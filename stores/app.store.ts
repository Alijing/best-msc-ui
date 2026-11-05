import { defineStore } from 'pinia'

const SIDEBAR_KEY = 'best-msc-sidebar'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const isFullscreen = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  if (import.meta.client) {
    sidebarCollapsed.value = localStorage.getItem(SIDEBAR_KEY) === '1'
  }

  function persistSidebar() {
    if (import.meta.client) {
      localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed.value ? '1' : '0')
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    persistSidebar()
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    persistSidebar()
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
