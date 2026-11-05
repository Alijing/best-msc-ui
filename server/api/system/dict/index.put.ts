/**
 * 更新字典
 * 后端 PUT /dict/info/{id}
 */
import { z } from "zod";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";

const bodySchema = z.object({
  id: z.union([z.string().regex(/^\d+$/), z.number().int()]),
  code: z.string().trim().min(1, "字典编码不能为空").regex(/^[a-zA-Z0-9_]+$/, "字典编码只能包含字母、数字和下划线"),
  type: z.coerce.number().int().min(0).max(1),
  structure: z.coerce.number().int().min(0).max(1),
  desc: z.string().optional(),
});

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    const id = String(payload.id);
    return await serverApiFetch(event, `/dict/info/${id}`, {
      method: "PUT",
      body: {
        code: payload.code,
        type: payload.type,
        structure: payload.structure,
        desc: payload.desc?.trim() ?? "",
      },
    }, true);
  },
});
