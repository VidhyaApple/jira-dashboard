<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { filterByField, useSupportOpenedByChart } from '../../../composables/charts/useSupportCharts'
import { toTicketListItems } from '../../../utils/ticketExport'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'
import TicketDrilldownDrawer from '../../dashboard/TicketDrilldownDrawer.vue'

const store = useDashboardStore()
const { dateRangeLabel } = storeToRefs(store)
const { chartOption, filtered } = useSupportOpenedByChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerTickets = ref(toTicketListItems([]))

function onChartClick (params: { name?: string }) {
  const source = params.name
  if (!source) return
  drawerTitle.value = `Opened by · ${source}`
  drawerTickets.value = toTicketListItems(filterByField(filtered.value, 'openedBy', source))
  drawerOpen.value = true
}
</script>

<template>
  <ChartPanel
    title="Opened by"
    :subtitle="`${dateRangeLabel} · automation vs human sources`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" export-name="support-opened-by" @click="onChartClick" />
    <TicketDrilldownDrawer
      :open="drawerOpen"
      :title="drawerTitle"
      :tickets="drawerTickets"
      @close="drawerOpen = false"
    />
  </ChartPanel>
</template>
