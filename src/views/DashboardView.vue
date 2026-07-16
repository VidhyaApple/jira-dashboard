<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppTopbar from '../components/layout/AppTopbar.vue'
import KpiCards from '../components/dashboard/KpiCards.vue'
import StatusChennaiChart from '../components/charts/StatusChennaiChart.vue'
import StatusUkChart from '../components/charts/StatusUkChart.vue'
import WorkTypeChennaiChart from '../components/charts/WorkTypeChennaiChart.vue'
import WorkTypeUkChart from '../components/charts/WorkTypeUkChart.vue'
import WorkTypeStoryPointsTable from '../components/charts/WorkTypeStoryPointsTable.vue'
import StoryPointsRegionChart from '../components/charts/StoryPointsRegionChart.vue'
import QuarterlySpChart from '../components/charts/QuarterlySpChart.vue'
import QuarterlyCountChart from '../components/charts/QuarterlyCountChart.vue'
import MonthlySpChart from '../components/charts/MonthlySpChart.vue'
import MonthlyCountChart from '../components/charts/MonthlyCountChart.vue'
import MonthlyBaselineChart from '../components/charts/MonthlyBaselineChart.vue'
import MonthlyCapacitySpChart from '../components/charts/MonthlyCapacitySpChart.vue'
import HierarchyChartPanel from '../components/charts/HierarchyChartPanel.vue'
import { useDashboardStore } from '../stores/dashboard'
import { useLayoutStore } from '../stores/layout'
import { provideEChartsOptions } from '../plugins/echarts'

provideEChartsOptions()

const store = useDashboardStore()
const layout = useLayoutStore()
const { sidebarCollapsed } = storeToRefs(layout)
const { tickets, selectedSquad, isLoading } = storeToRefs(store)

onMounted(async () => {
  store.applyUrlState()
  await store.loadSquad(store.selectedSquad)
  store.syncUrl()
})
</script>

<template>
  <div class="min-h-screen bg-[#ebedef] dark:bg-[#1a1d21]">
    <AppSidebar />

    <div class="transition-all duration-200" :class="sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'">
      <AppTopbar />

      <main class="space-y-4 p-4">
        <KpiCards />

        <div v-if="!tickets.length && !isLoading" class="rounded bg-white px-6 py-16 text-center shadow-sm dark:bg-[#2f353a]">
          <p class="text-gray-700 dark:text-gray-200">No ticket data for squad <strong>{{ selectedSquad }}</strong>.</p>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Add <code class="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">public/sources/{{ selectedSquad }}/ciec.csv</code>
            and <code class="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">team.csv</code>, or upload files in the sidebar.
          </p>
        </div>

        <Transition name="fade-up">
          <div v-if="tickets.length" class="space-y-8">
            <section id="status" class="scroll-mt-28 grid gap-5 md:grid-cols-2">
              <StatusChennaiChart />
              <StatusUkChart />
            </section>

            <section id="work-type" class="scroll-mt-28 space-y-5">
              <div class="grid gap-5 md:grid-cols-2">
                <WorkTypeChennaiChart />
                <WorkTypeUkChart />
              </div>
              <WorkTypeStoryPointsTable />
            </section>

            <section id="story-points" class="scroll-mt-28">
              <StoryPointsRegionChart />
            </section>

            <section id="timeline" class="scroll-mt-28 space-y-5">
              <div class="grid gap-5 md:grid-cols-2">
                <QuarterlySpChart />
                <QuarterlyCountChart />
                <MonthlySpChart />
                <MonthlyCountChart />
              </div>
              <MonthlyBaselineChart />
            </section>

            <section id="capacity" class="scroll-mt-28">
              <MonthlyCapacitySpChart />
            </section>

            <section id="hierarchy" class="scroll-mt-28">
              <HierarchyChartPanel />
            </section>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>
