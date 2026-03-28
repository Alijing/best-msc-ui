export default defineNuxtRouteMiddleware((to, from) => {
  // 中间件仅用于辅助逻辑：已登录时访问登录页的重定向、保存未登录时的目标路径
  // 未登录时的页面渲染控制由 app.vue 负责，避免闪烁和不必要的 API 调用
  
  if (import.meta.client) {
    const token = useCookie('auth_token')
    
    // 检查是否已登录（同时检查 token 和 localStorage）
    let isLoggedIn = !!token.value
    
    // 如果 cookie 中没有 token，检查 localStorage
    if (!isLoggedIn) {
      const loggedIn = localStorage.getItem('isLoggedIn')
      const expireTime = localStorage.getItem('tokenExpireTime')
      
      if (loggedIn === 'true' && expireTime) {
        const expireTimestamp = parseInt(expireTime, 10)
        const now = Date.now()
        isLoggedIn = now < expireTimestamp
        
        // 如果已过期，清除标记
        if (!isLoggedIn) {
          localStorage.removeItem('isLoggedIn')
          localStorage.removeItem('tokenExpireTime')
        }
      }
    }
    
    // 如果已登录且访问的是登录页，跳转到首页
    if (isLoggedIn && to.path === '/login') {
      return navigateTo('/')
    }
    
    // 如果未登录且访问的不是登录页，保存目标路径（用于登录后跳转）
    if (!isLoggedIn && to.path !== '/login') {
      // 将完整路径（包含查询参数）保存到 sessionStorage
      sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    }
  }
})
