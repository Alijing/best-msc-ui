# Best MSC UI - 现代化管理后台

基于 Nuxt 4 + Vue 3 + TypeScript + Pinia + Nuxt UI 的现代化管理后台系统。

## 📋 项目概览

Best MSC UI 是一个功能完善的管理后台系统，支持 SSR（服务端渲染），采用前后端一体化架构设计。主要功能包括用户认证、演员字典管理、兴趣视频管理等模块。

**核心特性**：
- ✅ 完整的认证体系（HttpOnly Cookie + 全局守卫）
- ✅ 演员字典管理（CRUD + 批量操作）
- ✅ 兴趣视频管理（多条件查询 + 预览 + 下载）
- ✅ 角色管理（CRUD + 编码唯一性校验）
- ✅ 响应式设计 + 暗色模式支持
- ✅ TypeScript 类型安全
- ✅ 自动导入机制（组件、Store、Composables）

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **元框架** | Nuxt | 4.4.2 |
| **前端框架** | Vue | 3.5.0 |
| **UI 组件库** | Nuxt UI | 4.6.0 |
| **图标库** | @nuxt/icon | Heroicons + Lucide |
| **状态管理** | Pinia | 3.0.4 |
| **样式方案** | Tailwind CSS | 内置于 Nuxt UI |
| **类型系统** | TypeScript | 5.3.3 |
| **运行时验证** | Zod | 3.22.4 |
| **数据查询** | @tanstack/vue-query | 5.17.9 |
| **包管理器** | pnpm | 9.11.0 |

## 快速开始

### 环境要求

- Node.js >= 22.x (推荐 v22.22.2)
- pnpm >= 9.x (推荐 v9.11.0)

**.npmrc 配置**：
```ini
shamefully-hoist=true
node-linker=hoisted
```

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置后端 API 地址
# NUXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
pnpm build
```

### 5. 预览生产构建

```bash
pnpm preview
```

### 代码检查与类型验证

```bash
pnpm lint        # ESLint 检查
pnpm lint:fix    # ESLint 自动修复
pnpm type-check  # TypeScript 类型检查
```

## 项目结构

详见 [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - 完整的项目梳理报告

## 开发文档

- [项目概览](./PROJECT_OVERVIEW.md) - 项目架构、功能模块、技术规范
- [开发规范文档](./开发规范文档.md) - 详细的开发规范和 AI 提示词
- [AUTH_SCHEME.md](./AUTH_SCHEME.md) - 全局鉴权与 Token 存储方案
- [ENVIRONMENT.md](./ENVIRONMENT.md) - 环境配置说明
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 需求规格说明书

## 许可证

MIT
