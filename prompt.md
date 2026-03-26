以下是一个完整的实现方案，包含所有必要文件，并充分利用 Nuxt 3 的特性，确保未登录时无论访问任何路径都只渲染登录页（使用 `guest` 布局），且不会先渲染目标页面再跳转。

---

## 1. `app.vue` – 应用入口，根据认证状态决定渲染内容
```vue
<template>
  <NuxtLayout :name="layoutName">
    <!-- 未登录时显示登录表单 -->
    <LoginForm v-if="!isLoggedIn" />
    <!-- 登录后显示路由对应的页面 -->
    <NuxtPage v-else />
  </NuxtLayout>
</template>

<script setup>
// 全局登录状态（SSR 安全）
const isLoggedIn = useState('isLoggedIn', () => false)

// 动态选择布局：未登录用 guest，登录后用 default
const layoutName = computed(() => isLoggedIn.value ? 'default' : 'guest')

// 可选：从 cookie 或 token 初始化状态（见下面插件）
onMounted(() => {
  // 客户端额外检查（如果服务端未正确同步）
  const token = useCookie('auth_token').value
  if (token && !isLoggedIn.value) {
    isLoggedIn.value = true
  }
})
</script>
```

---

## 2. `layouts/guest.vue` – 登录页专用布局（简洁，无侧边栏/导航）
```vue
<template>
  <div class="guest-layout">
    <slot />
  </div>
</template>

<style scoped>
.guest-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
</style>
```

---

## 3. `layouts/default.vue` – 默认布局（已登录用户使用）
```vue
<template>
  <div class="default-layout">
    <nav>
      <NuxtLink to="/">首页</NuxtLink>
      <NuxtLink to="/profile">个人中心</NuxtLink>
      <button @click="logout">退出登录</button>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
const isLoggedIn = useState('isLoggedIn')

const logout = () => {
  // 清除 cookie 和状态
  const tokenCookie = useCookie('auth_token')
  tokenCookie.value = null
  isLoggedIn.value = false
  // 可选：跳转到登录页（但 app.vue 会自动显示登录表单，无需跳转）
}
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
nav {
  background: #333;
  padding: 1rem;
  display: flex;
  gap: 1rem;
}
nav a, nav button {
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}
main {
  flex: 1;
  padding: 2rem;
}
</style>
```

---

## 4. `components/LoginForm.vue` – 登录表单组件
```vue
<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <h2>登录</h2>
      <input v-model="email" type="email" placeholder="邮箱" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit" :disabled="loading">登录</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isLoggedIn = useState('isLoggedIn')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // 调用登录 API（根据实际情况修改）
    const response = await $fetch('/api/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    // 保存 token 到 cookie（自动同步到服务端）
    const tokenCookie = useCookie('auth_token')
    tokenCookie.value = response.token

    // 更新全局登录状态
    isLoggedIn.value = true
  } catch (err) {
    error.value = err.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
input {
  padding: 0.5rem;
  font-size: 1rem;
}
button {
  padding: 0.5rem;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
.error {
  color: red;
}
</style>
```

---

## 5. `plugins/auth.client.ts` – 客户端插件，从 cookie 同步登录状态
```typescript
export default defineNuxtPlugin(() => {
  const isLoggedIn = useState('isLoggedIn')
  const token = useCookie('auth_token')

  // 客户端启动时，如果存在 token，设置登录状态为 true
  if (token.value) {
    isLoggedIn.value = true
  }

  // 可选：监听 token 变化，自动更新状态
  watch(token, (newToken) => {
    isLoggedIn.value = !!newToken
  })
})
```

---

## 6. `server/api/login.post.ts` – 登录 API 示例（模拟）
```typescript
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  // 模拟验证（实际应查数据库）
  if (email === 'user@example.com' && password === '123456') {
    // 生成模拟 token
    const token = 'mock-jwt-token'
    return { token }
  }

  throw createError({
    statusCode: 401,
    message: '邮箱或密码错误'
  })
})
```

---

## 7. `nuxt.config.ts` – 可选配置，确保 SSR 时 cookie 可用
```typescript
export default defineNuxtConfig({
  ssr: true, // 默认开启 SSR，必须保证状态同步
  // 如果使用全局中间件，也可以在这里配置
})
```

---

## 关键说明

1. **状态同步（SSR 关键）**
    - 在服务端渲染时，`useState('isLoggedIn')` 的初始值通过 `plugins/auth.client.ts` 无法执行，因此需要在服务端根据请求的 cookie 初始化状态。
    - 可以在 `app.vue` 的 `setup` 中增加服务端逻辑，或者使用一个 **服务端插件**（`plugins/auth.server.ts`）来从请求头中读取 token 并设置 `isLoggedIn`。
    - 简单起见，上述方案在客户端 `onMounted` 中再次检查，但可能会在 SSR 时短暂显示未登录内容（因为服务端初始值为 `false`）。
    - 完全避免闪烁的方案：使用 `useCookie` 在 `app.vue` 中直接初始化，因为 `useCookie` 在服务端也能获取请求中的 cookie。修改 `app.vue`：

```vue
<script setup>
const token = useCookie('auth_token')
const isLoggedIn = useState('isLoggedIn', () => !!token.value)
</script>
```

这样服务端和客户端都能从 cookie 获取初始值，确保水合一致。

2. **URL 保持不变**  
   未登录时，虽然浏览器地址栏可能是任意路径，但页面只显示登录表单，且 URL 不变。登录后状态更新，`<NuxtPage>` 自动渲染对应路由的组件，用户无需刷新。

3. **性能**  
   未登录时，`<NuxtPage>` 不渲染，因此目标页面的 `asyncData`、`setup` 等都不会被触发，避免了不必要的请求。

4. **公开页面扩展**  
   如果需要某些页面（如首页）允许未登录访问，可在 `app.vue` 中增加路由判断：
   ```vue
   <NuxtPage v-if="isLoggedIn || publicRoutes.includes(route.path)" />
   <LoginForm v-else />
   ```
   并通过 `useRoute()` 获取当前路径。

---

这个方案完全符合 Nuxt 3 的设计模式，利用 `app.vue` 作为总控，实现了“未登录时不渲染任何受保护页面”的目标，且无需中间件重定向，避免了页面闪烁。