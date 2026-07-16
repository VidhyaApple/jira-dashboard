<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { filterByField, useSupportCategoryChart } from '../../../composables/charts/useSupportCharts'
import { toTicketListItems } from '../../../utils/ticketExport'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'
import TicketDrilldownDrawer from '../../dashboard/TicketDrilldownDrawer.vue'

const store = useDashboardStore()
const { dateRangeLabel } = storeToRefs(store)
const { chartOption, filtered } = useSupportCategoryChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerTickets = ref(toTicketListItems([]))

function onChartClick (params: { name?: string }) {
  const category = params.name
  if (!category) return
  drawerTitle.value = `Category · ${category}`
  drawerTickets.value = toTicketListItems(filterByField(filtered.value, 'category', category))
  drawerOpen.value = true
}
</script>

<template>
  <ChartPanel
    title="Category"
    :subtitle="`${dateRangeLabel} · click bar to drill down`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" export-name="support-category" @click="onChartClick" />
    <TicketDrilldownDrawer
      :open="drawerOpen"
      :title="drawerTitle"
      :tickets="drawerTickets"
      @close="drawerOpen = false"
    />
  </ChartPanel>
</template>
