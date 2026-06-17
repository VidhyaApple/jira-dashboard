<template>
  <div class="min-h-screen text-slate-200 p-6 sm:p-10 dashboard-bg">
    <div class="max-w-7xl mx-auto space-y-8 motion-safe:animate-page-in">

      <!-- HEADER -->
      <div class="section-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between motion-safe:animate-section-header">
        <h1 class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent motion-safe:animate-title-shimmer bg-[length:200%_auto]">
          Jira Analytics Dashboard (2025-2026)
        </h1>

        <div class="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 hover:bg-amber-400/30 motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] text-sm"
          >Clear Filters</button>

          <button
            v-if="tickets.length"
            @click="clearData"
            class="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] text-sm"
          >Reset Data</button>

          <div v-if="tickets.length" class="bg-white text-slate-900 border border-slate-200 px-5 py-3 rounded-2xl shadow-lg motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-0.5">
            <div class="text-xs text-slate-500">All Tickets</div>
            <div class="text-2xl font-semibold tabular-nums motion-safe:transition-transform motion-safe:duration-300">{{ tickets.length }}</div>
          </div>

          <div v-if="tickets.length" class="bg-indigo-50 text-slate-900 border border-indigo-100 px-5 py-3 rounded-2xl shadow-lg motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-0.5">
            <div class="text-xs text-slate-500">Filtered</div>
            <div class="text-2xl font-semibold tabular-nums motion-safe:transition-transform motion-safe:duration-300">{{ filtered.length }}</div>
          </div>
        </div>
      </div>

      <!-- UPLOAD + TIMELINE -->
      <div class="section-upload bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-xl motion-safe:animate-section-upload motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-2xl motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-indigo-200/80">
        <div class="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
          <div class="min-w-0 space-y-3">
            <div class="font-semibold text-slate-800">Upload Dataset</div>
            <div class="grid gap-3 sm:grid-cols-2">
              <select v-model="uploadScope" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50">
