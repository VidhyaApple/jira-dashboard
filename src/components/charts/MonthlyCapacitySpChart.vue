<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useCapacityStore } from '../../stores/capacity'
import { useMonthlyCapacitySpChart } from '../../composables/charts/useCapacityCharts'
import { baselineModeLabel } from '../../utils/capacitySeries'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'
import PeriodNotesPanel from '../dashboard/PeriodNotesPanel.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const { baselineMode } = storeToRefs(useCapacityStore())
const regionFilter = ref<CombinedChartRegionFilter>('all')
const { chartOption, monthKeys } = useMonthlyCapacitySpChart(regionFilter)
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)

const subtitle = computed(() =>
  `${dateRangeLabel.value} · baseline: ${baselineModeLabel(baselineMode.value)}`
)
</script>

<template>
  <ChartPanel
    v-model:region-filter="regionFilter"
    show-region-filter
    span="full"
    title="Monthly — Actual vs baseline"
    :subtitle="subtitle"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" height="360px" export-name="capacity-actual-vs-baseline" />
    <PeriodNotesPanel :month-keys="monthKeys" />
  </ChartPanel>
</template>
