/**
 * 统一的 API 请求响应处理
 * 
 * 后端统一响应格式 R<T>：
 * { "code": 200, "msg": "ok", "data": { ... } }
 * { "code": 500, "msg": "系统异常", "data": null }
 */

import { parseCookies } from "h3";
import type { ApiResponse } from "~/types/api";
import type { H3Event } from "h3";

/**
 * API 请求拦截器 - 在客户端发起请求前检查登录状态
 */
export function interceptApiRequest(url: string, _options?: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!url) {
    return;
  }

  // 公开接口列表（不需要认证）
  const publicPaths = ["/api/auth/login", "/api/auth/register"];
  const isPublicPath = publicPaths.some((path) => url.includes(path));

  if (isPublicPath) {
    return;
  }

  const isLoggedInState = useState("isLoggedIn", () => false).value;
  if (isLoggedInState) {
    return;
  }

  console.warn(`⚠️ 拦截未登录用户的 API 请求：${url}`);
  throw new Error("用户未登录，已拦截请求");
}

/**
 * 判断 API 响应是否成功
 * 成功码：200
 */
function isSuccessCode(code: number): boolean {
  return code === 200;
}

/**
 * 处理 API 响应，当 code !== 200 时抛出错误
 * 
 * 特殊处理：
 * - 401 错误：Token 过期或无效，自动跳转到登录页
 * - 其他错误：直接抛出异常
 */
export async function handleApiResponse<T>(
  response: ApiResponse<T>,
): Promise<ApiResponse<T>> {
  if (!isSuccessCode(response.code)) {
    const errorMessage = response.msg || "请求失败";

    // 401 特殊处理：跳转到登录页
    if (response.code === 401) {
      if (typeof window !== "undefined") {
        console.log("🔒 [handleApiResponse] 检测到 401 错误，准备跳转登录页");

        useState("isLoggedIn", () => false).value = false;

        const route = useRoute();
        useState("redirectPath", () => "/").value = route.fullPath;

        await navigateTo(
          `/login?redirect=${encodeURIComponent(route.fullPath)}`,
        );
      }
    }

    throw createError({
      status: response.code,
      message: errorMessage,
    });
  }

  return response;
}

/**
 * Nuxt 客户端（浏览器）调用 Nuxt 服务端 API 请求函数
 * 通过服务端代理自动携带 HttpOnly cookie 中的 token
 */
export async function clientApiFetch<T>(
  url: string,
  options?: any,
): Promise<ApiResponse<T>> {
  if (typeof window !== "undefined") {
    interceptApiRequest(url, options);
  }

  try {
    const response = await $fetch<ApiResponse<T>>(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      timeout: 15000,
      retry: 0,
    });

    return handleApiResponse(response);
  } catch (error: any) {
    if (error.status === 404) {
      const toast = useToast();
      toast.add({
        title: "请求的资源不存在",
        description: `${url}，请检查配置是否正确`,
        color: "error",
        icon: "i-heroicons-exclamation-circle",
      });
      return Promise.resolve(error);
    }
    console.error(`API 请求失败 [${options?.method || "GET"}] ${url}:`, error);
    throw error;
  }
}

/**
 * 通用 API 请求函数（可用于服务端或客户端）
 */
export async function apiFetch<T>(
  url: string,
  options?: any,
): Promise<ApiResponse<T>> {
  if (typeof window !== "undefined") {
    interceptApiRequest(url, options);
  }

  try {
    const response = await $fetch<ApiResponse<T>>(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      timeout: 15000,
      retry: 0,
    });
    return handleApiResponse(response);
  } catch (error: any) {
    console.error(`API 请求失败 [${options?.method || "GET"}] ${url}:`, error);
    throw error;
  }
}

/**
 * Nuxt 服务端（Node.js）调用外部真实后端 API 请求函数
 */
export async function serverApiFetch<T>(
  event: H3Event,
  url: string,
  options?: any,
  withAuth: boolean = true,
): Promise<any> {
  const config = useRuntimeConfig(event);
  const BACKEND_URL = config.public.backendUrl;

  const fullUrl = url.startsWith("http") ? url : `${BACKEND_URL}${url}`;

  let token: string | null = null;

  if (withAuth) {
    const cookies = parseCookies(event);
    if (cookies.auth_token) {
      token = cookies.auth_token;
    } else {
      const authorization =
        event.headers.get("Authorization") ||
        event.headers.get("authorization");
      if (authorization) {
        token = authorization.replace("Bearer ", "");
      }
    }
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
      ...(token ? { Authorization: `${token}` } : {}),
    };
    return await $fetch<ApiResponse<T>>(fullUrl, {
      ...options,
      headers,
    });
  } catch (error: any) {
    console.error("❌ [serverApiFetch] 请求失败:", error);
    if (error.data) {
      return error.data;
    }
    return {
      code: error.statusCode || 500,
      msg: error.data?.msg || error.data?.message || error.message || "请求失败，请稍后重试",
      data: null,
    };
  }
}