<!--            <option value="chennai-individual">Chennai Individual</option>-->
                <option value="chennai">Chennai Aggregate</option>
                <option value="uk">UK Aggregate</option>
              </select>

              <input
                v-if="uploadScope==='chennai-individual'"
                v-model="uploadDeveloper"
                placeholder="Developer name"
                class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
              />

              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                class="sm:col-span-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 motion-safe:file:transition-colors"
                @change="handleFile"
              />
            </div>
          </div>

          <div class="min-w-0 space-y-3 lg:border-l lg:border-slate-200 lg:pl-10 pt-2 lg:pt-0 border-t border-slate-200 lg:border-t-0">
            <div class="font-semibold text-slate-800">Timeline</div>
            <select
              v-model="dateFilter"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              :disabled="!tickets.length"
            >
              <option value="all">All Time</option>
              <optgroup label="Rolling window">
                <option value="weekly">Last 7 Days</option>
                <option value="twoWeeks">Last 14 Days</option>
                <option value="monthly">Last 30 Days</option>
              </optgroup>
              <optgroup label="Quarter (current calendar year)">
                <option value="q1">Q1 (Jan–Mar)</option>
                <option value="q2">Q2 (Apr–Jun)</option>
                <option value="q3">Q3 (Jul–Sep)</option>
                <option value="q4">Q4 (Oct–Dec)</option>
              </optgroup>
            </select>
            <div
              class="text-sm text-slate-600 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 motion-safe:transition-colors motion-safe:duration-300"
              :class="{ 'opacity-50': !tickets.length }"
            >
              <span class="text-slate-500">Range:</span>
              {{ tickets.length ? dateRangeLabel : 'Upload data to apply timeline' }}
            </div>
          </div>
        </div>
      </div>

      <!-- CHART GRID -->
      <Transition name="charts-mount">
        <div v-if="tickets.length" id="chart-grid" class="grid md:grid-cols-2 gap-6">

        <!-- STATUS CHENNAI -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Status - Chennai</span>
            <span>{{ dateRangeLabel }} | Total: {{ chennaiFilteredCount }}</span>
          </div>
          <v-chart :option="statusChennaiChart" autoresize style="height:300px" />
        </div>

        <!-- STATUS UK -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Status - UK</span>
            <span>{{ dateRangeLabel }} | Total: {{ ukFilteredCount }}</span>
          </div>
          <v-chart :option="statusUkChart" autoresize style="height:300px" />
        </div>

        <!-- WORK TYPE CHENNAI -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Work Type - Chennai</span>
            <span>{{ dateRangeLabel }} | Total: {{ chennaiFilteredCount }}</span>
          </div>
          <v-chart :option="workChennaiChart" autoresize style="height:300px" />
        </div>

        <!-- WORK TYPE UK -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Work Type - UK</span>
            <span>{{ dateRangeLabel }} | Total: {{ ukFilteredCount }}</span>
          </div>
          <v-chart :option="workUkChart" autoresize style="height:300px" />
        </div>

        <!-- STORY POINTS BY REGION -->
        <div class="md:col-span-2 bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Story Points by Region (bars + line)</span>
            <span>{{ dateRangeLabel }} | Total SP: {{ totalFilteredSP }}</span>
          </div>
          <v-chart :option="spChart" autoresize style="height:320px" />
        </div>

        <!-- STORY POINTS BY WORK TYPE -->
        <div class="md:col-span-2 bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Story Points by Work Type</span>
            <span class="shrink-0">{{ dateRangeLabel }} | Split by Chennai / UK</span>
          </div>
          <v-chart :option="workTypeStoryPointsChart" autoresize style="height:380px" />
          <div v-if="workTypeStoryPointRows.length" class="mt-5 overflow-x-auto rounded-xl border border-slate-200">
            <table class="min-w-[920px] w-full border-collapse text-left text-xs">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">Work type</th>
                  <th class="px-4 py-3 font-semibold text-right">Total SP</th>
                  <th class="px-4 py-3 font-semibold text-right">Tickets</th>
                  <th class="px-4 py-3 font-semibold">Chennai</th>
                  <th class="px-4 py-3 font-semibold">UK</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in workTypeStoryPointRows" :key="row.workType" class="align-top hover:bg-slate-50/80">
                  <td class="px-4 py-3 font-semibold text-slate-800">{{ row.workType }}</td>
                  <td class="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">{{ row.totalSp }}</td>
                  <td class="px-4 py-3 text-right tabular-nums text-slate-600">{{ row.totalCount }}</td>
                  <td class="px-4 py-3">
                    <div class="mb-2 font-semibold text-indigo-700 tabular-nums">{{ row.chennai.sp }} SP / {{ row.chennai.count }} tickets</div>
                    <div class="flex max-w-md flex-wrap gap-1.5">
                      <template
                        v-for="ticket in row.chennai.visibleTickets"
                        :key="`chennai-${row.workType}-${ticket.key}`"
                      >
                        <a
                          v-if="ticket.href"
                          :href="ticket.href"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-700 underline-offset-2 hover:underline"
                        >{{ ticket.key }} · {{ ticket.storyPoints }} SP</a>
                        <span
                          v-else
                          class="rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-700"
                        >{{ ticket.key }} · {{ ticket.storyPoints }} SP</span>
                      </template>
                      <span v-if="row.chennai.moreCount" class="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-500">+{{ row.chennai.moreCount }} more</span>
                      <span v-if="!row.chennai.count" class="text-slate-400">—</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="mb-2 font-semibold text-emerald-700 tabular-nums">{{ row.uk.sp }} SP / {{ row.uk.count }} tickets</div>
                    <div class="flex max-w-md flex-wrap gap-1.5">
                      <template
                        v-for="ticket in row.uk.visibleTickets"
                        :key="`uk-${row.workType}-${ticket.key}`"
                      >
                        <a
                          v-if="ticket.href"
                          :href="ticket.href"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700 underline-offset-2 hover:underline"
                        >{{ ticket.key }} · {{ ticket.storyPoints }} SP</a>
                        <span
                          v-else
                          class="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700"
                        >{{ ticket.key }} · {{ ticket.storyPoints }} SP</span>
                      </template>
                      <span v-if="row.uk.moreCount" class="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-500">+{{ row.uk.moreCount }} more</span>
                      <span v-if="!row.uk.count" class="text-slate-400">—</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ISSUE HIERARCHY -->
        <div class="md:col-span-2 bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
            <div>
              <div class="font-medium text-slate-700 text-sm">Ticket hierarchy — linked vs standalone</div>
              <div class="text-xs text-slate-500 mt-0.5">{{ dateRangeLabel }} · Nested tickets are a subset — not double-counted in totals</div>
            </div>
            <select
              v-model="hierarchyRegionFilter"
              class="shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            >
              <option value="all">All regions</option>
              <option value="chennai">Chennai only</option>
              <option value="uk">UK only</option>
            </select>
          </div>

          <div
            v-if="issueHierarchyMeta.linkedChildCount"
            class="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-950"
          >
            <span class="font-semibold">{{ issueHierarchyMeta.linkedChildCount }} tickets</span>
            have a parent in this export (shown under <span class="font-medium">Linked</span>).
            The same tickets are <span class="font-semibold">not</span> repeated in standalone counts — e.g. Sub-task total
            {{ issueHierarchyMeta.workTypeSplits.find(r => r.workType === 'Sub-task')?.totalCount ?? '—' }}
            = linked
            {{ issueHierarchyMeta.workTypeSplits.find(r => r.workType === 'Sub-task')?.linkedCount ?? 0 }}
            + standalone
            {{ issueHierarchyMeta.workTypeSplits.find(r => r.workType === 'Sub-task')?.standaloneCount ?? 0 }}.
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/50">
            <v-chart :option="issueHierarchyChart" autoresize :style="{ height: issueHierarchyMeta.chartHeight + 'px', minWidth: '560px' }" />
          </div>

          <div v-if="issueHierarchyMeta.workTypeSplits.length" class="mt-5 grid gap-5 lg:grid-cols-2">
            <div class="overflow-x-auto rounded-xl border border-slate-200">
              <div class="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700">Linked vs standalone by work type</div>
              <table class="min-w-[480px] w-full border-collapse text-left text-xs">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">Work type</th>
                    <th class="px-4 py-3 font-semibold text-right">Total</th>
                    <th class="px-4 py-3 font-semibold text-right text-teal-700">Linked</th>
                    <th class="px-4 py-3 font-semibold text-right text-slate-600">Standalone</th>
                    <th class="px-4 py-3 font-semibold">Linked under</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="row in issueHierarchyMeta.workTypeSplits" :key="row.workType" class="hover:bg-slate-50/80">
                    <td class="px-4 py-3 font-medium text-slate-800">{{ row.workType }}</td>
                    <td class="px-4 py-3 text-right tabular-nums">{{ row.totalCount }} · {{ row.totalSp }} SP</td>
                    <td class="px-4 py-3 text-right tabular-nums text-teal-700">{{ row.linkedCount }} · {{ row.linkedSp }} SP</td>
                    <td class="px-4 py-3 text-right tabular-nums text-slate-600">{{ row.standaloneCount }} · {{ row.standaloneSp }} SP</td>
                    <td class="px-4 py-3 text-slate-600">
                      <span v-if="!row.linkedBreakdown.length" class="text-slate-400">—</span>
                      <span v-for="(part, idx) in row.linkedBreakdown" :key="`${row.workType}-${part.parentWorkType}`">
                        {{ idx ? ', ' : '' }}{{ part.count }} under {{ part.parentWorkType }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200">
              <div class="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700">Story point overlap (parent + child both have SP)</div>
              <table v-if="issueHierarchyMeta.spOverlaps.length" class="min-w-[360px] w-full border-collapse text-left text-xs">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">Parent</th>
                    <th class="px-4 py-3 font-semibold">Child</th>
                    <th class="px-4 py-3 font-semibold text-right">SP</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="pair in issueHierarchyMeta.spOverlaps" :key="`${pair.parentKey}-${pair.childKey}`" class="hover:bg-amber-50/60">
                    <td class="px-4 py-3">
                      <span class="font-medium text-slate-800">{{ pair.parentKey }}</span>
                      <span class="ml-1 text-slate-400">{{ pair.parentWorkType }}</span>
                      <span class="ml-1 tabular-nums text-amber-700">{{ pair.parentSp }} SP</span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-medium text-slate-800">{{ pair.childKey }}</span>
                      <span class="ml-1 text-slate-400">{{ pair.childWorkType }}</span>
                      <span class="ml-1 tabular-nums text-amber-700">{{ pair.childSp }} SP</span>
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums font-semibold text-amber-800">{{ pair.parentSp + pair.childSp }} SP</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="px-4 py-6 text-xs text-slate-500">No parent/child pairs where both carry story points in this filter.</div>
            </div>
          </div>
        </div>

        <!-- QUARTERLY (side by side on md+) -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Quarterly — Story points</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="quarterlySpChart" autoresize style="height:340px" />
        </div>

        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Quarterly — Ticket volume</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="quarterlyCountChart" autoresize style="height:340px" />
        </div>

        <!-- MONTHLY (side by side on md+) -->
        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Monthly — Story points</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="monthlySpChart" autoresize style="height:340px" />
        </div>

        <div class="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 chart-panel chart-panel--rich motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-1 min-w-0">
          <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start text-xs text-slate-500 mb-2">
            <span class="font-medium text-slate-700">Monthly — Ticket volume</span>
            <span class="shrink-0">{{ dateRangeLabel }} | By issue updated date</span>
          </div>
          <v-chart :option="monthlyCountChart" autoresize style="height:340px" />
        </div>

        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import VChart, { UPDATE_OPTIONS_KEY } from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart, TreeChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, AxisPointerComponent, TitleComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, BarChart, PieChart, LineChart, TreeChart, GridComponent, TooltipComponent, LegendComponent, AxisPointerComponent, TitleComponent])

/** Avoid vue-echarts smart merge putting `color` in replaceMerge (invalid in ECharts 6) when filters change. */
provide(UPDATE_OPTIONS_KEY, { notMerge: true })

type Ticket={ key?:string; url?:string; parentKey?:string; summary?:string; developer:string; region:'chennai'|'uk'; status?:string; workType?:string; storyPoints?:number; updated?:string }
type RegionKey = Ticket['region']
type MergedTicket = Ticket & { regions: RegionKey[] }
type CategoryTreeNode = {
  name: string
  workType: string
  segment: 'all' | 'linked-section' | 'standalone-section' | 'category'
  ticketCount: number
  underCount: number
  storyPoints: number
  underSp: number
  totalSp: number
  value: number
  subsetNote?: string
  itemStyle?: { color: string; borderColor?: string; borderWidth?: number }
  children?: CategoryTreeNode[]
}
type HierarchySpOverlap = {
  parentKey: string
  childKey: string
  parentWorkType?: string
  childWorkType?: string
  parentSp: number
  childSp: number
}
type HierarchyWorkTypeSplit = {
  workType: string
  totalCount: number
  totalSp: number
  linkedCount: number
  linkedSp: number
  standaloneCount: number
  standaloneSp: number
  linkedBreakdown: { parentWorkType: string; count: number; sp: number }[]
}
type WorkTypeStoryPointTicket = { key: string; storyPoints: number; url?: string }

