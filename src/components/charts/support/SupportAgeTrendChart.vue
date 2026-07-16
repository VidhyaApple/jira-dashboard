<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { useSupportAgeTrendChart } from '../../../composables/charts/useSupportCharts'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const { chartOption } = useSupportAgeTrendChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)
</script>

<template>
  <ChartPanel
    title="Resolution age trend"
    :subtitle="`${dateRangeLabel} · monthly avg Age of Task (days)`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" height="340px" export-name="support-age-trend" />
  </ChartPanel>
</template>
