/**
 * 批量删除字典。单条删除也走这里。
 * 后端 DELETE /dict/batch，body 为 ID 数组。
 */
import { z } from "zod";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";

const bodySchema = z.object({
  ids: z.array(z.union([z.string().regex(/^\d+$/), z.number().int()])).min(1, "至少选择一个字典"),
});

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch(event, "/dict/batch", {
      method: "DELETE",
      body: payload.ids.map((id) => String(id)),
    }, true);
  },
});
