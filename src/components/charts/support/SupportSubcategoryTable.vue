<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard'
import { buildSubcategoryRows } from '../../../utils/supportSeries'
import { toTicketListItems } from '../../../utils/ticketExport'
import ChartPanel from '../../ui/ChartPanel.vue'
import TicketDrilldownDrawer from '../../dashboard/TicketDrilldownDrawer.vue'

const store = useDashboardStore()
const { dateRangeLabel, filtered } = storeToRefs(store)

const rows = computed(() => buildSubcategoryRows(filtered.value))

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerTickets = ref(toTicketListItems([]))

function openSubcategory (subcategory: string) {
  const tickets = filtered.value.filter(t => (t.subcategory?.trim() || 'Other') === subcategory)
  drawerTitle.value = `Subcategory · ${subcategory}`
  drawerTickets.value = toTicketListItems(tickets)
  drawerOpen.value = true
}
</script>

<template>
  <ChartPanel
    v-if="rows.length"
    span="full"
    title="Subcategory"
    :subtitle="`${dateRangeLabel} · click a row to drill down`"
  >
    <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table class="min-w-[480px] w-full text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
          <tr>
            <th class="px-4 py-3 font-medium">Subcategory</th>
            <th class="px-4 py-3 font-medium">Category</th>
            <th class="px-4 py-3 font-medium text-right">Count</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="row in rows"
            :key="row.subcategory"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            @click="openSubcategory(row.subcategory)"
          >
            <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{{ row.subcategory }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ row.category }}</td>
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-brand-600 dark:text-brand-400">{{ row.count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <TicketDrilldownDrawer
      :open="drawerOpen"
      :title="drawerTitle"
      :tickets="drawerTickets"
      @close="drawerOpen = false"
    />
  </ChartPanel>
</template>
