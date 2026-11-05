/**
 * 客户端初始化插件
 *
 * 职责：页面加载时从 HttpOnly Cookie 恢复登录状态。
 * 登录页、注册页不阻塞挂载；会话恢复成功后再离开这些页面。
 */

import type { LoginResponse } from "~/stores/types/user";

const PUBLIC_ROUTES = ["/login", "/register"];

async function restoreSession() {
  const userStore = useUserStore();
  const isLoggedIn = useState("isLoggedIn", () => false);

  try {
    console.log("🔄 [init-auth] 开始初始化登录状态...");

    const response = await $fetch<{
      code: number;
      data?: LoginResponse;
    }>("/api/auth/me", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📦 [init-auth] 响应数据:", response);

    if (response.code === 200 && response.data) {
      userStore.setUserFromLoginResponse(response.data);
      isLoggedIn.value = true;
      console.log(
        "✅ [init-auth] 登录状态已恢复，用户:",
        response.data.nickname || response.data.username,
      );
      return true;
    }

    console.warn("⚠️ [init-auth] 响应码异常:", response.code);
    throw new Error("Invalid response");
  } catch (error: unknown) {
    const errorMessage =
      (error as { data?: { msg?: string } })?.data?.msg ||
      (error as Error)?.message ||
      "请求失败";
    const errorStatus =
      (error as { status?: number; statusCode?: number })?.status ||
      (error as { status?: number; statusCode?: number })?.statusCode;

    console.error("❌ [init-auth] 请求失败详情:", {
      message: errorMessage,
      data: (error as { data?: { msg?: string } })?.data,
      status: errorStatus,
    });

    isLoggedIn.value = false;
    console.log("⚠️ [init-auth] 用户未登录或 token 过期");
    return false;
  }
}

export default defineNuxtPlugin(() => {
  const route = useRoute();
  const restoring = restoreSession();

  if (PUBLIC_ROUTES.includes(route.path)) {
    void restoring.then((loggedIn) => {
      if (!loggedIn) return;
      if (PUBLIC_ROUTES.includes(useRoute().path)) {
        return navigateTo("/");
      }
    });
    return;
  }

  return restoring;
});
