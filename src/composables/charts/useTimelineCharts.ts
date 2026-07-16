import { computed, type Ref } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { buildQuarterlySeries, buildMonthlySeries } from '../../utils/timelineSeries'
import { CHENNAI_STYLE, UK_STYLE, showChennaiSeries, showUkSeries, type CombinedChartRegionFilter } from '../../utils/chartRegion'
import { valueLabel } from '../../utils/chartLabels'
import { NO_DATE_MSG, useChartTheme } from '../useChartTheme'

function useTimelineStore () {
  const { filtered, assumeMissingSpAsOne } = storeToRefs(useDashboardStore())
  return { filtered, assumeMissingSpAsOne }
}

function buildSpLineSeries (
  chennaiSp: number[],
  ukSp: number[],
  regionFilter: CombinedChartRegionFilter,
  theme: ReturnType<typeof useChartTheme>
) {
  const c = theme.chartColors.value
  const series: EChartsOption['series'] = []
  if (showChennaiSeries(regionFilter)) {
    series.push({
      name: REGION_LABELS.chennai, type: 'line', smooth: true, showSymbol: true, symbolSize: 8,
      data: chennaiSp, animationDelay: (idx: number) => idx * 45 + 80,
      lineStyle: { width: 3, color: CHENNAI_STYLE.main }, itemStyle: { color: CHENNAI_STYLE.main },
      areaStyle: { color: CHENNAI_STYLE.area },
      label: valueLabel(c, { color: CHENNAI_STYLE.main }),
      emphasis: { focus: 'series', lineStyle: { width: 4 } }
    })
  }
  if (showUkSeries(regionFilter)) {
    series.push({
      name: REGION_LABELS.uk, type: 'line', smooth: true, showSymbol: true, symbolSize: 8,
      data: ukSp, animationDelay: (idx: number) => idx * 45 + 130,
      lineStyle: { width: 3, color: UK_STYLE.main }, itemStyle: { color: UK_STYLE.main },
      areaStyle: { color: UK_STYLE.area },
      label: valueLabel(c, { color: UK_STYLE.main, position: 'bottom' }),
      emphasis: { focus: 'series', lineStyle: { width: 4 } }
    })
  }
  return series
}

function buildCountBarSeries (
  chennaiN: number[],
  ukN: number[],
  regionFilter: CombinedChartRegionFilter,
  theme: ReturnType<typeof useChartTheme>
) {
  const c = theme.chartColors.value
  const series: EChartsOption['series'] = []
  // Do not stack CIEC + Team — Team already includes CIEC
  if (showChennaiSeries(regionFilter)) {
    series.push({
      name: REGION_LABELS.chennai, type: 'bar', data: chennaiN,
      animationDelay: (idx: number) => idx * 45 + 80, animationEasing: 'elasticOut', barMaxWidth: 52,
      label: valueLabel(c, { inside: true, position: 'inside' }),
      itemStyle: { color: CHENNAI_STYLE.light, borderRadius: [8, 8, 0, 0] },
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 16, shadowColor: 'rgba(117, 146, 255, 0.5)' } }
    })
  }
  if (showUkSeries(regionFilter)) {
    series.push({
      name: REGION_LABELS.uk, type: 'bar', data: ukN,
      animationDelay: (idx: number) => idx * 45 + 120, animationEasing: 'elasticOut', barMaxWidth: 52,
      label: valueLabel(c, { inside: true, position: 'inside' }),
      itemStyle: { color: UK_STYLE.light, borderRadius: [8, 8, 0, 0] },
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 16, shadowColor: 'rgba(50, 213, 131, 0.5)' } }
    })
  }
  return series
}

function buildCountLineSeries (
  chennaiN: number[],
  ukN: number[],
  regionFilter: CombinedChartRegionFilter,
  theme: ReturnType<typeof useChartTheme>
) {
  const c = theme.chartColors.value
  const series: EChartsOption['series'] = []
  // Do not stack CIEC + Team — Team already includes CIEC
  if (showChennaiSeries(regionFilter)) {
    series.push({
      name: REGION_LABELS.chennai, type: 'line', smooth: true, symbolSize: 4,
      data: chennaiN, animationDelay: (idx: number) => idx * 28 + 65,
      lineStyle: { width: 1.5, color: CHENNAI_STYLE.main }, itemStyle: { color: CHENNAI_STYLE.main },
      areaStyle: { color: 'rgba(117, 146, 255, 0.25)' },
      label: valueLabel(c, { color: CHENNAI_STYLE.main }),
      emphasis: { focus: 'series' }
    })
  }
  if (showUkSeries(regionFilter)) {
    series.push({
      name: REGION_LABELS.uk, type: 'line', smooth: true, symbolSize: 4,
      data: ukN, animationDelay: (idx: number) => idx * 28 + 100,
      lineStyle: { width: 1.5, color: '#039855' }, itemStyle: { color: '#039855' },
      areaStyle: { color: 'rgba(50, 213, 131, 0.25)' },
      label: valueLabel(c, { color: UK_STYLE.main, position: 'bottom' }),
      emphasis: { focus: 'series' }
    })
  }
  return series
}

