# 项目梳理总结

> **梳理日期**: 2026-03-28  
> **项目版本**: 1.0.0  
> **技术栈**: Nuxt 3 + Vue 3 + TypeScript + Element Plus

---

## 📋 项目概览

Best MSC UI 是一个基于 Nuxt 3 的现代化管理后台系统，采用前后端一体化架构设计。项目遵循 Feature-Sliced Design 思想组织代码，具有良好的可维护性和可扩展性。

### 核心技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **元框架** | Nuxt | 4.4.2 | SSR 已禁用 (ssr: false) |
| **前端框架** | Vue | 3.4.3 | Composition API |
| **UI 组件库** | Element Plus | 2.13.6 | Vue 3 组件库 |
| **图标库** | @element-plus/icons-vue | 2.3.1 | 全局注册 |
| **状态管理** | Pinia | 3.0.4 | Vue 官方状态管理 |
| **样式方案** | Tailwind CSS | 3.4.0 | 原子化 CSS |
| **类型系统** | TypeScript | 5.3.3 | 严格模式 |
| **运行时验证** | Zod | 3.22.4 | API 参数验证 |
| **数据查询** | @tanstack/vue-query | 5.17.9 | 缓存与同步 |
| **路由** | Vue Router | 4.2.5 | Nuxt 文件路由 |
| **构建工具** | Vite | (Nuxt 内置) | 极速构建 |
| **包管理器** | pnpm | 9.11.0 | 依赖提升模式 |

### 环境要求

- **Node.js**: >= 22.x (推荐 v22.22.2)
- **pnpm**: >= 9.x (推荐 v9.11.0)
- **.npmrc 配置**:
  ```ini
  shamefully-hoist=true
  node-linker=hoisted
  ```

---

## 🏗️ 项目架构

### 目录结构

```
best_msc_ui/
├── app.vue                     # 应用入口（登录状态控制）
├── nuxt.config.ts              # Nuxt 配置文件
├── pages/                      # 页面路由（文件即路由）
│   ├── index.vue               # 仪表盘首页
│   ├── login.vue               # 登录页（guest 布局）
│   ├── user/index.vue          # 用户管理页面
│   ├── role/index.vue          # 角色管理页面
│   ├── menu/index.vue          # 菜单管理页面
│   └── video/taste/index.vue   # 情趣视频管理页面
├── layouts/                    # 布局组件
│   ├── default.vue             # 默认布局（左侧菜单 + 顶栏）
│   └── guest.vue               # 访客布局（无菜单）
├── components/                 # 全局共享组件
│   ├── LoginForm.vue           # 登录表单
│   ├── TopBar.vue              # 顶部栏（面包屑、通知、全屏、用户下拉）
│   ├── UserDropdown.vue        # 用户下拉菜单
│   └── NotificationDropdown.vue # 通知中心
├── composables/                # 组合式函数（自动导入）
│   └── useMenu.ts              # 菜单处理（权限过滤、面包屑生成）
├── stores/                     # Pinia 状态管理（自动导入）
│   ├── types/                  # 共享类型定义目录
│   │   ├── menu.d.ts           # 菜单相关类型
│   │   └── tasteVideo.d.ts     # 视频相关类型
│   ├── user.store.ts           # 用户信息、菜单、权限
│   ├── app.store.ts            # 应用 UI 状态
│   ├── menu.store.ts           # 菜单管理 CRUD
│   ├── role.store.ts           # 角色管理 CRUD
│   ├── user-manage.store.ts    # 用户管理 CRUD
│   └── tasteVideo.store.ts     # 视频管理 CRUD
├── modules/                    # 业务特性模块
│   ├── menu/                   # 菜单管理模块
│   │   └── components/
│   │       ├── MenuTree.vue           # 菜单树组件
│   │       ├── MenuFormDialog.vue     # 菜单表单弹窗
│   │       └── IconPicker.vue         # 图标选择器
│   ├── role/                   # 角色管理模块
│   │   └── components/
│   │       └── RoleFormDialog.vue     # 角色表单弹窗
│   ├── user/                   # 用户管理模块
│   │   └── components/
│   │       └── UserFormDialog.vue     # 用户表单弹窗
│   └── tasteVideo/             # 视频管理模块
│       └── components/
│           ├── TasteVideoList.vue         # 视频列表组件
│           ├── TasteVideoFormDialog.vue   # 视频表单弹窗
│           └── TasteVideoPreviewDialog.vue # 预览弹窗
├── server/                     # Nitro 服务端
│   ├── api/                    # API 路由
│   │   ├── auth/               # 认证接口
│   │   │   ├── login.post.ts
│   │   │   ├── logout.get.ts
│   │   │   └── me.get.ts
│   │   ├── menu/               # 菜单接口
│   │   ├── role/               # 角色接口
│   │   ├── user/               # 用户接口
│   │   └── video/              # 视频接口
│   │       ├── performer/      # 演员字典
│   │       └── taste/          # 情趣视频
│   └── utils/                  # 服务端工具
│       └── defineApiEventHandler.ts  # API 统一处理器
├── middleware/                 # 路由中间件
│   └── auth.global.ts          # 全局认证守卫
├── plugins/                    # Nuxt 插件（自动加载）
│   ├── auth.client.ts          # 客户端认证初始化
│   └── element-plus-icons.ts   # Element Plus 图标全局注册
├── utils/                      # 纯工具函数（自动导入）
│   └── api.ts                  # API 请求封装
│       ├── interceptApiRequest()   # 请求拦截器
│       ├── handleApiResponse()     # 响应处理器
│       ├── clientApiFetch()        # 客户端调用
│       ├── apiFetch()              # 通用调用
│       └── serverApiFetch()        # 服务端调用外部 API
├── assets/                     # 资源文件
│   └── css/main.css            # 全局样式
├── public/                     # 静态资源
│   └── favicon.svg             # 网站图标
├── types/                      # 全局类型定义
│   └── api.d.ts                # API 响应统一结构
├── .env.example                # 环境变量示例
├── .eslintrc.cjs               # ESLint 配置
├── tailwind.config.js          # Tailwind 配置
└── package.json                # 项目依赖
```

