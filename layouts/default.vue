<template>
  <div class="layout-default min-h-screen flex">
    <!-- 左侧边栏 -->
    <aside 
      class="bg-gray-800 text-white transition-all duration-300"
      :class="sidebarCollapsed ? 'w-16' : 'w-64'"
    >
      <!-- Logo 区域 -->
      <div class="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 v-if="!sidebarCollapsed" class="text-xl font-bold">BestMSC</h1>
        <el-icon v-else size="24"><House /></el-icon>
      </div>

      <!-- 菜单区域 -->
      <el-menu
        :default-active="route.path"
        background-color="#1f2937"
        text-color="#9ca3af"
        active-text-color="#FFFFFF"
        class="border-r-0"
        :collapse="sidebarCollapsed"
        router
      >
        <template v-for="menu in menusRef" :key="menu.path">
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.path">
            <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <TopBar />

      <!-- 主内容区 -->
      <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// 默认布局 - 包含左侧菜单和顶栏
import { House } from '@element-plus/icons-vue'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()

// 从 useMenu 组合式函数获取菜单（会自动过滤权限）
const { menus } = useMenu()

// 确保 menus 有默认空数组
const menusRef = computed(() => menus.value || [])

// 侧边栏折叠状态 - 直接使用 storeToRefs
const { sidebarCollapsed } = storeToRefs(appStore)

// 初始化时获取用户信息和菜单
const { refresh: refreshUserInfo } = await useAsyncData('userInfo', async () => {
  // 检查登录状态
  const isLoggedIn = useState('isLoggedIn')
  const token = useCookie('auth_token')
  
  // 如果没有登录状态但有 token 或 localStorage 标记，设置登录状态
  if (!isLoggedIn.value) {
    // 检查 cookie 中的 token（HttpOnly 无法读取，但保留检查）
    const hasToken = !!token.value
    
    // 检查 localStorage 中的登录标记
    let hasLocalStorageFlag = false
    if (import.meta.client) {
      const loggedIn = localStorage.getItem('isLoggedIn')
      const expireTime = localStorage.getItem('tokenExpireTime')
      
      if (loggedIn === 'true' && expireTime) {
        const expireTimestamp = parseInt(expireTime, 10)
        const now = Date.now()
        hasLocalStorageFlag = now < expireTimestamp
        
        // 如果已过期，清除标记
        if (!hasLocalStorageFlag) {
          localStorage.removeItem('isLoggedIn')
          localStorage.removeItem('tokenExpireTime')
        }
      }
    }
    
    // 如果有有效标记，设置登录状态
    if (hasToken || hasLocalStorageFlag) {
      isLoggedIn.value = true
    }
  }
  
  // 只在没有用户信息时才获取
  if (!userStore.user) {
    try {
      // 在 SSR 时，尝试从上下文中获取 event
      const event = typeof window === 'undefined' ? useRequestEvent() : undefined
      await userStore.fetchUserInfo(event)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
  
  // 必须返回一个值，避免 SSR 和客户端不一致
  return userStore.user || {}
}, {
  server: true, // SSR 模式下在服务端也执行
  lazy: false, // 阻塞式加载，确保首屏有数据
  getCachedData: (key) => {
    // 优先使用缓存数据，避免重复请求
    const cached = userStore.user
    if (cached) {
      return cached
    }
    return undefined
  }
})
</script>

<style scoped>
.layout-default {
  height: 100vh;
}

.el-menu {
  border-right: none !important;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: #374151 !important;
}

.el-menu-item.is-active {
  background-color: #31afaf !important;
}
</style>
