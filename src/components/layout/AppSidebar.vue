<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SQUADS, squadLabel } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useLayoutStore } from '../../stores/layout'
import type { DateFilterMode } from '../../utils/dateFilters'
import UploadPanel from '../dashboard/UploadPanel.vue'
import CapacityForm from '../dashboard/CapacityForm.vue'

const store = useDashboardStore()
const layout = useLayoutStore()
const { sidebarCollapsed, mobileSidebarOpen, activeSection } = storeToRefs(layout)
const {
  selectedSquad,
  dateFilter,
  filterYear,
  customFrom,
  customTo,
  tickets,
  hasActiveFilters,
  loadError,
  assumeMissingSpAsOne,
  doneTicketsOnly,
  needsYearSelector,
  needsCustomDates,
  yearOptions,
  isSupportSquad,
  showHierarchyChart
} = storeToRefs(store)

const deliveryNavGroups = [
  {
    label: 'Analytics',
    items: [
      { id: 'overview', label: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' },
      { id: 'status', label: 'Status', icon: 'M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z' },
      { id: 'work-type', label: 'Work Type', icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z' },
      { id: 'story-points', label: 'Story Points', icon: 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941' },
    ]
  },
  {
    label: 'Reports',
    items: [
      { id: 'timeline', label: 'Timeline', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' },
      { id: 'capacity', label: 'Capacity', icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
      { id: 'hierarchy', label: 'Hierarchy', icon: 'M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z' }
    ]
  }
]

const supportNavGroups = [
  {
    label: 'Analytics',
    items: [
      { id: 'overview', label: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' },
      { id: 'status', label: 'State & Priority', icon: 'M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z' },
      { id: 'work-type', label: 'Categories', icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z' }
    ]
  },
  {
    label: 'Reports',
    items: [
      { id: 'timeline', label: 'Timeline', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' },
      { id: 'hierarchy', label: 'Parent incidents', icon: 'M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z' }
    ]
  }
]

const navGroups = computed(() => {
  const groups = isSupportSquad.value ? supportNavGroups : deliveryNavGroups
  if (showHierarchyChart.value) return groups
  return groups.map(group => ({
    ...group,
    items: group.items.filter(item => item.id !== 'hierarchy')
  }))
})

const sidebarSelectClass =
  'w-full rounded border border-white/15 bg-[#3a4149] px-2.5 py-2 text-xs text-white outline-none focus:border-[#20a8d8] disabled:opacity-50'

function scrollTo (id: string) {
  layout.setActiveSection(id)
  layout.closeMobileSidebar()
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 72
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

function navClass (id: string) {
  const active = activeSection.value === id
  return active
    ? 'bg-white/10 text-white border-l-[3px] border-[#20a8d8]'
    : 'text-[#c4c9d0] border-l-[3px] border-transparent hover:bg-white/5 hover:text-white'
}

function onDateFilterChange (e: Event) {
  store.setDateFilter((e.target as HTMLSelectElement).value as DateFilterMode)
}
</script>

<template>
  <div
    v-if="mobileSidebarOpen"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="layout.closeMobileSidebar()"
  />

  <aside
    class="sidebar-coreui fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 lg:translate-x-0"
    :class="[
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      sidebarCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <div class="flex h-[55px] shrink-0 items-center gap-3 border-b border-white/10 px-4">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#20a8d8] text-xs font-bold text-white">JA</div>
      <span v-if="!sidebarCollapsed" class="truncate text-sm font-semibold tracking-wide text-white">JIRA ANALYTICS</span>
    </div>

    <div v-if="!sidebarCollapsed" class="border-b border-white/10 px-3 py-3">
      <p class="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-[#8a93a2]">Filters</p>
      <div class="space-y-2">
        <UploadPanel />

        <select
          :value="selectedSquad"
          :class="sidebarSelectClass"
          @change="store.setSquad(($event.target as HTMLSelectElement).value as typeof selectedSquad)"
        >
          <option v-for="s in SQUADS" :key="s" :value="s">Squad: {{ squadLabel(s) }}</option>
        </select>

        <select
          :value="dateFilter"
          :class="sidebarSelectClass"
          :disabled="!tickets.length"
          @change="onDateFilterChange"
        >
          <option value="all">All Time</option>
          <optgroup label="Rolling window">
            <option value="weekly">Last 7 Days</option>
            <option value="twoWeeks">Last 14 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="last6m">Last 6 Months</option>
          </optgroup>
          <optgroup label="Calendar">
            <option value="ytd">Year to date</option>
            <option value="q1">Q1 (Jan–Mar)</option>
            <option value="q2">Q2 (Apr–Jun)</option>
            <option value="q3">Q3 (Jul–Sep)</option>
            <option value="q4">Q4 (Oct–Dec)</option>
            <option value="custom">Custom range…</option>
          </optgroup>
        </select>

        <select
          v-if="needsYearSelector"
          :value="filterYear"
          :class="sidebarSelectClass"
          :disabled="!tickets.length"
          title="Year for quarter / YTD filters"
          @change="store.setFilterYear(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">Year: {{ y }}</option>
        </select>

        <div v-if="needsCustomDates" class="space-y-1.5 rounded border border-white/10 bg-[#3a4149]/60 p-2">
          <label class="block">
            <span class="mb-0.5 block text-[10px] uppercase tracking-wide text-[#8a93a2]">From</span>
            <input
              type="date"
              :value="customFrom"
              :class="sidebarSelectClass"
              @change="store.setCustomRange(($event.target as HTMLInputElement).value, customTo || ($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="block">
            <span class="mb-0.5 block text-[10px] uppercase tracking-wide text-[#8a93a2]">To</span>
            <input
              type="date"
              :value="customTo"
              :class="sidebarSelectClass"
              @change="store.setCustomRange(customFrom || ($event.target as HTMLInputElement).value, ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <label
          v-if="!isSupportSquad"
          class="flex cursor-pointer items-start gap-2 rounded border border-white/10 bg-[#3a4149]/60 px-2.5 py-2 text-xs text-[#c4c9d0]"
          :class="{ 'opacity-50 pointer-events-none': !tickets.length }"
          title="Treat missing story points as 1 SP across all charts and KPIs"
        >
          <input
            type="checkbox"
            class="mt-0.5 rounded border-white/25 bg-[#3a4149] text-[#20a8d8] focus:ring-[#20a8d8] focus:ring-offset-0"
            :checked="assumeMissingSpAsOne"
            :disabled="!tickets.length"
            @change="store.setAssumeMissingSpAsOne(($event.target as HTMLInputElement).checked)"
          />
          <span>Assume tickets without SP count as 1 SP</span>
        </label>

        <label
          v-if="!isSupportSquad"
          class="flex cursor-pointer items-start gap-2 rounded border border-white/10 bg-[#3a4149]/60 px-2.5 py-2 text-xs text-[#c4c9d0]"
          :class="{ 'opacity-50 pointer-events-none': !tickets.length }"
          title="Limits charts and KPIs to Done status / Done category"
        >
          <input
            type="checkbox"
            class="mt-0.5 rounded border-white/25 bg-[#3a4149] text-[#20a8d8] focus:ring-[#20a8d8] focus:ring-offset-0"
            :checked="doneTicketsOnly"
            :disabled="!tickets.length"
            @change="store.setDoneTicketsOnly(($event.target as HTMLInputElement).checked)"
          />
          <span>Only Done tickets</span>
        </label>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="w-full rounded border border-[#ffc107]/40 bg-[#ffc107]/15 px-3 py-2 text-xs font-medium text-[#ffc107] hover:bg-[#ffc107]/25"
          @click="store.clearFilters()"
        >Clear filters</button>

        <button
          v-if="tickets.length"
          type="button"
          class="w-full rounded border border-white/15 bg-[#3a4149] px-3 py-2 text-xs font-medium text-[#c4c9d0] hover:bg-white/5 hover:text-white"
          @click="store.clearData()"
        >Reset data</button>

        <p v-if="loadError" class="px-1 text-[11px] leading-snug text-[#f86c6b]">{{ loadError }}</p>

        <div v-if="!isSupportSquad" class="border-t border-white/10 pt-3">
          <CapacityForm />
        </div>
      </div>
    </div>

    <div v-else class="border-b border-white/10 p-2">
      <button
        type="button"
        title="Expand for filters"
        class="flex w-full items-center justify-center rounded py-2 text-[#8a93a2] hover:bg-white/5 hover:text-white"
        @click="layout.toggleSidebar()"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-3">
      <div v-for="group in navGroups" :key="group.label" class="mb-4">
        <p v-if="!sidebarCollapsed" class="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-[#8a93a2]">
          {{ group.label }}
        </p>
        <ul>
          <li v-for="item in group.items" :key="item.id">
            <button
              type="button"
              :title="sidebarCollapsed ? item.label : undefined"
              class="flex w-full items-center gap-3 py-2.5 pl-4 pr-3 text-sm font-medium transition"
              :class="navClass(item.id)"
              @click="scrollTo(item.id)"
            >
              <svg class="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
              <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <div class="hidden border-t border-white/10 p-2 lg:block">
      <button
        type="button"
        class="flex w-full items-center justify-center rounded py-2 text-[#8a93a2] transition hover:bg-white/5 hover:text-white"
        @click="layout.toggleSidebar()"
      >
        <svg class="h-5 w-5 transition" :class="sidebarCollapsed ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-coreui {
  background: #2f353a;
}
</style>
