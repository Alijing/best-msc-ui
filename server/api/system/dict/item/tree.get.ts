/**
 * 字典项树。树形字典的二级页面使用；列表型字典的项会全部作为根节点返回。
 * 后端 GET /dict/item/tree
 */
import { z } from "zod";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse } from "~/types/api";
import type { DictItemRecord } from "~/stores/types/dict";

const querySchema = z.object({
  dictId: z.string().regex(/^\d+$/).optional(),
  code: z.string().regex(/^[a-zA-Z0-9_]+$/).optional(),
}).refine((value) => Boolean(value.dictId || value.code), {
  message: "字典Id或编码不能为空",
});

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const query: { dictId?: string; code?: string } = {};
    if (payload.dictId) {
      query.dictId = payload.dictId;
    }
    if (payload.code) {
      query.code = payload.code;
    }

    return await serverApiFetch<ApiResponse<DictItemRecord[]>>(event, "/dict/item/tree", {
      method: "GET",
      query,
    }, true);
  },
});