### 自动导入规则

以下目录的内容会**自动导入**，无需手动 `import`：

| 目录 | 自动导入内容 | 命名约定 |
|------|-------------|----------|
| `components/` | 所有组件 | PascalCase |
| `composables/` | 组合式函数 | use 开头 |
| `stores/` | Pinia store | use 开头 + Store 结尾 |
| `utils/` | 工具函数 | camelCase |

**注意**：`modules/` 目录下的组件需要**手动导入**。

---

## 🔌 核心功能模块

### 1. 认证模块 ✅

**位置**: 
- 页面：`pages/login.vue`
- Store: `stores/user.store.ts`
- 中间件：`middleware/auth.global.ts`
- 插件：`plugins/auth.client.ts`
- API: `server/api/auth/*`

**功能**:
- ✅ 用户登录（邮箱 + 密码）
- ✅ 用户注销
- ✅ 获取当前用户信息
- ✅ Token 持久化（Cookie + localStorage）
- ✅ 全局认证守卫
- ✅ 未登录自动跳转
- ✅ 登录后返回原目标路径

**API 接口**:
```typescript
POST /api/auth/login      // 登录
GET  /api/auth/logout     // 登出
GET  /api/auth/me         // 获取当前用户
```

**关键流程**:
1. 登录成功 → 设置 `isLoggedIn` state → 保存 token 过期时间 → 获取用户信息 → 跳转首页
2. 访问受保护页面 → 中间件检查 token → 未登录保存目标路径 → 跳转登录页
3. 登录后 → 读取 sessionStorage 中的目标路径 → 自动跳转

---

### 2. 用户管理模块 ✅

**位置**:
- 页面：`pages/user/index.vue`
- Store: `stores/user-manage.store.ts`
- 模块：`modules/user/components/UserFormDialog.vue`
- API: `server/api/user/*`

**功能**:
- ✅ 用户列表（分页、查询）
- ✅ 新增用户（表单验证、角色选择）
- ✅ 编辑用户（数据回显、选择性修改密码）
- ✅ 删除用户（二次确认）
- ✅ 角色标签展示（admin/user/guest）

**查询条件**:
- 账号（模糊匹配）
- 姓名（模糊匹配）
- 电话（模糊匹配）
- 角色（下拉选择）

**API 接口**:
```typescript
GET    /api/user/all           // 获取用户列表
POST   /api/user/create        // 新增用户
PUT    /api/user/update/:id    // 编辑用户
DELETE /api/user/delete/:id    // 删除用户
```

---

### 3. 角色管理模块 ✅

