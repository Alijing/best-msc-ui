# 全局鉴权方案 - 实施检查清单

> 实施日期：2026-03-30  
> 状态：✅ 代码实施完成，待测试验证

---

## 📋 已完成的工作

### ✅ Phase 1: 创建核心文件（4 个文件）

#### 1. middleware/auth.global.ts
- [x] 全局认证中间件
- [x] SSR 和客户端双重检查
- [x] 自动保存重定向路径
- [x] 白名单机制
- [x] 详细注释

#### 2. plugins/init-auth.client.ts
- [x] 客户端初始化插件
- [x] 页面刷新自动恢复状态
- [x] 从 cookie 获取用户信息
- [x] 详细注释

#### 3. server/middleware/auth.ts
- [x] 服务端中间件
- [x] 解析 cookie 并注入上下文
- [x] 跳过不必要的路径
- [x] 详细注释

#### 4. server/api/auth/logout.get.ts
- [x] 登出接口
- [x] 清除 HttpOnly Cookie
- [x] 错误处理
- [x] 详细注释

---

### ✅ Phase 2: 修改现有文件（5 个文件）

#### 5. stores/user.store.ts
- [x] 移除 localStorage 存储
- [x] login 方法优化
- [x] logout 方法优化
- [x] 只使用 useState 管理状态
- [x] 详细注释

#### 6. utils/api.ts
- [x] interceptApiRequest 修复
- [x] handleApiResponse 添加重定向逻辑
- [x] 401 错误自动跳转并保存路径
- [x] 详细注释

#### 7. server/api/auth/login.post.ts
- [x] sameSite 配置从 strict 改为 lax
- [x] 添加详细注释
- [x] 优化日志输出

#### 8. components/LoginForm.vue
- [x] redirectPath 计算属性
- [x] 重定向路径验证（防开放重定向）
- [x] 登录成功后跳转逻辑
- [x] 清除 redirectPath
- [x] 详细注释

#### 9. pages/login.vue
- [x] 无需修改（保持原样）
- [x] 自动支持 query 参数

---

## 🧪 测试清单

### Phase 1: 基础功能测试

#### 测试 1: 未登录访问受保护页面
```
操作步骤：
1. 打开浏览器无痕模式
2. 访问 http://localhost:3000/dashboard

预期结果：
✅ 自动跳转到 /login?redirect=/dashboard
✅ console 显示中间件拦截日志
```

#### 测试 2: 正常登录流程
```
操作步骤：
1. 在登录页输入账号密码（admin/admin）
2. 点击登录按钮

预期结果：
✅ 表单验证通过
✅ 调用 /api/auth/login 成功
✅ 设置 HttpOnly Cookie
✅ useState('isLoggedIn') = true
✅ 跳转到 /dashboard
✅ console 显示完整的登录日志
```

#### 测试 3: 登录后回跳
```
操作步骤：
1. 未登录访问 /settings
2. 跳转到登录页
3. 登录成功

预期结果：
✅ 自动跳转回 /settings
✅ redirectPath 被清除
```

---

### Phase 2: 边界场景测试

#### 测试 4: 页面刷新状态恢复
```
操作步骤：
1. 登录成功
2. 刷新页面（F5）

预期结果：
✅ plugins/init-auth.client.ts 执行
✅ 调用 fetchUserInfo() 成功
✅ useState('isLoggedIn') 恢复为 true
✅ 页面保持登录状态
```

#### 测试 5: Token 过期处理
```
操作步骤：
1. 登录成功
2. 等待 token 过期（或手动使后端 token 失效）
3. 发起 API 请求

预期结果：
✅ 后端返回 401
✅ handleApiResponse 捕获 401
✅ 清除登录状态
✅ 保存当前路径到 redirectPath
✅ 跳转到 /login?redirect=/current/path
```

#### 测试 6: 登出功能
```
操作步骤：
1. 已登录状态
2. 点击登出按钮

预期结果：
✅ 调用 /api/auth/logout
✅ 服务端清除 HttpOnly Cookie
✅ 本地状态重置
✅ 跳转到登录页或首页
```

---

### Phase 3: 多标签页测试

#### 测试 7: 多标签页状态同步
```
操作步骤：
1. 打开两个标签页 A 和 B
2. 都登录成功
3. 在 A 标签页点击登出
4. 切换到 B 标签页并操作

预期结果：
✅ A 标签页登出成功
✅ B 标签页下次操作时触发 401
✅ B 标签页自动跳转登录页
```

---

### Phase 4: 安全性测试

#### 测试 8: XSS 防护
```
操作步骤：
1. 打开浏览器开发者工具
2. 尝试读取 document.cookie

预期结果：
✅ auth_token 不在 cookie 列表中（HttpOnly）
✅ JavaScript 无法读取 token
```

#### 测试 9: 重定向攻击防护
```
操作步骤：
1. 访问 /login?redirect=//evil.com
2. 登录成功

预期结果：
✅ 不会跳转到外部网站
✅ 使用默认值 /dashboard 或其他合法路径
```

---

## 🐛 可能的问题与解决方案

### 问题 1: 页面刷新后登录状态丢失
**原因**: plugins/init-auth.client.ts 未执行或 fetchUserInfo 失败  
**排查步骤**:
1. 检查控制台是否有 `[init-auth]` 日志
2. 检查 Network 面板 /api/auth/me 请求
3. 检查 cookie 是否正确设置

### 问题 2: 中间件死循环
**原因**: 白名单配置不正确  
**排查步骤**:
1. 检查 publicRoutes 是否包含 /login
2. 检查 isLoggedIn 状态是否正确
3. 查看控制台日志确认流程

### 问题 3: Cookie 未设置成功
**原因**: sameSite 配置问题或跨域限制  
**排查步骤**:
1. 检查 Application → Cookies 是否有 auth_token
2. 查看 login.post.ts 的日志
3. 确认后端 CORS 配置允许 credentials

### 问题 4: 登录后未跳转
**原因**: redirectPath 计算错误或 navigateTo 失败  
**排查步骤**:
1. 检查 redirectPath.value 的值
2. 查看控制台是否有跳转日志
3. 检查是否有 JavaScript 错误

---

## 📊 调试技巧

### 查看关键日志
```javascript
// 在浏览器控制台过滤日志
[middleware]      // 中间件日志
[init-auth]       // 初始化日志
[login]           // 登录日志
[logout]          // 登出日志
[handleApiResponse] // 401 处理日志
```

### 检查 Cookie
```javascript
// 注意：HttpOnly Cookie 无法通过 JS 读取
// 需要在 DevTools → Application → Cookies 中查看
```

### 检查 useState
```javascript
// 在组件中临时添加调试代码
console.log('isLoggedIn:', useState('isLoggedIn').value)
console.log('redirectPath:', useState('redirectPath').value)
```

---

## ✅ 验收标准

所有测试通过后，应该满足：

- [ ] 未登录用户无法访问任何受保护页面
- [ ] 登录后精确回到原页面
- [ ] 页面刷新后登录状态保持
- [ ] Token 过期自动跳转登录页
- [ ] 登出后完全清除状态
- [ ] 无 XSS 漏洞（HttpOnly Cookie）
- [ ] 无开放重定向漏洞
- [ ] 所有日志输出正常
- [ ] 无编译错误
- [ ] 用户体验流畅

---

## 🚀 下一步行动

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```

2. **执行 Phase 1 测试**（基础功能）

3. **记录测试结果**

4. **如有问题，查看日志并修复**

5. **全部通过后，更新开发规范文档**

---

**实施完成！准备开始测试！** 🎯
