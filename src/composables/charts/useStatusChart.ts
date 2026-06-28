import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { countByKey } from '../../utils/count'
import { pieSliceLabel } from '../../utils/chartLabels'
import { useChartTheme } from '../useChartTheme'

const PALETTES = {
  chennai: {
    colors: ['#465fff', '#7592ff', '#9cb9ff', '#3641f5', '#262e89'],
    shadow: 'rgba(70, 95, 255, 0.45)'
  },
  uk: {
    colors: ['#12b76a', '#32d583', '#6ce9a6', '#039855', '#027a48'],
    shadow: 'rgba(18, 183, 106, 0.5)'
  }
} as const

export function useStatusChart (region: 'chennai' | 'uk') {
  const { filtered } = storeToRefs(useDashboardStore())
  const { chartColors, chartEmptyTitle, themedLegend, withChartMotion } = useChartTheme()
  const palette = PALETTES[region]

  const chartOption = computed<EChartsOption>(() => {
    const entries = Object.entries(
      countByKey(filtered.value.filter(t => t.region === region).map(t => t.status))
    )
    if (!entries.length) {
      return withChartMotion({ animationDuration: 500, title: chartEmptyTitle('No status data') })
    }
    return withChartMotion({
      tooltip: {
        transitionDuration: 0.4,
        backgroundColor: chartColors.value.tooltipBg,
        borderColor: chartColors.value.tooltipBorder,
        textStyle: { color: chartColors.value.textStrong }
      },
      legend: themedLegend(),
      color: [...palette.colors],
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
          itemStyle: { shadowBlur: 28, shadowColor: palette.shadow },
          label: {
            fontWeight: 500,
            color: chartColors.value.textStrong,
            textBorderColor: 'transparent',
            textBorderWidth: 0
          }
        },
        data: entries.map(([n, v]) => ({ name: n, value: v }))
      }]
    })
  })

  return { chartOption }
}
