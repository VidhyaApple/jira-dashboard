<script setup lang="ts">
import { REGION_LABELS } from '../../config/squads'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'

const model = defineModel<CombinedChartRegionFilter>({ default: 'all' })

const selectClass =
  'h-8 shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 text-xs dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200'
</script>

<template>
  <select v-model="model" :class="selectClass" aria-label="Filter by region">
    <option value="all">All regions</option>
    <option value="chennai">{{ REGION_LABELS.chennai }}</option>
    <option value="uk">{{ REGION_LABELS.uk }}</option>
  </select>
</template>
