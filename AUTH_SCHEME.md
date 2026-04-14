# 全局鉴权与 Token 存储完整方案

> 基于 Nuxt 4 + @nuxt/ui 4.6.0 的跨域部署最优实践

---

## 📋 方案概述

### 核心架构：三层防护 + HttpOnly Cookie

```
┌─────────────────────────────────────┐
│  第一层：全局中间件（路由级拦截）    │
│  - middleware/auth.global.ts        │
│  - 检查所有路由访问                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  第二层：API 拦截器（请求级拦截）    │
│  - utils/api.ts                     │
│  - 检查所有 API 请求                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  第三层：401 处理器（响应级拦截）    │
│  - handleApiResponse()              │
│  - Token 过期自动跳转                │
└─────────────────────────────────────┘
```

### Token 存储策略

- ✅ **唯一真实存储**: HttpOnly Cookie（服务端设置）
- ✅ **运行时状态**: useState（仅用于响应式更新）
- ❌ **不再使用**: localStorage 存储敏感信息

### Layout 切换策略

- ✅ **公开页面**: `/login`、`/register` 使用 `guest` 布局（无侧边栏）
- ✅ **其他页面**: 默认使用 `default` 布局（带侧边栏和菜单）
- ✅ **动态计算**: `app.vue` 根据路由自动切换布局

---

## 🗂️ 文件清单

| 文件 | 职责 | 状态 | 优先级 |
|------|------|------|--------|
| `middleware/auth.global.ts` | 全局路由鉴权 + 重定向 | 🆕 新建 | P0 |
| `plugins/init-auth.client.ts` | 客户端初始化登录状态 | 🆕 新建 | P0 |
| `server/middleware/auth.ts` | 服务端注入登录状态 | 🆕 新建 | P1 |
| `stores/user.store.ts` | 用户状态管理 | ⚠️ 修改 | P0 |
| `utils/api.ts` | API 拦截 +401 处理 | ⚠️ 修改 | P0 |
| `pages/login.vue` | 登录页 + 重定向逻辑 | ⚠️ 修改 | P1 |
| `server/api/auth/login.post.ts` | 设置 HttpOnly Cookie | ✅ 已有 | - |
| `server/api/auth/logout.get.ts` | 清除 Cookie | ✅ 已实现 | P0 |

---

## 🎯 架构优化总结

### Layout 切换方案

**当前实现**: `app.vue` 动态计算 + 公共配置常量

```typescript
// config/routes.ts
export const PUBLIC_ROUTES = ['/login', '/register']
export const DEFAULT_HOME_PATH = '/'

// app.vue
const currentLayout = computed(() => {
  return PUBLIC_ROUTES.some(path => route.path.startsWith(path)) 
    ? 'guest' 
    : 'default'
})
```

**优点**:
- ✅ 代码集中，易于维护
- ✅ 响应式切换，用户体验好
- ✅ SSR 和客户端都能正确工作
- ✅ 使用公共配置，避免硬编码

**对比其他方案**:
- ❌ ~~nuxt.config.ts 静态配置~~: 路径匹配不灵活，已删除
- ❌ ~~页面级 definePageMeta~~: 维护成本高，容易遗漏

### 路由配置集中化

**核心思想**: 一处定义，多处使用

**涉及文件**:
1. `config/routes.ts` - 定义常量
2. `app.vue` - Layout 切换
3. `middleware/auth.global.ts` - 鉴权中间件
4. `utils/api.ts` - API 响应处理
5. `components/LoginForm.vue` - 登录表单

**全部使用公共常量**:
- `PUBLIC_ROUTES` - 公开页面列表
- `DEFAULT_HOME_PATH` - 默认首页路径

**避免的问题**:
- ❌ 硬编码 `'/'` 或 `'/dashboard'`
- ❌ 多处定义不一致
- ❌ 修改时需要同步多个文件

---

## 📝 详细实现

### 1. 全局中间件

**文件路径**: `middleware/auth.global.ts`

