<template>
  <!-- 未登录时显示登录表单 -->
  <div v-if="!isLoggedIn">
    <NuxtLayout :name="layoutName">
      <LoginForm />
    </NuxtLayout>
  </div>
  
  <!-- 登录后显示路由对应的页面（NuxtPage 始终存在，避免警告） -->
  <div v-show="isLoggedIn">
    <NuxtLayout :name="layoutName">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// 应用入口组件
// 根据认证状态决定渲染内容
const route = useRoute()

// 从 cookie 读取 token，初始化登录状态（SSR 安全）
const token = useCookie('auth_token')
const isLoggedIn = useState('isLoggedIn', () => !!token.value)

// 动态选择布局：未登录用 guest，登录后根据路由决定
const layoutName = computed(() => {
  // 未登录时始终使用 guest layout
  if (!isLoggedIn.value) {
    return 'guest'
  }
  // 登录页使用 guest layout
  if (route.path === '/login') {
    return 'guest'
  }
  // 其他页面使用默认 layout
  return 'default'
})

// 监听 token 变化，自动更新登录状态
watch(token, (newToken) => {
  isLoggedIn.value = !!newToken
})
</script>

<style scoped>
/* 全局样式在 assets/css/main.css 中定义 */
</style>