/** Set VITE_JIRA_BROWSE_BASE (e.g. https://yourorg.atlassian.net/browse) when exports lack issue URLs. */
const JIRA_BROWSE_BASE = (import.meta.env.VITE_JIRA_BROWSE_BASE as string | undefined)?.replace(/\/$/, '') ?? ''
type WorkTypeStoryPointSide = { sp: number; count: number; tickets: WorkTypeStoryPointTicket[] }
type WorkTypeStoryPointBucket = Record<RegionKey, WorkTypeStoryPointSide> & { totalSp: number; totalCount: number }
type WorkTypeStoryPointTableSide = WorkTypeStoryPointSide & { visibleTickets: WorkTypeStoryPointTableTicket[]; moreCount: number }
type WorkTypeStoryPointTableTicket = WorkTypeStoryPointTicket & { href: string | null }
type WorkTypeStoryPointTableRow = {
  workType: string
  chennai: WorkTypeStoryPointTableSide
  uk: WorkTypeStoryPointTableSide
  totalSp: number
  totalCount: number
}

const barRound: [number, number, number, number] = [10, 10, 0, 0]

/** Shared ECharts motion — stronger entrance + smooth updates when filters change */
function withChartMotion (opt: EChartsOption): EChartsOption {
  return {
    animation: true,
    animationDuration: 1650,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 1200,
    animationEasingUpdate: 'cubicOut',
    ...opt
  }
}

/** Axis tooltip preset for grouped / stacked bars */
const axisTooltipRich = {
  trigger: 'axis' as const,
  transitionDuration: 0.45,
  axisPointer: {
    type: 'shadow' as const,
    shadowStyle: { opacity: 0.22 },
    animation: true,
    animationDuration: 350,
    animationDurationUpdate: 250
  }
}

/** Axis tooltip for line / area time series */
const axisTooltipLine = {
  trigger: 'axis' as const,
  transitionDuration: 0.45,
  axisPointer: {
    type: 'line' as const,
    lineStyle: { width: 2, color: 'rgba(99, 102, 241, 0.45)' },
    animation: true,
    animationDuration: 380
  }
}

const tickets=ref<Ticket[]>([])
const uploadScope=ref('chennai')
const uploadDeveloper=ref('')
const dateFilter=ref('all')
const hierarchyRegionFilter=ref<'all'|RegionKey>('all')

const STORAGE_KEY='jiraTickets'

async function loadCsvUrl (url: string, region: Ticket['region']) {
  const res = await fetch(url)
  if (!res.ok) return
  const text = await res.text()
  await new Promise<void>((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        normRows(r.data as Record<string, unknown>[], region)
        resolve()
      }
    })
  })
}

onMounted(async () => {
  const d = localStorage.getItem(STORAGE_KEY)
  if (d) {
    tickets.value = JSON.parse(d)
    return
  }
  await loadCsvUrl('/ciec.csv', 'chennai')
  await loadCsvUrl('/uk.csv', 'uk')
})
const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(tickets.value))

/** Inclusive start/end for quarter Q1–Q4 in a calendar year (local time). */
function quarterRange (year: number, quarter: 1 | 2 | 3 | 4): { start: Date; end: Date } {
  const startMonth = (quarter - 1) * 3
  const start = new Date(year, startMonth, 1, 0, 0, 0, 0)
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999)
  return { start, end }
}

const filtered=computed(()=>{
 let d=[...tickets.value]
 const df=dateFilter.value
 if(df==='all') return d

 if(df==='q1' || df==='q2' || df==='q3' || df==='q4'){
   const year=new Date().getFullYear()
   const quarter=Number(df.replace('q','')) as 1|2|3|4
   const { start, end }=quarterRange(year, quarter)
   d=d.filter(t=>{
    if(!t.updated) return false
    const dt=new Date(t.updated)
    return dt>=start && dt<=end
   })
   return d
 }

 const now=new Date()
 let days=0
 if(df==='weekly') days=7
 if(df==='twoWeeks') days=14
 if(df==='monthly') days=30
 const threshold=new Date()
 threshold.setDate(now.getDate()-days)
 d=d.filter(t=>t.updated && new Date(t.updated)>=threshold)
 return d
})

const chennaiFilteredCount=computed(()=>filtered.value.filter(t=>t.region==='chennai').length)
const ukFilteredCount=computed(()=>filtered.value.filter(t=>t.region==='uk').length)
const totalFilteredSP=computed(()=>filtered.value.reduce((a,b)=>a+(b.storyPoints||0),0))

const hasActiveFilters=computed(()=> dateFilter.value!=='all')
const clearFilters=()=>{ dateFilter.value='all' }
const clearData=()=>{ tickets.value=[]; localStorage.removeItem(STORAGE_KEY)}

const dateRangeLabel=computed(()=>{
 const df=dateFilter.value
 if(df==='all') return 'All Time'
 if(df==='q1' || df==='q2' || df==='q3' || df==='q4'){
   const year=new Date().getFullYear()
   const quarter=Number(df.replace('q','')) as 1|2|3|4
   const { start, end }=quarterRange(year, quarter)
   return `${year} Q${quarter}: ${start.toLocaleDateString()} → ${end.toLocaleDateString()}`
 }
 const now=new Date()
 let days=0
 if(df==='weekly') days=7
 if(df==='twoWeeks') days=14
 if(df==='monthly') days=30
 const past=new Date()
 past.setDate(now.getDate()-days)
 return `${past.toLocaleDateString()} → ${now.toLocaleDateString()}`
})

const handleFile=(e:Event)=>{
 const f=(e.target as HTMLInputElement).files?.[0]
 if(!f) return
 const ext=f.name.split('.').pop()?.toLowerCase()
 if(ext==='csv'){
   Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>norm(r.data as any[])})
 } else {
   parseExcel(f)
 }
}

const parseExcel=(f:File)=>{
 const r=new FileReader()
 r.onload=e=>{
   const wb=XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer),{type:'array'})
   const sheetName=wb.SheetNames[0]
   const sheet=sheetName?wb.Sheets[sheetName]:undefined
   if(!sheet) return
   norm(XLSX.utils.sheet_to_json(sheet))
 }
 r.readAsArrayBuffer(f)
}

const norm=(json:any[])=> normRows(json, uploadScope.value.includes('uk') ? 'uk' : 'chennai')

const normRows=(json:Record<string, unknown>[], region:Ticket['region'])=>{
 const rows=json.map(r=>({
   key:r['Issue key'] as string|undefined,
   url:(r['Issue URL'] || r.URL || r.Link) as string|undefined,
   parentKey:parseParentKey(r),
   summary:r.Summary as string|undefined,
   developer:region,
   region,
   status:r.Status as string|undefined,
   workType:r['Issue Type'] as string|undefined,
   storyPoints:Number(r['Custom field (Story Points)']||0),
   updated:r.Updated as string|undefined
 }))
 tickets.value.push(...rows)
 save()
}

const count=(arr:(string|undefined)[])=>{
 const m:Record<string,number>={}
 arr.forEach(v=>{ if(!v)return; if(!m[v])m[v]=0; m[v]++ })
 return m
}

const ISSUE_TYPE_ORDER = ['Epic', 'Story', 'Task', 'Sub-task', 'Subtask', 'Bug']
const WORK_TYPE_COLORS: Record<string, string> = {
  Epic: '#8b5cf6',
  Story: '#6366f1',
  Task: '#0ea5e9',
  'Sub-task': '#06b6d4',
  Subtask: '#06b6d4',
  Bug: '#f43f5e'
}

function parseParentKey (r: Record<string, unknown>): string | undefined {
  const direct = r['Parent key'] ?? r['Parent Key'] ?? r['Parent issue key'] ?? r['Parent Issue Key']
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const parent = r.Parent
  if (typeof parent === 'string' && parent.trim()) {
    const match = parent.trim().match(/^([A-Za-z][A-Za-z0-9]+-\d+)/)
    return match ? match[1] : parent.trim()
  }
  return undefined
}

