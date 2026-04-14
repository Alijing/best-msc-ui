/**
 * 用户登出接口
 * 
 * 职责：清除 HttpOnly Cookie 并返回成功响应
 * 
 * 请求信息：
 * - Method: GET
 * - Path: /api/auth/logout
 * 
 * 为什么需要服务端清除 cookie？
 * - HttpOnly Cookie 只能由服务端设置和删除
 * - 客户端 JavaScript 无法直接删除
 * - 同时通知后端使 token 失效（可选）
 */

import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

export default defineApiEventHandler({
  handler: async (event) => {
    try {
      console.log('👋 [logout] 开始处理登出请求...')
      
      // ==================== 1. 先调用后端接口使 token 失效 ====================
      console.log('🔄 [logout] 调用后端登出接口...')
      const backendResponse = await serverApiFetch(event, '/security/user/logout', { method: 'GET' }, true)
      console.log('✅ [logout] 后端登出成功:', backendResponse)
      
      // ==================== 2. 后端成功后，清除 HttpOnly Cookie ====================
      console.log('🔄 [logout] 清除本地 Cookie...')
      deleteCookie(event, 'auth_token', {
        path: '/',        // 与设置时相同的路径
        httpOnly: true    // 保持相同的配置
      })
      
      console.log('✅ [logout] Cookie 已清除')
      
      // 返回成功响应（标准格式）
      return { 
        code: 20000,
        message: '登出成功',
        data: null
      }
      
    } catch (error: any) {
      // 错误处理
      console.error('❌ [logout] 登出失败:', error)
      
      // 即使后端失败，也清除本地 Cookie（保证用户体验）
      try {
        deleteCookie(event, 'auth_token', {
          path: '/',
          httpOnly: true
        })
        console.log('⚠️ [logout] 后端失败，但本地 Cookie 已清除')
      } catch (cookieError) {
        console.error('❌ [logout] Cookie 清除失败:', cookieError)
      }
      
      throw createError({
        status: error.statusCode || 500,
        message: error.message || '登出失败，请稍后重试'
      })
    }
  }
})
