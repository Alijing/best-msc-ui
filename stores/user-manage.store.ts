/**
 * 用户管理 Store
 */
import { defineStore } from "pinia";
import type { ApiResponse, ListResponse } from "~/types/api";
import type {
  DepartmentNode,
  DepartmentOption,
  ManagedUser,
  UserQuery,
  UserRequest,
} from "~/stores/types/user-manage";

export interface UserManageState {
  list: ManagedUser[];
  total: number;
  loading: boolean;
  query: UserQuery;
  departments: DepartmentOption[];
}

function flattenDepartments(
  nodes: DepartmentNode[] | undefined,
  prefix = "",
): DepartmentOption[] {
  const options: DepartmentOption[] = [];
  for (const node of nodes ?? []) {
    const name = prefix ? `${prefix} / ${node.name}` : node.name;
    options.push({ id: String(node.id), name });
    if (node.children?.length) {
      options.push(...flattenDepartments(node.children, name));
    }
  }
  return options;
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
      departmentId: undefined,
    },
    departments: [],
  }));

  async function fetchList(query?: Partial<UserQuery>) {
    try {
      if (query) {
        state.value.query = { ...state.value.query, ...query };
      }

      const snapshot = stableQuery(state.value.query);
      const response = await withListCache(
        queryKeys.user.list(snapshot),
        () =>
          clientApiFetch<ApiResponse<ListResponse<ManagedUser>>>("/api/system/user", {
            method: "GET",
            query: {
              pageIndex: snapshot.pageIndex,
              pageSize: snapshot.pageSize,
              ...(snapshot.account && { account: snapshot.account }),
              ...(snapshot.name && { name: snapshot.name }),
              ...(snapshot.departmentId && {
                departmentId: snapshot.departmentId,
              }),
            },
          }),
        (loading) => {
          state.value.loading = loading;
        },
      );

      if (response.code === 200) {
        state.value.list = response.data?.list ?? [];
        state.value.total = response.data?.total ?? 0;
      }
    } catch (error) {
      console.error("[UserManageStore] 获取用户列表失败:", error);
      state.value.list = [];
      state.value.total = 0;
      state.value.loading = false;
    }
  }

  async function refreshList() {
    await invalidateQuery(queryKeys.user.all);
    await fetchList();
  }

  async function fetchDepartments() {
    const response = await cachedQuery(
      queryKeys.user.departments,
      () =>
        clientApiFetch<ApiResponse<DepartmentNode[]>>(
          "/api/system/department/simple",
          { method: "GET" },
        ),
      DICT_STALE_MS,
    );

    if (response.code === 200) {
      state.value.departments = flattenDepartments(response.data ?? []);
    }

    return state.value.departments;
  }

  async function createUser(payload: UserRequest) {
    const data = await clientApiFetch<ApiResponse<boolean>>("/api/system/user", {
      method: "POST",
      body: payload,
    });

    if (data.code === 200) {
      await refreshList();
    }

    return data;
  }

  async function updateUser(payload: UserRequest) {
    const data = await clientApiFetch<ApiResponse<boolean>>("/api/system/user", {
      method: "PUT",
      body: payload,
    });

    if (data.code === 200) {
      await refreshList();
    }

    return data;
  }

  async function deleteUsers(ids: Array<string | number>) {
    const response = await clientApiFetch<ApiResponse<boolean>>("/api/system/user", {
      method: "DELETE",
      body: { ids },
    });

    if (response.code === 200 && response.data) {
      await refreshList();
    }

    return response;
  }

  function resetQuery() {
    state.value.query = {
      pageIndex: 1,
      pageSize: 10,
      account: undefined,
      name: undefined,
      departmentId: undefined,
    };
  }

  return {
    list: computed(() => state.value.list),
    total: computed(() => state.value.total),
    loading: computed(() => state.value.loading),
    query: computed(() => state.value.query),
    departments: computed(() => state.value.departments),
    fetchList,
    fetchDepartments,
    createUser,
    updateUser,
    deleteUsers,
    resetQuery,
  };
});