function issueTypeRank (workType?: string): number {
  if (!workType) return 99
  const idx = ISSUE_TYPE_ORDER.findIndex(t => t.toLowerCase() === workType.toLowerCase())
  return idx === -1 ? 50 : idx
}

function workTypeColor (workType?: string): string {
  if (!workType) return '#64748b'
  const exact = WORK_TYPE_COLORS[workType]
  if (exact) return exact
  const match = Object.entries(WORK_TYPE_COLORS).find(([name]) => name.toLowerCase() === workType.toLowerCase())
  return match?.[1] ?? '#64748b'
}

function jiraIssueUrl (ticket: Pick<WorkTypeStoryPointTicket, 'key' | 'url'>): string | null {
  if (ticket.url) return ticket.url
  if (!ticket.key || ticket.key === 'No key' || !JIRA_BROWSE_BASE) return null
  return `${JIRA_BROWSE_BASE}/${encodeURIComponent(ticket.key)}`
}

function mergeTicketsForHierarchy (rows: Ticket[]): Map<string, MergedTicket> {
  const map = new Map<string, MergedTicket>()
  for (const t of rows) {
    if (!t.key) continue
    const existing = map.get(t.key)
    if (existing) {
      if (!existing.regions.includes(t.region)) existing.regions.push(t.region)
      existing.storyPoints = Math.max(existing.storyPoints || 0, t.storyPoints || 0)
      if (!existing.parentKey && t.parentKey) existing.parentKey = t.parentKey
      if (!existing.workType && t.workType) existing.workType = t.workType
    } else {
      map.set(t.key, { ...t, regions: [t.region] })
    }
  }
  return map
}

function getDirectChildren (parentKeys: Set<string>, byKey: Map<string, MergedTicket>): MergedTicket[] {
  const children: MergedTicket[] = []
  for (const ticket of byKey.values()) {
    if (ticket.parentKey && parentKeys.has(ticket.parentKey)) children.push(ticket)
  }
  return children
}

function countDescendants (parentKeys: Set<string>, byKey: Map<string, MergedTicket>): number {
  let count = 0
  const queue = [...parentKeys]
  const seen = new Set<string>()
  while (queue.length) {
    const parentKey = queue.shift()!
    for (const ticket of byKey.values()) {
      if (ticket.parentKey !== parentKey || !ticket.key || seen.has(ticket.key)) continue
      seen.add(ticket.key)
      count += 1
      queue.push(ticket.key)
    }
  }
  return count
}

function sumTicketsStoryPoints (tickets: MergedTicket[]): number {
  return tickets.reduce((sum, ticket) => sum + (ticket.storyPoints || 0), 0)
}

function sumDescendantStoryPoints (parentKeys: Set<string>, byKey: Map<string, MergedTicket>): number {
  let total = 0
  const queue = [...parentKeys]
  const seen = new Set<string>()
  while (queue.length) {
    const parentKey = queue.shift()!
    for (const ticket of byKey.values()) {
      if (ticket.parentKey !== parentKey || !ticket.key || seen.has(ticket.key)) continue
      seen.add(ticket.key)
      total += ticket.storyPoints || 0
      queue.push(ticket.key)
    }
  }
  return total
}

function groupTicketsByWorkType (tickets: MergedTicket[]): Map<string, MergedTicket[]> {
  const groups = new Map<string, MergedTicket[]>()
  for (const ticket of tickets) {
    const workType = ticket.workType || 'Other'
    const bucket = groups.get(workType) || []
    bucket.push(ticket)
    groups.set(workType, bucket)
  }
  return groups
}

function categoryNodeLabel (workType: string, ticketCount: number, storyPoints: number): string {
  const ticketLabel = ticketCount === 1 ? '1 ticket' : `${ticketCount} tickets`
  return `${workType}\n${ticketLabel}\n${storyPoints} SP`
}

function hierarchyNodeSymbolSize (_value: number, params: any): [number, number] {
  const name = String(params?.data?.name ?? '')
  const lines = name.split('\n')
  const longest = Math.max(...lines.map(line => line.length), 10)
  const width = Math.min(240, Math.max(108, longest * 7 + 36))
  const height = Math.max(56, lines.length * 18 + 24)
  return [width, height]
}

function makeCategoryTreeNode (
  workType: string,
  tickets: MergedTicket[],
  keys: Set<string>,
  byKey: Map<string, MergedTicket>,
  childBranches: CategoryTreeNode[],
  segment: CategoryTreeNode['segment'],
  options?: { color?: string; subsetNote?: string }
): CategoryTreeNode {
  const ticketCount = tickets.length
  const underCount = countDescendants(keys, byKey)
  const storyPoints = sumTicketsStoryPoints(tickets)
  const underSp = sumDescendantStoryPoints(keys, byKey)
  const totalSp = storyPoints + underSp

  return {
    name: categoryNodeLabel(workType, ticketCount, storyPoints),
    workType,
    segment,
    ticketCount,
    underCount,
    storyPoints,
    underSp,
    totalSp,
    value: Math.max(storyPoints, ticketCount, 1),
    subsetNote: options?.subsetNote,
    itemStyle: { color: options?.color ?? workTypeColor(workType) },
    children: childBranches.length ? childBranches : undefined
  }
}

function buildCategoryBranch (
  parentKeys: Set<string>,
  byKey: Map<string, MergedTicket>,
  segment: CategoryTreeNode['segment']
): CategoryTreeNode[] {
  const directChildren = getDirectChildren(parentKeys, byKey)
  if (!directChildren.length) return []

  const nodes: CategoryTreeNode[] = []
  for (const [workType, tickets] of groupTicketsByWorkType(directChildren)) {
    const keys = new Set(tickets.map(t => t.key!))
    const childBranches = buildCategoryBranch(keys, byKey, segment)
    nodes.push(makeCategoryTreeNode(workType, tickets, keys, byKey, childBranches, segment, {
      color: workTypeColor(workType),
      subsetNote: 'Same tickets counted in work-type totals — shown here only for parent link.'
    }))
  }

  nodes.sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.ticketCount - a.ticketCount)
  return nodes
}

function getLinkedGraph (byKey: Map<string, MergedTicket>) {
  const linkedChildren = [...byKey.values()].filter(t => t.parentKey && byKey.has(t.parentKey))
  const linkedChildKeys = new Set(linkedChildren.map(t => t.key!))
  const linkedKeys = new Set<string>()
  for (const child of linkedChildren) {
    linkedKeys.add(child.key!)
    linkedKeys.add(child.parentKey!)
  }
  const linkedParents = [...byKey.values()].filter(t => t.key && linkedKeys.has(t.key) && !linkedChildKeys.has(t.key))
  const standaloneTickets = [...byKey.values()].filter(t => t.key && !linkedKeys.has(t.key))
  return { linkedChildren, linkedChildKeys, linkedKeys, linkedParents, standaloneTickets }
}

function buildHierarchySpOverlaps (byKey: Map<string, MergedTicket>): HierarchySpOverlap[] {
  const pairs: HierarchySpOverlap[] = []
  for (const ticket of byKey.values()) {
    if (!ticket.key || !ticket.parentKey) continue
    const parent = byKey.get(ticket.parentKey)
    if (!(ticket.storyPoints && ticket.storyPoints > 0 && parent?.storyPoints && parent.storyPoints > 0)) continue
    pairs.push({
      parentKey: ticket.parentKey,
      childKey: ticket.key,
      parentWorkType: parent.workType,
      childWorkType: ticket.workType,
      parentSp: parent.storyPoints,
      childSp: ticket.storyPoints
    })
  }
  return pairs.sort((a, b) => a.parentKey.localeCompare(b.parentKey) || a.childKey.localeCompare(b.childKey))
}

