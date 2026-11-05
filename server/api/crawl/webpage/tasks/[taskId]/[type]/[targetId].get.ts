/**
 * 将采集结果导入目标小说。type 固定由页面传 1。
 */
import { z } from "zod";
import { createError } from "h3";
import { defineApiEventHandler } from "#server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse } from "~/types/api";

const paramsSchema = z.object({
  taskId: z.string().trim().min(1, "任务 ID 不能为空"),
  type: z.coerce.number().int("类型必须是整数"),
  targetId: z.string().trim().regex(/^\d+$/, "目标 ID 必须是数字"),
});

export default defineApiEventHandler({
  handler: async (event) => {
    const parsed = paramsSchema.safeParse({
      taskId: getRouterParam(event, "taskId"),
      type: getRouterParam(event, "type"),
      targetId: getRouterParam(event, "targetId"),
    });
    if (!parsed.success) {
      throw createError({
        statusCode: 422,
        message: parsed.error.errors[0]?.message || "参数不正确",
      });
    }

    const { taskId, type, targetId } = parsed.data;
    return await serverApiFetch<ApiResponse<null>>(
      event,
      `/crawl/webpage/tasks/${encodeURIComponent(taskId)}/${type}/${targetId}`,
      {
        timeout: 300000,
      },
    );
  },
});
