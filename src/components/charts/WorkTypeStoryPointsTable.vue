<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { toTicketListItems } from '../../utils/ticketExport'
import ChartPanel from '../ui/ChartPanel.vue'
import TicketDrilldownDrawer from '../dashboard/TicketDrilldownDrawer.vue'

const store = useDashboardStore()
const { dateRangeLabel, workTypeStoryPointRows, filtered, assumeMissingSpAsOne } = storeToRefs(store)

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerTickets = ref(toTicketListItems([]))

function openWorkType (workType: string, region: 'chennai' | 'uk') {
  const tickets = filtered.value.filter(t => t.workType === workType && t.region === region)
  drawerTitle.value = `${workType} · ${REGION_LABELS[region]}`
  drawerTickets.value = toTicketListItems(tickets, assumeMissingSpAsOne.value)
  drawerOpen.value = true
}
</script>

<template>
  <ChartPanel
    v-if="workTypeStoryPointRows.length"
    span="full"
    title="Story Points by Work Type"
    :subtitle="`${dateRangeLabel} · ${REGION_LABELS.chennai} / ${REGION_LABELS.uk} · click a column to drill down`"
  >
    <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table class="min-w-[720px] w-full text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
          <tr>
            <th class="px-4 py-3 font-medium">Work type</th>
            <th class="px-4 py-3 font-medium">{{ REGION_LABELS.chennai }}</th>
            <th class="px-4 py-3 font-medium" title="Squad total (includes CIEC)">{{ REGION_LABELS.uk }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="row in workTypeStoryPointRows"
            :key="row.workType"
            class="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
          >
            <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{{ row.workType }}</td>
            <td class="cursor-pointer px-4 py-3" @click="openWorkType(row.workType, 'chennai')">
              <div class="mb-2 text-sm font-semibold tabular-nums text-brand-600 dark:text-brand-400">
                {{ row.chennai.sp }} SP / {{ row.chennai.count }} tickets
                <span v-if="row.chennai.noSpCount" class="ml-1 text-xs font-medium text-amber-600 dark:text-amber-400">· {{ row.chennai.noSpCount }} no SP</span>
              </div>
              <div class="flex max-w-md flex-wrap gap-1.5">
                <template v-for="ticket in row.chennai.visibleTickets" :key="`chennai-${row.workType}-${ticket.key}`">
                  <a v-if="ticket.href" :href="ticket.href" target="_blank" rel="noopener noreferrer" class="badge badge-ciec" @click.stop>{{ ticket.key }} · {{ ticket.storyPoints }} SP</a>
                  <span v-else class="badge badge-ciec">{{ ticket.key }} · {{ ticket.storyPoints }} SP</span>
                </template>
                <span v-if="row.chennai.moreCount" class="badge badge-muted">+{{ row.chennai.moreCount }} more</span>
                <span v-if="!row.chennai.count" class="text-xs text-gray-400">—</span>
              </div>
            </td>
            <td class="cursor-pointer px-4 py-3" @click="openWorkType(row.workType, 'uk')">
              <div class="mb-2 text-sm font-semibold tabular-nums text-success-600 dark:text-success-400">
                {{ row.uk.sp }} SP / {{ row.uk.count }} tickets
                <span v-if="row.uk.noSpCount" class="ml-1 text-xs font-medium text-amber-600 dark:text-amber-400">· {{ row.uk.noSpCount }} no SP</span>
              </div>
              <div class="flex max-w-md flex-wrap gap-1.5">
                <template v-for="ticket in row.uk.visibleTickets" :key="`uk-${row.workType}-${ticket.key}`">
                  <a v-if="ticket.href" :href="ticket.href" target="_blank" rel="noopener noreferrer" class="badge badge-team" @click.stop>{{ ticket.key }} · {{ ticket.storyPoints }} SP</a>
                  <span v-else class="badge badge-team">{{ ticket.key }} · {{ ticket.storyPoints }} SP</span>
                </template>
                <span v-if="row.uk.moreCount" class="badge badge-muted">+{{ row.uk.moreCount }} more</span>
                <span v-if="!row.uk.count" class="text-xs text-gray-400">—</span>
              </div>
            </td>
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
