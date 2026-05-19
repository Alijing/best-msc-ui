import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const isFullscreen = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  // Actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }

  return {
    sidebarCollapsed,
    isFullscreen,
    theme,
    toggleSidebar,
    setSidebarCollapsed,
    toggleFullscreen,
    setTheme
  }
})
