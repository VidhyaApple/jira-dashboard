<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { filterByField, useSupportStateChart } from '../../../composables/charts/useSupportCharts'
import { toTicketListItems } from '../../../utils/ticketExport'
import ChartPanel from '../../ui/ChartPanel.vue'
import BaseEChart from '../BaseEChart.vue'
import TicketDrilldownDrawer from '../../dashboard/TicketDrilldownDrawer.vue'

const store = useDashboardStore()
const { dateRangeLabel, filtered } = storeToRefs(store)
const { chartOption } = useSupportStateChart()
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerTickets = ref(toTicketListItems([]))

const count = computed(() => filtered.value.length)

function onChartClick (params: { name?: string }) {
  const state = params.name
  if (!state) return
  drawerTitle.value = `State · ${state}`
  drawerTickets.value = toTicketListItems(filterByField(filtered.value, 'status', state))
  drawerOpen.value = true
}
</script>

<template>
  <ChartPanel
    title="State"
    :subtitle="`${dateRangeLabel} · ${count} incidents · click slice to drill down`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart ref="chartRef" :option="chartOption" export-name="support-state" @click="onChartClick" />
    <TicketDrilldownDrawer
      :open="drawerOpen"
      :title="drawerTitle"
      :tickets="drawerTickets"
      @close="drawerOpen = false"
    />
  </ChartPanel>
</template>
