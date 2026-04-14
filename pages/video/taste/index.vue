<script setup lang="ts">
useHead({
  title: '兴趣视频管理'
})

// 使用面包屑
const breadcrumbs = computed(() => [
  { title: '首页', to: '/' },
  { title: '兴趣视频管理' }
])
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 页面标题 -->
    <div class="mb-4">
      <UBreadcrumb :links="breadcrumbs" />
      <h1 class="text-2xl font-bold mt-2">
        兴趣视频管理
      </h1>
    </div>

    <!-- 视频列表组件 -->
    <TasteVideoList />
  </div>
</template>
