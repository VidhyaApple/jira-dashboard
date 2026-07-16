<script setup lang="ts">
import { ref } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

const props = withDefaults(defineProps<{
  option: EChartsOption
  height?: string
  minWidth?: string
  exportName?: string
}>(), {
  height: '300px',
  exportName: 'chart'
})

const chartRef = ref<{
  getDataURL?: (opts?: { type?: string; pixelRatio?: number; backgroundColor?: string }) => string
} | null>(null)

defineExpose({
  exportPng () {
    const url = chartRef.value?.getDataURL?.({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    })
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.exportName}.png`
    a.click()
  }
})
</script>

<template>
  <v-chart
    ref="chartRef"
    :option="option"
    autoresize
    :style="{ height, minWidth: minWidth ?? undefined }"
    v-bind="$attrs"
  />
</template>
