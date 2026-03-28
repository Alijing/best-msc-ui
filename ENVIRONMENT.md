# 环境配置说明

## 系统要求

### Node.js
- **最低版本**: >= 22.0.0
- **推荐版本**: v22.22.2
- **下载地址**: https://nodejs.org/

### pnpm
- **最低版本**: >= 9.0.0
- **推荐版本**: v9.11.0
- **安装方式**: 
  ```bash
  npm install -g pnpm
  ```

## 项目配置

### .npmrc 配置
项目根目录包含 `.npmrc` 文件，配置如下：

```ini
shamefully-hoist=true
node-linker=hoisted
```

**作用说明**：
- `shamefully-hoist=true` - 将所有依赖提升到根目录（类似 npm/yarn 的行为）
- `node-linker=hoisted` - 使用提升模式而不是隔离模式

**为什么需要这个配置**：
- Element Plus 和它的依赖（包括 dayjs）需要扁平的 node_modules 结构
- pnpm 默认的隔离模式会导致某些包无法正确找到依赖
- hoist 模式让 pnpm 像 npm/yarn 一样工作，避免了依赖查找问题

### package.json 配置

#### engines 字段
```json
{
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

#### packageManager 字段
```json
{
  "packageManager": "pnpm@9.11.0"
}
```

## 快速开始

### 1. 检查环境
```bash
node --version  # 应返回 v22.x.x
pnpm --version  # 应返回 9.x.x
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 启动开发服务器
```bash
pnpm dev
```

## 常见问题

### 端口被占用
```bash
# 修改端口
pnpm dev --port 3001
```

### 依赖安装问题
如果遇到依赖安装问题，请清理后重新安装：

```bash
# Windows PowerShell
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
pnpm install
```

### @oxc 原生绑定问题
Nuxt 4.4.2 在 Windows 平台上需要 @oxc 相关的原生绑定，这些是必需的依赖项。

如果遇到相关错误，请确保：
1. Node.js 版本 >= 22.0.0
2. pnpm 版本 >= 9.0.0
3. .npmrc 配置正确

## 更新日志

- **2026-03-26**: 更新 Node.js 到 v22.22.2，pnpm 到 v9.11.0，Element Plus 到 v2.13.6
