<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()
const { selectedSquad, uploadRegion } = storeToRefs(store)

const sidebarSelectClass =
  'w-full rounded border border-white/15 bg-[#3a4149] px-2.5 py-2 text-xs text-white outline-none focus:border-[#20a8d8]'

function onFileChange (e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) store.handleFileUpload(file)
}
</script>

<template>
  <details class="group">
    <summary class="flex cursor-pointer list-none items-center justify-between px-1 py-1 text-xs font-semibold text-[#c4c9d0] hover:text-white">
      <span>Replace squad data — {{ selectedSquad }}</span>
      <span class="text-[10px] text-[#8a93a2] transition group-open:rotate-180">▼</span>
    </summary>
    <div class="mt-2 space-y-2">
      <select v-model="uploadRegion" :class="sidebarSelectClass">
        <option value="chennai">{{ REGION_LABELS.chennai }} (ciec.csv)</option>
        <option value="uk">{{ REGION_LABELS.uk }} (team.csv)</option>
      </select>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        class="w-full rounded border border-white/15 bg-[#3a4149] px-2.5 py-2 text-xs text-[#c4c9d0] file:mr-2 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-white"
        @change="onFileChange"
      />
      <p class="px-1 text-[10px] leading-snug text-[#8a93a2]">
        Expected: public/sources/{{ selectedSquad }}/ciec.csv and team.csv
      </p>
    </div>
  </details>
</template>
