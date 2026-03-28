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

// 从 cookie 读取 token（SSR 安全）
// maxAge 设置为 24 小时，实际过期时间由后端返回的 expireTime 控制
const token = useCookie('auth_token', {
  maxAge: 60 * 60 * 24, // 24 小时（兜底时间，实际由 expireTime 控制）
  path: '/'
})

// 使用 useState 管理登录状态（客户端登录时设置）
const isLoggedInState = useState('isLoggedIn', () => false)

// 使用 computed 动态计算登录状态，同时检查 cookie 和 state
const isLoggedIn = computed(() => {
  // 禁用了 SSR，优先检查 state（HttpOnly cookie 无法读取）
  return isLoggedInState.value || !!token.value
})

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
</script>

<style scoped>
/* 全局样式在 assets/css/main.css 中定义 */
</style>
