<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { REGION_LABELS } from '../../config/squads'
import { useDashboardStore } from '../../stores/dashboard'
import { useHierarchyChart } from '../../composables/charts/useHierarchyChart'
import ChartPanel from '../ui/ChartPanel.vue'
import BaseEChart from './BaseEChart.vue'

const store = useDashboardStore()
const { dateRangeLabel, hierarchyRegionFilter } = storeToRefs(store)
const { chartOption, issueHierarchyMeta } = useHierarchyChart()
</script>

<template>
  <ChartPanel
    span="full"
    title="Ticket hierarchy — linked vs standalone"
    :subtitle="`${dateRangeLabel} · nested tickets are a subset, not double-counted`"
  >
    <div class="mb-4 flex justify-end">
      <select
        v-model="hierarchyRegionFilter"
        class="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
      >
        <option value="all">All regions</option>
        <option value="chennai">{{ REGION_LABELS.chennai }} only</option>
        <option value="uk">{{ REGION_LABELS.uk }} only</option>
      </select>
    </div>

    <div v-if="issueHierarchyMeta.linkedChildCount" class="mb-4 rounded-xl border border-blue-light-200 bg-blue-light-50 px-4 py-3 text-sm text-blue-light-800 dark:border-blue-light-500/30 dark:bg-blue-light-500/10 dark:text-blue-light-200">
      <span class="font-semibold">{{ issueHierarchyMeta.linkedChildCount }} tickets</span>
      have a parent in this export (shown under <span class="font-medium">Linked</span>).
      The same tickets are <span class="font-semibold">not</span> repeated in standalone counts.
    </div>

    <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-2 dark:border-gray-800 dark:bg-gray-950/50">
      <BaseEChart
        :option="chartOption"
        :height="`${issueHierarchyMeta.chartHeight}px`"
        min-width="560px"
      />
    </div>

    <div v-if="issueHierarchyMeta.workTypeSplits.length" class="mt-5 grid gap-5 lg:grid-cols-2">
      <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="border-b border-gray-200 px-4 py-3 text-sm font-semibold dark:border-gray-800">Linked vs standalone by work type</div>
        <table class="min-w-[480px] w-full text-sm">
          <thead class="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950">
            <tr>
              <th class="px-4 py-2 text-left">Work type</th>
              <th class="px-4 py-2 text-right">Total</th>
              <th class="px-4 py-2 text-right text-brand-600">Linked</th>
              <th class="px-4 py-2 text-right">Standalone</th>
              <th class="px-4 py-2 text-left">Linked under</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="row in issueHierarchyMeta.workTypeSplits" :key="row.workType">
              <td class="px-4 py-2 font-medium">{{ row.workType }}</td>
              <td class="px-4 py-2 text-right tabular-nums">{{ row.totalCount }} · {{ row.totalSp }} SP</td>
              <td class="px-4 py-2 text-right tabular-nums text-brand-600">{{ row.linkedCount }} · {{ row.linkedSp }} SP</td>
              <td class="px-4 py-2 text-right tabular-nums">{{ row.standaloneCount }} · {{ row.standaloneSp }} SP</td>
              <td class="px-4 py-2 text-xs text-gray-500">
                <span v-if="!row.linkedBreakdown.length">—</span>
                <span v-for="(part, idx) in row.linkedBreakdown" :key="`${row.workType}-${part.parentWorkType}`">
                  {{ idx ? ', ' : '' }}{{ part.count }} under {{ part.parentWorkType }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="border-b border-gray-200 px-4 py-3 text-sm font-semibold dark:border-gray-800">Story point overlap (parent + child both have SP)</div>
        <table v-if="issueHierarchyMeta.spOverlaps.length" class="min-w-[360px] w-full text-sm">
          <thead class="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950">
            <tr>
              <th class="px-4 py-2 text-left">Parent</th>
              <th class="px-4 py-2 text-left">Child</th>
              <th class="px-4 py-2 text-right">SP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="pair in issueHierarchyMeta.spOverlaps" :key="`${pair.parentKey}-${pair.childKey}`">
              <td class="px-4 py-2">
                <span class="font-medium">{{ pair.parentKey }}</span>
                <span class="ml-1 text-xs text-gray-500">{{ pair.parentWorkType }}</span>
                <span class="ml-1 tabular-nums text-warning-600">{{ pair.parentSp }} SP</span>
              </td>
              <td class="px-4 py-2">
                <span class="font-medium">{{ pair.childKey }}</span>
                <span class="ml-1 text-xs text-gray-500">{{ pair.childWorkType }}</span>
                <span class="ml-1 tabular-nums text-warning-600">{{ pair.childSp }} SP</span>
              </td>
              <td class="px-4 py-2 text-right font-semibold tabular-nums text-warning-600">{{ pair.parentSp + pair.childSp }} SP</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="px-4 py-6 text-sm text-gray-500">No parent/child pairs where both carry story points in this filter.</div>
      </div>
    </div>
  </ChartPanel>
</template>
