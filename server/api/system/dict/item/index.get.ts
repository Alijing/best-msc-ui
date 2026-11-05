/**
 * 字典项分页。列表型字典使用。
 * 后端 POST /dict/item/page?current&size
 */
import { z } from "zod";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse, ListResponse } from "~/types/api";
import type { DictItemRecord } from "~/stores/types/dict";

const querySchema = z.object({
  pageIndex: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  dictId: z.string().regex(/^\d+$/, "字典Id无效"),
  val: z.string().trim().optional(),
  name: z.string().trim().optional(),
  desc: z.string().trim().optional(),
});

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const body: {
      dictId: string;
      val?: string;
      name?: string;
      desc?: string;
    } = {
      dictId: payload.dictId,
    };
    if (payload.val) {
      body.val = payload.val;
    }
    if (payload.name) {
      body.name = payload.name;
    }
    if (payload.desc) {
      body.desc = payload.desc;
    }

    return await serverApiFetch<ApiResponse<ListResponse<DictItemRecord>>>(event, "/dict/item/page", {
      method: "POST",
      query: {
        current: payload.pageIndex,
        size: payload.pageSize,
      },
      body,
    }, true);
  },
});