**位置**:
- 页面：`pages/role/index.vue`
- Store: `stores/role.store.ts`
- 模块：`modules/role/components/RoleFormDialog.vue`
- API: `server/api/role/*`

**功能**:
- ✅ 角色列表（分页、查询）
- ✅ 新增角色（名称、编码、状态、备注）
- ✅ 编辑角色（数据回显）
- ✅ 删除角色（二次确认）
- ✅ 角色编码唯一性校验
- ✅ 状态切换（启用/禁用）

**查询条件**:
- 角色名称（模糊匹配）
- 角色编码（模糊匹配）
- 状态（启用/禁用）

**API 接口**:
```typescript
GET    /api/role/all           // 获取角色列表
POST   /api/role/create        // 新增角色
PUT    /api/role/update/:id    // 编辑角色
DELETE /api/role/delete/:id    // 删除角色
GET    /api/role/check-code    // 检查编码唯一性
```

---

### 4. 菜单管理模块 ✅

**位置**:
- 页面：`pages/menu/index.vue`
- Store: `stores/menu.store.ts`
- 模块：`modules/menu/components/*`
- API: `server/api/menu/*`

**功能**:
- ✅ 菜单树形展示（多级嵌套）
- ✅ 新增顶级菜单
- ✅ 新增子菜单
- ✅ 编辑菜单（多语言支持：zh-CN/en-US）
- ✅ 删除菜单（二次确认）
- ✅ 批量更新（拖拽排序）
- ✅ 图标选择器（Element Plus 图标）

**菜单数据结构**:
```typescript
interface MenuNode {
  id: number
  parentId: number | null
  path: string
  name: string
  icon?: string
  i18n: Array<{
    locale: 'zh-CN' | 'en-US'
    name: string
  }>
  children?: MenuNode[]
  permission?: string
}
```

**API 接口**:
```typescript
GET    /api/menu/tree              // 获取菜单树
POST   /api/menu                   // 新增菜单
PUT    /api/menu/:id               // 编辑菜单
DELETE /api/menu/:id               // 删除菜单
POST   /api/menu/batch-update      // 批量更新
GET    /api/menu/:id               // 获取单个菜单
```

---

### 5. 情趣视频管理模块 ✅

**位置**:
- 页面：`pages/video/taste/index.vue`
- Store: `stores/tasteVideo.store.ts`
- 模块：`modules/tasteVideo/components/*`
- API: `server/api/video/taste/*`

**功能**:
- ✅ 视频列表（分页、多条件查询）
- ✅ 新增视频（表单验证、演员选择）
- ✅ 编辑视频（数据回显）
- ✅ 删除视频（二次确认）
- ✅ 预览功能（图片预览弹窗）
- ✅ 下载功能（磁力链接复制）
- ✅ 演员字典（前端过滤下拉框）

**查询条件**:
- 车牌号（模糊匹配）
- 演员（下拉选择，支持前端过滤）
- 评分（el-rate，1-5 分）
- 状态（未下载/已下载/已观看）
- 创建时间（日期范围选择器）

**视频数据结构**:
```typescript
interface TasteVideo {
  id: number
  number: string          // 车牌号
  name: string            // 名称
  performer: string       // 演员
  releaseDate: string     // 发行时间
  rating: number          // 评分 (1-5)
  status: 0 | 1 | 2       // 状态
  magnetUri: string       // 磁力链接
  gmtCreate: string       // 创建时间
}
```

**API 接口**:
```typescript
GET    /api/video/taste            // 获取视频列表
POST   /api/video/taste            // 新增视频
PUT    /api/video/taste/:id        // 编辑视频
DELETE /api/video/taste/:id        // 删除视频
GET    /api/video/taste/preview/:id // 获取预览图片
GET    /api/video/performer/dict   // 获取演员字典
```

---

## 🛠️ 技术规范

### 编码规范

#### 命名约定

| 类型 | 命名风格 | 示例 |
|------|---------|------|
| 组件名 | PascalCase | `LoginForm.vue`, `UserDropdown.vue` |
| 组合式函数 | use + camelCase | `useMenu.ts`, `useUserStore` |
| Pinia store | use + Store 结尾 | `useUserStore`, `useAppStore` |
| 目录名 | kebab-case | `user-profile/`, `auth/` |
| 类型/接口 | PascalCase | `User`, `MenuItem`, `LoginRequest` |
| API 路由文件 | [name].[method].ts | `login.post.ts`, `all.get.ts` |
| Store 文件名 | [name].store.ts | `user.store.ts`, `menu.store.ts` |

