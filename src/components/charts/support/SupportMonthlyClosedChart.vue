<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { useSupportMonthlyClosedChart } from '../../../composables/charts/useSupportCharts'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const { chartOption } = useSupportMonthlyClosedChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)
</script>

<template>
  <ChartPanel
    title="Monthly — incidents closed"
    :subtitle="`${dateRangeLabel} · by closed date`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" height="340px" export-name="support-monthly-closed" />
  </ChartPanel>
</template>
