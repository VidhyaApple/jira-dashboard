<script setup lang="ts">
import { ref } from 'vue'
import ChartRegionSelect from './ChartRegionSelect.vue'
import type { CombinedChartRegionFilter } from '../../utils/chartRegion'

const props = defineProps<{
  title: string
  subtitle?: string
  span?: 'default' | 'full'
  showRegionFilter?: boolean
  onExportPng?: () => void
}>()

const regionFilter = defineModel<CombinedChartRegionFilter>('regionFilter', { default: 'all' })
const exporting = ref(false)

function exportPng () {
  if (!props.onExportPng) return
  exporting.value = true
  try {
    props.onExportPng()
  } finally {
    exporting.value = false
  }
}
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
      <div class="flex shrink-0 items-center gap-2">
        <button
          v-if="onExportPng"
          type="button"
          class="rounded border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/5"
          :disabled="exporting"
          title="Download chart as PNG"
          @click="exportPng"
        >PNG</button>
        <ChartRegionSelect v-if="showRegionFilter" v-model="regionFilter" />
      </div>
    </div>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>
