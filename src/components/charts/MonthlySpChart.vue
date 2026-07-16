<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useMonthlySpChart } from '../../composables/charts/useTimelineCharts'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const regionFilter = ref<CombinedChartRegionFilter>('all')
const { chartOption } = useMonthlySpChart(regionFilter)
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)
</script>

<template>
  <ChartPanel
    v-model:region-filter="regionFilter"
    show-region-filter
    title="Monthly — Story points"
    :subtitle="`${dateRangeLabel} · by status category changed`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" height="340px" export-name="monthly-sp" />
  </ChartPanel>
</template>
