<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { useSupportMonthlyOpenedChart } from '../../../composables/charts/useSupportCharts'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const { chartOption } = useSupportMonthlyOpenedChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)
</script>

<template>
  <ChartPanel
    title="Monthly — incidents opened"
    :subtitle="`${dateRangeLabel} · by opened date`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" height="340px" export-name="support-monthly-opened" />
  </ChartPanel>
</template>