```typescript
/**
 * 全局认证中间件
 * 拦截所有路由，检查登录状态并自动重定向
 */

import { parseCookies, sendRedirect } from 'h3'
import { PUBLIC_ROUTES, DEFAULT_HOME_PATH } from '~/config/routes'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // ==================== 白名单路由（不需要登录） ====================
  // ✅ 使用公共配置，确保与 app.vue 保持一致
  const publicRoutes = PUBLIC_ROUTES
  
  // 如果当前路由在白名单中，直接放行
  if (publicRoutes.includes(to.path)) {
    // 已登录用户访问登录页/注册页，重定向到首页（防止重复登录）
    if (import.meta.client && useState('isLoggedIn', () => false).value) {
      console.log('⚠️ [middleware] 已登录用户访问登录页，重定向到首页')
      return navigateTo(DEFAULT_HOME_PATH)
    }
    return
  }
  
  // ==================== SSR 场景：服务端检查 ====================
  if (import.meta.server) {
    const event = useRequestEvent()
    const cookies = parseCookies(event)
    
    // 如果没有 token，服务端直接返回重定向
    if (!cookies.auth_token) {
      console.log(`🔒 [middleware] SSR 检测到未登录，重定向到登录页：${to.fullPath}`)
      return sendRedirect(event, `/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
    
    // 有 token，继续渲染
    return
  }
  
  // ==================== 客户端场景 ====================
  const isLoggedIn = useState('isLoggedIn', () => false)
  
  // 未登录，跳转到登录页并保存目标路径
  if (!isLoggedIn.value) {
    console.log(`🔒 [middleware] 客户端检测到未登录，准备跳转：${to.fullPath}`)
    
    // 保存用户原本要访问的路径（用于登录后回跳）
    useState('redirectPath', () => to.fullPath).value = to.fullPath
    
    // 跳转到登录页
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  // 已登录，正常访问
  return
})
```

**关键点**:
- ✅ 支持 SSR 和客户端双重检查
- ✅ 自动保存重定向路径
- ✅ 防止死循环（白名单机制）
- ✅ 服务端优先处理（避免客户端二次跳转）
- ✅ 使用公共配置常量，避免硬编码

---

### 2. 客户端初始化插件

**文件路径**: `plugins/init-auth.client.ts`

```typescript
/**
 * 客户端初始化插件
 * 页面加载时自动从 cookie 获取用户信息并恢复登录状态
 */

export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  const isLoggedIn = useState('isLoggedIn', () => false)
  
  try {
    // 尝试获取用户信息（会自动从 cookie 提取 token）
    await userStore.fetchUserInfo()
    isLoggedIn.value = true
    console.log('✅ [init-auth] 登录状态已恢复')
  } catch (error) {
    // 未登录或 token 过期
    isLoggedIn.value = false
    console.log('⚠️ [init-auth] 用户未登录')
  }
})
```

**关键点**:
- ✅ 只在客户端执行（`.client.ts` 后缀）
- ✅ 页面刷新后自动恢复状态
- ✅ 无需手动触发

---

### 3. 服务端中间件

**文件路径**: `server/middleware/auth.ts`

```typescript
/**
 * 服务端中间件
 * 在请求到达时注入登录状态到上下文
 */

