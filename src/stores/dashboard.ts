import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { Squad } from '../config/squads'
import { isSupportSquad as squadIsSupport, supportDataPath, squadDataPaths, squadStorageKey, squadLabel, squadDataDir } from '../config/squads'
import type { RegionKey, Ticket, WorkTypeStoryPointTableRow } from '../types/ticket'
import { ticketTimelineDate, timelineFieldFromRow, parseTicketDate } from '../utils/dates'
import {
  type DateFilterMode,
  availableYears,
  currentYear,
  dateRangeLabelForState,
  headerTitlePartsForState,
  loadDateFilterPrefs,
  resolveDateWindow,
  saveDateFilterPrefs
} from '../utils/dateFilters'
import { parseParentKey } from '../utils/jira'
import { loadAssumeMissingSpAsOne, saveAssumeMissingSpAsOne, sumEffectiveStoryPoints } from '../utils/storyPoints'
import { filterDoneTickets, loadDoneTicketsOnly, saveDoneTicketsOnly } from '../utils/ticketFilters'
import { buildHierarchyAnalysis, countCategoryTreeNodes } from '../utils/hierarchy'
import {
  buildWorkTypeStoryPointBuckets,
  sortedWorkTypeStoryPointEntries,
  toWorkTypeStoryPointTableSide
} from '../utils/workType'
import { parseSupportRows } from '../utils/supportParser'
import { avgAgeDays } from '../utils/supportSeries'
import {
  buildDashboardUrlQuery,
  parseDashboardUrl,
  replaceUrlQuery
} from '../utils/urlState'

const prefs = loadDateFilterPrefs()

function looksLikeSupportData (tickets: Ticket[]): boolean {
  if (!tickets.length) return false
  return tickets.some(t => t.openedAt || t.category || t.priority)
}

