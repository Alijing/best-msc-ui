/**
 * 字典管理 Store
 * 一级是字典分页；二级按 structure 拉字典项分页或字典项树。
 */
import { defineStore } from "pinia";
import type { ListResponse } from "~/types/api";
import type {
  DictItemQuery,
  DictItemRecord,
  DictItemRequest,
  DictMeta,
  DictQuery,
  DictRecord,
  DictRequest,
} from "~/stores/types/dict";

export interface DictState {
  list: DictRecord[];
  total: number;
  loading: boolean;
  query: DictQuery;
  current: DictRecord | null;
  currentLoading: boolean;
  currentError: string;
  items: DictItemRecord[];
  itemTotal: number;
  itemLoading: boolean;
  itemQuery: DictItemQuery;
  tree: DictItemRecord[];
  treeLoading: boolean;
}

export const useDictStore = defineStore("dict", () => {
  const state = useState<DictState>("dict-manage", () => ({
    list: [],
    total: 0,
    loading: false,
    query: {
      pageIndex: 1,
      pageSize: 10,
      code: undefined,
      desc: undefined,
      type: undefined,
    },
    current: null,
    currentLoading: false,
    currentError: "",
    items: [],
    itemTotal: 0,
    itemLoading: false,
    itemQuery: {
      pageIndex: 1,
      pageSize: 10,
      dictId: "",
      val: undefined,
      name: undefined,
      desc: undefined,
    },
    tree: [],
    treeLoading: false,
  }));

  let detailGeneration = 0;
  let itemGeneration = 0;
  let treeGeneration = 0;
  let loadedTreeId = "";

  async function fetchList(query?: Partial<DictQuery>) {
    try {
      if (query) {
        state.value.query = { ...state.value.query, ...query };
      }

      const snapshot = stableQuery(state.value.query);
      const response = await withListCache(
        queryKeys.dict.list(snapshot),
        () =>
          clientApiFetch<ListResponse<DictRecord>>("/api/system/dict", {
            method: "GET",
            query: {
              pageIndex: snapshot.pageIndex,
              pageSize: snapshot.pageSize,
              ...(snapshot.code && { code: snapshot.code }),
              ...(snapshot.desc && { desc: snapshot.desc }),
              ...((snapshot.type === 0 || snapshot.type === 1) && { type: snapshot.type }),
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
      console.error("[DictStore] 获取字典列表失败:", error);
      state.value.list = [];
      state.value.total = 0;
      state.value.loading = false;
    }
  }

  async function refreshList() {
    await invalidateQuery(queryKeys.dict.lists);
    await fetchList();
  }

  async function fetchDict(code: string) {
    const generation = ++detailGeneration;
    state.value.currentLoading = true;
    state.value.currentError = "";
    state.value.current = null;

    if (!/^[a-zA-Z0-9_]+$/.test(code)) {
      state.value.currentError = "字典编码无效";
      state.value.currentLoading = false;
      return;
    }

    try {
      const response = await clientApiFetch<DictMeta>(
        `/api/system/dict/${encodeURIComponent(code)}`,
      );
      if (generation !== detailGeneration) {
        return;
      }
      if (response.code === 200 && response.data?.code) {
        state.value.current = {
          id: response.data.id,
          code: response.data.code,
          type: response.data.type === 0 ? 0 : 1,
          structure: response.data.structure === 1 ? 1 : 0,
          desc: response.data.desc ?? "",
        };
        return;
      }
      state.value.currentError = response.msg || "字典不存在";
    } catch (error) {
      console.error("[DictStore] 获取字典失败:", error);
      if (generation !== detailGeneration) {
        return;
      }
      state.value.currentError = readApiError(error, "字典不存在");
    } finally {
      if (generation === detailGeneration) {
        state.value.currentLoading = false;
      }
    }
  }

  async function createDict(payload: DictRequest) {
    const response = await clientApiFetch<string | number>("/api/system/dict", {
      method: "POST",
      body: {
        code: payload.code,
        type: payload.type,
        structure: payload.structure,
        desc: payload.desc ?? "",
      },
    });
    if (response.code !== 200) {
      throw new Error(response.msg || "新增失败");
    }
    state.value.query.pageIndex = 1;
    await refreshList();
    return response;
  }

  async function updateDict(payload: DictRequest) {
    const response = await clientApiFetch<string | number>("/api/system/dict", {
      method: "PUT",
      body: payload,
    });
    if (response.code !== 200) {
      throw new Error(response.msg || "更新失败");
    }
    await refreshList();
    return response;
  }

  async function deleteDicts(ids: Array<string | number>) {
    const response = await clientApiFetch<string>("/api/system/dict", {
      method: "DELETE",
      body: { ids: ids.map((id) => String(id)) },
    });
    if (response.code !== 200) {
      throw new Error(response.msg || "删除失败");
    }
    const pageIndex = state.value.query.pageIndex;
    if (state.value.list.length <= ids.length && pageIndex > 1) {
      state.value.query.pageIndex = pageIndex - 1;
    }
    await refreshList();
    return response;
  }

  function resetQuery() {
    state.value.query = {
      pageIndex: 1,
      pageSize: 10,
      code: undefined,
      desc: undefined,
      type: undefined,
    };
  }

  function beginItems(dictId: string | number) {
    const id = String(dictId);
    if (state.value.itemQuery.dictId === id) {
      return;
    }
    state.value.items = [];
    state.value.itemTotal = 0;
    state.value.itemLoading = true;
    state.value.itemQuery = {
      pageIndex: 1,
      pageSize: state.value.itemQuery.pageSize || 10,
      dictId: id,
      val: undefined,
      name: undefined,
      desc: undefined,
    };
  }

  function beginTree(dictId: string | number) {
    const id = String(dictId);
    if (loadedTreeId === id) {
      return;
    }
    state.value.tree = [];
    state.value.treeLoading = true;
    loadedTreeId = "";
  }

  async function fetchItems(query?: Partial<DictItemQuery>) {
    const generation = ++itemGeneration;
    try {
      if (query) {
        state.value.itemQuery = { ...state.value.itemQuery, ...query };
      }
      const snapshot = stableQuery(state.value.itemQuery);
      if (!snapshot.dictId) {
        state.value.items = [];
        state.value.itemTotal = 0;
        return;
      }

      const response = await withListCache(
        queryKeys.dict.itemList(snapshot),
        () =>
          clientApiFetch<ListResponse<DictItemRecord>>("/api/system/dict/item", {
            method: "GET",
            query: {
              pageIndex: snapshot.pageIndex,
              pageSize: snapshot.pageSize,
              dictId: snapshot.dictId,
              ...(snapshot.val && { val: snapshot.val }),
              ...(snapshot.name && { name: snapshot.name }),
              ...(snapshot.desc && { desc: snapshot.desc }),
            },
          }),
        (loading) => {
          if (generation === itemGeneration) {
            state.value.itemLoading = loading;
          }
        },
      );

      if (generation !== itemGeneration) {
        return;
      }
      if (response.code === 200) {
        state.value.items = response.data?.list ?? [];
        state.value.itemTotal = response.data?.total ?? 0;
      }
    } catch (error) {
      console.error("[DictStore] 获取字典项列表失败:", error);
      if (generation !== itemGeneration) {
        return;
      }
      state.value.items = [];
      state.value.itemTotal = 0;
      state.value.itemLoading = false;
    }
  }

  async function fetchTree(dictId?: string | number) {
    const generation = ++treeGeneration;
    const id = String(dictId ?? state.value.current?.id ?? "");
    if (!id) {
      state.value.tree = [];
      state.value.treeLoading = false;
      return;
    }
    loadedTreeId = id;

    try {
      const response = await withListCache(
        queryKeys.dict.tree(id),
        () =>
          clientApiFetch<DictItemRecord[]>("/api/system/dict/item/tree", {
            query: { dictId: id },
          }),
        (loading) => {
          if (generation === treeGeneration) {
            state.value.treeLoading = loading;
          }
        },
      );
      if (generation !== treeGeneration) {
        return;
      }
      state.value.tree = response.code === 200 ? response.data ?? [] : [];
    } catch (error) {
      console.error("[DictStore] 获取字典项树失败:", error);
      if (generation !== treeGeneration) {
        return;
      }
      state.value.tree = [];
      state.value.treeLoading = false;
    }
  }

  async function refreshItems() {
    if (state.value.current?.structure === 1) {
      await invalidateQuery(queryKeys.dict.trees);
      await fetchTree(state.value.current.id);
      return;
    }
    await invalidateQuery(queryKeys.dict.items);
    await fetchItems();
  }

  async function createItem(payload: DictItemRequest) {
    const response = await clientApiFetch<string | number>("/api/system/dict/item", {
      method: "POST",
      body: {
        dictId: String(payload.dictId),
        parentId: String(payload.parentId ?? 0),
        val: payload.val,
        name: payload.name,
        desc: payload.desc ?? "",
        sort: payload.sort ?? 0,
        allowMdf: payload.allowMdf,
        allowDel: payload.allowDel,
      },
    });
    if (response.code !== 200) {
      throw new Error(response.msg || "新增失败");
    }
    await refreshItems();
    return response;
  }

  async function updateItem(payload: DictItemRequest) {
    const response = await clientApiFetch<string | number>("/api/system/dict/item", {
      method: "PUT",
      body: {
        ...payload,
        id: payload.id !== undefined ? String(payload.id) : undefined,
        dictId: String(payload.dictId),
        parentId: String(payload.parentId ?? 0),
      },
    });
    if (response.code !== 200) {
      throw new Error(response.msg || "更新失败");
    }
    await refreshItems();
    return response;
  }

  async function deleteItems(ids: Array<string | number>) {
    const response = await clientApiFetch<string>("/api/system/dict/item", {
      method: "DELETE",
      body: { ids: ids.map((id) => String(id)) },
    });
    if (response.code !== 200) {
      throw new Error(response.msg || "删除失败");
    }
    if (state.value.current?.structure !== 1) {
      const pageIndex = state.value.itemQuery.pageIndex;
      if (state.value.items.length <= ids.length && pageIndex > 1) {
        state.value.itemQuery.pageIndex = pageIndex - 1;
      }
    }
    await refreshItems();
    return response;
  }

  return {
    list: computed(() => state.value.list),
    total: computed(() => state.value.total),
    loading: computed(() => state.value.loading),
    query: computed(() => state.value.query),
    current: computed(() => state.value.current),
    currentLoading: computed(() => state.value.currentLoading),
    currentError: computed(() => state.value.currentError),
    items: computed(() => state.value.items),
    itemTotal: computed(() => state.value.itemTotal),
    itemLoading: computed(() => state.value.itemLoading),
    itemQuery: computed(() => state.value.itemQuery),
    tree: computed(() => state.value.tree),
    treeLoading: computed(() => state.value.treeLoading),
    fetchList,
    fetchDict,
    createDict,
    updateDict,
    deleteDicts,
    resetQuery,
    beginItems,
    beginTree,
    fetchItems,
    fetchTree,
    createItem,
    updateItem,
    deleteItems,
  };
});
