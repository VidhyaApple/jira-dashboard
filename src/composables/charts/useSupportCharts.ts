import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { usePeriodNotesStore } from '../../stores/periodNotes'
import { countByKey } from '../../utils/count'
import { formatPct, periodOverPeriodPct } from '../../utils/baselineSeries'
import { noteTooltipLine, periodNoteMarkPoints } from '../../utils/chartPeriodNotes'
import { pieSliceLabel, valueLabel } from '../../utils/chartLabels'
import {
  buildMonthlyAgeSeries,
  buildMonthlyClosedSeries,
  buildMonthlyOpenedSeries
} from '../../utils/supportSeries'
import type { Ticket } from '../../types/ticket'
import { NO_DATE_MSG, useChartTheme } from '../useChartTheme'

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#4f46e5', '#7c3aed', '#c4b5fd']
const BAR_COLOR = '#6366f1'
const BAR_SHADOW = 'rgba(99, 102, 241, 0.45)'
const LINE_COLOR = '#20a8d8'

type FieldKey =
  | 'priority'
  | 'category'
  | 'assignmentGroup'
  | 'assignedTo'
  | 'openedBy'
  | 'status'

function fieldValue (t: Ticket, field: FieldKey): string | undefined {
  switch (field) {
    case 'priority': return t.priority
    case 'category': return t.category
    case 'assignmentGroup': return t.assignmentGroup
    case 'assignedTo': return t.assignedTo
    case 'openedBy': return t.openedBy
    case 'status': return t.status
  }
}

function useSupportFiltered () {
  return storeToRefs(useDashboardStore()).filtered
}

function useSupportPieChart (field: FieldKey, emptyLabel: string) {
  const filtered = useSupportFiltered()
  const { chartColors, chartEmptyTitle, themedLegend, withChartMotion } = useChartTheme()

  const chartOption = computed<EChartsOption>(() => {
    const entries = Object.entries(
      countByKey(filtered.value.map(t => fieldValue(t, field)))
    ).sort((a, b) => b[1] - a[1])

    if (!entries.length) {
      return withChartMotion({ animationDuration: 500, title: chartEmptyTitle(emptyLabel) })
    }

    return withChartMotion({
      tooltip: {
        transitionDuration: 0.4,
        backgroundColor: chartColors.value.tooltipBg,
        borderColor: chartColors.value.tooltipBorder,
        textStyle: { color: chartColors.value.textStrong }
      },
      legend: themedLegend(),
      color: PIE_COLORS,
      series: [{
        type: 'pie',
        radius: ['48%', '72%'],
        animationType: 'expansion',
        animationEasing: 'elasticOut',
        animationDuration: 2200,
        animationDelay: (idx: number) => idx * 95 + 120,
        stillShowZeroSum: false,
        label: pieSliceLabel(chartColors.value),
        labelLine: {
          smooth: 0.35,
          length: 12,
          length2: 14,
          lineStyle: { color: chartColors.value.axis }
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
          itemStyle: { shadowBlur: 28, shadowColor: BAR_SHADOW }
        },
        data: entries.map(([name, value]) => ({ name, value }))
      }]
    })
  })

  return { chartOption, filtered }
}

