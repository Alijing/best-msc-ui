/**
 * 服务端中间件
 *
 * 职责：
 * - 从 cookie 读取登录态并写入 event.context
 * - 未登录的文档请求在进入 Vue 渲染前直接 302 到登录页
 */

import type { H3Event } from "h3";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

function shouldBypass(pathname: string) {
  if (
    pathname.startsWith("/_nuxt") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/__nuxt") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/_")
  ) {
    return true;
  }

  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".");
}

function isDocumentRequest(event: H3Event) {
  const dest = getRequestHeader(event, "sec-fetch-dest");
  if (dest) return dest === "document";

  const accept = getRequestHeader(event, "accept") ?? "";
  return accept.includes("text/html");
}

function toSafeReturnPath(pathname: string, search: string) {
  if (!pathname.startsWith("/") || pathname.startsWith("//") || pathname.includes("\\")) {
    return "/";
  }
  return `${pathname}${search}`;
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const { pathname } = url;

  if (shouldBypass(pathname)) {
    return;
  }

  const cookies = parseCookies(event);
  const hasToken = !!cookies.auth_token;
  event.context.isLoggedIn = hasToken;

  console.log(
    `🔍 [auth-middleware] 路径：${pathname}, 登录状态：${hasToken ? "✅" : "❌"}`,
  );

  if (hasToken || PUBLIC_PATHS.has(pathname) || !isDocumentRequest(event)) {
    return;
  }

  const returnPath = toSafeReturnPath(pathname, url.search);
  console.log(`🔒 [auth-middleware] 未登录文档请求，渲染前重定向：${returnPath}`);
  return sendRedirect(event, `/login?redirect=${encodeURIComponent(returnPath)}`, 302);
});
