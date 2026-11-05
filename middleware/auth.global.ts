/**
 * 全局认证中间件
 *
 * 职责：拦截所有路由访问，检查用户登录状态
 * - 未登录用户自动重定向到登录页
 * - 保存原始访问路径用于登录后回跳
 * - 支持 SSR 和客户端双重检查
 */

import { parseCookies } from "h3";

export default defineNuxtRouteMiddleware(async (to, _from) => {
  // ==================== 跳过内部路径 ====================
  // Vite/Nuxt 内部路径不需要认证检查
  if (
    to.path.startsWith("/@") ||
    to.path.startsWith("/_") ||
    to.path.startsWith("/__")
  ) {
    return;
  }

  // ==================== 白名单路由（不需要登录） ====================
  const publicRoutes = ["/login", "/register"];

  // 如果当前路由在白名单中，直接放行
  if (publicRoutes.includes(to.path)) {
    // 已登录用户访问登录页/注册页，重定向到首页（防止重复登录）
    if (import.meta.client && useState("isLoggedIn", () => false).value) {
      console.log("⚠️ [middleware] 已登录用户访问登录页，重定向到首页");
      return navigateTo("/");
    }
    return;
  }

  // ==================== SSR 场景：服务端检查 ====================
  // 浏览器地址栏的文档请求已由 server/middleware/auth.ts 在渲染前重定向。
  // 这里处理仍进入渲染器的请求（如 payload），并用 navigateTo 中止当前页渲染。
  if (import.meta.server) {
    const event = useRequestEvent();
    const cookies = parseCookies(event!);

    if (!cookies.auth_token) {
      console.log(
        `🔒 [middleware] SSR 检测到未登录，重定向到登录页：${to.fullPath}`,
      );
      return navigateTo(
        `/login?redirect=${encodeURIComponent(to.fullPath)}`,
        { redirectCode: 302 },
      );
    }

    // 有 token，继续渲染页面
    console.log("✅ [middleware] SSR 检测到已登录，继续渲染");
    return;
  }

  // ==================== 客户端场景 ====================
  // 在浏览器端，使用 useState 检查登录状态
  const isLoggedIn = useState("isLoggedIn", () => false);

  // 未登录，跳转到登录页并保存目标路径
  if (!isLoggedIn.value) {
    console.log(`🔒 [middleware] 客户端检测到未登录，准备跳转：${to.fullPath}`);

    // 保存用户原本要访问的路径（用于登录后回跳）
    useState("redirectPath", () => to.fullPath).value = to.fullPath;

    // 跳转到登录页，带上 redirect 参数
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // 已登录，正常访问
  console.log(`✅ [middleware] 客户端检测到已登录，允许访问：${to.fullPath}`);
  return;
});
