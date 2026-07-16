<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { useSupportVolumeBaselineChart } from '../../../composables/charts/useSupportCharts'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'
import PeriodNotesPanel from '../../dashboard/PeriodNotesPanel.vue'

const { dateRangeLabel } = storeToRefs(useDashboardStore())
const { chartOption, monthKeys } = useSupportVolumeBaselineChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)
</script>

<template>
  <ChartPanel
    span="full"
    title="Monthly — incident volume performance"
    :subtitle="`${dateRangeLabel} · % change vs previous month (first month is baseline)`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" height="360px" export-name="support-volume-baseline" />
    <PeriodNotesPanel :month-keys="monthKeys" />
  </ChartPanel>
</template>
