<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useWorkTypeChart } from '../../composables/charts/useWorkTypeChart'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel, ukFilteredCount } = storeToRefs(useDashboardStore())
const { chartOption } = useWorkTypeChart('uk')
</script>

<template>
  <ChartPanel
    :title="`Work Type — ${REGION_LABELS.uk}`"
    :subtitle="`${dateRangeLabel} · ${ukFilteredCount} tickets`"
  >
    <BaseEChart :option="chartOption" />
  </ChartPanel>
</template>
