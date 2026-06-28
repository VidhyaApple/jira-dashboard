import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { countByKey } from '../../utils/count'
import { escapeHtml } from '../../utils/html'
import { sumStoryPointsByWorkType } from '../../utils/workType'
import { BAR_ROUND, useChartTheme } from '../useChartTheme'

const STYLES = {
  chennai: { barColor: '#465fff', shadow: 'rgba(70, 95, 255, 0.45)' },
  uk: { barColor: '#12b76a', shadow: 'rgba(18, 183, 106, 0.45)' }
} as const

export function useWorkTypeChart (region: 'chennai' | 'uk') {
  const { filtered, assumeMissingSpAsOne } = storeToRefs(useDashboardStore())
  const {
    chartColors,
    chartEmptyTitle,
    themedValueAxis,
    themedCategoryAxis,
    withChartMotion,
    axisTooltipRich
  } = useChartTheme()
  const style = STYLES[region]

  const chartOption = computed<EChartsOption>(() => {
    const regionTickets = filtered.value.filter(t => t.region === region)
    const counts = countByKey(regionTickets.map(t => t.workType))
    const storyPoints = sumStoryPointsByWorkType(regionTickets, assumeMissingSpAsOne.value)
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const keys = sorted.map(x => x[0])
    const vals = sorted.map(([workType, ticketCount]) => ({
      value: ticketCount,
      sp: storyPoints[workType] ?? 0
    }))

    if (!keys.length) {
      return withChartMotion({ animationDuration: 500, title: chartEmptyTitle('No work type data') })
    }

    const c = chartColors.value
    return withChartMotion({
      tooltip: {
        ...axisTooltipRich,
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params[0] : params as { axisValue?: string; value?: number; data?: { sp?: number } }
          const workType = String(p?.axisValue ?? '')
          const ticketCount = Number(p?.value ?? 0)
          const sp = Number(p?.data?.sp ?? storyPoints[workType] ?? 0)
          const label = sp > 0 ? `${ticketCount} (${sp} SP)` : `${ticketCount}`
          return [
            `<div style="font-weight:700;margin-bottom:4px">${escapeHtml(workType)}</div>`,
            `<div>${escapeHtml(label)}</div>`
          ].join('')
        }
      },
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
        backgroundStyle: { color: c.splitLine, borderRadius: [0, BAR_ROUND[0], BAR_ROUND[1], 0] },
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => {
            const ticketCount = Number(params.value ?? 0)
            const sp = Number(params.data?.sp ?? 0)
            return sp > 0 ? `${ticketCount} (${sp} SP)` : `${ticketCount}`
          },
          fontWeight: 600,
          color: c.textStrong
        },
        itemStyle: { color: style.barColor, borderRadius: [0, 10, 10, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 22, shadowColor: style.shadow } }
      }]
    })
  })

  return { chartOption }
}
