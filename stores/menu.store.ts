// 菜单管理 Store
import { defineStore } from "pinia";
import type { ApiResponse } from '~/types/api'
import type { MenuNode, SortMenu, UpdateMenu } from "~/stores/types/menu";

export const useMenuStore = defineStore("menu", () => {
  // State
  const menus = ref<MenuNode[]>([]);
  const selectedMenu = ref<MenuNode | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const toast = useToast();

  // Getters
  const getMenuTree = computed(() => menus.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  // Actions
  const createMenu = async (menu: UpdateMenu) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await clientApiFetch("/api/system/menu", {
        method: "POST",
        body: menu,
      });

      await fetchMenuTree();
      toast.add({
        title: "成功",
        description: "菜单创建成功",
        color: "success",
      });
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "创建菜单失败";
      toast.add({
        title: "错误",
        description: errorMessage || "创建菜单失败",
        color: "error",
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchMenuTree = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await clientApiFetch<MenuNode[]>(
        "/api/system/menu/tree",
        { method: "GET" },
      );
      menus.value = response.data || [];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "获取菜单失败";
      toast.add({
        title: "错误",
        description: errorMessage,
        color: "error",
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateMenu = async (menu: UpdateMenu) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await clientApiFetch("/api/system/menu", {
        method: "PUT",
        body: menu,
      });
      // 更新成功后刷新菜单
      await fetchMenuTree();
      toast.add({
        title: "成功",
        description: "菜单更新成功",
        color: "success",
      });
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "更新菜单失败";
      toast.add({
        title: "错误",
        description: errorMessage || "更新菜单失败",
        color: "error",
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteMenu = async (id: number | string) => {
    loading.value = true;
    error.value = null;
    try {
      if (id === undefined || id === null || id === "") {
        throw createError({
          status: 30400,
          message: "菜单ID不能为空",
        });
      }

      const response = await clientApiFetch<ApiResponse<boolean>>(
        "/api/system/menu",
        {
          method: "DELETE",
          body: { ids: [id] },
        },
      );

      if (response.code !== 200) {
        throw new Error(response.msg || "菜单删除失败");
      }

      toast.add({
        title: "成功",
        description: "菜单删除成功",
        color: "success",
      });

      await fetchMenuTree();

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "菜单删除失败";
      toast.add({
        title: "错误",
        description: errorMessage,
        color: "error",
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  const sortMenu = async (items: SortMenu[]) => {
    loading.value = true;
    error.value = null;
    try {
      // 发送排序请求
      await clientApiFetch("/api/system/menu/sort", {
        method: "POST",
        body: { items },
      });

      // 排序成功后刷新菜单树
      await fetchMenuTree();
      toast.add({
        title: "成功",
        description: "菜单排序更新成功",
        color: "success",
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "菜单排序更新失败";
      toast.add({
        title: "错误",
        description: errorMessage || "菜单排序更新失败",
        color: "error",
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  const checkPathExist = async (path: string, excludeId?: number) => {
    error.value = null;
    try {
      // 发送路径检查请求
      const response = await clientApiFetch("/api/system/menu/check-path", {
        method: "GET",
        query: { path, excludeId },
      });

      // 检查路径是否可用
      if (!response.data) {
        error.value = response.msg || "路径已存在";
        toast.add({
          title: "警告",
          description: response.msg || "路径已存在",
          color: "warning",
        });
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "路径检查失败";
      toast.add({
        title: "错误",
        description: errorMessage || "路径检查失败",
        color: "error",
      });
      throw error;
    }
  };

  const fetchMenuById = async (id: number | string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await clientApiFetch<UpdateMenu>(
        `/api/system/menu/${id}`,
        { method: "GET" },
      );
      if (response.code === 200 && response.data) {
        return response.data;
      } else {
        throw new Error(response.msg || "获取菜单详情失败");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "获取菜单详情失败";
      toast.add({
        title: "错误",
        description: errorMessage,
        color: "error",
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    menus,
    selectedMenu,
    loading,
    error,

    // Getters
    getMenuTree,
    isLoading,
    getError,

    // Actions
    createMenu,
    fetchMenuTree,
    fetchMenuById,
    updateMenu,
    deleteMenu,
    sortMenu,
    checkPathExist,
  };
});
