<script setup lang="ts">
/**
 * 应用入口组件
 * 
 * Toast 全局配置：
 * - position: 显示位置（top-center 顶部居中）
 * - duration: 显示时长（毫秒）
 */
const toaster = {
  position: 'top-center',
  duration: 3000,
  max: 3
}
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
/* 全局样式已在 assets/css/main.css 中定义 */
</style>
