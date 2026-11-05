/**
 * 更新字典项
 * 后端 PUT /dict/item/{id}
 */
import { z } from "zod";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";

const bodySchema = z.object({
  id: z.union([z.string().regex(/^\d+$/), z.number().int()]),
  dictId: z.union([z.string().regex(/^\d+$/), z.number().int()]),
  parentId: z.union([z.string().regex(/^\d+$/), z.number().int()]).optional(),
  val: z.string().trim().min(1, "字典项值不能为空").regex(/^[a-zA-Z0-9_]+$/, "字典项值只能包含字母、数字和下划线"),
  name: z.string().trim().min(1, "字典项名称不能为空"),
  desc: z.string().optional(),
  sort: z.coerce.number().optional(),
  allowMdf: z.coerce.number().int().min(0).max(1),
  allowDel: z.coerce.number().int().min(0).max(1),
});

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    const id = String(payload.id);
    return await serverApiFetch(event, `/dict/item/${id}`, {
      method: "PUT",
      body: {
        dictId: String(payload.dictId),
        parentId: String(payload.parentId ?? 0),
        val: payload.val,
        name: payload.name,
        desc: payload.desc?.trim() ?? "",
        sort: payload.sort ?? 0,
        allowMdf: payload.allowMdf,
        allowDel: payload.allowDel,
      },
    }, true);
  },
});
