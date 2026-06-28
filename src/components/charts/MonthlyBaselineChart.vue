<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useMonthlyBaselineChart } from '../../composables/charts/useBaselineCharts'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const regionFilter = ref<CombinedChartRegionFilter>('all')
const { chartOption } = useMonthlyBaselineChart(regionFilter)
</script>

<template>
  <ChartPanel
    v-model:region-filter="regionFilter"
    show-region-filter
    span="full"
    title="Monthly — Story points performance"
    :subtitle="`${dateRangeLabel} · % change vs previous month (first month is baseline)`"
  >
    <BaseEChart :option="chartOption" height="360px" />
  </ChartPanel>
</template>
