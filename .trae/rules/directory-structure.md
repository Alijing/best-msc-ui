---
alwaysApply: true
description: 完整目录结构及各目录职责
---

# 目录结构

```
.
├── app.vue
├── nuxt.config.ts
├── pages/               # 路由页面，只做组装，无业务逻辑
├── layouts/             # 布局组件（default.vue, guest.vue）
├── components/          # 全局共享组件（自动导入）
├── composables/         # 组合式函数（自动导入，以 use 开头）
├── stores/              # Pinia store（自动导入，命名 [name].store.ts）
│   └── types/           # 共享 TypeScript 类型
├── modules/             # 业务模块内聚
│   └── components/      # 模块组件（自动导入，路径 modules/components/[module]/[Component].vue）
├── server/api/          # Nitro API 路由（命名 [name].[method].ts）
├── server/utils/        # 服务端工具（defineApiEventHandler 等）
├── middleware/          # 路由中间件（auth.global.ts）
├── plugins/             # Nuxt 插件（按需）
├── utils/               # 纯工具函数（自动导入）
├── assets/css/          # 全局样式
├── public/              # 静态资源
└── types/               # 全局类型定义（如 api.d.ts）
```