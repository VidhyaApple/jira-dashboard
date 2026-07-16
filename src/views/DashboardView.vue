<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppTopbar from '../components/layout/AppTopbar.vue'
import KpiCards from '../components/dashboard/KpiCards.vue'
import SupportKpiCards from '../components/dashboard/SupportKpiCards.vue'
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
import SupportStateChart from '../components/charts/support/SupportStateChart.vue'
import SupportPriorityChart from '../components/charts/support/SupportPriorityChart.vue'
import SupportCategoryChart from '../components/charts/support/SupportCategoryChart.vue'
import SupportAssignmentGroupChart from '../components/charts/support/SupportAssignmentGroupChart.vue'
import SupportAssigneeChart from '../components/charts/support/SupportAssigneeChart.vue'
import SupportOpenedByChart from '../components/charts/support/SupportOpenedByChart.vue'
import SupportSubcategoryTable from '../components/charts/support/SupportSubcategoryTable.vue'
import SupportMonthlyOpenedChart from '../components/charts/support/SupportMonthlyOpenedChart.vue'
import SupportMonthlyClosedChart from '../components/charts/support/SupportMonthlyClosedChart.vue'
import SupportVolumeBaselineChart from '../components/charts/support/SupportVolumeBaselineChart.vue'
import SupportAgeTrendChart from '../components/charts/support/SupportAgeTrendChart.vue'
import { useDashboardStore } from '../stores/dashboard'
import { useLayoutStore } from '../stores/layout'
import { provideEChartsOptions } from '../plugins/echarts'

provideEChartsOptions()

const store = useDashboardStore()
const layout = useLayoutStore()
const { sidebarCollapsed } = storeToRefs(layout)
const { tickets, selectedSquad, isLoading, isSupportSquad, showHierarchyChart } = storeToRefs(store)

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
        <SupportKpiCards v-if="isSupportSquad" />
        <KpiCards v-else />

        <div v-if="!tickets.length && !isLoading" class="rounded bg-white px-6 py-16 text-center shadow-sm dark:bg-[#2f353a]">
          <p class="text-gray-700 dark:text-gray-200">No data for squad <strong>{{ selectedSquad }}</strong>.</p>
          <p v-if="isSupportSquad" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Add <code class="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">public/sources/{{ selectedSquad }}/support.csv</code>,
            or upload the file in the sidebar.
          </p>
          <p v-else class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Add <code class="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">public/sources/{{ selectedSquad }}/ciec.csv</code>
            and <code class="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">team.csv</code>, or upload files in the sidebar.
          </p>
        </div>

        <Transition name="fade-up">
          <div v-if="tickets.length && isSupportSquad" class="space-y-8">
            <section id="status" class="scroll-mt-28 space-y-5">
              <div class="grid gap-5 md:grid-cols-2">
                <SupportStateChart />
                <SupportPriorityChart />
              </div>
              <div id="timeline" class="space-y-5">
                <div class="grid gap-5 md:grid-cols-2">
                  <SupportMonthlyOpenedChart />
                  <SupportMonthlyClosedChart />
                </div>
                <SupportVolumeBaselineChart />
                <SupportAgeTrendChart />
              </div>
            </section>

            <section id="work-type" class="scroll-mt-28 space-y-5">
              <div class="grid gap-5 md:grid-cols-2">
                <SupportCategoryChart />
                <SupportAssignmentGroupChart />
              </div>
              <div class="grid gap-5 md:grid-cols-2">
                <SupportAssigneeChart />
                <SupportOpenedByChart />
              </div>
            </section>

            <section id="subcategory" class="scroll-mt-28">
              <SupportSubcategoryTable />
            </section>

            <section v-if="showHierarchyChart" id="hierarchy" class="scroll-mt-28">
              <HierarchyChartPanel />
            </section>
          </div>

          <div v-else-if="tickets.length" class="space-y-8">
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

            <section v-if="showHierarchyChart" id="hierarchy" class="scroll-mt-28">
              <HierarchyChartPanel />
            </section>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>
