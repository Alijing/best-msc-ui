/**
 * 服务端中间件
 * 
 * 职责：在请求到达时从 cookie 提取 token 并注入到上下文
 * 
 * 为什么需要这个中间件？
 * - Nuxt 服务端渲染时需要知道用户登录状态
 * - 提前解析 cookie，避免每个接口都重复解析
 * - 将登录状态注入到 event.context，其他服务端代码可以直接使用
 */

export default defineEventHandler(async (event) => {
  // ==================== 跳过不必要的路径 ====================
  // 静态资源、API 路由、开发工具不需要检查
  if (
    event.path.startsWith('/_nuxt') ||      // Vite 构建文件
    event.path.startsWith('/api') ||         // API 路由（单独处理）
    event.path.startsWith('/__nuxt_devtools__') // Nuxt 开发工具
  ) {
    return
  }
  
  // ==================== 解析 Cookie ====================
  const cookies = parseCookies(event)
  const hasToken = !!cookies.auth_token
  
  // ==================== 注入到上下文 ====================
  // 这样在其他服务端代码中可以通过 event.context.isLoggedIn 访问
  event.context.isLoggedIn = hasToken
  
  // 调试日志（生产环境可以关闭）
  console.log(`🔍 [auth-middleware] 路径：${event.path}, 登录状态：${hasToken ? '✅' : '❌'}`)
})
