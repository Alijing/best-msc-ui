# 项目架构

> 技术栈版本以 `package.json` 为准；编码/API 规范见 [conventions.md](./conventions.md) 与 [`.cursor/rules/`](../.cursor/rules/)。

---

## 概览

Best MSC UI 是基于 Nuxt 4 的管理后台，前后端一体化（Nitro BFF + 外部后端 API），SSR 已启用。页面只做组装，业务 UI 在 `modules/components/`，数据与交互在 Pinia Store。

---

## 目录结构

```
best_msc_ui/
├── app.vue
├── nuxt.config.ts
├── pages/                      # 文件即路由
│   ├── index.vue、dashboard/index.vue
│   ├── login.vue
│   ├── video/performer/、video/taste/
│   └── system/role/、system/menu/
├── layouts/                    # default.vue、guest.vue
├── components/                 # 全局共享（TopBar、ConfirmDialog 等）
├── modules/components/         # 业务组件（auth、performer、tasteVideo、system/*）
├── composables/                # useMenu 等
├── stores/ + stores/types/
├── server/api/                 # Nitro 路由
├── server/middleware/auth.ts
├── middleware/auth.global.ts
├── plugins/init-auth.client.ts
├── utils/api.ts
├── config/routes.ts
└── types/api.d.ts
```

### 自动导入

| 目录 | 约定 |
|------|------|
| `components/`、`modules/components/` | PascalCase 组件 |
| `composables/` | `use` 前缀 |
| `stores/` | `useXxxStore`，文件 `[name].store.ts` |
| `utils/` | camelCase |

Nuxt UI 与图标自动导入；上述目录**勿手动 import**（类型除外）。

---

## 功能模块

### 认证 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/login.vue` |
| 组件 | `modules/components/auth/LoginForm.vue` |
| Store | `stores/user.store.ts` |
| 守卫 | `middleware/auth.global.ts`、`plugins/init-auth.client.ts` |
| API | `server/api/auth/*` |

- 登录 / 登出 / 当前用户；HttpOnly Cookie；全局守卫与登录后回跳  
- 详见 [auth.md](./auth.md)、需求 [requirements/auth.md](./requirements/auth.md)

**API**：`POST /api/auth/login`、`GET /api/auth/logout`、`GET /api/auth/me`

---

### 演员字典 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/video/performer/index.vue` |
| 组件 | `modules/components/performer/*` |
| Store | `stores/performer.store.ts` |
| API | `server/api/video/performer/*` |

列表分页查询、CRUD、批量删除、字典接口。

---

### 角色管理 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/system/role/index.vue` |
| 组件 | `modules/components/system/role/*` |
| Store | `stores/role.store.ts` |
| API | `server/api/system/role/*` |

编码唯一性校验、分页与多条件查询。

---

### 菜单管理 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/system/menu/index.vue` |
| 组件 | `modules/components/system/menu/*` |
| Store | `stores/menu.store.ts` |
| API | `server/api/system/menu/*` |

树形菜单、路径校验、批量更新排序。

---

### 兴趣视频 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/video/taste/index.vue` |
| 组件 | `modules/components/tasteVideo/*` |
| Store | `stores/tasteVideo.store.ts` |
| API | `server/api/video/taste/*` |

多条件查询、预览、磁力链接、演员字典联动。

---

### 仪表盘 ✅

- `pages/index.vue` 与 `pages/dashboard/index.vue` 内容相同（`/`、`/dashboard`）

---

## 数据统计（约）

| 类型 | 数量 | 说明 |
|------|------|------|
| 页面 | 7 | 含 login、dashboard、performer、taste、role、menu |
| 全局组件 | 4 | TopBar、UserDropdown、NotificationDropdown、ConfirmDialog |
| 模块组件 | 10 | 含 LoginForm、各 List/FormDialog、MenuTree 等 |
| Stores | 6 | user、app、menu、role、performer、tasteVideo |
| Composables | 1 | useMenu |
| Nitro API 文件 | ~30 | 含 auth、video、system |

| 模块 | 状态 |
|------|------|
| 认证、演员、角色、菜单、兴趣视频、仪表盘 | ✅ |
| 用户管理（独立模块） | 见需求 [requirements/user.md](./requirements/user.md) |
| RBAC 按钮级权限 | 🟡 基础能力，可扩展 |

---

## 待扩展

- 完整 RBAC、按钮级权限、动态菜单权限  
- 骨架屏、i18n、数据导出、图表、E2E 测试  

完整需求见 [requirements/README.md](./requirements/README.md)。

---

## 相关文档

- [开发规范索引](./conventions.md)
- [鉴权说明](./auth.md)
- [环境 FAQ](./environment.md)
- [文档整理方案](../文档整理方案.md)
- [文档维护](./MAINTENANCE.md)
