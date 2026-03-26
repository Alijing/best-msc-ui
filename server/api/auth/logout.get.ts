import { defineApiEventHandler } from '../../utils/defineApiEventHandler'
import {serverApiFetch} from "~/utils/api"
import { deleteCookie } from 'h3'

/**
 * 用户登出接口
 * POST /api/auth/logout
 * 清除 HttpOnly cookie
 */
export default defineApiEventHandler({
  handler: async (event) => {
    try {
      // 调用后端登出接口
      const response = await serverApiFetch(event, '/security/user/logout', {
        method: 'GET'
      })
      
      // 清除本地 cookie
      deleteCookie(event, 'auth_token')
      
      return response
    } catch (error: any) {
      console.error('❌ [logout.post.ts] 登出失败:', error)

      // 向后端传递错误信息
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '登出失败，请稍后重试'
      })
    }
  }
})
