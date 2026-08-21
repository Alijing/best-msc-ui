/**
 * 客户端初始化插件
 *
 * 职责：页面加载时自动从 HttpOnly Cookie 获取用户信息并恢复登录状态
 */

export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const userStore = useUserStore()
    const isLoggedIn = useState('isLoggedIn', () => false)

    try {
      console.log('🔄 [init-auth] 开始初始化登录状态...')

      const response = await $fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('📦 [init-auth] 响应数据:', response)

      // 后端成功码为 200
      if (response.code === 200 && response.data) {
        userStore.setUserFromLoginResponse(response.data)

        console.log('📦 [init-auth] 用户信息已更新:', response.data)
        isLoggedIn.value = true
        console.log('✅ [init-auth] 登录状态已恢复，用户:', response.data.nickname || response.data.username)
      } else {
        console.warn('⚠️ [init-auth] 响应码异常:', response.code)
        throw new Error('Invalid response')
      }

    } catch (error: unknown) {
      const errorMessage = (error as { data?: { msg?: string } })?.data?.msg || (error as Error)?.message || '请求失败'
      const errorStatus = (error as { status?: number; statusCode?: number })?.status || (error as { status?: number; statusCode?: number })?.statusCode

      console.error('❌ [init-auth] 请求失败详情:', {
        message: errorMessage,
        data: (error as { data?: { msg?: string } })?.data,
        status: errorStatus
      })

      isLoggedIn.value = false
      console.log('⚠️ [init-auth] 用户未登录或 token 过期')
    }
  }
})
