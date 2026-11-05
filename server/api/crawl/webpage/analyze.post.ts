/**
 * 网页结构分析
 */
import { z } from "zod";
import { defineApiEventHandler } from "#server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse } from "~/types/api";
import type { AnalyzeResponse } from "~/stores/types/crawl";

const bodySchema = z.object({
  url: z.string().trim().min(1, "请输入目录页 URL").url("请输入有效的 URL"),
  usePlaywright: z.boolean().optional(),
});

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch<ApiResponse<AnalyzeResponse>>(
      event,
      "/crawl/webpage/analyze",
      {
        method: "POST",
        body: {
          url: payload.url,
          usePlaywright: payload.usePlaywright ?? false,
        },
        timeout: 120000,
      },
    );
  },
});