function isDateFilterMode (v: string | undefined): v is DateFilterMode {
  return !!v && [
    'all', 'weekly', 'twoWeeks', 'monthly', 'q1', 'q2', 'q3', 'q4', 'custom', 'ytd', 'last6m'
  ].includes(v)
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    tickets: [] as Ticket[],
    selectedSquad: 'SAM' as Squad,
    uploadRegion: 'chennai' as RegionKey,
    dateFilter: (isDateFilterMode(prefs.dateFilter) ? prefs.dateFilter : 'all') as DateFilterMode,
    filterYear: prefs.filterYear && prefs.filterYear >= 2000 ? prefs.filterYear : currentYear(),
    customFrom: prefs.customFrom ?? '',
    customTo: prefs.customTo ?? '',
    hierarchyRegionFilter: 'all' as 'all' | RegionKey,
    assumeMissingSpAsOne: loadAssumeMissingSpAsOne(),
    doneTicketsOnly: loadDoneTicketsOnly(),
    loadError: null as string | null,
    isLoading: false
  }),

  getters: {
    isSupportSquad (state): boolean {
      return squadIsSupport(state.selectedSquad)
    },

    filtered (state): Ticket[] {
      let rows = state.tickets.filter(t => t.squad === state.selectedSquad)
      const window = resolveDateWindow({
        dateFilter: state.dateFilter,
        filterYear: state.filterYear,
        customFrom: state.customFrom,
        customTo: state.customTo
      })
      if (window) {
        rows = rows.filter(t => {
          const raw = ticketTimelineDate(t)
          if (!raw) return false
          const dt = parseTicketDate(raw)
          if (!dt) return false
          return dt >= window.start && dt <= window.end
        })
      }
      if (squadIsSupport(state.selectedSquad)) {
        return rows
      }
      return filterDoneTickets(rows, state.doneTicketsOnly)
    },

    chennaiFilteredCount (): number {
      return this.filtered.filter(t => t.region === 'chennai').length
    },

    ukFilteredCount (): number {
      return this.filtered.filter(t => t.region === 'uk').length
    },

    teamFiltered (): Ticket[] {
      return this.filtered.filter(t => t.region === 'uk')
    },

    chennaiFiltered (): Ticket[] {
      return this.filtered.filter(t => t.region === 'chennai')
    },

    squadTeamTickets (state): Ticket[] {
      return state.tickets.filter(t => t.squad === state.selectedSquad && t.region === 'uk')
    },

    supportSquadTickets (state): Ticket[] {
      return state.tickets.filter(t => t.squad === state.selectedSquad)
    },

    supportLinkedChildCount (): number {
      const analysis = buildHierarchyAnalysis(this.filtered, false)
      return analysis.linkedChildCount
    },

    supportAvgResolutionDays (): number | null {
      return avgAgeDays(this.filtered)
    },

    totalFilteredSP (state): number {
      return sumEffectiveStoryPoints(this.teamFiltered, state.assumeMissingSpAsOne)
    },

    teamLinkedChildCount (state): number {
      const analysis = buildHierarchyAnalysis(this.teamFiltered, state.assumeMissingSpAsOne)
      return analysis.linkedChildCount
    },

    hasActiveFilters (state): boolean {
      return state.dateFilter !== 'all'
    },

    dateRangeLabel (state): string {
      return dateRangeLabelForState({
        dateFilter: state.dateFilter,
        filterYear: state.filterYear,
        customFrom: state.customFrom,
        customTo: state.customTo
      })
    },

    headerTitle (state): string {
      const { squad, period } = headerTitlePartsForState(squadLabel(state.selectedSquad), {
        dateFilter: state.dateFilter,
        filterYear: state.filterYear,
        customFrom: state.customFrom,
        customTo: state.customTo
      })
      if (period.startsWith('·')) return `${squad} ${period}`
      return `${squad} ${period}`
    },

    headerTitleParts (state): { squad: string; period: string } {
      return headerTitlePartsForState(squadLabel(state.selectedSquad), {
        dateFilter: state.dateFilter,
        filterYear: state.filterYear,
        customFrom: state.customFrom,
        customTo: state.customTo
      })
    },

    workTypeStoryPointRows (state): WorkTypeStoryPointTableRow[] {
      const buckets = buildWorkTypeStoryPointBuckets(this.filtered, state.assumeMissingSpAsOne)
      return sortedWorkTypeStoryPointEntries(buckets).map(([workType, bucket]) => ({
        workType,
        chennai: toWorkTypeStoryPointTableSide(bucket.chennai),
        uk: toWorkTypeStoryPointTableSide(bucket.uk),
        totalSp: bucket.totalSp,
        totalCount: bucket.totalCount,
        totalNoSpCount: bucket.totalNoSpCount
      }))
    },

    hierarchyFilteredTickets (): Ticket[] {
      if (this.hierarchyRegionFilter === 'all') return this.filtered
      return this.filtered.filter(t => t.region === this.hierarchyRegionFilter)
    },

    issueHierarchyMeta (state): ReturnType<typeof buildHierarchyAnalysis> & { chartHeight: number } {
      const analysis = buildHierarchyAnalysis(this.hierarchyFilteredTickets, state.assumeMissingSpAsOne)
      const nodeCount = analysis.tree?.children
        ? countCategoryTreeNodes(analysis.tree.children) + 1
        : 0
      const chartHeight = Math.min(880, Math.max(460, nodeCount * 64 + 100))
      return { ...analysis, chartHeight }
    },

    showHierarchyChart (state): boolean {
      if (squadIsSupport(state.selectedSquad)) return false
      return this.filtered.length > 0
    },

    yearOptions (): number[] {
      return availableYears(6)
    },

    needsYearSelector (): boolean {
      return ['q1', 'q2', 'q3', 'q4', 'ytd'].includes(this.dateFilter)
    },

    needsCustomDates (): boolean {
      return this.dateFilter === 'custom'
    }
  },

  actions: {
    save () {
      localStorage.setItem(squadStorageKey(this.selectedSquad), JSON.stringify(this.tickets))
    },

    persistDatePrefs () {
      saveDateFilterPrefs({
        dateFilter: this.dateFilter,
        filterYear: this.filterYear,
        customFrom: this.customFrom,
        customTo: this.customTo
      })
      this.syncUrl()
    },

    syncUrl () {
      const query = buildDashboardUrlQuery({
        squad: this.selectedSquad,
        dateFilter: this.dateFilter,
        filterYear: this.filterYear,
        customFrom: this.customFrom,
        customTo: this.customTo,
        doneTicketsOnly: this.doneTicketsOnly,
        assumeMissingSpAsOne: this.assumeMissingSpAsOne
      })
      replaceUrlQuery(query)
    },

    applyUrlState () {
      const url = parseDashboardUrl()
      if (url.squad) this.selectedSquad = url.squad
      if (url.dateFilter) this.dateFilter = url.dateFilter
      if (url.year) this.filterYear = url.year
      if (url.from) this.customFrom = url.from
      if (url.to) this.customTo = url.to
      if (url.from && url.to && !url.dateFilter) this.dateFilter = 'custom'
      if (url.done != null) {
        this.doneTicketsOnly = url.done
        saveDoneTicketsOnly(url.done)
      }
      if (url.assumeSp != null) {
        this.assumeMissingSpAsOne = url.assumeSp
        saveAssumeMissingSpAsOne(url.assumeSp)
      }
    },

    parseSupportRows (json: Record<string, unknown>[], squad: Squad, append: boolean) {
      const rows = parseSupportRows(json, squad)
      if (append) {
        this.tickets.push(...rows)
      } else {
        this.tickets = this.tickets
          .filter(t => t.squad !== squad)
          .concat(rows)
      }
      this.save()
    },

    async loadSupportCsvUrl (url: string, squad: Squad): Promise<boolean> {
      const res = await fetch(url)
      if (!res.ok) return false
      const text = await res.text()
      await new Promise<void>((resolve) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (r) => {
            this.parseSupportRows(r.data as Record<string, unknown>[], squad, true)
            resolve()
          }
        })
      })
      return true
    },

    async loadCsvUrl (url: string, region: RegionKey, squad: Squad): Promise<boolean> {
      const res = await fetch(url)
      if (!res.ok) return false
      const text = await res.text()
      await new Promise<void>((resolve) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (r) => {
            this.normRows(r.data as Record<string, unknown>[], region, squad, true)
            resolve()
          }
        })
      })
      return true
    },

    async loadSquadFromFiles (squad: Squad) {
      this.isLoading = true
      this.loadError = null
      this.tickets = []

      if (squadIsSupport(squad)) {
        const ok = await this.loadSupportCsvUrl(supportDataPath(squad), squad)
        if (!ok) {
          this.loadError = `No data found for ${squad}. Add public/sources/${squadDataDir(squad)}/support.csv`
        }
        this.save()
        this.isLoading = false
        return
      }

      const paths = squadDataPaths(squad) as { chennai: string; team: string }
      const [ciecOk, teamOk] = await Promise.all([
        this.loadCsvUrl(paths.chennai, 'chennai', squad),
        this.loadCsvUrl(paths.team, 'uk', squad)
      ])
      if (!ciecOk && !teamOk) {
        this.loadError = `No data found for ${squad}. Add public/sources/${squadDataDir(squad)}/ciec.csv and team.csv`
      } else if (!ciecOk || !teamOk) {
        const missing = [!ciecOk && 'ciec.csv', !teamOk && 'team.csv'].filter(Boolean).join(' and ')
        this.loadError = `Partial load for ${squad}: missing ${missing}`
      }
      this.save()
      this.isLoading = false
    },

    async loadSquad (squad: Squad) {
      const stored = localStorage.getItem(squadStorageKey(squad))
      if (stored) {
        const parsed = JSON.parse(stored) as Ticket[]
        const tickets = parsed.map(t => ({ ...t, squad: t.squad ?? squad }))
        if (squadIsSupport(squad) && tickets.length > 0 && !looksLikeSupportData(tickets)) {
          localStorage.removeItem(squadStorageKey(squad))
          await this.loadSquadFromFiles(squad)
          return
        }
        this.tickets = tickets
        this.loadError = null
        return
      }
      await this.loadSquadFromFiles(squad)
    },

    setSquad (squad: Squad) {
      this.selectedSquad = squad
      this.dateFilter = 'all'
      this.hierarchyRegionFilter = 'all'
      this.persistDatePrefs()
      this.loadSquad(squad)
    },

    setDateFilter (value: DateFilterMode) {
      this.dateFilter = value
      this.persistDatePrefs()
    },

    setFilterYear (year: number) {
      this.filterYear = year
      this.persistDatePrefs()
    },

    setCustomRange (from: string, to: string) {
      this.customFrom = from
      this.customTo = to
      this.dateFilter = 'custom'
      this.persistDatePrefs()
    },

    clearFilters () {
      this.dateFilter = 'all'
      this.customFrom = ''
      this.customTo = ''
      this.persistDatePrefs()
    },

    setAssumeMissingSpAsOne (value: boolean) {
      this.assumeMissingSpAsOne = value
      saveAssumeMissingSpAsOne(value)
      this.syncUrl()
    },

    setDoneTicketsOnly (value: boolean) {
      this.doneTicketsOnly = value
      saveDoneTicketsOnly(value)
      this.syncUrl()
    },

    async clearData () {
      localStorage.removeItem(squadStorageKey(this.selectedSquad))
      this.dateFilter = 'all'
      this.hierarchyRegionFilter = 'all'
      this.persistDatePrefs()
      await this.loadSquadFromFiles(this.selectedSquad)
    },

    normRows (json: Record<string, unknown>[], region: RegionKey, squad: Squad, append: boolean) {
      const rows: Ticket[] = json.map(r => ({
        key: r['Issue key'] as string | undefined,
        url: (r['Issue URL'] || r.URL || r.Link) as string | undefined,
        parentKey: parseParentKey(r),
        summary: r.Summary as string | undefined,
        squad,
        developer: region,
        region,
        status: r.Status as string | undefined,
        statusCategory: r['Status Category'] as string | undefined,
        workType: r['Issue Type'] as string | undefined,
        storyPoints: Number(r['Custom field (Story Points)'] || 0),
        statusCategoryChanged: timelineFieldFromRow(r),
        updated: r.Updated as string | undefined
      }))
      if (append) {
        this.tickets.push(...rows)
      } else {
        this.tickets = this.tickets
          .filter(t => t.region !== region || t.squad !== squad)
          .concat(rows)
      }
      this.save()
    },

    handleFileUpload (file: File) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (squadIsSupport(this.selectedSquad)) {
        if (ext === 'csv') {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: r => this.parseSupportRows(r.data as Record<string, unknown>[], this.selectedSquad, false)
          })
        }
        return
      }
      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: r => this.normRows(r.data as Record<string, unknown>[], this.uploadRegion, this.selectedSquad, false)
        })
        return
      }
      const reader = new FileReader()
      reader.onload = e => {
        const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array' })
        const sheetName = wb.SheetNames[0]
        const sheet = sheetName ? wb.Sheets[sheetName] : undefined
        if (!sheet) return
        this.normRows(XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[], this.uploadRegion, this.selectedSquad, false)
      }
      reader.readAsArrayBuffer(file)
    }
  }
})
