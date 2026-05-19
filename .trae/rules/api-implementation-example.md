---
alwaysApply: false
description: defineApiEventHandler 完整模板 + ApiResponse 类型定义（需要时手动引用 #rule api-implementation-example）
---
# API 实现示例

## defineApiEventHandler 模板

```ts
import { z } from "zod";
import { defineApiEventHandler } from "#server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";

const querySchema = z.object({ pageIndex: z.coerce.number().default(1) });

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    return await serverApiFetch<ApiResponse<T>>(event, "/backend/path", {
      method: "GET",
      query: payload,
    });
  },
});
```

## 统一响应格式（ApiResponse）

```ts
interface ApiResponse<T = any> {
  code: number; // 20000 成功
  data: T;
  message: string;
  success: boolean;
  total?: number;
}
```
