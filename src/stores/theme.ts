import { defineStore } from 'pinia'
import { watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'jira-dashboard-theme'

function getInitialTheme (): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme (mode: ThemeMode) {
  const root = document.documentElement
  root.setAttribute('data-theme', mode)
  root.classList.toggle('dark', mode === 'dark')
  localStorage.setItem(STORAGE_KEY, mode)
}

export function chartThemeColors (mode: ThemeMode) {
  if (mode === 'dark') {
    return {
      text: '#94a3b8',
      textStrong: '#e2e8f0',
      axis: '#475569',
      splitLine: 'rgba(148, 163, 184, 0.12)',
      tooltipBg: '#1a2332',
      tooltipBorder: '#334155',
      empty: '#64748b'
    }
  }
  return {
    text: '#64748b',
    textStrong: '#1e293b',
    axis: '#94a3b8',
    splitLine: 'rgba(15, 23, 42, 0.08)',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e2e8f0',
    empty: '#64748b'
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: getInitialTheme() as ThemeMode
  }),

  actions: {
    init () {
      applyTheme(this.mode)
      watch(
        () => this.mode,
        mode => applyTheme(mode)
      )
    },

    toggle () {
      this.mode = this.mode === 'light' ? 'dark' : 'light'
    },

    set (mode: ThemeMode) {
      this.mode = mode
    }
  }
})