export function useQuarterlySpChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const { filtered, assumeMissingSpAsOne } = useTimelineStore()
  const theme = useChartTheme()
  const series = computed(() => buildQuarterlySeries(filtered.value, assumeMissingSpAsOne.value))

  const chartOption = computed<EChartsOption>(() => {
    const { labels, chennaiSp, ukSp } = series.value
    if (!labels.length) return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    return theme.withChartMotion({
      tooltip: theme.axisTooltipLine,
      legend: theme.themedLegend(),
      grid: { left: 48, right: 24, bottom: 56, top: 40, containLabel: true },
      xAxis: theme.themedCategoryAxis(labels, false),
      yAxis: theme.themedValueAxis('Story points'),
      series: buildSpLineSeries(chennaiSp, ukSp, regionFilter.value, theme)
    })
  })

  return { chartOption }
}

export function useQuarterlyCountChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const { filtered, assumeMissingSpAsOne } = useTimelineStore()
  const theme = useChartTheme()
  const series = computed(() => buildQuarterlySeries(filtered.value, assumeMissingSpAsOne.value))

  const chartOption = computed<EChartsOption>(() => {
    const { labels, chennaiN, ukN } = series.value
    if (!labels.length) return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    return theme.withChartMotion({
      tooltip: theme.axisTooltipRich,
      legend: theme.themedLegend(),
      grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
      xAxis: { ...theme.themedCategoryAxis(labels), axisTick: { alignWithLabel: true } },
      yAxis: { ...theme.themedValueAxis('Tickets'), minInterval: 1 },
      series: buildCountBarSeries(chennaiN, ukN, regionFilter.value, theme)
    })
  })

  return { chartOption }
}

export function useMonthlySpChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const { filtered, assumeMissingSpAsOne } = useTimelineStore()
  const theme = useChartTheme()
  const series = computed(() => buildMonthlySeries(filtered.value, assumeMissingSpAsOne.value))

  const chartOption = computed<EChartsOption>(() => {
    const { labels, chennaiSp, ukSp } = series.value
    if (!labels.length) return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    const c = theme.chartColors.value
    const lineSeries: EChartsOption['series'] = []
    if (showChennaiSeries(regionFilter.value)) {
      lineSeries.push({
        name: REGION_LABELS.chennai, type: 'line', smooth: true, symbolSize: 6,
        data: chennaiSp, animationDelay: (idx: number) => idx * 32 + 70,
        lineStyle: { width: 2.5, color: CHENNAI_STYLE.main }, itemStyle: { color: CHENNAI_STYLE.main },
        label: valueLabel(c, { color: CHENNAI_STYLE.main }),
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: CHENNAI_STYLE.areaStrong },
              { offset: 1, color: 'rgba(70, 95, 255, 0.02)' }
            ]
          }
        },
        emphasis: { focus: 'series' }
      })
    }
    if (showUkSeries(regionFilter.value)) {
      lineSeries.push({
        name: REGION_LABELS.uk, type: 'line', smooth: true, symbolSize: 6,
        data: ukSp, animationDelay: (idx: number) => idx * 32 + 110,
        lineStyle: { width: 2.5, color: UK_STYLE.main }, itemStyle: { color: UK_STYLE.main },
        label: valueLabel(c, { color: UK_STYLE.main, position: 'bottom' }),
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: UK_STYLE.areaStrong },
              { offset: 1, color: 'rgba(18, 183, 106, 0.02)' }
            ]
          }
        },
        emphasis: { focus: 'series' }
      })
    }
    return theme.withChartMotion({
      tooltip: theme.axisTooltipLine,
      legend: theme.themedLegend(),
      grid: { left: 48, right: 24, bottom: 56, top: 40, containLabel: true },
      xAxis: theme.themedCategoryAxis(labels, false),
      yAxis: theme.themedValueAxis('Story points'),
      series: lineSeries
    })
  })

  return { chartOption }
}

export function useMonthlyCountChart (regionFilter: Ref<CombinedChartRegionFilter>) {
  const { filtered, assumeMissingSpAsOne } = useTimelineStore()
  const theme = useChartTheme()
  const series = computed(() => buildMonthlySeries(filtered.value, assumeMissingSpAsOne.value))

  const chartOption = computed<EChartsOption>(() => {
    const { labels, chennaiN, ukN } = series.value
    if (!labels.length) return theme.withChartMotion({ animationDuration: 500, title: theme.chartEmptyTitle(NO_DATE_MSG) })
    return theme.withChartMotion({
      tooltip: theme.axisTooltipLine,
      legend: theme.themedLegend(),
      grid: { left: 48, right: 24, bottom: 56, top: 40, containLabel: true },
      xAxis: theme.themedCategoryAxis(labels, false),
      yAxis: { ...theme.themedValueAxis('Tickets'), minInterval: 1 },
      series: buildCountLineSeries(chennaiN, ukN, regionFilter.value, theme)
    })
  })

  return { chartOption }
}
