import { computed, type Ref } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { usePeriodNotesStore } from '../../stores/periodNotes'
import { buildMonthlySeries } from '../../utils/timelineSeries'
import { formatPct, periodOverPeriodPct } from '../../utils/baselineSeries'
import { noteTooltipLine, periodNoteMarkPoints } from '../../utils/chartPeriodNotes'
import { pctValueLabel } from '../../utils/chartLabels'
import {
  type CombinedChartRegionFilter,
  showChennaiSeries
} from '../../utils/chartRegion'
import { NO_DATE_MSG, useChartTheme } from '../useChartTheme'

type TimelineSeries = ReturnType<typeof buildMonthlySeries>

function primaryPctSeries (
  filter: CombinedChartRegionFilter,
  totalPct: (number | null)[],
  chennaiPct: (number | null)[],
  ukPct: (number | null)[]
): (number | null)[] {
  if (filter === 'chennai') return chennaiPct
  if (filter === 'uk') return ukPct
  return totalPct
}

function buildBaselineChartOption (
  series: TimelineSeries,
  theme: ReturnType<typeof useChartTheme>,
  emptyMsg: string,
  regionFilter: CombinedChartRegionFilter,
  notesByMonth: Record<string, string>
): EChartsOption {
  const { labels, monthKeys, chennaiSp, ukSp, chennaiNoSp, ukNoSp } = series
  if (labels.length < 2) {
    return theme.withChartMotion({
      animationDuration: 500,
      title: theme.chartEmptyTitle(emptyMsg)
    })
  }

  const totalSp = ukSp
  const totalPct = periodOverPeriodPct(totalSp)
  const chennaiPct = periodOverPeriodPct(chennaiSp)
  const ukPct = periodOverPeriodPct(ukSp)
  const mainPct = primaryPctSeries(regionFilter, totalPct, chennaiPct, ukPct)
  const c = theme.chartColors.value

  function combinedBarData () {
    return mainPct.map((value, i) => {
      if (value == null) return null
      const positive = value >= 0
      const parts = [`{total|${formatPct(value)}}`]
      if (regionFilter === 'all') {
        const cPct = chennaiPct[i]
        if (cPct != null) parts.push(`{chennai|${REGION_LABELS.chennai} ${formatPct(cPct)}}`)
      }

      return {
        value,
        label: {
          show: true,
          position: (positive ? 'top' : 'bottom') as 'top' | 'bottom',
          distance: 8,
          formatter: parts.join('\n'),
          align: 'center' as const,
          lineHeight: 14,
          rich: {
            total: { color: c.textStrong, fontSize: 11, fontWeight: 600, lineHeight: 16 },
            chennai: { color: '#7592ff', fontSize: 10, fontWeight: 500, lineHeight: 14 },
            uk: { color: '#32d583', fontSize: 10, fontWeight: 500, lineHeight: 14 }
          }
        }
      }
    })
  }

  const mainSeriesName = REGION_LABELS[regionFilter === 'all' ? 'uk' : regionFilter]

  const lineSeries: EChartsOption['series'] = []
  if (regionFilter === 'all' && showChennaiSeries(regionFilter)) {
    lineSeries.push({
      name: REGION_LABELS.chennai,
      type: 'line',
      smooth: true,
      showSymbol: true,
      symbolSize: 7,
      connectNulls: false,
      data: chennaiPct,
      animationDelay: (idx: number) => idx * 40 + 120,
      lineStyle: { width: 2.5, color: '#465fff' },
      itemStyle: { color: '#465fff' },
      label: pctValueLabel(c, '#465fff'),
      emphasis: { focus: 'series' }
    })
  }

  function spAt (idx: number): number {
    if (regionFilter === 'chennai') return chennaiSp[idx] ?? 0
    if (regionFilter === 'uk') return ukSp[idx] ?? 0
    return totalSp[idx] ?? 0
  }

  function noSpAt (idx: number): number {
    if (regionFilter === 'chennai') return chennaiNoSp[idx] ?? 0
    return ukNoSp[idx] ?? 0
  }

  const noSpCounts = labels.map((_, i) => noSpAt(i))

  return theme.withChartMotion({
    tooltip: {
      trigger: 'axis',
      transitionDuration: 0.45,
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      textStyle: { color: c.textStrong },
      formatter (params: unknown) {
        const rows = Array.isArray(params) ? params : [params]
        const idx = (rows[0] as { dataIndex?: number })?.dataIndex ?? 0
        const period = labels[idx] ?? ''
        const prevPeriod = idx > 0 ? labels[idx - 1] : ''
        const lines = [`<strong>${period}</strong>`]
        if (idx === 0) {
          lines.push('Baseline period — no prior comparison')
          lines.push(`${mainSeriesName}: ${spAt(0)} SP`)
          if (noSpCounts[idx]) lines.push(`<span style="color:#f59e0b">◆ ${noSpCounts[idx]} tickets without story points</span>`)
          const note = noteTooltipLine(notesByMonth[monthKeys[idx]!])
          if (note) lines.push(note)
          return lines.join('<br/>')
        }
        lines.push(`<span style="opacity:0.7">vs ${prevPeriod}</span>`)
        for (const row of rows) {
          const p = row as { seriesName?: string; value?: number | null; marker?: string; seriesType?: string }
          if (p.seriesType === 'scatter') continue
          if (p.value == null) continue
          const name = p.seriesName ?? ''
          const sp = name === REGION_LABELS.chennai ? chennaiSp[idx] : name === REGION_LABELS.uk ? ukSp[idx] : spAt(idx)
          const prevSp = name === REGION_LABELS.chennai ? chennaiSp[idx - 1] : name === REGION_LABELS.uk ? ukSp[idx - 1] : spAt(idx - 1)
          lines.push(`${p.marker ?? ''} ${name}: <strong>${formatPct(p.value)}</strong> (${prevSp} → ${sp} SP)`)
        }
        if (noSpCounts[idx]) {
          lines.push(`<span style="color:#f59e0b">◆ ${noSpCounts[idx]} tickets without story points</span>`)
        }
        const note = noteTooltipLine(notesByMonth[monthKeys[idx]!])
        if (note) lines.push(note)
        return lines.join('<br/>')
      }
    },
    legend: theme.themedLegend(),
    grid: { left: 48, right: 52, bottom: 56, top: 72, containLabel: true },
    xAxis: theme.themedCategoryAxis(labels, false),
    yAxis: [
      {
        ...theme.themedValueAxis('Change (%)'),
        axisLabel: { color: c.text, formatter: '{value}%' }
      },
      {
        ...theme.themedValueAxis('No SP tickets'),
        minInterval: 1,
        splitLine: { show: false },
        axisLine: { show: true, lineStyle: { color: '#f59e0b', type: 'dashed' } },
        axisLabel: { color: '#f59e0b' }
      }
    ],
    series: [
      {
        name: mainSeriesName,
        type: 'bar',
        yAxisIndex: 0,
        data: combinedBarData(),
        barMaxWidth: 36,
        animationDelay: (idx: number) => idx * 40 + 80,
        itemStyle: {
          color: (params: { value?: unknown }) => {
            const v = typeof params.value === 'number' ? params.value : null
            if (v == null) return 'transparent'
            return v >= 0 ? '#6366f1' : '#f04438'
          },
          borderRadius: [4, 4, 0, 0]
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: c.axis, type: 'dashed', width: 1 },
          label: { formatter: 'Baseline', color: c.text, fontSize: 10 },
          data: [{ yAxis: 0 }]
        },
        markPoint: periodNoteMarkPoints(monthKeys, notesByMonth, mainPct),
        labelLayout: { hideOverlap: true, moveOverlap: 'shiftY' },
        emphasis: { focus: 'series' }
      },
      ...lineSeries.map(s => ({ ...s, yAxisIndex: 0 })),
      {
        name: 'Tickets without SP',
        type: 'scatter',
        yAxisIndex: 1,
        symbol: 'diamond',
        symbolSize: (val: unknown) => {
          const n = typeof val === 'number' ? val : 0
          return Math.max(9, Math.min(18, 9 + n * 1.5))
        },
        itemStyle: {
          color: 'rgba(245, 158, 11, 0.2)',
          borderColor: '#f59e0b',
          borderWidth: 2
        },
        data: noSpCounts,
        z: 4,
        label: {
          show: true,
          formatter: (params: { value?: unknown }) => {
            const v = typeof params.value === 'number' ? params.value : 0
            return v ? `${v}` : ''
          },
          position: 'top',
          distance: 4,
          color: '#f59e0b',
          fontSize: 10,
          fontWeight: 600
        },
        emphasis: { scale: 1.3, itemStyle: { color: 'rgba(245, 158, 11, 0.45)' } }
      }
    ]
  })
}

const NEED_PERIODS_MSG = 'Need at least 2 periods to compare performance'

export function useMonthlyBaselineChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const { filtered, assumeMissingSpAsOne, selectedSquad } = storeToRefs(useDashboardStore())
  const notesStore = usePeriodNotesStore()
  const theme = useChartTheme()
  const series = computed(() => buildMonthlySeries(filtered.value, assumeMissingSpAsOne.value))

  const monthKeys = computed(() => series.value.monthKeys)

  const notesByMonth = computed(() =>
    notesStore.notesForMonths(selectedSquad.value, monthKeys.value)
  )

  const chartOption = computed<EChartsOption>(() =>
    buildBaselineChartOption(
      series.value,
      theme,
      series.value.labels.length ? NEED_PERIODS_MSG : NO_DATE_MSG,
      regionFilter.value,
      notesByMonth.value
    )
  )

  return { chartOption, monthKeys }
}
