# 全局鉴权

> 完整历史方案（含大量代码示例）见 [archive/AUTH_SCHEME.full.md](./archive/AUTH_SCHEME.full.md)。

---

## 架构：三层防护 + HttpOnly Cookie

```
middleware/auth.global.ts     → 路由级拦截
utils/api.ts                  → 请求拦截
handleApiResponse()           → 401 跳转登录
```

### Token 存储

| 方式 | 用途 |
|------|------|
| HttpOnly Cookie | 唯一持久化（`login.post.ts` 设置） |
| `useState` / Pinia | 运行时 UI 状态 |
| localStorage | ❌ 不存 token |

### Layout

- 公开路由：`/login`（`config/routes.ts` → `PUBLIC_ROUTES`）→ `guest` 布局  
- 其余 → `default` 布局（`app.vue` 按路由计算）

---

## 关键文件

| 文件 | 职责 |
|------|------|
| `middleware/auth.global.ts` | 白名单、未登录重定向、保存 `redirectPath` |
| `plugins/init-auth.client.ts` | 刷新后恢复登录态 |
| `server/middleware/auth.ts` | 服务端解析 Cookie |
| `stores/user.store.ts` | login / logout / fetchUserInfo |
| `utils/api.ts` | 拦截与 401 处理 |
| `modules/components/auth/LoginForm.vue` | 登录表单与回跳 |
| `server/api/auth/login.post.ts` | 写 Cookie |
| `server/api/auth/logout.get.ts` | 清 Cookie |

路由常量集中在 `config/routes.ts`（`PUBLIC_ROUTES`、`DEFAULT_HOME_PATH`），避免多处硬编码。

---

## 核心流程

### 登录

访问受保护页 → 中间件未登录 → 保存 `redirectPath` → `/login?redirect=...` → 登录成功写 Cookie → 拉用户信息 → `navigateTo` 回原路径。

### 401

API 返回 401 → `handleApiResponse` 清状态 → 保存当前路径 → 跳转登录。

### 刷新

`init-auth.client.ts` → `fetchUserInfo()` → 从 Cookie 恢复会话。

---

## 安全要点

- Cookie：`httpOnly`；生产 `secure`；`sameSite: 'lax'`
- 重定向：仅允许站内路径（`/` 开头且非 `//`）
- 敏感信息不进 localStorage

---

## API

```
POST /api/auth/login
GET  /api/auth/logout
GET  /api/auth/me
```

需求细节见 [requirements/auth.md](./requirements/auth.md)。
