import { defineStore } from "pinia";
import { H3Event } from "h3";
import type { User, TokenInfo } from "~/stores/types/user";
import type { MenuNode } from "~/stores/types/menu";
import type { ApiResponse } from "~/types/api";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const menus = ref<MenuNode[]>([]);
  const permissions = ref<string[]>([]);

  const isLoggedIn = computed(() => !!user.value);

  const hasPermission = (permission: string) => {
    if (!user.value) return false;
    const userPermissions = permissions.value || [];
    const userRole = user.value.role || "";
    return userPermissions.includes(permission) || userRole === "admin";
  };

  async function fetchUserInfo(event?: H3Event) {
    try {
      if (event && typeof window === "undefined") {
        const response = await serverApiFetch<ApiResponse<User>>(
          event,
          "/security/user/current",
          {
            method: "GET",
          },
        );
        user.value = response.data;
        menus.value = response.data.menus;
        permissions.value = response.data.permission || [];
      } else {
        const response =
          await clientApiFetch<ApiResponse<User>>("/api/auth/me");
        user.value = response.data as unknown as User;
        menus.value = (response.data as unknown as User).menus || [];
        permissions.value = (response.data as unknown as User).permission || [];
      }
    } catch (error) {
      console.error("❌ [fetchUserInfo] 获取用户信息失败:", error);
      throw error;
    }
  }

  async function login(credentials: { account: string; password: string }) {
    try {
      console.log("[login] 登录中...");

      const response = await apiFetch<TokenInfo>("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      const isLoggedIn = useState("isLoggedIn", () => false);
      isLoggedIn.value = true;

      await fetchUserInfo();

      console.log("✅ [login] 登录成功，用户:", credentials.account);

      return response;
    } catch (error) {
      console.error("❌ [login] 登录失败:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      console.log("👋 [logout] 开始处理登出...");

      await clientApiFetch("/api/auth/logout", { method: "GET" });

      console.log("✅ [logout] 服务端 Cookie 已清除");
    } catch (error) {
      console.error("❌ [logout] 登出请求失败:", error);
    } finally {
      user.value = null;
      menus.value = [];
      permissions.value = [];

      const isLoggedIn = useState("isLoggedIn", () => false);
      isLoggedIn.value = false;

      console.log("✅ [logout] 本地状态已重置");
    }
  }

  return {
    user,
    menus,
    permissions,
    isLoggedIn,
    hasPermission,
    fetchUserInfo,
    login,
    logout,
  };
});
