/**
 * 开启网页数据采集任务
 */
import { z } from "zod";
import { defineApiEventHandler } from "#server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse } from "~/types/api";
import type { TaskStartResponse } from "~/stores/types/crawl";

const bodySchema = z.object({
  url: z.string().trim().min(1, "请输入目标网页 URL").url("请输入有效的 URL"),
  containerSelector: z.string().trim().min(1, "请填写容器选择器"),
  itemSelector: z.string().trim().min(1, "请填写项目选择器"),
  nextUrl: z.string().trim().nullable().optional(),
  maxPages: z.number().int().min(1, "最大页数至少为 1"),
  delay: z.number().min(0, "请求间隔不能为负数"),
  concurrency: z.number().int().min(1, "并发数至少为 1"),
  withContent: z.boolean(),
  followPagination: z.boolean(),
  contentSelector: z.string().trim().nullable().optional(),
  clean: z.boolean(),
});

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch<ApiResponse<TaskStartResponse>>(
      event,
      "/crawl/webpage/tasks/start",
      {
        method: "POST",
        body: payload,
        timeout: 60000,
      },
    );
  },
});