function buildWorkTypeSplits (
  byKey: Map<string, MergedTicket>,
  linkedChildKeys: Set<string>
): HierarchyWorkTypeSplit[] {
  const allTickets = [...byKey.values()]
  const workTypes = [...new Set(allTickets.map(t => t.workType || 'Other'))]

  return workTypes.map(workType => {
    const ofType = allTickets.filter(t => (t.workType || 'Other') === workType)
    const linked = ofType.filter(t => t.key && linkedChildKeys.has(t.key))
    const standalone = ofType.filter(t => t.key && !linkedChildKeys.has(t.key))

    const breakdownMap = new Map<string, { count: number; sp: number }>()
    for (const child of linked) {
      const parent = child.parentKey ? byKey.get(child.parentKey) : undefined
      const parentWorkType = parent?.workType || 'Parent'
      const bucket = breakdownMap.get(parentWorkType) || { count: 0, sp: 0 }
      bucket.count += 1
      bucket.sp += child.storyPoints || 0
      breakdownMap.set(parentWorkType, bucket)
    }

    return {
      workType,
      totalCount: ofType.length,
      totalSp: sumTicketsStoryPoints(ofType),
      linkedCount: linked.length,
      linkedSp: sumTicketsStoryPoints(linked),
      standaloneCount: standalone.length,
      standaloneSp: sumTicketsStoryPoints(standalone),
      linkedBreakdown: [...breakdownMap.entries()]
        .map(([parentWorkType, stats]) => ({ parentWorkType, ...stats }))
        .sort((a, b) => b.count - a.count)
    }
  }).sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.totalCount - a.totalCount)
}

function buildLinkedSection (
  linkedParents: MergedTicket[],
  byKey: Map<string, MergedTicket>,
  linkedKeys: Set<string>
): CategoryTreeNode | null {
  if (!linkedParents.length && !linkedKeys.size) return null

  const parentBranches: CategoryTreeNode[] = []
  for (const [workType, tickets] of groupTicketsByWorkType(linkedParents)) {
    const keys = new Set(tickets.map(t => t.key!))
    const childBranches = buildCategoryBranch(keys, byKey, 'category')
    parentBranches.push(makeCategoryTreeNode(workType, tickets, keys, byKey, childBranches, 'category', {
      color: workTypeColor(workType)
    }))
  }
  parentBranches.sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.ticketCount - a.ticketCount)

  const participantTickets = [...byKey.values()].filter(t => t.key && linkedKeys.has(t.key))

  return {
    name: categoryNodeLabel('Linked in export', participantTickets.length, sumTicketsStoryPoints(participantTickets)),
    workType: 'Linked in export',
    segment: 'linked-section',
    ticketCount: participantTickets.length,
    underCount: linkedParents.length,
    storyPoints: sumTicketsStoryPoints(participantTickets),
    underSp: 0,
    totalSp: sumTicketsStoryPoints(participantTickets),
    value: Math.max(participantTickets.length, 1),
    subsetNote: 'Parent and child both exist in this export.',
    itemStyle: { color: '#0f766e' },
    children: parentBranches.length ? parentBranches : undefined
  }
}

function buildStandaloneSection (standaloneTickets: MergedTicket[]): CategoryTreeNode | null {
  if (!standaloneTickets.length) return null

  const branches: CategoryTreeNode[] = []
  for (const [workType, tickets] of groupTicketsByWorkType(standaloneTickets)) {
    branches.push(makeCategoryTreeNode(workType, tickets, new Set(), new Map(), [], 'category', {
      color: '#64748b',
      subsetNote: 'No parent link within this export — different tickets from linked children above.'
    }))
  }
  branches.sort((a, b) => issueTypeRank(a.workType) - issueTypeRank(b.workType) || b.ticketCount - a.ticketCount)

  return {
    name: categoryNodeLabel('Standalone', standaloneTickets.length, sumTicketsStoryPoints(standaloneTickets)),
    workType: 'Standalone',
    segment: 'standalone-section',
    ticketCount: standaloneTickets.length,
    underCount: 0,
    storyPoints: sumTicketsStoryPoints(standaloneTickets),
    underSp: 0,
    totalSp: sumTicketsStoryPoints(standaloneTickets),
    value: Math.max(standaloneTickets.length, 1),
    subsetNote: 'Tickets without a resolvable parent in this export.',
    itemStyle: { color: '#475569' },
    children: branches.length ? branches : undefined
  }
}

function buildHierarchyAnalysis (rows: Ticket[]): {
  tree: CategoryTreeNode | null
  workTypeSplits: HierarchyWorkTypeSplit[]
  spOverlaps: HierarchySpOverlap[]
  linkedChildCount: number
} {
  const byKey = mergeTicketsForHierarchy(rows)
  if (!byKey.size) {
    return { tree: null, workTypeSplits: [], spOverlaps: [], linkedChildCount: 0 }
  }

  const { linkedChildren, linkedChildKeys, linkedKeys, linkedParents, standaloneTickets } = getLinkedGraph(byKey)
  const workTypeSplits = buildWorkTypeSplits(byKey, linkedChildKeys)
  const spOverlaps = buildHierarchySpOverlaps(byKey)

  const sections: CategoryTreeNode[] = []
  const linkedSection = buildLinkedSection(linkedParents, byKey, linkedKeys)
  const standaloneSection = buildStandaloneSection(standaloneTickets)
  if (linkedSection) sections.push(linkedSection)
  if (standaloneSection) sections.push(standaloneSection)

  const allTickets = [...byKey.values()]
  const totalSp = sumTicketsStoryPoints(allTickets)

  const tree: CategoryTreeNode = {
    name: categoryNodeLabel('All tickets', byKey.size, totalSp),
    workType: 'All',
    segment: 'all',
    ticketCount: byKey.size,
    underCount: linkedChildren.length,
    storyPoints: totalSp,
    underSp: 0,
    totalSp,
    value: Math.max(totalSp, byKey.size, 1),
    itemStyle: { color: '#334155' },
    children: sections.length ? sections : undefined
  }

  return {
    tree,
    workTypeSplits,
    spOverlaps,
    linkedChildCount: linkedChildren.length
  }
}

function countCategoryTreeNodes (nodes: CategoryTreeNode[]): number {
  let count = 0
  for (const node of nodes) {
    count += 1
    if (node.children?.length) count += countCategoryTreeNodes(node.children)
  }
  return count
}

