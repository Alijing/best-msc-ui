# Best MSC UI - 现代化管理后台

基于 Nuxt 4 + Vue 3 + TypeScript + Pinia + Nuxt UI 的现代化管理后台系统。

## 📋 项目概览

Best MSC UI 是一个功能完善的管理后台系统，支持 SSR（服务端渲染），采用前后端一体化架构设计。主要功能包括用户认证、演员字典管理、兴趣视频、角色与菜单管理等模块。

**核心特性**：
- ✅ 完整的认证体系（HttpOnly Cookie + 全局守卫）
- ✅ 演员字典管理（CRUD + 批量操作）
- ✅ 兴趣视频管理（多条件查询 + 预览 + 下载）
- ✅ 角色与菜单管理
- ✅ 响应式设计 + 暗色模式支持
- ✅ TypeScript 类型安全
- ✅ 自动导入机制（组件、Store、Composables）

## 技术栈

版本以 [package.json](./package.json) 为准（Nuxt 4、Vue 3、Nuxt UI 4、Pinia 3、TypeScript、Zod、pnpm）。

## 快速开始

### 环境要求

| 工具 | 要求 | 推荐 |
|------|------|------|
| Node.js | >= 22.0.0 | v22.22.2 |
| pnpm | >= 9.0.0 | v9.11.0 |

```bash
node --version
pnpm --version
```

**`.npmrc`**（已配置）：

```ini
shamefully-hoist=true
node-linker=hoisted
```

排错见 [docs/environment.md](./docs/environment.md)。

### 安装与运行

```bash
pnpm install
cp .env.example .env   # 配置 NUXT_PUBLIC_BACKEND_URL
pnpm dev               # http://localhost:3000
```

```bash
pnpm build
pnpm preview
pnpm lint
pnpm type-check
```

## 文档怎么用

不必全读，按场景跳转即可。

| 场景 | 看什么 |
|------|--------|
| **新人上手** | 本文「快速开始」→ [架构](./docs/architecture.md) → [规范索引](./docs/conventions.md)；装不上再看 [环境 FAQ](./docs/environment.md) |
| **日常写代码** | [架构](./docs/architecture.md)（放哪、有哪些模块）+ [规范索引](./docs/conventions.md)；鉴权改动看 [auth](./docs/auth.md) |
| **做某功能** | [需求索引](./docs/requirements/README.md) 进对应模块（如 `taste.md`），对照架构里的页面/Store/API |
| **提 PR** | 按 [.github/pull_request_template.md](./.github/pull_request_template.md) 勾选；可见变更写入 [CHANGELOG](./CHANGELOG.md) 的 `[Unreleased]` |
| **用 Cursor** | Agent 自动读 [`.cursor/rules/`](./.cursor/rules/)；改团队约定只改此处，勿维护已删的 `prompt.md` |
| **季度维护** | [MAINTENANCE](./docs/MAINTENANCE.md) 核对架构/需求 `status` 与 archive |
| **删除历史文档** | 先 `git commit` 基线，再按 [可选清理步骤](./docs/可选清理步骤.md) 操作 |

**三个真源**：依赖版本 → [package.json](./package.json)；编码约定 → `.cursor/rules/`；模块与目录 → [docs/architecture.md](./docs/architecture.md) + 代码。

**示例**（改兴趣视频）：`requirements/taste.md` → 架构中「兴趣视频」路径 → 改代码 → `pnpm lint` / `type-check` → PR 勾选 taste + 必要时 architecture/CHANGELOG。

<details>
<summary>各文档阅读频率（展开）</summary>

| 文档 | 频率 |
|------|------|
| README、architecture、conventions | 常 |
| requirements/*、auth | 做相关功能时 |
| environment、CHANGELOG、PR 模板 | 按需 |
| 文档整理方案、docs/archive | 几乎不用（备查） |

</details>

## 文档索引

| 文档 | 说明 |
|------|------|
| [文档整理方案](./文档整理方案.md) | 文档体系与整理进度 |
| [项目架构](./docs/architecture.md) | 目录、模块、API 概览 |
| [开发规范索引](./docs/conventions.md) | 人类速查；AI 见 `.cursor/rules/` |
| [鉴权说明](./docs/auth.md) | HttpOnly Cookie 与三层防护 |
| [需求规格](./docs/requirements/README.md) | 按模块拆分的需求 |
| [环境排错](./docs/environment.md) | FAQ |
| [文档归档](./docs/archive/) | 历史全文与梳理记录 |
| [文档维护](./docs/MAINTENANCE.md) | SSOT、PR 自检、季度 archive 审查 |
| [可选清理步骤](./docs/可选清理步骤.md) | 删除 archive 等历史文档的完整命令与验收 |
| [CHANGELOG](./CHANGELOG.md) | 产品/代码变更记录 |

## 许可证

MIT
