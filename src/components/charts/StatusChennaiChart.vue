<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useStatusChart } from '../../composables/charts/useStatusChart'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel, chennaiFilteredCount } = storeToRefs(useDashboardStore())
const { chartOption } = useStatusChart('chennai')
</script>

<template>
  <ChartPanel
    :title="`Status — ${REGION_LABELS.chennai}`"
    :subtitle="`${dateRangeLabel} · ${chennaiFilteredCount} tickets`"
  >
    <BaseEChart :option="chartOption" />
  </ChartPanel>
</template>