function escapeHtml (value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function makeWorkTypeStoryPointSide (): WorkTypeStoryPointSide {
  return { sp: 0, count: 0, tickets: [] }
}

function sortWorkTypeStoryPointTickets (tickets: WorkTypeStoryPointTicket[]): WorkTypeStoryPointTicket[] {
  return [...tickets].sort((a, b) => {
    const aHasSp = a.storyPoints > 0
    const bHasSp = b.storyPoints > 0
    if (aHasSp !== bHasSp) return aHasSp ? -1 : 1
    return b.storyPoints - a.storyPoints || a.key.localeCompare(b.key)
  })
}

function buildWorkTypeStoryPointBuckets (rows: Ticket[]): Record<string, WorkTypeStoryPointBucket> {
  const buckets: Record<string, WorkTypeStoryPointBucket> = {}
  for (const t of rows) {
    if (!t.workType) continue
    if (!buckets[t.workType]) {
      buckets[t.workType] = {
        chennai: makeWorkTypeStoryPointSide(),
        uk: makeWorkTypeStoryPointSide(),
        totalSp: 0,
        totalCount: 0
      }
    }
    const storyPoints = t.storyPoints || 0
    const side = buckets[t.workType]![t.region]
    side.sp += storyPoints
    side.count += 1
    side.tickets.push({ key: t.key || 'No key', storyPoints, url: t.url })
    buckets[t.workType]!.totalSp += storyPoints
    buckets[t.workType]!.totalCount += 1
  }
  for (const bucket of Object.values(buckets)) {
    bucket.chennai.tickets = sortWorkTypeStoryPointTickets(bucket.chennai.tickets)
    bucket.uk.tickets = sortWorkTypeStoryPointTickets(bucket.uk.tickets)
  }
  return buckets
}

function sortedWorkTypeStoryPointEntries (buckets: Record<string, WorkTypeStoryPointBucket>): [string, WorkTypeStoryPointBucket][] {
  return Object.entries(buckets).sort((a, b) => b[1].totalSp - a[1].totalSp || b[1].totalCount - a[1].totalCount)
}

function toWorkTypeStoryPointTableSide (side: WorkTypeStoryPointSide): WorkTypeStoryPointTableSide {
  const visibleTickets = side.tickets.slice(0, 6).map(ticket => ({
    ...ticket,
    href: jiraIssueUrl(ticket)
  }))
  return {
    ...side,
    visibleTickets,
    moreCount: Math.max(side.tickets.length - visibleTickets.length, 0)
  }
}

const workTypeStoryPointRows = computed<WorkTypeStoryPointTableRow[]>(() => {
  const buckets = buildWorkTypeStoryPointBuckets(filtered.value)
  return sortedWorkTypeStoryPointEntries(buckets).map(([workType, bucket]) => ({
    workType,
    chennai: toWorkTypeStoryPointTableSide(bucket.chennai),
    uk: toWorkTypeStoryPointTableSide(bucket.uk),
    totalSp: bucket.totalSp,
    totalCount: bucket.totalCount
  }))
})

function formatWorkTypeTicketList (tickets: WorkTypeStoryPointTicket[]): string {
  const visible = sortWorkTypeStoryPointTickets(tickets).slice(0, 8)
  const lines = visible.map(t => {
    const label = `${escapeHtml(t.key)}: ${t.storyPoints} SP`
    const url = jiraIssueUrl(t)
    return url
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">${label}</a>`
      : label
  })
  if (tickets.length > visible.length) lines.push(`+${tickets.length - visible.length} more`)
  return lines.length ? lines.join('<br/>') : 'No tickets'
}

function formatWorkTypeStoryPointTooltip (workType: string, bucket: WorkTypeStoryPointBucket): string {
  const regionRows: { label: string; key: RegionKey; color: string }[] = [
    { label: 'Chennai', key: 'chennai', color: '#6366f1' },
    { label: 'UK', key: 'uk', color: '#10b981' }
  ]
  const details = regionRows.map(({ label, key, color }) => {
    const side = bucket[key]
    return `
      <div style="margin-top:8px">
        <div>
          <span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${color};margin-right:6px"></span>
          <strong>${label}</strong>: ${side.sp} SP across ${side.count} ticket${side.count === 1 ? '' : 's'}
        </div>
        <div style="margin-left:14px;color:#64748b">${formatWorkTypeTicketList(side.tickets)}</div>
      </div>
    `
  }).join('')

  return `
    <div style="max-width:360px;white-space:normal">
      <div style="font-weight:700;margin-bottom:4px">${escapeHtml(workType)}</div>
      <div>Total: ${bucket.totalSp} SP across ${bucket.totalCount} ticket${bucket.totalCount === 1 ? '' : 's'}</div>
      ${details}
    </div>
  `
}

/** Same donut structure for Chennai + UK status; palette + shadow differ by region */
function statusDonutChart (data: Record<string, number>, colors: string[], emphasisShadow: string): EChartsOption {
  const entries = Object.entries(data)
  if (!entries.length) {
    return withChartMotion({
      animationDuration: 500,
      title: { text: 'No status data', left: 'center', top: 'middle', textStyle: { color: '#64748b', fontSize: 14 } }
    })
  }
  return withChartMotion({
    tooltip: { transitionDuration: 0.4 },
    legend: { bottom: 0 },
    color: colors,
    series: [{
      type: 'pie',
      radius: ['48%', '72%'],
      animationType: 'expansion',
      animationEasing: 'elasticOut',
      animationDuration: 2200,
      animationDelay: (idx: number) => idx * 95 + 120,
      stillShowZeroSum: false,
      label: { formatter: '{b}: {c}', fontWeight: 500 },
      labelLine: { smooth: 0.35, length: 12, length2: 14 },
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: { shadowBlur: 28, shadowColor: emphasisShadow },
        label: { fontWeight: 700 }
      },
      data: entries.map(([n, v]) => ({ name: n, value: v }))
    }]
  })
}

/** Same horizontal bar layout for Chennai + UK work types; bar + shadow colors differ */
function workTypeHorizontalChart (data: Record<string, number>, barColor: string, emphasisShadow: string): EChartsOption {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1])
  const keys = sorted.map(x => x[0])
  const vals = sorted.map(x => x[1])
  if (!keys.length) {
    return withChartMotion({
      animationDuration: 500,
      title: { text: 'No work type data', left: 'center', top: 'middle', textStyle: { color: '#64748b', fontSize: 14 } }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipRich,
    grid: { left: 8, right: 24, top: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { opacity: 0.35 } } },
    yAxis: { type: 'category', data: keys, inverse: true, axisTick: { show: false } },
    series: [{
      type: 'bar',
      data: vals,
      animationDelay: (idx: number) => idx * 72 + 100,
      animationEasing: 'elasticOut',
      barMaxWidth: 44,
      showBackground: true,
      backgroundStyle: { color: 'rgba(15, 23, 42, 0.06)', borderRadius: [0, barRound[0], barRound[1], 0] },
      label: { show: true, position: 'right', fontWeight: 600 },
      itemStyle: { color: barColor, borderRadius: [0, 10, 10, 0] },
      emphasis: {
        focus: 'series',
        itemStyle: { shadowBlur: 22, shadowColor: emphasisShadow }
      }
    }]
  })
}

const statusChennaiChart = computed<EChartsOption>(() => statusDonutChart(
  count(filtered.value.filter(t => t.region === 'chennai').map(t => t.status)),
  ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#3730a3'],
  'rgba(79, 70, 229, 0.45)'
))

const statusUkChart = computed<EChartsOption>(() => statusDonutChart(
  count(filtered.value.filter(t => t.region === 'uk').map(t => t.status)),
  ['#10b981', '#34d399', '#6ee7b7', '#059669', '#065f46'],
  'rgba(16, 185, 129, 0.5)'
))

const workChennaiChart = computed<EChartsOption>(() => workTypeHorizontalChart(
  count(filtered.value.filter(t => t.region === 'chennai').map(t => t.workType)),
  '#6366f1',
  'rgba(99, 102, 241, 0.45)'
))

const workUkChart = computed<EChartsOption>(() => workTypeHorizontalChart(
  count(filtered.value.filter(t => t.region === 'uk').map(t => t.workType)),
  '#10b981',
  'rgba(16, 185, 129, 0.45)'
))

