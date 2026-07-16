<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { BASELINE_MODE_OPTIONS, capacityFormulaLabel } from '../../config/capacity'
import { useDashboardStore } from '../../stores/dashboard'
import { useCapacityStore } from '../../stores/capacity'
import { buildMonthlySeries } from '../../utils/timelineSeries'
import { computeFilteredPeriodBaseline } from '../../utils/capacitySeries'
import type { CapacityBaselineMode } from '../../types/capacity'
import type { RegionKey } from '../../types/ticket'

const dashboard = useDashboardStore()
const capacity = useCapacityStore()
const { selectedSquad, filtered, assumeMissingSpAsOne } = storeToRefs(dashboard)
const { spPerDevPerDay, workingDaysPerMonth, baselineMode } = storeToRefs(capacity)

const squadCapacity = computed(() => capacity.squadCapacity(selectedSquad.value))

const filteredBaseline = computed(() => {
  const monthly = buildMonthlySeries(filtered.value, assumeMissingSpAsOne.value)
  return computeFilteredPeriodBaseline(monthly)
})

const inputClass =
  'w-full rounded border border-white/15 bg-[#3a4149] px-2.5 py-2 text-xs text-white outline-none focus:border-[#20a8d8]'

function onDeveloperInput (region: RegionKey, e: Event) {
  const raw = (e.target as HTMLInputElement).value
  capacity.setDevelopers(selectedSquad.value, region, Number(raw))
}

function onBaselineModeChange (e: Event) {
  capacity.setBaselineMode((e.target as HTMLSelectElement).value as CapacityBaselineMode)
}
</script>

<template>
  <details class="group" open>
    <summary class="flex cursor-pointer list-none items-center justify-between px-1 py-1 text-xs font-semibold text-[#c4c9d0] hover:text-white">
      <span>Capacity baseline — {{ selectedSquad }}</span>
      <span class="text-[10px] text-[#8a93a2] transition group-open:rotate-180">▼</span>
    </summary>

    <div class="mt-2 space-y-2">
      <label class="block px-1">
        <span class="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#8a93a2]">Baseline mode</span>
        <select
          :value="baselineMode"
          :class="inputClass"
          @change="onBaselineModeChange"
        >
          <option v-for="opt in BASELINE_MODE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <div
        v-if="baselineMode === 'filtered'"
        class="space-y-1 rounded border border-white/10 bg-[#3a4149]/60 px-2.5 py-2 text-[10px] leading-snug text-[#c4c9d0]"
      >
        <p class="text-[#8a93a2]">Average monthly SP across the current date filter ({{ filteredBaseline.monthsUsed }} mo)</p>
        <p>{{ REGION_LABELS.chennai }}: <span class="font-semibold text-white">{{ filteredBaseline.chennai }} SP/mo</span></p>
        <p>{{ REGION_LABELS.uk }}: <span class="font-semibold text-white">{{ filteredBaseline.uk }} SP/mo</span> <span class="text-[#8a93a2]">(squad total)</span></p>
      </div>

      <template v-else>
        <p class="px-1 text-[10px] leading-snug text-[#8a93a2]">
          {{ spPerDevPerDay }} SP per developer per day · {{ workingDaysPerMonth }} working days per month
        </p>

        <label class="block px-1">
          <span class="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#8a93a2]">{{ REGION_LABELS.chennai }} developers</span>
          <input
            type="number"
            min="0"
            step="1"
            :value="squadCapacity.chennai"
            :class="inputClass"
            @change="onDeveloperInput('chennai', $event)"
          />
        </label>

        <label class="block px-1">
          <span class="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#8a93a2]">{{ REGION_LABELS.uk }} developers</span>
          <input
            type="number"
            min="0"
            step="1"
            :value="squadCapacity.uk"
            :class="inputClass"
            @change="onDeveloperInput('uk', $event)"
          />
        </label>

        <div class="space-y-1 rounded border border-white/10 bg-[#3a4149]/60 px-2.5 py-2 text-[10px] leading-snug text-[#c4c9d0]">
          <p>{{ REGION_LABELS.chennai }}: {{ capacityFormulaLabel(squadCapacity.chennai) }}</p>
          <p>{{ REGION_LABELS.uk }}: {{ capacityFormulaLabel(squadCapacity.uk) }} <span class="text-[#8a93a2]">(squad total)</span></p>
        </div>
      </template>
    </div>
  </details>
</template>
