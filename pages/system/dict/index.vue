<script setup lang="ts">
useHead({
  title: "字典管理",
});
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="mb-4 shrink-0">
      <h1 class="text-2xl font-bold">
        字典管理
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        先维护字典。打开字典项时，数据结构为列表则分页表格展示，为树形则按上下级展开。
      </p>
    </div>
    <div class="min-h-0 flex-1">
      <DictList />
    </div>
  </div>
</template>
