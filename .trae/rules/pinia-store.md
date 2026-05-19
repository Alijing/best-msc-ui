---
alwaysApply: true
description: Pinia 状态管理规范（命名、定义方式、已存在 stores）
---

# Pinia 状态管理规范

## 文件命名
`[name].store.ts`（如 `user.store.ts`）

## 定义方式
使用 `defineStore` + Composition API 风格。

## 已存在的 stores
- `user`、`app`、`menu`、`role`、`user-manage`、`tasteVideo`

## 注意事项
- Store 内统一处理 loading / error / toast
- 调用接口后需根据 `code === 20000` 判断成功
- 可参考项目中已有 store 实现具体逻辑，或参考代码示例，请引用规则：`#rule pinia-crud-example`