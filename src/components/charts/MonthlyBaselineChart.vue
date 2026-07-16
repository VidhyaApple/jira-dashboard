<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useMonthlyBaselineChart } from '../../composables/charts/useBaselineCharts'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'
import PeriodNotesPanel from '../dashboard/PeriodNotesPanel.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const regionFilter = ref<CombinedChartRegionFilter>('all')
const { chartOption, monthKeys } = useMonthlyBaselineChart(regionFilter)
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)
</script>

<template>
  <ChartPanel
    v-model:region-filter="regionFilter"
    show-region-filter
    span="full"
    title="Monthly — Story points performance"
    :subtitle="`${dateRangeLabel} · % change vs previous month (first month is baseline)`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" height="360px" export-name="monthly-baseline" />
    <PeriodNotesPanel :month-keys="monthKeys" />
  </ChartPanel>
</template>
