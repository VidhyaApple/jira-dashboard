<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useStatusChart } from '../../composables/charts/useStatusChart'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel, ukFilteredCount } = storeToRefs(useDashboardStore())
const { chartOption } = useStatusChart('uk')
</script>

<template>
  <ChartPanel
    :title="`Status — ${REGION_LABELS.uk}`"
    :subtitle="`${dateRangeLabel} · ${ukFilteredCount} tickets`"
  >
    <BaseEChart :option="chartOption" />
  </ChartPanel>
</template>
