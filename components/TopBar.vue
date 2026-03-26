<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="flex items-center gap-4">
      <el-button text @click="toggleSidebar">
        <el-icon><Fold /></el-icon>
      </el-button>
      
      <el-breadcrumb separator="/">
        <el-breadcrumb-item 
          v-for="(crumb, index) in breadcrumbs" 
          :key="crumb.path"
          :to="index === breadcrumbs.length - 1 ? undefined : crumb.path"
        >
          {{ crumb.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：功能按钮 -->
    <div class="flex items-center gap-3">
      <!-- 通知下拉 -->
      <NotificationDropdown />

      <!-- 全屏切换 -->
      <el-button text @click="toggleFullscreen">
        <el-icon>
          <FullScreen v-if="!isFullscreen" />
          <CloseBold v-else />
        </el-icon>
      </el-button>

      <!-- 主题切换（可选） -->
      <!-- <el-button text @click="toggleTheme">
        <el-icon><Moon v-if="theme === 'light'" /><Sunny v-else /></el-icon>
      </el-button> -->

      <!-- 用户下拉菜单 -->
      <UserDropdown />
    </div>
  </header>
</template>

<script setup lang="ts">
// 顶部栏组件
// 包含：折叠按钮、面包屑、通知、全屏切换、用户菜单

const appStore = useAppStore()
const { toggleSidebar, toggleFullscreen } = appStore
const { isFullscreen } = storeToRefs(appStore)

// 获取面包屑
const { breadcrumbs } = useMenu()
</script>

<style scoped>
.el-breadcrumb {
  margin-left: 8px;
}

.el-button {
  padding: 8px;
}
</style>
