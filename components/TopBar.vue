<script setup lang="ts">
import { useAppStore } from '~/stores/app.store'
import { useUserStore } from '~/stores/user.store'

interface BreadcrumbItem {
  name: string
  path: string
}

defineProps<{
  breadcrumbs?: BreadcrumbItem[]
}>()

const appStore = useAppStore()
const userStore = useUserStore()

// 切换侧边栏折叠状态
function toggleSidebar() {
  appStore.toggleSidebar()
}

// 切换全屏
function toggleFullscreen() {
  appStore.toggleFullscreen()
}

// 登出
async function handleLogout() {
  await userStore.logout()
  await navigateTo('/login')
}
</script>

<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between h-16 px-4">
      <!-- 左侧：折叠按钮和面包屑 -->
      <div class="flex items-center space-x-4">
        <!-- 折叠按钮 -->
        <UButton
          @click="toggleSidebar"
          variant="ghost"
          color="gray"
        >
          <template #leading>
            <UIcon 
              :name="appStore.sidebarCollapsed ? 'i-heroicons-bars-3-bottom-right' : 'i-heroicons-bars-3-bottom-left'" 
              class="w-5 h-5"
            />
          </template>
        </UButton>

        <!-- 面包屑导航 -->
        <nav v-if="breadcrumbs && breadcrumbs.length > 0" class="hidden md:flex items-center space-x-2">
          <template v-for="(crumb, index) in breadcrumbs" :key="index">
            <NuxtLink
              :to="crumb.path"
              class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
            >
              {{ crumb.name }}
            </NuxtLink>
            
            <UIcon
              v-if="index < breadcrumbs.length - 1"
              name="i-heroicons-chevron-right"
              class="w-4 h-4 text-gray-400"
            />
          </template>
        </nav>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="flex items-center space-x-2">
        <!-- 通知下拉 -->
        <NotificationDropdown />

        <!-- 全屏切换 -->
        <UButton
          @click="toggleFullscreen"
          variant="ghost"
          color="gray"
          :title="appStore.isFullscreen ? '退出全屏' : '全屏'"
        >
          <template #leading>
            <UIcon 
              :name="appStore.isFullscreen ? 'i-heroicons-arrows-pointing-in' : 'i-heroicons-arrows-pointing-out'" 
              class="w-5 h-5"
            />
          </template>
        </UButton>

        <!-- 主题切换 -->
        <UColorModeButton />

        <!-- 用户下拉菜单 -->
        <UserDropdown @logout="handleLogout" />
      </div>
    </div>
  </header>
</template>
