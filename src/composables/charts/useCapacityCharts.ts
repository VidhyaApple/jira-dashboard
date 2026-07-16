import { computed, type Ref } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useCapacityStore } from '../../stores/capacity'
import { usePeriodNotesStore } from '../../stores/periodNotes'
import { buildMonthlySeries } from '../../utils/timelineSeries'
import { buildMonthlyCapacityComparison, baselineSeriesSuffix, computeFilteredPeriodBaseline } from '../../utils/capacitySeries'
import { noteTooltipLine, periodNoteMarkPoints } from '../../utils/chartPeriodNotes'
import {
  type CombinedChartRegionFilter,
  showChennaiSeries,
  showUkSeries
} from '../../utils/chartRegion'
import { pctValueLabel, valueLabel } from '../../utils/chartLabels'
import { NO_DATE_MSG, useChartTheme } from '../useChartTheme'

const NO_CAPACITY_MSG = 'Set developer counts in the sidebar to calculate monthly capacity'
const NO_FILTERED_BASELINE_MSG = 'Need at least one month in the filtered period for baseline'

function formatCapacityPct (value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value}%`
}

function buildSpChartOption (
  data: ReturnType<typeof buildMonthlyCapacityComparison>,
  theme: ReturnType<typeof useChartTheme>,
  regionFilter: CombinedChartRegionFilter,
  notesByMonth: Record<string, string>
): EChartsOption {
  const c = theme.chartColors.value
  const {
    labels,
    monthKeys,
    chennaiSp,
    ukSp,
    chennaiCapacity,
    ukCapacity,
    baselineMode
  } = data
  const baselineSuffix = baselineSeriesSuffix(baselineMode)
  const useFilteredBaseline = baselineMode === 'filtered'

  function repeatCapacity (value: number) {
    return labels.map(() => value)
  }

  function baselineLine (name: string, value: number, color: string) {
    return {
      name,
      type: 'line' as const,
      smooth: false,
      symbol: 'none' as const,
      data: repeatCapacity(value),
      lineStyle: { width: 2, color, type: 'dashed' as const },
      itemStyle: { color },
      label: { show: false },
      z: 2
    }
  }

  const series: EChartsOption['series'] = []
  let firstBarIndex = -1

  if (showChennaiSeries(regionFilter)) {
    if (firstBarIndex < 0) firstBarIndex = series.length
    series.push({
      name: `${REGION_LABELS.chennai} actual`,
      type: 'bar',
      stack: 'ciec',
      data: chennaiSp,
      barMaxWidth: 22,
      itemStyle: { color: '#465fff', borderRadius: [0, 0, 0, 0] },
      label: valueLabel(c, { color: '#465fff' })
    })
    if (useFilteredBaseline) {
      series.push(baselineLine(`${REGION_LABELS.chennai} ${baselineSuffix}`, chennaiCapacity, '#7592ff'))
    } else {
      series.push({
        name: `${REGION_LABELS.chennai} capacity`,
        type: 'bar',
        stack: 'ciec-cap',
        data: repeatCapacity(chennaiCapacity),
        barMaxWidth: 22,
        itemStyle: { color: 'rgba(70, 95, 255, 0.18)', borderColor: '#7592ff', borderWidth: 1, borderRadius: [4, 4, 0, 0] },
        label: { show: false }
      })
    }
  }

  if (showUkSeries(regionFilter)) {
    if (firstBarIndex < 0) firstBarIndex = series.length
    series.push({
      name: `${REGION_LABELS.uk} actual`,
      type: 'bar',
      stack: 'uk',
      data: ukSp,
      barMaxWidth: 22,
      itemStyle: { color: '#12b76a', borderRadius: [0, 0, 0, 0] },
      label: valueLabel(c, { color: '#12b76a', position: 'bottom' })
    })
    if (useFilteredBaseline) {
      series.push(baselineLine(`${REGION_LABELS.uk} ${baselineSuffix}`, ukCapacity, '#32d583'))
    } else {
      series.push({
        name: `${REGION_LABELS.uk} capacity`,
        type: 'bar',
        stack: 'uk-cap',
        data: repeatCapacity(ukCapacity),
        barMaxWidth: 22,
        itemStyle: { color: 'rgba(18, 183, 106, 0.18)', borderColor: '#32d583', borderWidth: 1, borderRadius: [4, 4, 0, 0] },
        label: { show: false }
      })
    }
  }

  const markY = regionFilter === 'uk'
    ? ukSp
    : regionFilter === 'chennai'
      ? chennaiSp
      : ukSp

  if (firstBarIndex >= 0 && series[firstBarIndex] && typeof series[firstBarIndex] === 'object') {
    const bar = series[firstBarIndex] as { markPoint?: ReturnType<typeof periodNoteMarkPoints> }
    bar.markPoint = periodNoteMarkPoints(monthKeys, notesByMonth, markY)
  }

  return theme.withChartMotion({
    tooltip: {
      trigger: 'axis',
      transitionDuration: 0.45,
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      textStyle: { color: c.textStrong },
      axisPointer: { type: 'shadow' },
      formatter (params: unknown) {
        const rows = Array.isArray(params) ? params : [params]
        const idx = (rows[0] as { dataIndex?: number })?.dataIndex ?? 0
        const period = labels[idx] ?? ''
        const lines = [`<strong>${period}</strong>`]
        for (const row of rows) {
          const p = row as { seriesName?: string; value?: number; marker?: string; seriesType?: string }
          if (p.seriesType === 'line') {
            lines.push(`${p.marker ?? ''} ${p.seriesName}: <strong>${p.value ?? 0} SP</strong>`)
          } else if (p.seriesType === 'bar') {
            lines.push(`${p.marker ?? ''} ${p.seriesName}: <strong>${p.value ?? 0} SP</strong>`)
          }
        }
        const note = noteTooltipLine(notesByMonth[monthKeys[idx]!])
        if (note) lines.push(note)
        return lines.join('<br/>')
      }
    },
    legend: { ...theme.themedLegend(), top: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 64, containLabel: true },
    xAxis: theme.themedCategoryAxis(labels),
    yAxis: theme.themedValueAxis('Story points'),
    series
  })
}

function primaryCapacityPct (
  filter: CombinedChartRegionFilter,
  totalPct: (number | null)[],
  chennaiPct: (number | null)[],
  ukPct: (number | null)[]
): (number | null)[] {
  if (filter === 'chennai') return chennaiPct
  if (filter === 'uk') return ukPct
  return totalPct
}

function buildPctChartOption (
  data: ReturnType<typeof buildMonthlyCapacityComparison>,
  theme: ReturnType<typeof useChartTheme>,
  regionFilter: CombinedChartRegionFilter
): EChartsOption {
  const c = theme.chartColors.value
  const { labels, totalPct, chennaiPct, ukPct, totalSp, chennaiSp, ukSp, totalCapacity, chennaiCapacity, ukCapacity, baselineMode } = data
  const baselineLabel = baselineMode === 'filtered' ? 'baseline' : 'capacity'
  const mainPct = primaryCapacityPct(regionFilter, totalPct, chennaiPct, ukPct)

  function combinedPctLabel (value: number | null, i: number) {
    if (value == null) return ''
    const parts = [`{total|${formatCapacityPct(value)}}`]
    if (regionFilter === 'all') {
      const cVal = chennaiPct[i]
      if (cVal != null) parts.push(`{chennai|${REGION_LABELS.chennai} ${formatCapacityPct(cVal)}}`)
    }
    return parts.join('\n')
  }

  const barData = mainPct.map((value, i) => {
    if (value == null) return null
    return {
      value,
      label: {
        show: true,
        position: 'top' as const,
        distance: 8,
        formatter: combinedPctLabel(value, i),
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

  const mainName = REGION_LABELS[regionFilter === 'all' ? 'uk' : regionFilter]
  const lineSeries: EChartsOption['series'] = []
  if (regionFilter === 'all') {
    lineSeries.push({
      name: REGION_LABELS.chennai,
      type: 'line',
      smooth: true,
      showSymbol: true,
      symbolSize: 6,
      data: chennaiPct,
      lineStyle: { width: 2, color: '#465fff' },
      itemStyle: { color: '#465fff' },
      label: pctValueLabel(c, '#465fff')
    })
  }

  function actualAt (idx: number): number {
    if (regionFilter === 'chennai') return chennaiSp[idx] ?? 0
    if (regionFilter === 'uk') return ukSp[idx] ?? 0
    return totalSp[idx] ?? 0
  }

  function capacityForFilter (): number {
    if (regionFilter === 'chennai') return chennaiCapacity
    if (regionFilter === 'uk') return ukCapacity
    return totalCapacity
  }

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
        const lines = [`<strong>${period}</strong>`]
        const cap = capacityForFilter()
        if (mainPct[idx] != null) {
          lines.push(`${mainName}: <strong>${formatCapacityPct(mainPct[idx])}</strong> (${actualAt(idx)} / ${cap} SP ${baselineLabel})`)
        }
        if (regionFilter === 'all' && chennaiPct[idx] != null) {
          lines.push(`${REGION_LABELS.chennai}: <strong>${formatCapacityPct(chennaiPct[idx])}</strong> (${chennaiSp[idx]} / ${chennaiCapacity} SP ${baselineLabel})`)
        }
        return lines.join('<br/>')
      }
    },
    legend: theme.themedLegend(),
    grid: { left: 48, right: 24, bottom: 56, top: 72, containLabel: true },
    xAxis: theme.themedCategoryAxis(labels),
    yAxis: {
      ...theme.themedValueAxis('% of capacity'),
      axisLabel: { color: c.text, formatter: '{value}%' }
    },
    series: [
      {
        name: mainName,
        type: 'bar',
        data: barData,
        barMaxWidth: 36,
        itemStyle: {
          color: (params: { value?: unknown }) => {
            const v = typeof params.value === 'number' ? params.value : null
            if (v == null) return 'transparent'
            return v >= 100 ? '#6366f1' : '#f04438'
          },
          borderRadius: [4, 4, 0, 0]
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: c.axis, type: 'dashed', width: 1 },
          label: { formatter: '100% target', color: c.text, fontSize: 10 },
          data: [{ yAxis: 100 }]
        },
        labelLayout: { hideOverlap: true, moveOverlap: 'shiftY' }
      },
      ...lineSeries
    ]
  })
}

function useCapacityComparison () {
  const { filtered, selectedSquad, assumeMissingSpAsOne } = storeToRefs(useDashboardStore())
  const capacity = useCapacityStore()
  const { baselineMode } = storeToRefs(capacity)

  return computed(() => {
    const monthly = buildMonthlySeries(filtered.value, assumeMissingSpAsOne.value)
    const squadCap = capacity.squadCapacity(selectedSquad.value)
    const filteredBaseline = computeFilteredPeriodBaseline(monthly)
    return buildMonthlyCapacityComparison(
      monthly,
      squadCap.chennai,
      squadCap.uk,
      baselineMode.value,
      filteredBaseline
    )
  })
}

function emptyChartMessage (data: ReturnType<typeof buildMonthlyCapacityComparison>): string {
  if (data.baselineMode === 'filtered') return NO_FILTERED_BASELINE_MSG
  return NO_CAPACITY_MSG
}

export function useMonthlyCapacitySpChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const theme = useChartTheme()
  const comparison = useCapacityComparison()
  const { selectedSquad } = storeToRefs(useDashboardStore())
  const notesStore = usePeriodNotesStore()

  const monthKeys = computed(() => comparison.value.monthKeys)

  const notesByMonth = computed(() =>
    notesStore.notesForMonths(selectedSquad.value, monthKeys.value)
  )

  const chartOption = computed<EChartsOption>(() => {
    const data = comparison.value
    if (!data.labels.length) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    }
    if (!data.hasCapacity) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(emptyChartMessage(data)) })
    }
    return buildSpChartOption(data, theme, regionFilter.value, notesByMonth.value)
  })

  return { chartOption, comparison, monthKeys }
}

export function useMonthlyCapacityPctChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const theme = useChartTheme()
  const comparison = useCapacityComparison()

  const chartOption = computed<EChartsOption>(() => {
    const data = comparison.value
    if (!data.labels.length) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    }
    if (!data.hasCapacity) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(emptyChartMessage(data)) })
    }
    return buildPctChartOption(data, theme, regionFilter.value)
  })

  return { chartOption, comparison }
}
