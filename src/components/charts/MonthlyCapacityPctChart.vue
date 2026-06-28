<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useMonthlyCapacityPctChart } from '../../composables/charts/useCapacityCharts'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const regionFilter = ref<CombinedChartRegionFilter>('all')
const { chartOption } = useMonthlyCapacityPctChart(regionFilter)
</script>

<template>
  <ChartPanel
    v-model:region-filter="regionFilter"
    show-region-filter
    span="full"
    title="Monthly — Capacity utilization"
    :subtitle="`${dateRangeLabel} · % of monthly baseline completed (100% = on target)`"
  >
    <BaseEChart :option="chartOption" height="360px" />
  </ChartPanel>
</template>
