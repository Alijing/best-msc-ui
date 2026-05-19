<script setup lang="ts">
import { useAppStore } from '~/stores/app.store'

const appStore = useAppStore()
const route = useRoute()

// 菜单组合式函数逻辑内联，避免服务端渲染时访问未定义数据
const userStore = useUserStore()

// 安全的菜单计算属性（客户端才使用）
const menus = computed(() => {
  if (import.meta.client) {
    return userStore.menus || []
  }
  return []
})

// 面包屑生成（仅在客户端）
const breadcrumbs = computed(() => {
  if (!import.meta.client) return [{ name: '首页', path: '/' }]
  
  const crumbs: Array<{ name: string; path: string }> = [{ name: '首页', path: '/' }]
  
  const findPath = (menuItems: any[], currentPath: string): boolean => {
    for (const item of menuItems) {
      if (item.path === currentPath) {
        crumbs.push({ name: item.name, path: item.path })
        return true
      }
      if (item.children && findPath(item.children, currentPath)) {
        crumbs.unshift({ name: item.name, path: item.path })
        return true
      }
    }
    return false
  }
  
  findPath(userStore.menus || [], route.path)
  return crumbs
})

// 菜单项点击处理
function handleMenuSelect(path: string) {
  navigateTo(path)
}
</script>

<template>
  <div class="layout-default flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- 左侧边栏 -->
    <aside 
      :class="[
        'bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out',
        appStore.sidebarCollapsed ? 'w-16' : 'w-64'
      ]"
      class="flex flex-col"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <h1 v-if="!appStore.sidebarCollapsed" class="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
          Best MSC 管理系统
        </h1>
        <img
          v-else
          src="/favicon.svg"
          alt="Logo"
          class="w-10 h-10 flex-shrink-0"
        />
      </div>

      <!-- 菜单列表 -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul>
          <li
            v-for="menu in menus"
            :key="menu.id"
            class="px-2 py-2 group"
          >
            <UButton
              @click="handleMenuSelect(menu.path)"
              variant="ghost"
              color="gray"
              class="w-full justify-start h-11 transition-all duration-200 ease-in-out hover:bg-teal-100 dark:hover:bg-teal-900/50"
              :class="$route.path === menu.path ? 'bg-teal-200 dark:bg-teal-900/70 text-primary font-semibold shadow-sm' : ''"
            >
              <template #leading>
                <UIcon 
                  v-if="menu.icon" 
                  :name="menu.icon" 
                  class="w-5 h-5 flex-shrink-0"
                />
                <UIcon 
                  v-else 
                  name="i-heroicons-document" 
                  class="w-5 h-5 flex-shrink-0"
                />
              </template>
              
              <span 
                v-if="!appStore.sidebarCollapsed" 
              >
                {{ menu.name }}
              </span>
            </UButton>
            
            <!-- 子菜单（如果有） -->
            <ul 
              v-if="menu.children && !appStore.sidebarCollapsed" 
              class="ml-6 mt-2 space-y-1.5"
            >
              <li
                v-for="child in menu.children"
                :key="child.id"
                class="group"
              >
                <UButton
                  @click="handleMenuSelect(child.path)"
                  variant="ghost"
                  color="gray"
                  size="sm"
                  class="w-full justify-start h-10 transition-all duration-200 ease-in-out hover:bg-teal-100 dark:hover:bg-teal-900/50"
                  :class="$route.path === child.path ? 'bg-teal-200 dark:bg-teal-900/70 text-primary font-semibold shadow-sm' : ''"
                >
                  <template #leading>
                    <UIcon 
                      v-if="child.icon" 
                      :name="child.icon" 
                      class="w-4 h-4 flex-shrink-0"
                    />
                    <UIcon 
                      v-else 
                      name="i-heroicons-document" 
                      class="w-4 h-4 flex-shrink-0"
                    />
                    <span>{{ child.name }}</span>
                  </template>
                </UButton>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶栏 -->
      <TopBar :breadcrumbs="breadcrumbs" />

      <!-- 页面内容 -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
