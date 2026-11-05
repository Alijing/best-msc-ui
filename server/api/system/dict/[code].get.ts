/**
 * 按编码读取字典概要，用来判断二级页面是列表还是树。
 * 后端 GET /dict/data/{code}
 */
import { createError } from "h3";
import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse } from "~/types/api";
import type { DictMeta } from "~/stores/types/dict";

export default defineApiEventHandler({
  handler: async (event) => {
    const code = getRouterParam(event, "code");
    if (!code || !/^[a-zA-Z0-9_]+$/.test(code)) {
      throw createError({ statusCode: 422, message: "字典编码无效" });
    }

    return await serverApiFetch<ApiResponse<DictMeta>>(event, `/dict/data/${code}`, {
      method: "GET",
    }, true);
  },
});
