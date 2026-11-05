/**
 * 小说字典，供采集页选择目录地址。
 */
import { defineApiEventHandler } from "#server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse } from "~/types/api";
import type { NovelDictItem } from "~/stores/types/novel";

export default defineApiEventHandler({
  handler: async (event) => {
    return await serverApiFetch<ApiResponse<NovelDictItem[]>>(
      event,
      "/novel/dict",
      {
        method: "GET",
      },
    );
  },
});
