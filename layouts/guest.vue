<template>
  <div class="layout-guest min-h-screen flex items-center justify-center">
    <slot />
  </div>
</template>

<script setup lang="ts">
// 访客布局 - 无菜单，用于登录页等不需要导航的页面
</script>

<style scoped>
.layout-guest {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
