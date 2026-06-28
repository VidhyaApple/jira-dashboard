<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useStoryPointsRegionChart } from '../../composables/charts/useStoryPointsRegionChart'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const { dateRangeLabel, totalFilteredSP } = storeToRefs(useDashboardStore())
const { chartOption } = useStoryPointsRegionChart()
</script>

<template>
  <ChartPanel
    span="full"
    title="Story Points by Region"
    :subtitle="`${dateRangeLabel} · ${totalFilteredSP} SP total · bars = story points, line = tickets without SP`"
  >
    <BaseEChart :option="chartOption" height="320px" />
  </ChartPanel>
</template>
