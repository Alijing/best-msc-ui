---
alwaysApply: true
description: TypeScript 类型定义、ID 联合类型、Zod 派生、共享类型目录
---

# 类型定义与校验

## ID 字段规范

所有业务实体的 `id`、`parentId` 及相关参数统一使用 `string | number` 联合类型（兼容后端数值与字符串）。涉及精度敏感操作时，使用 `String(id)` 显式转换。

## 共享类型

- 存放目录：`stores/types/`（如 `menu.d.ts`）
- API 请求/响应类型命名：`ApiXXXRequest` / `ApiXXXResponse`

## Zod 派生类型

使用 `z.infer<typeof schema>` 避免重复定义。

## 全局类型

`types/api.d.ts` 定义通用响应结构（如 `ApiResponse`）。

## 注意

- 禁止使用 `any`，除非有明确理由。
- 优先使用自动导入的类型，无需手动 import。
