<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useQuarterlySpChart } from '../../composables/charts/useTimelineCharts'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const regionFilter = ref<CombinedChartRegionFilter>('all')
const { chartOption } = useQuarterlySpChart(regionFilter)
</script>

<template>
  <ChartPanel
    v-model:region-filter="regionFilter"
    show-region-filter
    title="Quarterly — Story points"
    :subtitle="`${dateRangeLabel} · by status category changed`"
  >
    <BaseEChart :option="chartOption" height="340px" />
  </ChartPanel>
</template>
