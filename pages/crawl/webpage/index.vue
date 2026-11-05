<script setup lang="ts">
useHead({
  title: "网页数据采集",
});

const breadcrumbs = computed(() => [
  { title: "首页", to: "/" },
  { title: "网页数据采集" },
]);
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <div class="mb-4 shrink-0">
      <UBreadcrumb :links="breadcrumbs" />
      <h1 class="text-2xl font-bold mt-2">网页数据采集</h1>
    </div>
    <div class="flex-1 min-h-0">
      <WebpageCrawlWorkbench />
    </div>
  </div>
</template>

<style scoped>

</style>