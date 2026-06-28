import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { effectiveStoryPoints, isMissingStoryPoints } from '../../utils/storyPoints'
import { valueLabel } from '../../utils/chartLabels'
import { BAR_ROUND, useChartTheme } from '../useChartTheme'

export function useStoryPointsRegionChart () {
  const { filtered, assumeMissingSpAsOne } = storeToRefs(useDashboardStore())
  const theme = useChartTheme()

  const chartOption = computed<EChartsOption>(() => {
    const c = theme.chartColors.value
    const assume = assumeMissingSpAsOne.value
    const chennaiTickets = filtered.value.filter(t => t.region === 'chennai')
    const ukTickets = filtered.value.filter(t => t.region === 'uk')

    const chennaiSp = chennaiTickets.reduce((a, b) => a + effectiveStoryPoints(b, assume), 0)
    const ukSp = ukTickets.reduce((a, b) => a + effectiveStoryPoints(b, assume), 0)
    const chennaiNoSp = assume ? 0 : chennaiTickets.filter(isMissingStoryPoints).length
    const ukNoSp = assume ? 0 : ukTickets.filter(isMissingStoryPoints).length

    if (!chennaiTickets.length && !ukTickets.length) {
      return theme.withChartMotion({
        animationDuration: 500,
        title: theme.chartEmptyTitle('No ticket data for the current filter')
      })
    }

    const regions = [REGION_LABELS.chennai, REGION_LABELS.uk]

    return theme.withChartMotion({
      tooltip: theme.axisTooltipRich,
      legend: theme.themedLegend(),
      grid: { left: 48, right: 52, bottom: 56, top: 32, containLabel: true },
      xAxis: {
        ...theme.themedCategoryAxis(regions),
        axisTick: { alignWithLabel: true }
      },
      yAxis: [
        theme.themedValueAxis('Story points'),
        { ...theme.themedValueAxis('No SP tickets'), minInterval: 1, splitLine: { show: false } }
      ],
      series: [
        {
          name: 'Total story points',
          type: 'bar',
          yAxisIndex: 0,
          data: [chennaiSp, ukSp],
          animationDelay: (idx: number) => idx * 110 + 90,
          animationEasing: 'elasticOut',
          barMaxWidth: 72,
          barGap: '28%',
          showBackground: true,
          backgroundStyle: { color: c.splitLine, borderRadius: BAR_ROUND },
          label: valueLabel(c),
          itemStyle: {
            borderRadius: BAR_ROUND,
            color: (params: { dataIndex?: number }) => (params.dataIndex === 0 ? '#465fff' : '#12b76a')
          },
          emphasis: {
            focus: 'series',
            itemStyle: { shadowBlur: 24, shadowColor: 'rgba(70, 95, 255, 0.35)' }
          }
        },
        {
          name: 'Tickets without SP',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: [chennaiNoSp, ukNoSp],
          animationDelay: (idx: number) => idx * 110 + 200,
          symbolSize: 10,
          lineStyle: { width: 3, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#fff' },
          label: valueLabel(c, { color: '#f59e0b' }),
          emphasis: {
            focus: 'series',
            lineStyle: { width: 4 }
          }
        }
      ]
    })
  })

  return { chartOption }
}
