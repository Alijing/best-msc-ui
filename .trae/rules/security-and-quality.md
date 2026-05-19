---
alwaysApply: true
description: 安全规范、代码质量检查、Git 提交规范
---

# 安全与代码质量

## 安全规范（必须遵守）

- **禁止 `v-html`**：除非内容经过 DOMPurify 清洗
- **用户输入**：服务端必须使用 Zod 校验，客户端可选
- **Cookie**：设置 `httpOnly`、`secure`、`sameSite: 'strict'`
- **CSRF**：若使用 cookie 认证，敏感接口需验证 token

## 代码质量检查

- ESLint：`pnpm lint` / `pnpm lint:fix`
- 类型检查：`pnpm type-check`
- 生产构建：自动移除 `console.log` 和 `debugger`（Vite 配置）

## Git 提交规范（推荐）

使用 Conventional Commits：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档
- `style:` 格式
- `refactor:` 重构
- `perf:` 性能
- `test:` 测试
- `chore:` 构建/辅助工具