const spChart = computed<EChartsOption>(() => {

  const chennaiTickets = filtered.value.filter(t => t.region === 'chennai')
  const ukTickets = filtered.value.filter(t => t.region === 'uk')

  const chennaiSP = chennaiTickets.reduce((a,b)=>a+(b.storyPoints || 0),0)
  const ukSP = ukTickets.reduce((a,b)=>a+(b.storyPoints || 0),0)

  const chennaiNoSP = chennaiTickets.filter(t => !t.storyPoints || t.storyPoints === 0).length
  const ukNoSP = ukTickets.filter(t => !t.storyPoints || t.storyPoints === 0).length

  return withChartMotion({
    tooltip: axisTooltipRich,
    legend:{ bottom: 0 },
    xAxis:{
      type:'category',
      data:['Chennai','UK'],
      axisTick: { alignWithLabel: true }
    },
    yAxis:[
      { type:'value', name: 'Story points', splitLine: { lineStyle: { opacity: 0.35 } } },
      { type:'value', name: 'Tickets (no SP)', minInterval: 1, splitLine: { show: false } }
    ],
    series:[
      {
        name:'Total Story Points',
        type:'bar',
        yAxisIndex: 0,
        data:[chennaiSP, ukSP],
        animationDelay: (idx: number) => idx * 110 + 90,
        animationEasing: 'elasticOut',
        barMaxWidth: 72,
        barGap: '28%',
        showBackground: true,
        backgroundStyle: { color: 'rgba(15, 23, 42, 0.05)', borderRadius: barRound },
        label:{ show:true, position:'top', fontWeight: 600 },
        itemStyle:{
          borderRadius: barRound,
          color:(p:any)=> p.dataIndex===0 ? '#6366f1' : '#10b981'
        },
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 24, shadowColor: 'rgba(99, 102, 241, 0.35)' }
        }
      },
      {
        name:'Tickets Without SP',
        type:'line',
        yAxisIndex: 1,
        smooth: true,
        data:[chennaiNoSP, ukNoSP],
        animationDelay: (idx: number) => idx * 110 + 200,
        symbolSize: 10,
        lineStyle: { width: 3, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#fff' },
        label:{ show:true, position:'top', fontWeight: 600, color: '#b45309' },
        emphasis: {
          focus: 'series',
          lineStyle: { width: 4 }
        }
      }
    ]
  })
})

const workTypeStoryPointsChart = computed<EChartsOption>(() => {
  const buckets = buildWorkTypeStoryPointBuckets(filtered.value)
  const sorted = sortedWorkTypeStoryPointEntries(buckets)
  const labels = sorted.map(([workType]) => workType)

  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: { text: 'No work type story point data', left: 'center', top: 'middle', textStyle: { color: '#64748b', fontSize: 14 } }
    })
  }

  const chennaiSp = labels.map(workType => buckets[workType]!.chennai.sp)
  const ukSp = labels.map(workType => buckets[workType]!.uk.sp)

  return withChartMotion({
    tooltip: {
      trigger: 'axis',
      transitionDuration: 0.35,
      axisPointer: {
        type: 'shadow',
        shadowStyle: { opacity: 0.18 }
      },
      formatter: (params: any) => {
        const first = Array.isArray(params) ? params[0] : params
        const workType = String(first?.axisValue ?? '')
        const bucket = buckets[workType]
        return bucket ? formatWorkTypeStoryPointTooltip(workType, bucket) : escapeHtml(workType)
      }
    },
    legend: { bottom: 0 },
    grid: { left: 8, right: 32, top: 24, bottom: 56, containLabel: true },
    xAxis: { type: 'value', name: 'Story points', splitLine: { lineStyle: { opacity: 0.35 } } },
    yAxis: { type: 'category', data: labels, inverse: true, axisTick: { show: false } },
    series: [
      {
        name: 'Chennai',
        type: 'bar',
        stack: 'story-points',
        data: chennaiSp,
        animationDelay: (idx: number) => idx * 58 + 80,
        animationEasing: 'elasticOut',
        barMaxWidth: 36,
        label: {
          show: true,
          position: 'inside',
          formatter: ({ value }: any) => Number(value) ? `${value}` : '',
          fontWeight: 700,
          color: '#fff'
        },
        itemStyle: { color: '#6366f1', borderRadius: [0, 0, 0, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 18, shadowColor: 'rgba(99, 102, 241, 0.45)' } }
      },
      {
        name: 'UK',
        type: 'bar',
        stack: 'story-points',
        data: ukSp,
        animationDelay: (idx: number) => idx * 58 + 120,
        animationEasing: 'elasticOut',
        barMaxWidth: 36,
        label: {
          show: true,
          position: 'inside',
          formatter: ({ value }: any) => Number(value) ? `${value}` : '',
          fontWeight: 700,
          color: '#fff'
        },
        itemStyle: { color: '#10b981', borderRadius: [0, 10, 10, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 18, shadowColor: 'rgba(16, 185, 129, 0.45)' } }
      }
    ]
  })
})

const hierarchyFilteredTickets = computed(() => {
  const rows = filtered.value
  if (hierarchyRegionFilter.value === 'all') return rows
  return rows.filter(t => t.region === hierarchyRegionFilter.value)
})

const issueHierarchyMeta = computed(() => {
  const analysis = buildHierarchyAnalysis(hierarchyFilteredTickets.value)
  const nodeCount = analysis.tree?.children ? countCategoryTreeNodes(analysis.tree.children) + 1 : 0
  const chartHeight = Math.min(880, Math.max(460, nodeCount * 64 + 100))
  return { ...analysis, nodeCount, chartHeight }
})

const issueHierarchyChart = computed<EChartsOption>(() => {
  const { tree } = issueHierarchyMeta.value

  if (!tree) {
    return withChartMotion({
      animationDuration: 500,
      title: { text: 'No issues in the current filter', left: 'center', top: 'middle', textStyle: { color: '#64748b', fontSize: 14 } }
    })
  }

  return withChartMotion({
    tooltip: {
      trigger: 'item',
      transitionDuration: 0.35,
      formatter: (params: any) => {
        const d = params?.data as CategoryTreeNode | undefined
        if (!d) return ''
        if (d.workType === 'All') {
          return [
            '<strong>All tickets</strong>',
            `${d.ticketCount} tickets · ${d.storyPoints} SP`,
            d.underCount ? `${d.underCount} have a parent in this export (linked branch)` : 'No parent links in this export'
          ].filter(Boolean).join('<br/>')
        }
        if (d.segment === 'linked-section') {
          return [
            '<strong>Linked in export</strong>',
            `${d.ticketCount} tickets · ${d.storyPoints} SP`,
            'Parent and child rows both exist in this dataset'
          ].join('<br/>')
        }
        if (d.segment === 'standalone-section') {
          return [
            '<strong>Standalone</strong>',
            `${d.ticketCount} tickets · ${d.storyPoints} SP`,
            'Parent missing from export — not shown under linked branch'
          ].join('<br/>')
        }
        const lines = [
          `<strong>${escapeHtml(d.workType)}</strong>`,
          `${d.ticketCount} tickets · ${d.storyPoints} SP`,
          d.subsetNote ? `<span style="color:#64748b">${escapeHtml(d.subsetNote)}</span>` : '',
          d.underCount ? `${d.underCount} nested underneath · ${d.underSp} SP underneath` : ''
        ].filter(Boolean)
        return lines.join('<br/>')
      }
    },
    series: [{
      type: 'tree',
      data: [tree],
      top: 40,
      left: '12%',
      bottom: 24,
      right: '12%',
      orient: 'TB',
      roam: true,
      initialTreeDepth: -1,
      expandAndCollapse: true,
      animationDurationUpdate: 650,
      symbol: 'roundRect',
      symbolSize: hierarchyNodeSymbolSize,
      label: {
        position: 'inside',
        verticalAlign: 'middle',
        align: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: '#fff',
        lineHeight: 18,
        overflow: 'break',
        width: 220
      },
      leaves: {
        label: { position: 'inside', verticalAlign: 'middle', align: 'center' }
      },
      lineStyle: { color: '#94a3b8', width: 2, curveness: 0.35 },
      emphasis: { focus: 'descendant' }
    }]
  })
})

function parseTicketDate (updated?: string): Date | null {
  if (!updated) return null
  const d = new Date(updated)
  return Number.isNaN(d.getTime()) ? null : d
}

