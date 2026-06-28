import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    activeSection: 'overview'
  }),

  actions: {
    toggleSidebar () {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    toggleMobileSidebar () {
      this.mobileSidebarOpen = !this.mobileSidebarOpen
    },

    closeMobileSidebar () {
      this.mobileSidebarOpen = false
    },

    setActiveSection (id: string) {
      this.activeSection = id
    }
  }
})
