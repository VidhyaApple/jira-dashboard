<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { filterByField, useSupportAssigneeChart } from '../../../composables/charts/useSupportCharts'
import { toTicketListItems } from '../../../utils/ticketExport'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'
import TicketDrilldownDrawer from '../../dashboard/TicketDrilldownDrawer.vue'

const store = useDashboardStore()
const { dateRangeLabel } = storeToRefs(store)
const { chartOption, filtered } = useSupportAssigneeChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerTickets = ref(toTicketListItems([]))

function onChartClick (params: { name?: string }) {
  const assignee = params.name
  if (!assignee) return
  drawerTitle.value = `Assigned to · ${assignee}`
  drawerTickets.value = toTicketListItems(filterByField(filtered.value, 'assignedTo', assignee))
  drawerOpen.value = true
}
</script>

<template>
  <ChartPanel
    title="Assignee workload"
    :subtitle="`${dateRangeLabel} · top resolvers`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" export-name="support-assignee" @click="onChartClick" />
    <TicketDrilldownDrawer
      :open="drawerOpen"
      :title="drawerTitle"
      :tickets="drawerTickets"
      @close="drawerOpen = false"
    />
  </ChartPanel>
</template>
