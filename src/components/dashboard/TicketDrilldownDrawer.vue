<script setup lang="ts">
import { REGION_LABELS } from '../../config/squads'
import type { TicketListItem } from '../../utils/ticketExport'

defineProps<{
  open: boolean
  title: string
  tickets: TicketListItem[]
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex justify-end bg-black/40"
      @click.self="emit('close')"
    >
      <aside class="flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-[#2f353a]">
        <div class="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div class="min-w-0">
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ title }}</h2>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ tickets.length }} tickets</p>
          </div>
          <button
            type="button"
            class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-[#25292e] dark:text-gray-400">
              <tr>
                <th class="px-3 py-2 font-medium">Key</th>
                <th class="px-3 py-2 font-medium">Status</th>
                <th class="px-3 py-2 text-right font-medium">SP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="t in tickets" :key="`${t.region}-${t.key}`" class="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                <td class="px-3 py-2">
                  <a
                    v-if="t.href"
                    :href="t.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-[#20a8d8] hover:underline"
                  >{{ t.key }}</a>
                  <span v-else class="font-medium text-gray-800 dark:text-gray-200">{{ t.key }}</span>
                  <p v-if="t.summary" class="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{{ t.summary }}</p>
                  <p class="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                    {{ t.region === 'chennai' ? REGION_LABELS.chennai : REGION_LABELS.uk }}
                    <span v-if="t.workType"> · {{ t.workType }}</span>
                  </p>
                </td>
                <td class="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">{{ t.status || '—' }}</td>
                <td class="px-3 py-2 text-right tabular-nums font-medium">{{ t.storyPoints }}</td>
              </tr>
              <tr v-if="!tickets.length">
                <td colspan="3" class="px-3 py-8 text-center text-sm text-gray-400">No tickets</td>
              </tr>
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