function quarterKey (d: Date): string {
  const y = d.getFullYear()
  const q = Math.floor(d.getMonth() / 3) + 1
  return `${y} Q${q}`
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

/** Stable key for sorting, e.g. 2025-03 */
function monthKey (d: Date): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

function monthLabelFromKey (key: string): string {
  const [ys, ms] = key.split('-')
  const y = Number(ys)
  const m = Number(ms) - 1
  if (Number.isNaN(y) || m < 0 || m > 11) return key
  return `${MONTH_SHORT[m]} ${y}`
}

/** Ordered quarter labels from min→max inclusive, plus any bucket keys that hold data. */
function buildQuarterlySeries (rows: Ticket[]) {
  const dated = rows.filter(t => parseTicketDate(t.updated))
  let minD: Date | null = null
  let maxD: Date | null = null
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
    if (!minD || d < minD) minD = d
    if (!maxD || d > maxD) maxD = d
  }
  const labels: string[] = []
  if (minD && maxD) {
    let y = minD.getFullYear()
    let q = Math.floor(minD.getMonth() / 3) + 1
    const endY = maxD.getFullYear()
    const endQ = Math.floor(maxD.getMonth() / 3) + 1
    while (y < endY || (y === endY && q <= endQ)) {
      labels.push(`${y} Q${q}`)
      q += 1
      if (q > 4) {
        q = 1
        y += 1
      }
    }
  }
  const agg: Record<string, { chennai: { sp: number; n: number }; uk: { sp: number; n: number } }> = {}
  for (const lab of labels) {
    agg[lab] = { chennai: { sp: 0, n: 0 }, uk: { sp: 0, n: 0 } }
  }
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
    const k = quarterKey(d)
    if (!agg[k]) continue
    const side = t.region === 'uk' ? agg[k].uk : agg[k].chennai
    side.n += 1
    side.sp += t.storyPoints || 0
  }
  const chennaiSp = labels.map(l => agg[l]!.chennai.sp)
  const ukSp = labels.map(l => agg[l]!.uk.sp)
  const chennaiN = labels.map(l => agg[l]!.chennai.n)
  const ukN = labels.map(l => agg[l]!.uk.n)
  return { labels, chennaiSp, ukSp, chennaiN, ukN }
}

/** Ordered month keys (YYYY-MM) from min→max inclusive; chart uses Jan, Feb, … labels. */
function buildMonthlySeries (rows: Ticket[]) {
  const dated = rows.filter(t => parseTicketDate(t.updated))
  let minD: Date | null = null
  let maxD: Date | null = null
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
    if (!minD || d < minD) minD = d
    if (!maxD || d > maxD) maxD = d
  }
  const keys: string[] = []
  if (minD && maxD) {
    let y = minD.getFullYear()
    let m = minD.getMonth()
    const endY = maxD.getFullYear()
    const endM = maxD.getMonth()
    while (y < endY || (y === endY && m <= endM)) {
      keys.push(`${y}-${String(m + 1).padStart(2, '0')}`)
      m += 1
      if (m > 11) {
        m = 0
        y += 1
      }
    }
  }
  const agg: Record<string, { chennai: { sp: number; n: number }; uk: { sp: number; n: number } }> = {}
  for (const k of keys) {
    agg[k] = { chennai: { sp: 0, n: 0 }, uk: { sp: 0, n: 0 } }
  }
  for (const t of dated) {
    const d = parseTicketDate(t.updated)!
    const k = monthKey(d)
    if (!agg[k]) continue
    const side = t.region === 'uk' ? agg[k].uk : agg[k].chennai
    side.n += 1
    side.sp += t.storyPoints || 0
  }
  const labels = keys.map(monthLabelFromKey)
  const chennaiSp = keys.map(k => agg[k]!.chennai.sp)
  const ukSp = keys.map(k => agg[k]!.uk.sp)
  const chennaiN = keys.map(k => agg[k]!.chennai.n)
  const ukN = keys.map(k => agg[k]!.uk.n)
  return { labels, chennaiSp, ukSp, chennaiN, ukN }
}

const quarterlySeries = computed(() => buildQuarterlySeries(filtered.value))
const monthlySeries = computed(() => buildMonthlySeries(filtered.value))

const quarterlySpChart = computed<EChartsOption>(() => {
  const { labels, chennaiSp, ukSp } = quarterlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipLine,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 8 ? 35 : 0 }, boundaryGap: false },
    yAxis: { type: 'value', name: 'Story points', splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        data: chennaiSp,
        animationDelay: (idx: number) => idx * 45 + 80,
        lineStyle: { width: 3, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(99, 102, 241, 0.12)' },
        emphasis: { focus: 'series', lineStyle: { width: 4 } }
      },
      {
        name: 'UK',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        data: ukSp,
        animationDelay: (idx: number) => idx * 45 + 130,
        lineStyle: { width: 3, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.12)' },
        emphasis: { focus: 'series', lineStyle: { width: 4 } }
      }
    ]
  })
})

const quarterlyCountChart = computed<EChartsOption>(() => {
  const { labels, chennaiN, ukN } = quarterlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipRich,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 8 ? 35 : 0 }, axisTick: { alignWithLabel: true } },
    yAxis: { type: 'value', name: 'Tickets', minInterval: 1, splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'bar',
        stack: 'vol',
        data: chennaiN,
        animationDelay: (idx: number) => idx * 45 + 80,
        animationEasing: 'elasticOut',
        barMaxWidth: 52,
        label: { show: true, position: 'inside', fontWeight: 600, color: '#fff' },
        itemStyle: { color: '#818cf8', borderRadius: [0, 0, 0, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 16, shadowColor: 'rgba(129, 140, 248, 0.5)' } }
      },
      {
        name: 'UK',
        type: 'bar',
        stack: 'vol',
        data: ukN,
        animationDelay: (idx: number) => idx * 45 + 120,
        animationEasing: 'elasticOut',
        barMaxWidth: 52,
        label: { show: true, position: 'inside', fontWeight: 600, color: '#fff' },
        itemStyle: { color: '#34d399', borderRadius: [8, 8, 0, 0] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 16, shadowColor: 'rgba(52, 211, 153, 0.5)' } }
      }
    ]
  })
})

const monthlySpChart = computed<EChartsOption>(() => {
  const { labels, chennaiSp, ukSp } = monthlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipLine,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 6 ? 35 : 0 }, boundaryGap: false },
    yAxis: { type: 'value', name: 'Story points', splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: chennaiSp,
        animationDelay: (idx: number) => idx * 32 + 70,
        lineStyle: { width: 2.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.45)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.02)' }
            ]
          }
        },
        emphasis: { focus: 'series' }
      },
      {
        name: 'UK',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: ukSp,
        animationDelay: (idx: number) => idx * 32 + 110,
        lineStyle: { width: 2.5, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
            ]
          }
        },
        emphasis: { focus: 'series' }
      }
    ]
  })
})

const monthlyCountChart = computed<EChartsOption>(() => {
  const { labels, chennaiN, ukN } = monthlySeries.value
  if (!labels.length) {
    return withChartMotion({
      animationDuration: 500,
      title: {
        text: 'No issues with a valid Updated date in the current filter',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#64748b', fontSize: 14 }
      }
    })
  }
  return withChartMotion({
    tooltip: axisTooltipLine,
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, bottom: 56, top: 32, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: labels.length > 6 ? 35 : 0 }, boundaryGap: false },
    yAxis: { type: 'value', name: 'Tickets', minInterval: 1, splitLine: { lineStyle: { opacity: 0.35 } } },
    series: [
      {
        name: 'Chennai',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbolSize: 4,
        data: chennaiN,
        animationDelay: (idx: number) => idx * 28 + 65,
        lineStyle: { width: 1.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(129, 140, 248, 0.55)' },
        emphasis: { focus: 'series' }
      },
      {
        name: 'UK',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbolSize: 4,
        data: ukN,
        animationDelay: (idx: number) => idx * 28 + 100,
        lineStyle: { width: 1.5, color: '#059669' },
        itemStyle: { color: '#059669' },
        areaStyle: { color: 'rgba(52, 211, 153, 0.55)' },
        emphasis: { focus: 'series' }
      }
    ]
  })
})</script>

<style>
body{font-family:Inter,system-ui,sans-serif}
</style>
