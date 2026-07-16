<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { usePeriodNotesStore } from '../../stores/periodNotes'
import { monthLabelFromKey } from '../../utils/dates'

const props = defineProps<{
  monthKeys: string[]
}>()

const dashboard = useDashboardStore()
const notes = usePeriodNotesStore()
const { selectedSquad } = storeToRefs(dashboard)

const draft = ref<Record<string, string>>({})
const importError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const rows = computed(() =>
  props.monthKeys.map(key => ({
    key,
    label: monthLabelFromKey(key),
    saved: notes.noteText(selectedSquad.value, key)
  }))
)

const notedCount = computed(() => rows.value.filter(r => r.saved).length)

watch(
  [() => props.monthKeys, selectedSquad, () => notes.bySquad],
  () => {
    const next: Record<string, string> = {}
    for (const key of props.monthKeys) {
      next[key] = notes.noteText(selectedSquad.value, key)
    }
    draft.value = next
  },
  { immediate: true, deep: true }
)

function saveRow (monthKey: string) {
  notes.setNote(selectedSquad.value, monthKey, draft.value[monthKey] ?? '')
}

function onExport () {
  const blob = new Blob([notes.exportJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jira-dashboard-period-notes-${selectedSquad.value}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function onImportClick () {
  importError.value = null
  fileInput.value?.click()
}

function onImportFile (e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const ok = notes.importJson(String(reader.result ?? ''))
    importError.value = ok ? null : 'Invalid notes JSON — expected squad → monthKey → { text, updatedAt }'
    ;(e.target as HTMLInputElement).value = ''
  }
  reader.readAsText(file)
}
</script>

<template>
  <details class="mt-3 rounded border border-[#c8ced3] dark:border-gray-700">
    <summary class="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5">
      <span class="flex items-center justify-between gap-2">
        <span>Month notes — {{ selectedSquad }}</span>
        <span class="font-normal text-gray-500 dark:text-gray-400">
          {{ notedCount ? `${notedCount} noted` : 'Add comments' }} · ▼
        </span>
      </span>
    </summary>

    <div class="space-y-2 border-t border-[#c8ced3] px-3 py-3 dark:border-gray-700">
      <p class="text-[11px] leading-snug text-gray-500 dark:text-gray-400">
        Explain dips or spikes for months in the current filter (e.g. vacation, release freeze). Saved in the browser as JSON.
      </p>

      <div v-if="!monthKeys.length" class="text-[11px] text-gray-500 dark:text-gray-400">
        No months in the current filter.
      </div>

      <div
        v-for="row in rows"
        :key="row.key"
        class="grid gap-1.5 sm:grid-cols-[7rem_1fr] sm:items-start"
      >
        <label class="pt-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-300" :for="`note-${row.key}`">
          {{ row.label }}
          <span v-if="row.saved" class="ml-1 text-[#20a8d8]" title="Has a saved note">●</span>
        </label>
        <textarea
          :id="`note-${row.key}`"
          v-model="draft[row.key]"
          rows="2"
          maxlength="280"
          placeholder="e.g. Holiday period — team on leave"
          class="w-full resize-y rounded border border-[#c8ced3] bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-[#20a8d8] dark:border-gray-600 dark:bg-[#3a4149] dark:text-gray-100"
          @blur="saveRow(row.key)"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          class="rounded border border-[#c8ced3] px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5"
          @click="onExport"
        >Export JSON</button>
        <button
          type="button"
          class="rounded border border-[#c8ced3] px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5"
          @click="onImportClick"
        >Import JSON</button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="hidden"
          @change="onImportFile"
        />
        <p v-if="importError" class="text-[11px] text-[#f86c6b]">{{ importError }}</p>
      </div>
    </div>
  </details>
</template>