function useSupportBarChart (field: FieldKey, emptyLabel: string, topN = 12) {
  const filtered = useSupportFiltered()
  const {
    chartColors,
    chartEmptyTitle,
    themedValueAxis,
    themedCategoryAxis,
    withChartMotion,
    axisTooltipRich
  } = useChartTheme()

  const chartOption = computed<EChartsOption>(() => {
    const counts = countByKey(filtered.value.map(t => fieldValue(t, field)))
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, topN)
    const keys = sorted.map(x => x[0])
    const vals = sorted.map(([, v]) => v)

    if (!keys.length) {
      return withChartMotion({ animationDuration: 500, title: chartEmptyTitle(emptyLabel) })
    }

    const c = chartColors.value
    return withChartMotion({
      tooltip: axisTooltipRich,
      grid: { left: 8, right: 48, top: 16, bottom: 8, containLabel: true },
      xAxis: themedValueAxis(),
      yAxis: { ...themedCategoryAxis(keys), inverse: true },
      series: [{
        type: 'bar',
        data: vals,
        animationDelay: (idx: number) => idx * 72 + 100,
        animationEasing: 'elasticOut',
        barMaxWidth: 44,
        showBackground: true,
        backgroundStyle: { color: c.splitLine, borderRadius: [0, 10, 10, 0] },
        label: {
          show: true,
          position: 'right',
          fontWeight: 600,
          color: c.textStrong
        },
        itemStyle: { color: BAR_COLOR, borderRadius: [0, 10, 10, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 22, shadowColor: BAR_SHADOW } }
      }]
    })
  })

  return { chartOption, filtered }
}

export function useSupportStateChart () {
  return useSupportPieChart('status', 'No state data')
}

export function useSupportPriorityChart () {
  return useSupportPieChart('priority', 'No priority data')
}

export function useSupportCategoryChart () {
  return useSupportBarChart('category', 'No category data')
}

export function useSupportAssignmentGroupChart () {
  return useSupportBarChart('assignmentGroup', 'No assignment group data', 8)
}

export function useSupportAssigneeChart () {
  return useSupportBarChart('assignedTo', 'No assignee data', 10)
}

export function useSupportOpenedByChart () {
  return useSupportBarChart('openedBy', 'No opened-by data', 10)
}

export function useSupportMonthlyOpenedChart () {
  const filtered = useSupportFiltered()
  const theme = useChartTheme()
  const series = computed(() => buildMonthlyOpenedSeries(filtered.value))

  const chartOption = computed<EChartsOption>(() => {
    const { labels, counts } = series.value
    if (!labels.length) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    }
    const c = theme.chartColors.value
    return theme.withChartMotion({
      tooltip: theme.axisTooltipLine,
      grid: { left: 48, right: 24, bottom: 56, top: 40, containLabel: true },
      xAxis: theme.themedCategoryAxis(labels, false),
      yAxis: { ...theme.themedValueAxis('Incidents opened'), minInterval: 1 },
      series: [{
        name: 'Opened',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: counts,
        animationDelay: (idx: number) => idx * 32 + 70,
        lineStyle: { width: 2.5, color: BAR_COLOR },
        itemStyle: { color: BAR_COLOR },
        label: valueLabel(c, { color: BAR_COLOR }),
        areaStyle: { color: 'rgba(99, 102, 241, 0.15)' },
        emphasis: { focus: 'series' }
      }]
    })
  })

  return { chartOption }
}

export function useSupportMonthlyClosedChart () {
  const filtered = useSupportFiltered()
  const theme = useChartTheme()
  const series = computed(() => buildMonthlyClosedSeries(filtered.value))

  const chartOption = computed<EChartsOption>(() => {
    const { labels, counts } = series.value
    if (!labels.length) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    }
    const c = theme.chartColors.value
    return theme.withChartMotion({
      tooltip: theme.axisTooltipLine,
      grid: { left: 48, right: 24, bottom: 56, top: 40, containLabel: true },
      xAxis: theme.themedCategoryAxis(labels, false),
      yAxis: { ...theme.themedValueAxis('Incidents closed'), minInterval: 1 },
      series: [{
        name: 'Closed',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: counts,
        animationDelay: (idx: number) => idx * 32 + 110,
        lineStyle: { width: 2.5, color: LINE_COLOR },
        itemStyle: { color: LINE_COLOR },
        label: valueLabel(c, { color: LINE_COLOR, position: 'bottom' }),
        areaStyle: { color: 'rgba(32, 168, 216, 0.15)' },
        emphasis: { focus: 'series' }
      }]
    })
  })

  return { chartOption }
}

