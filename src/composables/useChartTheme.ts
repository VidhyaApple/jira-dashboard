import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import { useThemeStore, chartThemeColors } from '../stores/theme'

export const BAR_ROUND: [number, number, number, number] = [10, 10, 0, 0]
export const NO_DATE_MSG = 'No issues with a valid Status Category Changed date in the current filter'

export function useChartTheme () {
  const themeStore = useThemeStore()
  const chartColors = computed(() => chartThemeColors(themeStore.mode))

  function chartEmptyTitle (text: string) {
    return {
      text,
      left: 'center' as const,
      top: 'middle' as const,
      textStyle: { color: chartColors.value.empty, fontSize: 14 }
    }
  }

  function themedLegend () {
    return { bottom: 0, textStyle: { color: chartColors.value.text } }
  }

  function themedValueAxis (name?: string) {
    const c = chartColors.value
    return {
      type: 'value' as const,
      name,
      nameTextStyle: { color: c.text },
      axisLabel: { color: c.text },
      axisLine: { lineStyle: { color: c.axis } },
      splitLine: { lineStyle: { color: c.splitLine } }
    }
  }

  function themedCategoryAxis (data: string[], boundaryGap = true) {
    const c = chartColors.value
    return {
      type: 'category' as const,
      data,
      boundaryGap,
      axisLabel: { color: c.text, rotate: data.length > 6 ? 35 : 0 },
      axisLine: { lineStyle: { color: c.axis } },
      axisTick: { show: false }
    }
  }

  function withChartMotion (opt: EChartsOption): EChartsOption {
    return {
      animation: true,
      animationDuration: 1650,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 1200,
      animationEasingUpdate: 'cubicOut',
      ...opt
    }
  }

  const axisTooltipRich = {
    trigger: 'axis' as const,
    transitionDuration: 0.45,
    axisPointer: {
      type: 'shadow' as const,
      shadowStyle: { opacity: 0.22 },
      animation: true,
      animationDuration: 350,
      animationDurationUpdate: 250
    }
  }

  const axisTooltipLine = {
    trigger: 'axis' as const,
    transitionDuration: 0.45,
    axisPointer: {
      type: 'line' as const,
      lineStyle: { width: 2, color: 'rgba(99, 102, 241, 0.45)' },
      animation: true,
      animationDuration: 380
    }
  }

  return {
    chartColors,
    chartEmptyTitle,
    themedLegend,
    themedValueAxis,
    themedCategoryAxis,
    withChartMotion,
    axisTooltipRich,
    axisTooltipLine
  }
}
