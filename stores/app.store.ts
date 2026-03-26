import { defineStore } from 'pinia'

// 应用 UI 状态 Store - 管理侧边栏、全屏等 UI 状态
export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const isFullscreen = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  // Actions
  /**
   * 切换侧边栏折叠状态
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * 设置侧边栏状态
   */
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  /**
   * 切换全屏模式
   */
  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  }

  /**
   * 设置主题
   */
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return {
    // State
    sidebarCollapsed,
    isFullscreen,
    theme,

    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    toggleFullscreen,
    setTheme
  }
})
