<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard'
import { useLayoutStore } from '../../stores/layout'
import ThemeToggle from '../ui/ThemeToggle.vue'

const store = useDashboardStore()
const layout = useLayoutStore()
const { headerTitleParts } = storeToRefs(store)
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-[#c8ced3] bg-white shadow-sm dark:border-gray-700 dark:bg-[#2f353a]">
    <div class="relative flex min-h-[60px] items-center px-4 py-2">
      <!-- Left: hamburger -->
      <div class="z-10 flex items-center gap-1">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-white/10"
          @click="layout.toggleMobileSidebar()"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <button
          type="button"
          class="hidden h-9 w-9 items-center justify-center rounded text-gray-600 hover:bg-gray-100 lg:inline-flex dark:text-gray-300 dark:hover:bg-white/10"
          @click="layout.toggleSidebar()"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      <!-- Center: title -->
      <h1 class="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-baseline gap-2 tracking-tight">
        <span class="bg-gradient-to-r from-[#6f42c1] to-[#9b59b6] bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl dark:from-[#a78bfa] dark:to-[#c4b5fd]">
          {{ headerTitleParts.squad }}
        </span>
        <span class="bg-gradient-to-r from-[#20a8d8] to-[#0d6efd] bg-clip-text text-xl font-bold text-transparent md:text-2xl dark:from-[#5bc0de] dark:to-[#6ea8fe]">
          {{ headerTitleParts.period }}
        </span>
      </h1>

      <!-- Right: theme toggle -->
      <div class="z-10 ml-auto flex items-center">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
