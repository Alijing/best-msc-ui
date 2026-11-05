/**
 * 小说管理 Store
 */
import { defineStore } from "pinia";
import type { ApiResponse, ListResponse } from "~/types/api";
import type { Novel, NovelQuery, NovelRequest } from "~/stores/types/novel";

export interface NovelState {
  list: Novel[];
  total: number;
  loading: boolean;
  query: NovelQuery;
  chapterSizes: Record<string, number | null>;
}

export const useNovelStore = defineStore("novel", () => {
  const state = useState<NovelState>("novel-manage", () => ({
    list: [],
    total: 0,
    loading: false,
    query: {
      pageIndex: 1,
      pageSize: 10,
      name: undefined,
    },
    chapterSizes: {},
  }));

  let chapterSizeGeneration = 0;

  async function fetchList(query?: Partial<NovelQuery>) {
    try {
      if (query) {
        state.value.query = { ...state.value.query, ...query };
      }

      const snapshot = stableQuery(state.value.query);
      const response = await withListCache(
        queryKeys.novel.list(snapshot),
        () =>
          clientApiFetch<ListResponse<Novel>>("/api/book/novel", {
            method: "GET",
            query: {
              pageIndex: snapshot.pageIndex,
              pageSize: snapshot.pageSize,
              ...(snapshot.name && { name: snapshot.name }),
            },
          }),
        (loading) => {
          state.value.loading = loading;
        },
      );

      if (response.code === 200) {
        state.value.list = response.data?.list ?? [];
        state.value.total = response.data?.total ?? 0;
        void loadChapterSizes(state.value.list);
      }
    } catch (error) {
      console.error("[NovelStore] 获取小说列表失败:", error);
      state.value.list = [];
      state.value.total = 0;
      state.value.loading = false;
    }
  }

  async function refreshList() {
    chapterSizeGeneration += 1;
    state.value.chapterSizes = {};
    await invalidateQuery(queryKeys.novel.all);
    await fetchList();
  }

  async function loadChapterSizes(novels: Novel[]) {
    const generation = chapterSizeGeneration;
    const pending = novels.filter((item) => {
      const key = String(item.id);
      return !(key in state.value.chapterSizes);
    });
    const queue = [...pending];
    const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
      while (queue.length > 0) {
        const novel = queue.shift();
        if (!novel || generation !== chapterSizeGeneration) {
          return;
        }
        const key = String(novel.id);
        if (key in state.value.chapterSizes) {
          continue;
        }
        try {
          const response = await clientApiFetch<number>(
            `/api/book/novel/${key}/chapters/size`,
          );
          if (generation !== chapterSizeGeneration) {
            return;
          }
          state.value.chapterSizes = {
            ...state.value.chapterSizes,
            [key]: response.code === 200 ? Number(response.data ?? 0) : null,
          };
        } catch (error) {
          console.error("[NovelStore] 获取章节数失败:", error);
          if (generation === chapterSizeGeneration) {
            state.value.chapterSizes = {
              ...state.value.chapterSizes,
              [key]: null,
            };
          }
        }
      }
    });
    await Promise.all(workers);
  }

  async function fetchNovelById(id: string | number): Promise<Novel | null> {
    const response = await clientApiFetch<Novel>(`/api/book/novel/${id}`);
    if (response.code === 200 && response.data) {
      return response.data;
    }
    return null;
  }

  async function createNovel(payload: NovelRequest) {
    const data = await clientApiFetch<string | number>("/api/book/novel", {
      method: "POST",
      body: {
        name: payload.name,
        path: payload.path,
      },
    });

    if (data.code === 200) {
      state.value.query.pageIndex = 1;
      await refreshList();
    }

    return data;
  }

  async function updateNovel(payload: NovelRequest) {
    const data = await clientApiFetch<string | number>("/api/book/novel", {
      method: "PUT",
      body: payload,
    });

    if (data.code === 200) {
      await refreshList();
    }

    return data;
  }

  async function deleteNovels(ids: Array<string | number>) {
    const response = await clientApiFetch<boolean>("/api/book/novel", {
      method: "DELETE",
      body: { ids },
    });

    if (response.code === 200) {
      await refreshList();
    }

    return response;
  }

  function resetQuery() {
    state.value.query = {
      pageIndex: 1,
      pageSize: 10,
      name: undefined,
    };
  }

  return {
    list: computed(() => state.value.list),
    total: computed(() => state.value.total),
    loading: computed(() => state.value.loading),
    query: computed(() => state.value.query),
    chapterSizes: computed(() => state.value.chapterSizes),
    fetchList,
    fetchNovelById,
    createNovel,
    updateNovel,
    deleteNovels,
    resetQuery,
  };
});
