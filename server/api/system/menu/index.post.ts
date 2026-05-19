import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import { z } from "zod";
import type { ApiResponse } from "~/types/api";

// 创建菜单验证 schema
const updateMenuSchema = z.object({
  id: z
    .union([z.number(), z.string()])
    .optional()
    .refine((val) => {
      if (val === undefined) return true;
      const numVal = typeof val === "string" ? parseInt(val) : val;
      return !isNaN(numVal) && numVal >= 0;
    }, "菜单ID必须为非负数"),
  parentId: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (val === undefined) return true;
      const numVal = typeof val === "string" ? parseInt(val) : val;
      return !isNaN(numVal) && numVal >= 0;
    }, "父级ID必须为非负数")
    .optional()
    .refine((val) => {
      if (val === undefined) return true;
      const numVal = typeof val === "string" ? parseInt(val) : val;
      return !isNaN(numVal) && numVal >= 0;
    }, "父级ID必须为非负数"),
  path: z
    .string()
    .optional()
    .refine((val) => !val || /^\/[a-zA-Z0-9_\/]+$/.test(val), {
      message: "路径格式错误，只允许输入字母、数字、下划线和斜杠",
    }),
  i18ns: z
    .array(
      z.object({
        id: z.union([z.literal(0), z.literal(1)]),
        name: z.string().min(1, "多语言名称不能为空"),
      }),
    )
    .min(1, "至少需要一个语言版本")
    .optional(),
  icon: z.string().optional(),
  permKey: z.string().optional(),
  sort: z.number().int().min(0).optional(),
});

export default defineApiEventHandler({
  // 验证请求体
  validation: updateMenuSchema,

  // 处理 POST 请求
  handler: async (event, payload) => {
    return await serverApiFetch<ApiResponse<boolean>>(event, "/sys/menu/info", {
      method: "POST",
      body: payload,
    });
  },
});
