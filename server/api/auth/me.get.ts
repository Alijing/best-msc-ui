import { defineApiEventHandler } from "~/server/utils/defineApiEventHandler";
import { serverApiFetch } from "~/utils/api";
import { H3Event } from "h3";

/**
 * 刷新用户信息接口
 * GET /api/auth/me
 * 
 * 调用 /auth/refresh 获取当前用户信息
 * 返回格式与登录接口一致，无需额外转换
 */
export default defineApiEventHandler({
  handler: async (event: H3Event) => {
    return await serverApiFetch(event, "/auth/refresh", {
      method: "GET",
    });
  },
});
