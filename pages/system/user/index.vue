<script setup lang="ts">
useHead({
  title: '用户管理'
})

const breadcrumbs = computed(() => [
  { title: '首页', to: '/' },
  { title: '系统管理', to: '/system' },
  { title: '用户管理' }
])
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <div class="mb-4 shrink-0">
      <UBreadcrumb :links="breadcrumbs" />
      <h1 class="text-2xl font-bold mt-2">用户管理</h1>
    </div>

    <div class="flex-1 min-h-0">
      <UserList />
    </div>
  </div>
</template>