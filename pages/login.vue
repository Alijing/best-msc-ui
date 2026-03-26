<template>
  <!-- 登录页面 - 直接引用 LoginForm 组件 -->
  <LoginForm />
</template>

<script setup lang="ts">
// 登录页面 - 仅作为路由入口
// 实际内容在 components/LoginForm.vue 中

// 设置页面标题
useHead({
  title: '登录 - BestMSC'
})
</script>