export default defineEventHandler(async (event) => {
  // 跳过静态资源、API、开发工具
  if (
    event.path.startsWith('/_nuxt') || 
    event.path.startsWith('/api') ||
    event.path.startsWith('/__nuxt_devtools__')
  ) {
    return
  }
  
  const cookies = parseCookies(event)
  const hasToken = !!cookies.auth_token
  
  // 注入到上下文，供后续使用
  event.context.isLoggedIn = hasToken
  
  console.log(`🔍 [auth-middleware] 路径：${event.path}, 登录状态：${hasToken}`)
})
```

**关键点**:
- ✅ 跳过不必要的路径（性能优化）
- ✅ 注入到上下文（其他服务端代码可用）
- ✅ 日志输出（便于调试）

---

### 4. 用户 Store 修改

**文件路径**: `stores/user.store.ts`

#### 修改 login 方法

```typescript
async function login(credentials: { account: string; password: string }) {
  try {
    console.log('[login] 登录中...')
    
    const response = await apiFetch<TokenInfo>('/api/auth/login', {
      method: 'POST',
      body: credentials
    })

    // ✅ 只设置 useState，不再使用 localStorage
    const isLoggedIn = useState('isLoggedIn', () => false)
    isLoggedIn.value = true
    
    // ✅ 不再保存 tokenExpireTime（cookie 的 maxAge 已足够）
    
    // 登录成功后立即获取用户信息
    await fetchUserInfo()

    return response
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}
```

#### 修改 logout 方法

```typescript
async function logout() {
  try {
    // ✅ 调用后端登出接口（会清除 token）
    await clientApiFetch('/api/auth/logout')
  } finally {
    // 清除本地状态
    user.value = null
    menus.value = []
    permissions.value = []
    
    // ✅ 清除 useState
    const isLoggedIn = useState('isLoggedIn', () => false)
    isLoggedIn.value = false
    
    // ❌ 移除 localStorage 清理逻辑（不再使用）
    
    console.log('✅ [logout] 已退出登录')
  }
}
```

---

### 5. API 工具函数修改

**文件路径**: `utils/api.ts`

#### 修复 interceptApiRequest

```typescript
/**
 * API 请求拦截器 - 在客户端发起请求前检查登录状态
 */
export function interceptApiRequest(url: string, options?: any): void {
  // 只在客户端进行拦截检查
  if (typeof window === 'undefined') {
    return
  }

  // 如果 url 为空，直接放行
  if (!url) {
    return
  }

  // 公开接口列表（不需要认证）
  const publicPaths = ['/api/auth/login', '/api/auth/register']
  const isPublicPath = publicPaths.some(path => url.includes(path))

  // 如果是公开接口，直接放行
  if (isPublicPath) {
    return
  }

  // ✅ 只检查 useState，不检查 HttpOnly Cookie（客户端读不到）
  const isLoggedInState = useState('isLoggedIn', () => false).value
  
  // 如果 state 为已登录，则放行
  if (isLoggedInState) {
    return
  }

  // 未登录且不是公开接口时，抛出错误阻止请求
  console.warn(`⚠️ 拦截未登录用户的 API 请求：${url}`)
  throw new Error('用户未登录，已拦截请求')
}
```

#### 修复 handleApiResponse

```typescript
/**
 * 处理 API 响应，当 code !== 20000 时抛出错误
 */
export async function handleApiResponse<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
  if (response.code !== 20000) {
    const errorMessage = response.message || '请求失败'

    // 401 特殊处理：跳转到登录页
    if (response.code === 401) {
      if (typeof window !== 'undefined') {
        // ✅ 清除登录状态
        useState('isLoggedIn', () => false).value = false
        
        // ✅ 保存当前路径用于回跳
        const route = useRoute()
        useState('redirectPath', () => DEFAULT_HOME_PATH).value = route.fullPath
        
        // ✅ 带 redirect 参数跳转
        await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      }
    }

    throw createError({
      status: response.code,
      message: errorMessage
    })
  }
  console.log(`✅ [clientApiFetch] 请求成功:`, response)
  return response
}
```

---

### 6. 登出接口

**文件路径**: `server/api/auth/logout.get.ts`

```typescript
import { defineApiEventHandler } from '../utils/defineApiEventHandler'

/**
 * 用户登出接口
 * GET /api/auth/logout
 * 清除 HttpOnly cookie
 */
