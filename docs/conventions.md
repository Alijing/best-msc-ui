# 开发规范索引

> **维护原则**：AI 与机器可读规范以 [`.cursor/rules/`](../.cursor/rules/) 为唯一真源；本文仅作人类速查与导航。依赖版本以 [`package.json`](../package.json) 为准。定期维护见 [MAINTENANCE.md](./MAINTENANCE.md)。

---

## Cursor 规则一览

| 规则文件 | 作用域 | 说明 |
|----------|--------|------|
| [project-core.mdc](../.cursor/rules/project-core.mdc) | 始终 | 技术栈、目录、命名、自动导入 |
| [api-server.mdc](../.cursor/rules/api-server.mdc) | `server/**` | RESTful、Handler、Zod、ApiResponse |
| [pinia-stores.mdc](../.cursor/rules/pinia-stores.mdc) | `stores/**` | Store 命名与 CRUD 模式 |
| [vue-nuxt-ui.mdc](../.cursor/rules/vue-nuxt-ui.mdc) | `**/*.vue` | Nuxt UI、页面/模块分工 |
| [auth-security.mdc](../.cursor/rules/auth-security.mdc) | 鉴权相关路径 | 守卫、Cookie、安全 |
| [client-api.mdc](../.cursor/rules/client-api.mdc) | pages/modules 等 | useFetch、clientApiFetch |

---

## 速查

### 命名

- 组件 `PascalCase`；组合式 `useXxx`；Store `useXxxStore`；目录 `kebab-case`
- API 文件 `[name].[method].ts`；Store 文件 `[name].store.ts`

### Vue SFC

`script setup` → `template`（Nuxt UI + Tailwind）→ `style scoped`（尽量少）

### 数据与 API

- 页面初始：`useFetch`；交互 / Store：`clientApiFetch` 或 `$fetch`
- 成功码：`code === 20000`（`ApiResponse<T>`）
- 服务端入参：Zod 校验

### 安全

- 禁止未清洗的 `v-html`
- Token 仅存 HttpOnly Cookie，不用 localStorage

### 质量

```bash
pnpm lint
pnpm lint:fix
pnpm type-check
```

---

## 架构与需求

- [项目架构](./architecture.md)
- [需求规格](./requirements/README.md)

---

*原 `开发规范文档.md` 已合并至本文件与 `.cursor/rules/`，请勿在根目录恢复重复副本。*
