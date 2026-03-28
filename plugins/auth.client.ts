// 客户端认证插件 - 在页面刷新时从 localStorage 恢复登录状态并检查 token 过期
export default defineNuxtPlugin(() => {
  const isLoggedInState = useState('isLoggedIn', () => false)
  
  // 从 localStorage 读取登录标记和 token 过期时间（HttpOnly cookie 无法读取）
  if (import.meta.client) {
    const loggedIn = localStorage.getItem('isLoggedIn')
    const expireTime = localStorage.getItem('tokenExpireTime')
    
    console.log('🔍 [auth.client] 检查登录状态:', { loggedIn, expireTime })
    
    if (loggedIn === 'true' && expireTime) {
      const expireTimestamp = parseInt(expireTime, 10)
      const now = Date.now()
      
      console.log('🕐 [auth.client] 当前时间:', new Date(now).toLocaleString())
      console.log('⏰ [auth.client] 过期时间:', new Date(expireTimestamp).toLocaleString())
      console.log('⏳ [auth.client] 剩余时间:', Math.floor((expireTimestamp - now) / 1000), '秒')
      
      // 检查 token 是否过期
      if (now < expireTimestamp) {
        // 未过期，恢复登录状态
        isLoggedInState.value = true
        console.log('✅ [auth.client] Token 未过期，已恢复登录状态')
      } else {
        // 已过期，清除所有标记
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('tokenExpireTime')
        console.warn('⚠️ [auth.client] Token 已过期，请重新登录')
      }
    } else {
      console.log('ℹ️ [auth.client] 没有找到有效的登录标记')
    }
  }
})
