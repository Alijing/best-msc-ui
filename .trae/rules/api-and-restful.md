---
alwaysApply: true
description: 客户端 API 调用、服务端 RESTful 规范、统一响应格式要点
---
# API 调用与 RESTful 规范

## 客户端
- 初始数据：优先 `useFetch`（SSR 友好）
- 交互请求：`$fetch`
- 复杂缓存：`@tanstack/vue-query`

## 服务端 API 路由
- 文件命名：`[name].[method].ts`（get, post, put, delete）
- RESTful 设计：
  - `index.get.ts` → GET /api/[module] 列表
  - `[id].get.ts` → GET /api/[module]/:id 详情
  - `index.post.ts` → POST /api/[module] 创建
  - `index.put.ts` → PUT /api/[module] 更新（body 含 id）
  - `index.delete.ts` → DELETE /api/[module] 删除（body 含 ids）
  - `[action].get.ts` → 特殊操作

## 统一响应格式要点
- 接口统一返回 `ApiResponse<T>`，其中 `code === 20000` 表示成功
- 错误处理：客户端用 `try/catch` + `useToast()` 提示；服务端自动捕获

## 实现参考
如需完整的 `defineApiEventHandler` 模板和 `ApiResponse` 类型定义，请引用规则：`#rule api-implementation-example`