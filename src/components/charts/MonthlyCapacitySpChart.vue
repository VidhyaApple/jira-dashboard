<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useCapacityStore } from '../../stores/capacity'
import { useMonthlyCapacitySpChart } from '../../composables/charts/useCapacityCharts'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel, selectedSquad } = storeToRefs(useDashboardStore())
const capacity = useCapacityStore()
const regionFilter = ref<CombinedChartRegionFilter>('all')
const { chartOption } = useMonthlyCapacitySpChart(regionFilter)

const baselineSummary = computed(() => {
  const b = capacity.squadMonthlyBaseline(selectedSquad.value)
  return `${b.total} SP/mo team capacity`
})
</script>

<template>
  <ChartPanel
    v-model:region-filter="regionFilter"
    show-region-filter
    span="full"
    title="Monthly — Actual vs capacity"
    :subtitle="`${dateRangeLabel} · ${baselineSummary} · completed story points by month`"
  >
    <BaseEChart :option="chartOption" height="360px" />
  </ChartPanel>
</template>
