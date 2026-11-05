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
│   ├── system/role/、system/menu/、system/user/
│   ├── book/novel/
│   └── crawl/webpage/
├── layouts/                    # default.vue、guest.vue
├── components/                 # 全局共享（TopBar、ConfirmDialog 等）
├── modules/components/         # 业务组件（auth、performer、tasteVideo、system/*、book/novel、crawl）
├── composables/                # useMenu 等
├── stores/ + stores/types/
├── server/api/                 # Nitro 路由
├── server/middleware/auth.ts
├── middleware/auth.global.ts
├── plugins/                    # init-auth.client.ts、vue-query.ts
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

### 字典管理 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/system/dict/index.vue`、`pages/system/dict/[code].vue` |
| 组件 | `modules/components/system/dict/*` |
| Store | `stores/dict.store.ts` |
| API | `server/api/system/dict/*` |

字典分页列表。字典项页按数据结构切换：`structure = 0` 为分页表格，`structure = 1` 为树。系统类字典不能删除。后端为 `/dict`。详见 [requirements/dict.md](./requirements/dict.md)。

**API**：

- `GET /api/system/dict`
- `GET /api/system/dict/:code`
- `POST /api/system/dict`
- `PUT /api/system/dict`
- `DELETE /api/system/dict`
- `GET /api/system/dict/item`
- `POST /api/system/dict/item`
- `PUT /api/system/dict/item`
- `DELETE /api/system/dict/item`
- `GET /api/system/dict/item/tree`

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

### 用户管理 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/system/user/index.vue` |
| 组件 | `modules/components/system/user/*` |
| Store | `stores/user-manage.store.ts` |
| API | `server/api/system/user/*` |

列表分页查询、新增、编辑、删除。后端为 `/sys/spider`。新增用户的初始密码与账号相同；编辑不改密码。删除当前登录用户时前端拦截。

---

### 小说管理 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/book/novel/index.vue` |
| 组件 | `modules/components/book/novel/*` |
| Store | `stores/novel.store.ts` |
| API | `server/api/book/novel/*`、`server/api/novel/dict.get.ts` |

按名称分页查询，维护小说名称和目录页地址。支持批量删除（同时删除章节和正文）、下载 TXT、展示章节数。后端为 `/novel`。采集页下拉仍用 `GET /api/novel/dict`。详见 [requirements/novel.md](./requirements/novel.md)。

**API**：

- `GET /api/book/novel`
- `GET /api/book/novel/:id`
- `POST /api/book/novel`
- `PUT /api/book/novel`
- `DELETE /api/book/novel`
- `GET /api/book/novel/:id/chapters/size`
- `GET /api/book/novel/:id/download`
- `GET /api/novel/dict`

---

### 网页数据采集 ✅

| 类型 | 路径 |
|------|------|
| 页面 | `pages/crawl/webpage/index.vue` |
| 组件 | `modules/components/crawl/*` |
| Store | `stores/crawl.store.ts` |
| API | `server/api/crawl/webpage/*`、`server/api/novel/dict.get.ts` |

选择小说后分析目录页，确认选择器并启动采集。任务进行中每 2 秒轮询；完成后可导入所选小说。任务 ID 与小说 ID 存在 `sessionStorage`。详见 [requirements/crawl.md](./requirements/crawl.md)。

**API**：

- `POST /api/crawl/webpage/analyze`
- `POST /api/crawl/webpage/tasks/start`
- `GET /api/crawl/webpage/tasks/status/:taskId`
- `DELETE /api/crawl/webpage/tasks/:taskId`
- `GET /api/crawl/webpage/tasks/:taskId/1/:novelId`
- `GET /api/novel/dict`

---

### 仪表盘 ✅

- `pages/index.vue` 与 `pages/dashboard/index.vue` 内容相同（`/`、`/dashboard`）

---

## 数据统计（约）

| 类型 | 数量 | 说明 |
|------|------|------|
| 页面 | 12 | 含 login、dashboard、performer、taste、role、menu、user、dict、book/novel、crawl/webpage |
| 全局组件 | 5 | TopBar、UserDropdown、NotificationDropdown、ConfirmDialog、TableSkeleton |
| 模块组件 | 22 | 含 LoginForm、各 List/FormDialog、MenuTree、字典列表/字典项、小说列表/表单，以及网页采集 4 个组件 |
| Stores | 9 | user、app、menu、role、performer、tasteVideo、novel、crawl、dict |
| Composables | 1 | useMenu |
| Nitro API 文件 | ~47 | 含 auth、video、system（含字典）、book/novel |

| 模块 | 状态 |
|------|------|
| 认证、演员、角色、菜单、字典、用户、小说、兴趣视频、网页采集、仪表盘 | ✅ |
| RBAC 按钮级权限 | 🟡 基础能力，可扩展 |

---

## 性能

- 列表、菜单树、角色/演员字典、部门树、预览图地址走 `@tanstack/vue-query`（`plugins/vue-query.ts`）。列表 30 秒内复用缓存，字典 5 分钟；新增、编辑、删除后按模块 key 失效再拉。小说列表同样缓存 30 秒。
- 列表和菜单树首次加载使用 `TableSkeleton`。已有数据时保留表格。
- 兴趣视频、演员、用户、角色表格启用 `UTable` 虚拟滚动，行数上来后只渲染可视区域。菜单树保留完整 DOM，方便展开和拖拽排序。

## 待扩展

- 完整 RBAC、按钮级权限、动态菜单权限  
- i18n、数据导出、图表、E2E 测试  

完整需求见 [requirements/README.md](./requirements/README.md)。

---

## 相关文档

- [开发规范索引](./conventions.md)
- [鉴权说明](./auth.md)
- [环境 FAQ](./environment.md)
- [文档维护](./MAINTENANCE.md)
