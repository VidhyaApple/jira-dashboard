<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import {
  buildMonthlySpBuckets,
  doneSplit,
  sparklinePath
} from '../../utils/velocity'

const store = useDashboardStore()
const {
  squadTeamTickets,
  teamFiltered,
  totalFilteredSP,
  teamLinkedChildCount,
  assumeMissingSpAsOne,
  doneTicketsOnly
} = storeToRefs(store)

const monthly = computed(() =>
  buildMonthlySpBuckets(teamFiltered.value, assumeMissingSpAsOne.value)
)

const split = computed(() => doneSplit(teamFiltered.value))

const kpis = computed(() => {
  const total = squadTeamTickets.value.length
  const filt = teamFiltered.value.length
  const sp = totalFilteredSP.value
  const linked = teamLinkedChildCount.value
  const pctFiltered = total ? Math.round((filt / total) * 100) : 0
  const spSpark = sparklinePath(monthly.value.map(p => p.sp))
  const countSpark = sparklinePath(monthly.value.map(p => p.count))

  return [
    {
      label: 'Tickets',
      value: total.toLocaleString(),
      sub: `${pctFiltered}% filtered · Team`,
      color: 'bg-[#6f42c1]',
      spark: countSpark
    },
    {
      label: 'Filtered',
      value: filt.toLocaleString(),
      sub: doneTicketsOnly.value
        ? 'Team · Done only'
        : `Team · ${split.value.donePct}% Done`,
      color: 'bg-[#20a8d8]',
      spark: countSpark
    },
    {
      label: 'Story Points',
      value: sp.toLocaleString(),
      sub: assumeMissingSpAsOne.value ? 'Team SP (missing = 1)' : 'Team SP',
      color: 'bg-[#ffc107]',
      spark: spSpark
    },
    {
      label: 'Linked',
      value: linked.toLocaleString(),
      sub: 'Team · in export',
      color: 'bg-[#f86c6b]',
      spark: sparklinePath(
        buildMonthlySpBuckets(
          teamFiltered.value.filter(t => t.parentKey),
          assumeMissingSpAsOne.value
        ).map(p => p.count)
      )
    }
  ]
})
</script>

<template>
  <div v-if="squadTeamTickets.length" id="overview" class="scroll-mt-20 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
