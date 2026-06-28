import { computed, type Ref } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useCapacityStore } from '../../stores/capacity'
import { buildMonthlySeries } from '../../utils/timelineSeries'
import { buildMonthlyCapacityComparison } from '../../utils/capacitySeries'
import {
  type CombinedChartRegionFilter,
  showChennaiSeries,
  showUkSeries
} from '../../utils/chartRegion'
import { pctValueLabel, valueLabel } from '../../utils/chartLabels'
import { NO_DATE_MSG, useChartTheme } from '../useChartTheme'

const NO_CAPACITY_MSG = 'Set developer counts in the sidebar to calculate monthly capacity'

function formatCapacityPct (value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value}%`
}

function buildSpChartOption (
  data: ReturnType<typeof buildMonthlyCapacityComparison>,
  theme: ReturnType<typeof useChartTheme>,
  regionFilter: CombinedChartRegionFilter
): EChartsOption {
  const c = theme.chartColors.value
  const { labels, chennaiSp, ukSp, totalSp, chennaiCapacity, ukCapacity, totalCapacity } = data

  function repeatCapacity (value: number) {
    return labels.map(() => value)
  }

  const series: EChartsOption['series'] = []

  if (showChennaiSeries(regionFilter)) {
    series.push(
      {
        name: `${REGION_LABELS.chennai} actual`,
        type: 'bar',
        stack: 'ciec',
        data: chennaiSp,
        barMaxWidth: 22,
        itemStyle: { color: '#465fff', borderRadius: [0, 0, 0, 0] },
        label: valueLabel(c, { color: '#465fff' })
      },
      {
        name: `${REGION_LABELS.chennai} capacity`,
        type: 'bar',
        stack: 'ciec-cap',
        data: repeatCapacity(chennaiCapacity),
        barMaxWidth: 22,
        itemStyle: { color: 'rgba(70, 95, 255, 0.18)', borderColor: '#7592ff', borderWidth: 1, borderRadius: [4, 4, 0, 0] },
        label: { show: false }
      }
    )
  }

  if (showUkSeries(regionFilter)) {
    series.push(
      {
        name: `${REGION_LABELS.uk} actual`,
        type: 'bar',
        stack: 'uk',
        data: ukSp,
        barMaxWidth: 22,
        itemStyle: { color: '#12b76a', borderRadius: [0, 0, 0, 0] },
        label: valueLabel(c, { color: '#12b76a', position: 'bottom' })
      },
      {
        name: `${REGION_LABELS.uk} capacity`,
        type: 'bar',
        stack: 'uk-cap',
        data: repeatCapacity(ukCapacity),
        barMaxWidth: 22,
        itemStyle: { color: 'rgba(18, 183, 106, 0.18)', borderColor: '#32d583', borderWidth: 1, borderRadius: [4, 4, 0, 0] },
        label: { show: false }
      }
    )
  }

  if (regionFilter === 'all') {
    series.push(
      {
        name: 'Total actual',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: totalSp,
        lineStyle: { width: 2.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        label: valueLabel(c, { color: '#6366f1' }),
        z: 3
      },
      {
        name: 'Total capacity',
        type: 'line',
        smooth: false,
        symbol: 'none',
        data: repeatCapacity(totalCapacity),
        lineStyle: { width: 2, color: '#94a3b8', type: 'dashed' },
        itemStyle: { color: '#94a3b8' },
        label: { show: false },
        z: 2
      }
    )
  }

  return theme.withChartMotion({
    tooltip: {
      trigger: 'axis',
      transitionDuration: 0.45,
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      textStyle: { color: c.textStrong },
      axisPointer: { type: 'shadow' }
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
  const { labels, totalPct, chennaiPct, ukPct, totalSp, chennaiSp, ukSp, totalCapacity, chennaiCapacity, ukCapacity } = data
  const mainPct = primaryCapacityPct(regionFilter, totalPct, chennaiPct, ukPct)

  function combinedPctLabel (value: number | null, i: number) {
    if (value == null) return ''
    const parts = [`{total|${formatCapacityPct(value)}}`]
    if (regionFilter === 'all') {
      const cVal = chennaiPct[i]
      const uVal = ukPct[i]
      if (cVal != null) parts.push(`{chennai|${REGION_LABELS.chennai} ${formatCapacityPct(cVal)}}`)
      if (uVal != null) parts.push(`{uk|${REGION_LABELS.uk} ${formatCapacityPct(uVal)}}`)
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

  const mainName = regionFilter === 'all' ? 'Total' : REGION_LABELS[regionFilter]
  const lineSeries: EChartsOption['series'] = []
  if (regionFilter === 'all') {
    lineSeries.push(
      {
        name: REGION_LABELS.chennai,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        data: chennaiPct,
        lineStyle: { width: 2, color: '#465fff' },
        itemStyle: { color: '#465fff' },
        label: pctValueLabel(c, '#465fff')
      },
      {
        name: REGION_LABELS.uk,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        data: ukPct,
        lineStyle: { width: 2, color: '#12b76a' },
        itemStyle: { color: '#12b76a' },
        label: { ...pctValueLabel(c, '#12b76a'), position: 'bottom' as const }
      }
    )
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
          lines.push(`${mainName}: <strong>${formatCapacityPct(mainPct[idx])}</strong> (${actualAt(idx)} / ${cap} SP)`)
        }
        if (regionFilter === 'all' && chennaiPct[idx] != null) {
          lines.push(`${REGION_LABELS.chennai}: <strong>${formatCapacityPct(chennaiPct[idx])}</strong> (${chennaiSp[idx]} / ${chennaiCapacity} SP)`)
        }
        if (regionFilter === 'all' && ukPct[idx] != null) {
          lines.push(`${REGION_LABELS.uk}: <strong>${formatCapacityPct(ukPct[idx])}</strong> (${ukSp[idx]} / ${ukCapacity} SP)`)
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

  return computed(() => {
    const monthly = buildMonthlySeries(filtered.value, assumeMissingSpAsOne.value)
    const squadCap = capacity.squadCapacity(selectedSquad.value)
    return buildMonthlyCapacityComparison(monthly, squadCap.chennai, squadCap.uk)
  })
}

export function useMonthlyCapacitySpChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const theme = useChartTheme()
  const comparison = useCapacityComparison()

  const chartOption = computed<EChartsOption>(() => {
    const data = comparison.value
    if (!data.labels.length) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    }
    if (!data.hasCapacity) {
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_CAPACITY_MSG) })
    }
    return buildSpChartOption(data, theme, regionFilter.value)
  })

  return { chartOption, comparison }
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
      return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_CAPACITY_MSG) })
    }
    return buildPctChartOption(data, theme, regionFilter.value)
  })

  return { chartOption, comparison }
}