export function useSupportAgeTrendChart () {
  const filtered = useSupportFiltered()
  const theme = useChartTheme()
  const series = computed(() => buildMonthlyAgeSeries(filtered.value))

  const chartOption = computed<EChartsOption>(() => {
    const { labels, avgDays } = series.value
    if (!labels.length) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    }
    const c = theme.chartColors.value
    return theme.withChartMotion({
      tooltip: {
        ...theme.axisTooltipLine,
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params[0] : params as { axisValue?: string; value?: number | null }
          const days = p?.value
          const label = days == null ? '—' : `${days} days`
          return `<strong>${p?.axisValue ?? ''}</strong><br/>Avg resolution: ${label}`
        }
      },
      grid: { left: 48, right: 24, bottom: 56, top: 40, containLabel: true },
      xAxis: theme.themedCategoryAxis(labels, false),
      yAxis: theme.themedValueAxis('Avg days'),
      series: [{
        name: 'Avg resolution age',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        connectNulls: false,
        data: avgDays,
        animationDelay: (idx: number) => idx * 32 + 90,
        lineStyle: { width: 2.5, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        label: valueLabel(c, { color: '#f59e0b' }),
        emphasis: { focus: 'series' }
      }]
    })
  })

  return { chartOption }
}

const NEED_PERIODS_MSG = 'Need at least 2 periods to compare volume'

export function useSupportVolumeBaselineChart () {
  const { filtered, selectedSquad } = storeToRefs(useDashboardStore())
  const notesStore = usePeriodNotesStore()
  const theme = useChartTheme()
  const series = computed(() => buildMonthlyOpenedSeries(filtered.value))

  const monthKeys = computed(() => series.value.monthKeys)

  const notesByMonth = computed(() =>
    notesStore.notesForMonths(selectedSquad.value, monthKeys.value)
  )

  const chartOption = computed<EChartsOption>(() => {
    const { labels, monthKeys: keys, counts } = series.value
    if (labels.length < 2) {
      return theme.withChartMotion({
        animationDuration: 500,
        title: theme.chartEmptyTitle(labels.length ? NEED_PERIODS_MSG : NO_DATE_MSG)
      })
    }

    const pct = periodOverPeriodPct(counts)
    const c = theme.chartColors.value

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
            lines.push(`Opened: ${counts[0]} incidents`)
            const note = noteTooltipLine(notesByMonth.value[keys[idx]!])
            if (note) lines.push(note)
            return lines.join('<br/>')
          }
          lines.push(`<span style="opacity:0.7">vs ${prevPeriod}</span>`)
          const p = rows[0] as { value?: number | null; marker?: string }
          if (p.value != null) {
            lines.push(`${p.marker ?? ''} Change: <strong>${formatPct(p.value)}</strong> (${counts[idx - 1]} → ${counts[idx]} opened)`)
          }
          const note = noteTooltipLine(notesByMonth.value[keys[idx]!])
          if (note) lines.push(note)
          return lines.join('<br/>')
        }
      },
      grid: { left: 48, right: 24, bottom: 56, top: 56, containLabel: true },
      xAxis: theme.themedCategoryAxis(labels, false),
      yAxis: {
        ...theme.themedValueAxis('Change (%)'),
        axisLabel: { color: c.text, formatter: '{value}%' }
      },
      series: [{
        name: 'Opened volume',
        type: 'bar',
        data: pct.map((value) => {
          if (value == null) return null
          const positive = value >= 0
          return {
            value,
            label: {
              show: true,
              position: (positive ? 'top' : 'bottom') as 'top' | 'bottom',
              formatter: formatPct(value),
              color: c.textStrong,
              fontSize: 11,
              fontWeight: 600
            }
          }
        }),
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
        markPoint: periodNoteMarkPoints(keys, notesByMonth.value, pct),
        labelLayout: { hideOverlap: true, moveOverlap: 'shiftY' },
        emphasis: { focus: 'series' }
      }]
    })
  })

  return { chartOption, monthKeys }
}

export function filterByField (
  tickets: Ticket[],
  field: FieldKey,
  value: string
): Ticket[] {
  return tickets.filter(t => fieldValue(t, field) === value)
}
