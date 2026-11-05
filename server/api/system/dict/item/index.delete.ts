/**
 * 批量删除字典项。树形字典会连同下级一起删除。
 * 后端 DELETE /dict/item/batch
 */
import { z } from "zod";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";

const bodySchema = z.object({
  ids: z.array(z.union([z.string().regex(/^\d+$/), z.number().int()])).min(1, "至少选择一个字典项"),
});

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch(event, "/dict/item/batch", {
      method: "DELETE",
      body: payload.ids.map((id) => String(id)),
    }, true);
  },
});
