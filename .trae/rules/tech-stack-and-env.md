---
alwaysApply: true
description: 技术栈、包管理器、Node 版本、runtimeConfig 环境变量配置
---

# 技术栈与环境配置

## 技术栈

- 元框架：Nuxt 4.4.2（SSR: true）
- UI 组件库：Nuxt UI v4.6.0
- 图标库：`@nuxt/icon` + `@iconify-json/heroicons`、`@iconify-json/lucide`
- 样式：Tailwind CSS 3.4.0（Nuxt UI 自动配置）
- 状态管理：Pinia 3.0.4 + `@pinia/nuxt`
- 数据获取：`useFetch` / `$fetch`，复杂缓存 `@tanstack/vue-query`
- 类型安全：TypeScript 5.3.3 + Zod 3.22.4
- 包管理器：pnpm 9.11.0，Node.js >=22.x

## 环境变量与 runtimeConfig

```ts
runtimeConfig: {
  public: {
    backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  }
}
```

- 客户端可用变量以 `NUXT_PUBLIC_` 开头
- 服务端私有变量使用 `NUXT_`
