# 环境排错 FAQ

环境要求与快速开始见根目录 [README.md](../README.md)。**Node / pnpm 版本以 [`package.json`](../package.json) 的 `engines`、`packageManager` 为准。**

## 检查版本

```bash
node --version   # 应 >= v22.x
pnpm --version   # 应 >= 9.x
```

## 端口被占用

```bash
pnpm dev --port 3001
```

## 依赖安装失败

```bash
# Windows PowerShell
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
pnpm install
```

## @oxc 原生绑定（Windows）

Nuxt 4.4.2 在 Windows 上依赖 @oxc 原生绑定。若报错请确认：

1. Node.js >= 22.0.0
2. pnpm >= 9.0.0
3. 根目录 `.npmrc` 含 `shamefully-hoist=true` 与 `node-linker=hoisted`

## .npmrc 说明

```ini
shamefully-hoist=true
node-linker=hoisted
```

pnpm 默认隔离模式可能导致部分包找不到依赖；hoist 模式与 npm/yarn 行为更接近，本项目依赖此配置。
