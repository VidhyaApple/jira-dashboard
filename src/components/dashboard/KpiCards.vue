<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { ticketTimelineDate, parseTicketDate, monthKey } from '../../utils/dates'
import { effectiveStoryPoints } from '../../utils/storyPoints'
import type { Ticket } from '../../types/ticket'

const store = useDashboardStore()
const { tickets, filtered, totalFilteredSP, issueHierarchyMeta, assumeMissingSpAsOne } = storeToRefs(store)

const kpis = computed(() => {
  const total = tickets.value.length
  const filt = filtered.value.length
  const sp = totalFilteredSP.value
  const linked = issueHierarchyMeta.value.linkedChildCount
  const pctFiltered = total ? Math.round((filt / total) * 100) : 0

  return [
    {
      label: 'Tickets',
      value: total.toLocaleString(),
      sub: `${pctFiltered}% filtered`,
      color: 'bg-[#6f42c1]',
      spark: buildSparkline(filtered.value)
    },
    {
      label: 'Filtered',
      value: filt.toLocaleString(),
      sub: 'Active filter',
      color: 'bg-[#20a8d8]',
      spark: buildSparkline(filtered.value.filter(t => t.region === 'chennai'))
    },
    {
      label: 'Story Points',
      value: sp.toLocaleString(),
      sub: assumeMissingSpAsOne.value ? 'Total SP (missing = 1)' : 'Total SP',
      color: 'bg-[#ffc107]',
      spark: buildSparkline(filtered.value, true)
    },
    {
      label: 'Linked',
      value: linked.toLocaleString(),
      sub: 'In export',
      color: 'bg-[#f86c6b]',
      spark: buildSparkline(filtered.value.filter(t => t.parentKey), true)
    }
  ]
})

function buildSparkline (rows: Ticket[], useSp = false): string {
  const buckets = new Map<string, number>()
  for (const t of rows) {
    const raw = ticketTimelineDate(t)
    const d = parseTicketDate(raw)
    if (!d) continue
    const k = monthKey(d)
    buckets.set(k, (buckets.get(k) || 0) + (useSp ? effectiveStoryPoints(t, assumeMissingSpAsOne.value) : 1))
  }
  const vals = [...buckets.values()]
  if (vals.length < 2) {
    return 'M0,20 L20,18 L40,15 L60,12 L80,10 L100,8 L120,6'
  }
  const max = Math.max(...vals, 1)
  const step = 120 / (vals.length - 1)
  return vals.map((v, i) => {
    const x = i * step
    const y = 24 - (v / max) * 20
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}
</script>

<template>
  <div v-if="tickets.length" id="overview" class="scroll-mt-20 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
