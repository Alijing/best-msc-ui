/**
 * 字典分页
 * 后端 POST /dict/page?current&size，筛选条件放在 body
 */
import { z } from "zod";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse, ListResponse } from "~/types/api";
import type { DictRecord } from "~/stores/types/dict";

const querySchema = z.object({
  pageIndex: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  code: z.string().trim().optional(),
  desc: z.string().trim().optional(),
  type: z.coerce.number().int().min(0).max(1).optional(),
});

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const body: { code?: string; desc?: string; type?: number } = {};
    if (payload.code) {
      body.code = payload.code;
    }
    if (payload.desc) {
      body.desc = payload.desc;
    }
    if (payload.type === 0 || payload.type === 1) {
      body.type = payload.type;
    }

    return await serverApiFetch<ApiResponse<ListResponse<DictRecord>>>(event, "/dict/page", {
      method: "POST",
      query: {
        current: payload.pageIndex,
        size: payload.pageSize,
      },
      body,
    }, true);
  },
});
