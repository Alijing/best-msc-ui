/**
 * 客户端初始化插件
 * 
 * 职责：页面加载时自动从 HttpOnly Cookie 获取用户信息并恢复登录状态
 * 
 * 为什么需要这个插件？
 * - useState 在页面刷新后会丢失
 * - HttpOnly Cookie 虽然安全但 JavaScript 无法读取
 * - 所以需要在应用启动时主动调用 API 获取用户信息
 */

export default defineNuxtPlugin(async () => {
  // 只在客户端执行（浏览器环境）
  if (import.meta.client) {
    const userStore = useUserStore()
    const isLoggedIn = useState('isLoggedIn', () => false)
    
    try {
      console.log('🔄 [init-auth] 开始初始化登录状态...')
      
      // ==================== 直接调用 API，不经过拦截器 ====================
      // 使用 $fetch 直接调用，绕过 interceptApiRequest 检查
      // 因为此时 useState 还未设置，会被拦截
      console.log('🔄 [init-auth] 发起请求获取用户信息...')
      
      const response = await $fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // 自动携带 cookie（跨域必需）
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // 如果成功获取用户信息，设置 store
      console.log('📦 [init-auth] 响应数据:', response)
      
      if (response.code === 20000 && response.data) {
        // 更新用户状态
        // 注意：需要确保 userStore.user 是响应式对象
        if (userStore.user) {
          userStore.user.username = response.data.username
          userStore.user.email = response.data.email
          // 复制其他字段...
        } else {
          // 如果 user 是 null，需要重新赋值
          userStore.user = response.data
        }
        
        // ✅ 直接赋值给 ref，不要加 .value
        userStore.menus = response.data.menus || []
        userStore.permissions = response.data.permissions || []

        console.log('📦 [init-auth] 用户信息已更新:', response.data)
        // 设置登录状态为 true
        isLoggedIn.value = true
        console.log('✅ [init-auth] 登录状态已恢复，用户:', response.data.name)
      } else {
        console.warn('⚠️ [init-auth] 响应码异常:', response.code)
        // 响应码不是 20000，视为未登录
        throw new Error('Invalid response')
      }
      
    } catch (error: any) {
      // 获取失败（未登录或 token 过期）
      console.error('❌ [init-auth] 请求失败详情:', {
        message: error.message,
        data: error.data,
        status: error.status
      })
      isLoggedIn.value = false
      console.log('⚠️ [init-auth] 用户未登录或 token 过期')
      
      // 注意：这里不跳转到登录页
      // 因为有些页面可能是公开的（如首页），让中间件去处理跳转逻辑
    }
  }
})
