<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useStatusChart } from '../../composables/charts/useStatusChart'
import { toTicketListItems } from '../../utils/ticketExport'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'
import TicketDrilldownDrawer from '../dashboard/TicketDrilldownDrawer.vue'

const props = defineProps<{ region: 'chennai' | 'uk' }>()

const store = useDashboardStore()
const { dateRangeLabel, assumeMissingSpAsOne, filtered } = storeToRefs(store)
const { chartOption } = useStatusChart(props.region)
const chartRef = ref<InstanceType<typeof BaseEChart> | null>(null)

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerTickets = ref(toTicketListItems([]))

const count = computed(() =>
  filtered.value.filter(t => t.region === props.region).length
)

function onChartClick (params: { name?: string }) {
  const status = params.name
  if (!status) return
  const tickets = filtered.value.filter(
    t => t.region === props.region && t.status === status
  )
  drawerTitle.value = `${REGION_LABELS[props.region]} · ${status}`
  drawerTickets.value = toTicketListItems(tickets, assumeMissingSpAsOne.value)
  drawerOpen.value = true
}
</script>

<template>
  <ChartPanel
    :title="`Status — ${REGION_LABELS[region]}`"
    :subtitle="`${dateRangeLabel} · ${count} tickets · click slice to drill down`"
    :on-export-png="() => chartRef?.exportPng()"
  >
    <BaseEChart
      ref="chartRef"
      :option="chartOption"
      :export-name="`status-${region}`"
      @click="onChartClick"
    />
    <TicketDrilldownDrawer
      :open="drawerOpen"
      :title="drawerTitle"
      :tickets="drawerTickets"
      @close="drawerOpen = false"
    />
  </ChartPanel>
</template>
