import {z} from 'zod'
import {defineApiEventHandler} from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'

// 登录请求验证 Schema
const LoginRequestSchema = z.object({
  account: z.string().min(5, '账号长度至少 5 位'),
  password: z.string().min(5, '密码长度至少 5 位')
})

/**
 * 用户登录接口
 * POST /api/auth/login
 * 调用真实服务端接口，并设置 HttpOnly cookie
 */
export default defineApiEventHandler({
  validation: LoginRequestSchema,
  
  handler: async (event, payload) => {
    const { account, password } = payload
    
    try {
      // 登录接口不需要 token，直接调用后端接口
      const response = await serverApiFetch(event, '/security/user/login', {
        method: 'POST',
        body: {
          account,
          password
        }
      }, false) // 第三个参数为 false 表示不携带 token

      
      // ==================== 从响应中获取 token 并设置 HttpOnly cookie ====================
      if (response.data?.token) {
        console.log('🔐 [login] 准备设置 HttpOnly Cookie')
        
        // 设置 HttpOnly Cookie
        setCookie(event, 'auth_token', response.data.token, {
          httpOnly: true,           // ✅ JavaScript 无法读取（防 XSS）
          secure: import.meta.env.PROD, // ✅ 生产环境使用 HTTPS
          sameSite: 'lax',          // ✅ 改为 lax（跨域开发环境兼容）
                                      // strict 在跨域时会阻止 cookie 发送
          path: '/',                // Cookie 路径
          maxAge: response.data.expireTime || 7200 // 默认 2 小时（秒）
        })
        
        console.log('✅ [login] HttpOnly Cookie 已设置')
      }
      
      return response
    } catch (error: any) {
      console.error('登录请求失败:', error)
      
      // 向后端传递错误信息
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '登录失败，请稍后重试'
      })
    }
  }
})
