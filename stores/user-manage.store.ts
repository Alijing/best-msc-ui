/**
 * 用户管理 Store
 */
import { defineStore } from "pinia";
import type { ApiResponse } from "~/types/api";
import type { User, UserQuery } from "~/stores/types/user-manage";

export interface UserManageState {
  list: User[];
  total: number;
  loading: boolean;
  query: UserQuery;
}

export const useUserManageStore = defineStore("user-manage", () => {
  const state = useState<UserManageState>("user-manage", () => ({
    list: [],
    total: 0,
    loading: false,
    query: {
      pageIndex: 1,
      pageSize: 10,
      account: undefined,
      name: undefined,
      phone: undefined,
      role: undefined,
    },
  }));

  /**
   * 获取用户列表
   */
  async function fetchList(query?: Partial<UserQuery>) {
    try {
      state.value.loading = true;

      if (query) {
        state.value.query = { ...state.value.query, ...query };
      }

      const response = await clientApiFetch<ApiResponse<User[]>>(
        "/api/system/user",
        {
          method: "GET",
          query: {
            pageIndex: state.value.query.pageIndex,
            pageSize: state.value.query.pageSize,
            ...(state.value.query.account && {
              account: state.value.query.account,
            }),
            ...(state.value.query.name && { name: state.value.query.name }),
            ...(state.value.query.phone && { phone: state.value.query.phone }),
            ...(state.value.query.role && { role: state.value.query.role }),
          },
        },
      );

      if (response.code === 20000) {
        state.value.list = (response.data as unknown as User[]) || [];
        state.value.total = response.total || 0;
      }
    } catch (error) {
      console.error("[UserManageStore] 获取用户列表失败:", error);
      state.value.list = [];
      state.value.total = 0;
    } finally {
      state.value.loading = false;
    }
  }

  /**
   * 重置查询条件
   */
  function resetQuery() {
    state.value.query = {
      pageIndex: 1,
      pageSize: 10,
      account: undefined,
      name: undefined,
      phone: undefined,
      role: undefined,
    };
  }

  return {
    list: computed(() => state.value.list),
    total: computed(() => state.value.total),
    loading: computed(() => state.value.loading),
    query: computed(() => state.value.query),
    fetchList,
    resetQuery,
  };
});
