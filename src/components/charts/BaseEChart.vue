<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

withDefaults(defineProps<{
  option: EChartsOption
  height?: string
  minWidth?: string
}>(), {
  height: '300px'
})
</script>

<template>
  <v-chart
    :option="option"
    autoresize
    :style="{ height, minWidth: minWidth ?? undefined }"
  />
</template>