#### 组件结构顺序

```vue
<script setup lang="ts">
  // 1. 类型导入（如果需要）
  // 2. props 和 emits 定义（使用泛型）
  // 3. 组合式函数调用（useStore、useRoute 等）
  // 4. 响应式数据定义
  // 5. 计算属性
  // 6. 方法/事件处理
  // 7. 生命周期钩子
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
  <!-- 样式（优先使用 Element Plus + Tailwind） -->
</style>
```

#### Props & Emits 定义

```typescript
const props = withDefaults(defineProps<{ title?: string }>(), {
  title: '默认标题'
})

const emit = defineEmits<{
  (e: 'update', id: number): void
}>()
```

---

### API 开发规范

#### 统一响应格式

```typescript
interface ApiResponse<T = any> {
  code: number      // 20000 表示成功
  data: T
  message: string
  success: boolean
  total?: number    // 列表接口可能有 total
}

interface ListResponse<T = any> {
  list: T[]
  total: number
}
```

#### 错误处理

- `code === 20000`: 成功
- `code === 401`: 未授权，自动跳转登录页
- `code !== 20000`: 抛出错误，显示错误消息
- `422`: 参数验证失败（Zod）

#### API 统一处理器

```typescript
// server/utils/defineApiEventHandler.ts
export function defineApiEventHandler<T extends z.ZodTypeAny>(config: {
  validation?: T  // Zod 验证 schema
  guards?: Array<(event: H3Event, payload: z.infer<T>) => Promise<void>>
  handler: (event: H3Event, payload: z.infer<T>) => Promise<any>
})
```

**功能**:
- ✅ 自动合并 body 和 query 参数
- ✅ Zod 运行时验证（失败返回 422）
- ✅ 守卫函数数组（权限检查）
- ✅ 统一错误处理

---

### 状态管理规范

#### Store 定义模式

```typescript
// stores/user.store.ts
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const menus = ref<MenuItem[]>([])
  
  // Getters
  const isLoggedIn = computed(() => !!user.value)
  
  // Actions
  async function fetchUserInfo() {
    // ...
  }
  
  return {
    user, menus, isLoggedIn, fetchUserInfo
  }
})
```

#### 已实现的 Stores

| Store | 功能 | 主要方法 |
|-------|------|---------|
| `user.store.ts` | 用户信息、菜单、权限 | `login`, `logout`, `fetchUserInfo` |
| `app.store.ts` | 应用 UI 状态 | `toggleSidebar`, `toggleFullscreen` |
| `menu.store.ts` | 菜单管理 | `fetchMenuTree`, `createMenu`, `updateMenu`, `deleteMenu` |
| `role.store.ts` | 角色管理 | `fetchRoles`, `createRole`, `updateRole`, `deleteRole` |
| `user-manage.store.ts` | 用户管理 | `fetchUsers`, `createUser`, `updateUser`, `deleteUser` |
| `tasteVideo.store.ts` | 视频管理 | `fetchList`, `createVideo`, `updateVideo`, `deleteVideo` |

---

### 数据获取规范

#### 客户端数据获取

| 场景 | 推荐方式 | 说明 |
|------|---------|------|
| 页面级数据 | `useAsyncData` + `$fetch` | SSR 友好，自动去重 |
| 交互性请求 | `$fetch` 或 `clientApiFetch` | 表单提交、按钮点击 |
| 复杂缓存 | `@tanstack/vue-query` | 后台更新、缓存管理 |

#### API 请求封装

```typescript
// utils/api.ts
export async function clientApiFetch<T>(url: string, options?: any): Promise<ApiResponse<T>>
export async function apiFetch<T>(url: string, options?: any): Promise<ApiResponse<T>>
export async function serverApiFetch<T>(event: any, url: string, options?: any): Promise<any>
```

**特性**:
- ✅ 自动请求拦截（检查登录状态）
- ✅ 统一错误处理（code !== 20000 抛出异常）
- ✅ 401 自动跳转登录页
- ✅ 自动携带 cookie（credentials: 'include'）

---

## 🔒 安全机制

### 认证与授权

