# Best MSC UI

一个基于 **Nuxt 3** + **Vue 3** + **TypeScript** + **Element Plus** 的现代化管理后台系统。

## 🚀 技术栈

- **框架**: [Nuxt 3](https://nuxt.com/) - Vue 全栈框架
- **UI 库**: [Element Plus](https://element-plus.org/) - Vue 3 组件库
- **状态管理**: [Pinia](https://pinia.vuejs.org/) - Vue 官方状态管理
- **样式**: [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS
- **类型安全**: [TypeScript](https://www.typescriptlang.org/) + [Zod](https://zod.dev/) - 运行时验证
- **数据查询**: [@tanstack/vue-query](https://tanstack.com/query) - 强大的数据同步与缓存
- **包管理器**: [pnpm](https://pnpm.io/)

## 📦 快速开始

### 环境要求

- Node.js >= 18.x
- pnpm >= 8.x

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

启动后访问：http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

### 代码检查

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# TypeScript 类型检查
pnpm type-check
```

## 📁 项目结构

```
.
├── assets/css/              # 全局样式
│   └── main.css
├── components/              # 全局共享组件
│   ├── NotificationDropdown.vue
│   ├── TopBar.vue
│   └── UserDropdown.vue
├── composables/             # 组合式函数
│   └── useMenu.ts
├── layouts/                 # 布局组件
│   ├── default.vue         # 默认布局（含菜单）
│   └── guest.vue           # 访客布局（无菜单）
├── middleware/              # 路由中间件
│   └── auth.global.ts      # 全局认证守卫
├── modules/                 # 业务模块
│   └── user/components/
│       └── UserFormDialog.vue
├── pages/                   # 页面路由
│   ├── user/
│   │   └── index.vue       # 用户管理页面
│   ├── index.vue           # 首页
│   └── login.vue           # 登录页
├── server/                  # 服务端 API
│   ├── api/
│   │   ├── auth/           # 认证相关接口
│   │   └── user/           # 用户管理接口
│   └── utils/
│       ├── defineApiEventHandler.ts
│       └── types.ts
├── stores/                  # Pinia 状态管理
│   ├── app.store.ts
│   ├── user-manage.store.ts
│   └── user.store.ts
├── app.vue                  # 应用入口
├── nuxt.config.ts           # Nuxt 配置
├── tailwind.config.js       # Tailwind 配置
└── package.json
```

## ✨ 功能特性

### 已实现功能

#### 🔐 认证模块
- 用户登录/注销
- 全局认证守卫
- 用户信息获取与持久化
- 访客布局与默认布局切换

#### 👥 用户管理模块
- **用户列表**：支持分页、模糊查询（账号、姓名、电话、角色）
- **新增用户**：表单验证、角色选择（从后台动态加载）
- **编辑用户**：数据回显、密码选择性修改
- **删除用户**：二次确认
- **角色管理**：三种角色类型，不同颜色标签区分，支持动态扩展

#### 🎨 UI 组件
- **TopBar**：顶部导航栏，包含面包屑、通知、全屏切换、用户下拉菜单
- **UserDropdown**：用户信息与操作下拉菜单
- **NotificationDropdown**：通知中心下拉列表
- **UserFormDialog**：用户表单弹窗（新增/编辑）

#### 🛡️ 类型安全
- 全面使用 TypeScript
- Zod 运行时验证（服务端 API）
- 前后端共享类型定义

## 🔧 配置说明

### Nuxt 配置 (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt',
    '@nuxt/devtools'
  ],
  elementPlus: {
    defaultLocale: 'zh-cn',
    importStyle: 'css'
  },
  css: ['~/assets/css/main.css'],
  imports: {
    dirs: ['stores', 'composables/**', 'utils/**']
  }
})
```

### 自动导入规则

以下目录的内容会自动导入，无需手动 `import`：

- `components/` - 所有组件
- `composables/` - 所有组合式函数（以 `use` 开头）
- `stores/` - 所有 Pinia store
- `utils/` - 工具函数

**注意**：`modules/` 目录下的组件需要手动导入。

## 📝 API 接口规范

### 服务端 API 位置

所有 API 接口位于 `server/api/` 目录，遵循 RESTful 风格：

- `GET /api/user/all` - 获取用户列表
- `POST /api/user/create` - 新增用户
- `PUT /api/user/update/:id` - 编辑用户
- `DELETE /api/user/delete/:id` - 删除用户
- `GET /api/role/all` - 获取所有角色
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户注销
- `GET /api/auth/me` - 获取当前用户信息

### 统一错误处理

使用 `defineApiEventHandler` 封装，支持：

- Zod 参数验证（失败返回 422）
- 统一错误响应格式
- 权限守卫（可扩展）

## 🎯 开发规范

### 命名约定

- **组件**: `PascalCase` (如 `UserFormDialog.vue`)
- **组合式函数**: `use` 开头 + `camelCase` (如 `useMenu.ts`)
- **Store**: `use` 开头 + `Store` 结尾 (如 `useUserManageStore`)
- **目录**: `kebab-case` (如 `user-profile/`)
- **类型/接口**: `PascalCase` (如 `User`, `CreateUserRequest`)

### 组件结构顺序

```vue
<script setup lang="ts">
  // 1. 类型导入
  // 2. props 和 emits
  // 3. 组合式函数调用
  // 4. 响应式数据
  // 5. 计算属性
  // 6. 方法/事件
  // 7. 生命周期
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
  <!-- 样式 -->
</style>
```

### Props & Emits 定义

```typescript
const props = withDefaults(defineProps<{ title?: string }>(), {
  title: '默认标题'
})

const emit = defineEmits<{
  (e: 'update', id: number): void
}>()
```

## 📚 状态管理

### Store 模块

- **`user.store.ts`**: 当前登录用户信息、菜单、权限
- **`user-manage.store.ts`**: 用户管理列表、分页、查询参数
- **`app.store.ts`**: 应用 UI 状态（侧边栏折叠、全屏等）

### 使用示例

```typescript
const userStore = useUserStore()
const { user, menus } = storeToRefs(userStore)
await userStore.fetchUserInfo()
```

## 🎨 样式方案

- **Tailwind CSS**: 用于布局、间距、尺寸等原子类
- **Element Plus**: 组件样式（默认主题）
- **自定义样式**: `assets/css/main.css`

避免重复造轮子，优先使用 Tailwind 和 Element Plus 的内置样式。

## 🔒 权限控制

当前版本权限控制较为基础，仅实现：

- 全局登录守卫（未登录跳转到登录页）
- 简单的角色字段标记

后续可扩展为完整的 RBAC（基于角色的访问控制）系统。

## 📊 数据模型

### 用户类型定义

```typescript
type RoleType = 'admin' | 'user' | 'guest'

interface User {
  id: number
  account: string
  name: string
  phone?: string
  role: RoleType
  createTime: Date
}
```

完整类型定义见各 store 文件和 `server/utils/types.ts`。

## 🐛 常见问题

### 端口被占用

```bash
# 修改端口
pnpm dev --port 3001
```

### 类型检查错误

```bash
# 运行类型检查
pnpm type-check
```

### 依赖安装问题

```bash
# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📄 许可证

MIT License

---

**开发团队**: Best MSC Team  
**最后更新**: 2026-03-16