<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { buildMonthlyOpenedSeries } from '../../utils/supportSeries'
import { sparklinePath } from '../../utils/velocity'
import { isClosedTicket } from '../../utils/ticketFilters'

const store = useDashboardStore()
const {
  supportSquadTickets,
  filtered,
  supportAvgResolutionDays,
  supportLinkedChildCount,
  doneTicketsOnly
} = storeToRefs(store)

const monthly = computed(() => buildMonthlyOpenedSeries(filtered.value))

const closedPct = computed(() => {
  const total = filtered.value.length
  if (!total) return 0
  const closed = filtered.value.filter(isClosedTicket).length
  return Math.round((closed / total) * 1000) / 10
})

const kpis = computed(() => {
  const total = supportSquadTickets.value.length
  const filt = filtered.value.length
  const avgDays = supportAvgResolutionDays.value
  const linked = supportLinkedChildCount.value
  const pctFiltered = total ? Math.round((filt / total) * 100) : 0
  const countSpark = sparklinePath(monthly.value.counts)

  return [
    {
      label: 'Incidents',
      value: total.toLocaleString(),
      sub: `${pctFiltered}% filtered`,
      color: 'bg-[#6f42c1]',
      spark: countSpark
    },
    {
      label: 'Filtered',
      value: filt.toLocaleString(),
      sub: doneTicketsOnly.value
        ? 'Closed only'
        : `${closedPct.value}% Closed`,
      color: 'bg-[#20a8d8]',
      spark: countSpark
    },
    {
      label: 'Avg resolution',
      value: avgDays != null ? `${avgDays} days` : '—',
      sub: 'Age of Task',
      color: 'bg-[#ffc107]',
      spark: countSpark
    },
    {
      label: 'Parent-linked',
      value: linked.toLocaleString(),
      sub: 'In export',
      color: 'bg-[#f86c6b]',
      spark: sparklinePath(
        buildMonthlyOpenedSeries(filtered.value.filter(t => t.parentKey)).counts
      )
    }
  ]
})
</script>

<template>
  <div v-if="supportSquadTickets.length" id="overview" class="scroll-mt-20 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="kpi in kpis"
      :key="kpi.label"
      class="relative overflow-hidden rounded shadow-sm"
      :class="kpi.color"
    >
      <div class="p-4 pb-0">
        <p class="text-2xl font-light text-white">{{ kpi.value }}</p>
        <p class="text-sm font-medium text-white/90">{{ kpi.label }}</p>
        <p class="mt-0.5 text-xs text-white/70">{{ kpi.sub }}</p>
      </div>
      <svg class="mt-2 h-10 w-full" viewBox="0 0 120 24" preserveAspectRatio="none">
        <path :d="kpi.spark" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" />
      </svg>
    </div>
  </div>
</template>
