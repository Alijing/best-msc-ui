/**
 * 移除网页数据采集任务
 */
import { z } from "zod";
import { createError } from "h3";
import { defineApiEventHandler } from "#server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import type { ApiResponse } from "~/types/api";
import type { TaskDeleted } from "~/stores/types/crawl";

const taskIdSchema = z.string().trim().min(1, "任务 ID 不能为空");

export default defineApiEventHandler({
  handler: async (event) => {
    const parsed = taskIdSchema.safeParse(getRouterParam(event, "taskId"));
    if (!parsed.success) {
      throw createError({
        statusCode: 422,
        message: "任务 ID 不能为空",
      });
    }

    return await serverApiFetch<ApiResponse<TaskDeleted>>(
      event,
      `/crawl/webpage/tasks/${encodeURIComponent(parsed.data)}`,
      {
        method: "DELETE",
      },
    );
  },
});