export default defineApiEventHandler({
  handler: async (event) => {
    try {
      // ✅ 清除 HttpOnly Cookie
      deleteCookie(event, 'auth_token')
      
      // 可选：调用后端清除 token
      // await serverApiFetch(event, '/security/user/logout', { method: 'POST' }, false)
      
      console.log('✅ [logout] Cookie 已清除')
      return { success: true, message: '登出成功' }
    } catch (error: any) {
      console.error('登出失败:', error)
      throw createError({
        status: error.statusCode || 500,
        message: error.message || '登出失败'
      })
    }
  }
})
```

---

### 7. 登录页处理重定向

**文件路径**: `pages/login.vue`

```vue
<script setup lang="ts">
import { useUserStore } from '~/stores/user.store'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const formRef = ref()
const loading = ref(false)

const formData = ref({
  account: '',
  password: ''
})

// 优先从 query 读取，其次从 useState 读取
const redirectPath = computed(() => {
  const queryRedirect = route.query.redirect as string
  const savedRedirect = useState('redirectPath', () => DEFAULT_HOME_PATH).value
  
  // 验证重定向路径是否合法（防止开放重定向漏洞）
  const isValidRedirect = (path: string) => {
    return path && path.startsWith('/') && !path.startsWith('//')
  }
  
  return isValidRedirect(queryRedirect) ? queryRedirect : 
         isValidRedirect(savedRedirect) ? savedRedirect : 
         DEFAULT_HOME_PATH
})

/**
 * 提交登录表单
 */
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    loading.value = true

    // 调用登录接口
    await userStore.login(formData.value)
    
    // ✅ 清除保存的重定向路径
    useState('redirectPath').value = null
    
    // ✅ 跳转到目标页面
    await navigateTo(redirectPath.value)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- 登录表单 UI -->
</template>
```

---

### 8. 登录接口配置优化

**文件路径**: `server/api/auth/login.post.ts`

```typescript
setCookie(event, 'auth_token', response.data.token, {
  httpOnly: true,           // ✅ JavaScript 无法读取
  secure: import.meta.env.PROD,  // ✅ 生产环境 HTTPS only
  sameSite: 'lax',          // ✅ 改为 lax（跨域开发环境兼容）
  path: '/',
  maxAge: response.data.expireTime || 7200 // 默认 2 小时
})
```

**sameSite 说明**:
- `strict`: 最严格，完全禁止跨域携带（开发环境会有问题）
- `lax`: 允许 GET 请求跨域携带（推荐，兼容性好）
- `none`: 完全开放（需要 `secure: true`）

---

## 🔒 安全性保障

### XSS 防护
- ✅ Token 存储在 HttpOnly Cookie 中，JavaScript 无法访问
- ✅ 不在 localStorage 中存储任何敏感信息
- ✅ 所有用户输入都经过验证

### CSRF 防护
- ✅ `sameSite: 'lax'` 限制跨站请求
- ✅ 生产环境强制 HTTPS
- ✅ 建议后端实现 CSRF Token

### 中间人攻击防护
- ✅ 生产环境 `secure: true`（仅 HTTPS 传输）
- ✅ 开发环境可降级为 HTTP

### 重定向攻击防护
- ✅ 验证 redirect 参数合法性
- ✅ 只允许内部路径重定向
- ✅ 防止开放重定向漏洞

---

## 🎯 完整流程演示

### 正常登录流程

```
用户访问 /dashboard
        ↓
全局中间件拦截 → 未登录
        ↓
保存 redirectPath = '/dashboard'
        ↓
跳转到 /login?redirect=/dashboard
        ↓
用户输入账号密码
        ↓
调用 /api/auth/login
        ↓
服务端设置 HttpOnly Cookie
        ↓
useState('isLoggedIn') = true
        ↓
获取用户信息
        ↓
清除 redirectPath
        ↓
navigateTo('/dashboard')
        ↓
✅ 回到原页面
```

### Token 过期流程

```
用户正在浏览页面
        ↓
发起 API 请求
        ↓
后端返回 401（Token 过期）
        ↓
handleApiResponse 捕获 401
        ↓
清除 useState('isLoggedIn')
        ↓
保存当前路径到 redirectPath
        ↓
跳转到 /login?redirect=/current/path
        ↓
用户重新登录
        ↓
