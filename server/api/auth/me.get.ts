import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import { H3Event } from "h3";

/**
 * 获取当前用户信息接口
 * GET /api/auth/me
 */
export default defineApiEventHandler({
  handler: async (event: H3Event) => {
    // 同时返回给前端（会在浏览器控制台看到）
    return await serverApiFetch(event, "/security/user/current", {
      method: "GET",
    });
  },
});
