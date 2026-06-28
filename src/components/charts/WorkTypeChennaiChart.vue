<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useWorkTypeChart } from '../../composables/charts/useWorkTypeChart'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel, chennaiFilteredCount } = storeToRefs(useDashboardStore())
const { chartOption } = useWorkTypeChart('chennai')
</script>

<template>
  <ChartPanel
    :title="`Work Type — ${REGION_LABELS.chennai}`"
    :subtitle="`${dateRangeLabel} · ${chennaiFilteredCount} tickets`"
  >
    <BaseEChart :option="chartOption" />
  </ChartPanel>
</template>
