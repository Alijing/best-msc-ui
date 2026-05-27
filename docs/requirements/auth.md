---
status: implemented
priority: P0
module: auth
---

## 一、认证模块

### 1.1 用户登录功能

```markdown
### 功能名称

用户登录

### 所属模块

pages/login.vue, stores/user.store.ts, server/api/auth/\*

### 类型

页面 + Store + API 路由

### 详细描述

提供用户登录功能，支持邮箱/账号和密码登录。登录成功后获取用户信息、菜单和权限，跳转到仪表盘首页。失败时显示错误提示。

### 输入

- account: string (必填) - 账号或邮箱
- password: string (必填) - 密码（加密传输）

### 输出

- 成功：跳转至首页，保存 token 和用户信息
- 失败：显示错误消息，停留在登录页

### 数据模型

interface LoginRequest {
account: string
password: string
}

interface LoginResponse {
token: string
expireTime: number
user: {
id: number
email: string
name: string
roles: string[]
}
}

### 依赖

- useUserStore (login, fetchUserInfo 方法)
- useRouter / navigateTo
- useCookie (存储 auth_token)
- useState('isLoggedIn') (运行时状态)

### 样式要求

- 居中布局
- 表单宽度 400px
- 使用 Nuxt UI 表单组件 (UInput, UButton, UCard)
- 响应式设计

### 其他约束

- Token 存储在 HttpOnly Cookie 中
- 密码前端不加密，后端 HTTPS 传输
- 登录状态持久化（token 过期时间检查）
- 已登录用户访问登录页自动跳转首页
- 未登录访问保护页面保存目标路径
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 1.2 用户注销功能

```markdown
### 功能名称

用户注销

### 所属模块

components/UserDropdown.vue, stores/user.store.ts, server/api/auth/logout.get.ts

### 类型

组件 + Store + API 路由

### 详细描述

用户点击退出登录按钮后，调用后端注销接口，清除本地用户状态和 token，跳转到登录页。

### 输入

无（用户触发事件）

### 输出

- 成功：清除所有用户相关状态，跳转登录页
- 失败：清除本地状态，跳转登录页

### 数据模型

无

### 依赖

- useUserStore (logout 方法)
- useToast (成功提示)
- navigateTo (路由跳转)

### 样式要求

下拉菜单项，使用 Nuxt UI 图标 (UIcon)

### 其他约束

- 无论后端是否成功，前端都必须清除状态
- 清除范围：user store、cookie、useState
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 1.3 获取当前用户信息

```markdown
### 功能名称

获取当前用户信息

### 所属模块

stores/user.store.ts, server/api/auth/me.get.ts

### 类型

Store + API 路由

### 详细描述

从后端获取当前登录用户的详细信息，包括基本信息、菜单树和权限列表。用于登录后初始化和页面刷新恢复状态。

### 输入

无（从 Cookie 自动提取 token）

### 输出

- user: 用户信息对象
- menus: 菜单树数组
- permissions: 权限字符串数组

### 数据模型

interface UserInfo {
id: number
email: string
name: string
avatar?: string
roles: string[]
menus: MenuNode[]
permissions: string[]
}

### 依赖

- useUserStore
- clientApiFetch / serverApiFetch
- useState (SSR 状态同步)

### 样式要求

无（纯数据逻辑）

### 其他约束

- 支持 SSR 和客户端两种场景
- SSR 场景使用 serverApiFetch 从 event 提取 cookie
- 客户端场景使用 clientApiFetch 自动携带 cookie
- 401 自动跳转登录页
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 1.4 全局认证守卫

```markdown
### 功能名称

全局认证守卫

### 所属模块

middleware/auth.global.ts, plugins/auth.client.ts

### 类型

中间件 + 插件

### 详细描述

拦截所有路由请求，检查用户登录状态。未登录用户访问保护页面时重定向到登录页，并保存目标路径。已登录用户访问登录页自动跳转首页。

### 输入

- to: 目标路由
- from: 来源路由

### 输出

- 重定向或放行

### 数据模型

无

### 依赖

- useCookie (检查 auth_token)
- useState('isLoggedIn') (客户端状态检查)
- useState('redirectPath') (保存重定向路径)
- navigateTo (重定向)

### 样式要求

无（逻辑层）

### 其他约束

- 公开接口白名单（如 /api/auth/login）
- Token 过期由 401 响应处理器处理
- 仅客户端执行中间件逻辑
- 不影响服务端渲染
```

**优先级**: P0 ✅  
**状态**: 已实现

---
