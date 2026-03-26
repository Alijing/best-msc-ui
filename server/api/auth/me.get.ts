import {defineApiEventHandler} from '../../utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'

/**
 * 获取当前用户信息接口
 * GET /api/auth/me
 */
export default defineApiEventHandler({
  handler: async (event) => {
    
    try {
      // 同时返回给前端（会在浏览器控制台看到）
      return await serverApiFetch(event, '/security/user/current', {
        method: 'GET'
      })
    } catch (error: any) {
      console.error('❌ [me.get.ts] 获取当前用户信息失败:', error)

      // 向后端传递错误信息
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '获取当前用户信息失败，请稍后重试'
      })
    }

  }
})