1. **Token 管理**:
   - Token 存储在 HttpOnly Cookie 中（生产环境 HTTPS）
   - localStorage 存储登录标记和过期时间
   - Token 过期自动清除状态

2. **请求拦截**:
   - 公开接口白名单（如 `/api/auth/login`）
   - 未登录拦截并警告
   - 401 自动跳转

3. **中间件守卫**:
   - 全局路由守卫（`auth.global.ts`）
   - 已登录访问登录页自动跳转首页
   - 未登录访问保护页面保存目标路径

4. **XSS 防护**:
   - HttpOnly Cookie
   - SameSite: strict
   - 生产环境 HTTPS

5. **CSRF 防护**:
   - SameSite Cookie 策略
   - Token 验证

---

## 🚀 性能优化

### 构建优化

```typescript
// nuxt.config.ts
vite: {
  optimizeDeps: {
    include: ['vue', 'pinia', 'element-plus']
  },
  esbuild: {
    drop: ['console'] // 生产环境移除 console
  }
}
```

### 缓存策略

- ✅ `useAsyncData` 的 `getCachedData` 选项
- ✅ `@tanstack/vue-query` 智能缓存
- ✅ 组件懒加载（Nuxt 自动）

### 依赖管理

- ✅ pnpm hoisted 模式（扁平 node_modules）
- ✅ 预优化依赖配置
- ✅ 按需导入（自动 tree-shaking）

---

## 📝 开发工作流

### 启动项目

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 设置 NUXT_BACKEND_URL

# 3. 启动开发服务器
pnpm dev

# 4. 访问 http://localhost:3000
```

### 代码检查

```bash
pnpm lint        # ESLint 检查
pnpm lint:fix    # ESLint 自动修复
pnpm type-check  # TypeScript 类型检查
```

### 构建部署

```bash
pnpm build       # 构建生产版本
pnpm preview     # 预览生产构建
```

---

## 📊 数据统计

### 代码统计

| 类型 | 数量 | 说明 |
|------|------|------|
| **页面** | 6 | login, index, user, role, menu, video/taste |
| **全局组件** | 4 | LoginForm, TopBar, UserDropdown, NotificationDropdown |
| **模块组件** | 9 | MenuTree, MenuFormDialog, IconPicker, RoleFormDialog, UserFormDialog, TasteVideoList, TasteVideoFormDialog, TasteVideoPreviewDialog |
| **Stores** | 6 | user, app, menu, role, user-manage, tasteVideo |
| **Composables** | 1 | useMenu |
| **API 接口** | ~30 | 认证、用户、角色、菜单、视频 |
| **中间件** | 1 | auth.global.ts |
| **插件** | 2 | auth.client.ts, element-plus-icons.ts |

### 功能完成度

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 认证模块 | 100% | ✅ |
| 用户管理 | 100% | ✅ |
| 角色管理 | 100% | ✅ |
| 菜单管理 | 100% | ✅ |
| 视频管理 | 100% | ✅ |
| UI 组件 | 100% | ✅ |
| 权限控制 | 60% | 🟡 (基础实现，可扩展 RBAC) |

---

## 🎯 待扩展功能

### 权限系统增强

- [ ] 完整的 RBAC 权限模型
- [ ] 按钮级权限控制
- [ ] 动态菜单权限
- [ ] 角色权限分配界面

### 用户体验优化

- [ ] 骨架屏加载
- [ ] 更丰富的动画效果
- [ ] 主题切换功能
- [ ] 国际化支持（i18n）

### 功能增强

- [ ] 数据导出（Excel、PDF）
- [ ] 文件上传组件
- [ ] 富文本编辑器
- [ ] 图表可视化（ECharts）
- [ ] WebSocket 实时通信

### 测试覆盖

- [ ] 单元测试（Vitest）
- [ ] 组件测试（Vue Test Utils）
- [ ] E2E 测试（Playwright）

---

## 📚 参考文档

- [开发规范文档](./开发规范文档.md) - 详细的开发规范和 AI 提示词
- [prompt.md](./prompt.md) - 情趣视频模块功能描述示例
- [ENVIRONMENT.md](./ENVIRONMENT.md) - 环境配置说明
- [Nuxt 3 文档](https://nuxt.com/)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

---

## 📞 技术支持

**开发团队**: Best MSC Team  
**最后更新**: 2026-03-28  
**项目版本**: 1.0.0

---

**此文档由 AI 自动生成并维护，反映项目最新状态。**