✅ 回到当前页面
```

### 页面刷新流程

```
用户刷新页面
        ↓
plugins/init-auth.client.ts 执行
        ↓
调用 userStore.fetchUserInfo()
        ↓
服务端从 Cookie 提取 token
        ↓
获取用户信息成功
        ↓
useState('isLoggedIn') = true
        ↓
✅ 登录状态恢复
```

---

## 📊 测试清单

### Phase 1: 核心功能测试

- [ ] 未登录访问 `/dashboard` → 跳转到登录页
- [ ] 登录后 → 正确跳转到 `/dashboard`
- [ ] 页面刷新 → 登录状态保持
- [ ] 点击登出 → 清除 Cookie 并跳转登录页

### Phase 2: 边界场景测试

- [ ] Token 过期 → 自动跳转登录页
- [ ] 登录后回到原页面 → 路径正确
- [ ] 直接在地址栏输入任意受保护页面 → 拦截并跳转
- [ ] 已登录用户访问 `/login` → 重定向到首页

### Phase 3: 多标签页测试

- [ ] 一个标签页登出 → 其他标签页下次操作时跳转
- [ ] 多个标签页同时刷新 → 状态同步正常

---

## 🚀 实施步骤

### 第一步：创建核心文件（30 分钟）

```bash
# 创建文件结构
touch middleware/auth.global.ts
touch plugins/init-auth.client.ts
touch server/middleware/auth.ts
touch server/api/auth/logout.get.ts
```

### 第二步：修改现有文件（30 分钟）

- [ ] 修改 `stores/user.store.ts` - 移除 localStorage
- [ ] 修改 `utils/api.ts` - 修复拦截器和 401 处理
- [ ] 修改 `pages/login.vue` - 添加重定向逻辑
- [ ] 修改 `server/api/auth/login.post.ts` - sameSite 配置

### 第三步：测试验证（30 分钟）

- [ ] 启动开发服务器
- [ ] 测试正常登录流程
- [ ] 测试未登录访问
- [ ] 测试 Token 过期处理
- [ ] 测试页面刷新状态恢复

### 第四步：清理优化（15 分钟）

- [ ] 删除所有 localStorage 相关代码
- [ ] 添加必要的注释
- [ ] 检查控制台警告
- [ ] 更新开发规范文档

---

## 💡 常见问题解答

### Q1: 为什么客户端读不到 Cookie？

**A**: HttpOnly Cookie 的设计就是不让 JavaScript 读取，这是为了安全（防 XSS）。我们使用 `useState` 作为运行时状态的缓存。

### Q2: 页面刷新后 useState 会丢失吗？

**A**: 会。所以我们有 `plugins/init-auth.client.ts`，每次页面加载时自动从 Cookie 获取用户信息并恢复状态。

### Q3: 为什么不直接用 Cookie 而要用 useState？

**A**: 
- Cookie 是持久化存储（安全但慢）
- useState 是响应式状态（快速更新 UI）
- 两者配合：Cookie 存真实数据，useState 做响应式更新

### Q4: 多标签页状态如何同步？

**A**: 不需要实时同步。每个标签页独立维护自己的 useState。一个标签页登出后，其他标签页下次操作时会触发 401，然后自动跳转登录页。

### Q5: 开发环境和生产环境如何切换？

**A**: 通过环境变量自动控制：
- `secure: import.meta.env.PROD` - 生产环境启用 HTTPS
- `sameSite: 'lax'` - 兼容开发和生产

---

## 📚 参考资料

- [Nuxt 官方文档 - 中间件](https://nuxt.com/docs/guide/directory-structure/middleware)
- [Nuxt 官方文档 - 插件](https://nuxt.com/docs/guide/directory-structure/plugins)
- [HttpOnly Cookie 安全最佳实践](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)
- [CSRF 防护指南](https://owasp.org/www-community/attacks/csrf)

---

## 📝 版本记录

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2026-03-30 | 初始版本，完整方案文档化 |

---

**方案制定完成！准备开始实施吧！** 🚀
