import { defineStore } from "pinia";
import type { User, LoginResponse, TokenInfo } from "~/stores/types/user";
import type { MenuNode } from "~/stores/types/menu";
import type { ApiResponse } from "~/types/api";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const menus = ref<MenuNode[]>([]);
  const permissions = ref<string[]>([]);

  const isLoggedIn = computed(() => !!user.value);

  /**
   * 检查用户是否拥有指定权限
   * 优先使用 perms 列表检查，管理员角色直接通过
   */
  const hasPermission = (permission: string) => {
    if (!user.value) return false;
    const userPermissions = permissions.value || [];
    const userRoles = user.value.roles || [];
    return userPermissions.includes(permission) || userRoles.includes("ADMIN");
  };

  /**
   * 从登录响应中设置用户信息
   */
  function setUserFromLoginResponse(data: LoginResponse) {
    user.value = {
      id: data.userId,
      username: data.username,
      nickname: data.nickname,
      avatar: data.avatar,
      menus: data.menus,
      perms: data.perms,
      roles: data.roles,
    };
    menus.value = data.menus || [];
    permissions.value = data.perms || [];
  }

  /**
   * 获取当前用户信息（页面刷新时从 Cookie 恢复会话）
   */
  async function fetchUserInfo() {
    try {
      const response = await clientApiFetch<LoginResponse>("/api/auth/me");
      if (response.code === 200 && response.data) {
        setUserFromLoginResponse(response.data as LoginResponse);
      }
    } catch (error) {
      console.error("❌ [fetchUserInfo] 获取用户信息失败:", error);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async function login(credentials: { account: string; password: string }) {
    try {
      console.log("[login] 登录中...");

      const response = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      // 登录成功
      if (response.code === 200 && response.data) {
        const loginData = response.data as LoginResponse;
        setUserFromLoginResponse(loginData);

        const isLoggedIn = useState("isLoggedIn", () => false);
        isLoggedIn.value = true;

        console.log("✅ [login] 登录成功，用户:", loginData.username);
        return loginData as unknown as TokenInfo;
      }

      throw new Error(response.msg || "登录失败");
    } catch (error) {
      console.error("❌ [login] 登录失败:", error);
      throw error;
    }
  }

  /**
   * 用户登出
   */
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
    setUserFromLoginResponse,
    login,
    logout,
  };
});
