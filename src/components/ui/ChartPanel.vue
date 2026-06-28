<script setup lang="ts">
import ChartRegionSelect from './ChartRegionSelect.vue'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'

defineProps<{
  title: string
  subtitle?: string
  span?: 'default' | 'full'
  showRegionFilter?: boolean
}>()

const regionFilter = defineModel<CombinedChartRegionFilter>('regionFilter', { default: 'all' })
</script>

<template>
  <div
    class="overflow-hidden rounded bg-white shadow-sm dark:bg-[#2f353a]"
    :class="span === 'full' ? 'md:col-span-2' : ''"
  >
    <div class="flex items-start justify-between gap-3 border-b border-[#c8ced3] px-4 py-3 dark:border-gray-700">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ title }}</h3>
        <p v-if="subtitle" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>
      <ChartRegionSelect v-if="showRegionFilter" v-model="regionFilter" />
    </div>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>
