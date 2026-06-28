import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { Squad } from '../config/squads'
import { squadDataPaths, squadStorageKey } from '../config/squads'
import type { RegionKey, Ticket, WorkTypeStoryPointTableRow } from '../types/ticket'
import { quarterRange, ticketTimelineDate, timelineFieldFromRow, dateRangeLabelForFilter, headerTitleForFilter, headerTitleParts } from '../utils/dates'
import { parseParentKey } from '../utils/jira'
import { loadAssumeMissingSpAsOne, saveAssumeMissingSpAsOne, sumEffectiveStoryPoints } from '../utils/storyPoints'
import { buildHierarchyAnalysis, countCategoryTreeNodes } from '../utils/hierarchy'
import {
  buildWorkTypeStoryPointBuckets,
  sortedWorkTypeStoryPointEntries,
  toWorkTypeStoryPointTableSide
} from '../utils/workType'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    tickets: [] as Ticket[],
    selectedSquad: 'SAM' as Squad,
    uploadRegion: 'chennai' as RegionKey,
    dateFilter: 'all',
    hierarchyRegionFilter: 'all' as 'all' | RegionKey,
    assumeMissingSpAsOne: loadAssumeMissingSpAsOne(),
    loadError: null as string | null,
    isLoading: false
  }),

  getters: {
    filtered (state): Ticket[] {
      let rows = state.tickets.filter(t => t.squad === state.selectedSquad)
      const df = state.dateFilter
      if (df === 'all') return rows

      if (df === 'q1' || df === 'q2' || df === 'q3' || df === 'q4') {
        const year = new Date().getFullYear()
        const quarter = Number(df.replace('q', '')) as 1 | 2 | 3 | 4
        const { start, end } = quarterRange(year, quarter)
        return rows.filter(t => {
          const raw = ticketTimelineDate(t)
          if (!raw) return false
          const dt = new Date(raw)
          return dt >= start && dt <= end
        })
      }

      const now = new Date()
      let days = 0
      if (df === 'weekly') days = 7
      if (df === 'twoWeeks') days = 14
      if (df === 'monthly') days = 30
      const threshold = new Date()
      threshold.setDate(now.getDate() - days)
      return rows.filter(t => {
        const raw = ticketTimelineDate(t)
        return raw && new Date(raw) >= threshold
      })
    },

    chennaiFilteredCount (): number {
      return this.filtered.filter(t => t.region === 'chennai').length
    },

    ukFilteredCount (): number {
      return this.filtered.filter(t => t.region === 'uk').length
    },

    totalFilteredSP (state): number {
      return sumEffectiveStoryPoints(this.filtered, state.assumeMissingSpAsOne)
    },

    hasActiveFilters (state): boolean {
      return state.dateFilter !== 'all'
    },

    dateRangeLabel (state): string {
      return dateRangeLabelForFilter(state.dateFilter)
    },

    headerTitle (state): string {
      return headerTitleForFilter(state.selectedSquad, state.dateFilter)
    },

    headerTitleParts (state): { squad: string; period: string } {
      return headerTitleParts(state.selectedSquad, state.dateFilter)
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
    }
  },

  actions: {
    save () {
      localStorage.setItem(squadStorageKey(this.selectedSquad), JSON.stringify(this.tickets))
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
      const paths = squadDataPaths(squad)
      const [ciecOk, teamOk] = await Promise.all([
        this.loadCsvUrl(paths.chennai, 'chennai', squad),
        this.loadCsvUrl(paths.team, 'uk', squad)
      ])
      if (!ciecOk && !teamOk) {
        this.loadError = `No data found for ${squad}. Add public/sources/${squad}/ciec.csv and team.csv`
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
        this.tickets = parsed.map(t => ({ ...t, squad: t.squad ?? squad }))
        this.loadError = null
        return
      }
      await this.loadSquadFromFiles(squad)
    },

    setSquad (squad: Squad) {
      this.selectedSquad = squad
      this.dateFilter = 'all'
      this.hierarchyRegionFilter = 'all'
      this.loadSquad(squad)
    },

    clearFilters () {
      this.dateFilter = 'all'
    },

    setAssumeMissingSpAsOne (value: boolean) {
      this.assumeMissingSpAsOne = value
      saveAssumeMissingSpAsOne(value)
    },

    async clearData () {
      localStorage.removeItem(squadStorageKey(this.selectedSquad))
      this.dateFilter = 'all'
      this.hierarchyRegionFilter = 'all'
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
