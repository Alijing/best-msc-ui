import { QueryClient, type QueryKey } from "@tanstack/vue-query";

export const LIST_STALE_MS = 30_000;
export const DICT_STALE_MS = 5 * 60_000;

export const listTableRootClass = "max-h-[calc(100vh-420px)] overflow-auto";

export const listTableVirtualize = { estimateSize: 64, overscan: 8 };

export function getQueryClient(): QueryClient {
  const client = useNuxtApp().$queryClient;
  if (!(client instanceof QueryClient)) {
    throw new Error("QueryClient 未注册");
  }
  return client;
}

export function stableQuery<T>(query: T): T {
  return JSON.parse(JSON.stringify(query)) as T;
}

export function cachedQuery<T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  staleTime = LIST_STALE_MS,
): Promise<T> {
  return getQueryClient().fetchQuery({
    queryKey: key,
    queryFn,
    staleTime,
  });
}

export function invalidateQuery(key: QueryKey) {
  return getQueryClient().invalidateQueries({ queryKey: key });
}

export async function withListCache<T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  staleTime = LIST_STALE_MS,
): Promise<T> {
  if (getQueryClient().getQueryData(key) === undefined) {
    setLoading(true);
  }
  try {
    return await cachedQuery(key, queryFn, staleTime);
  } finally {
    setLoading(false);
  }
}

export const queryKeys = {
  tasteVideo: {
    all: ["taste-video"] as const,
    list: (query: object) => ["taste-video", "list", query] as const,
    preview: (id: string | number) =>
      ["taste-video", "preview", String(id)] as const,
  },
  performer: {
    all: ["performer"] as const,
    list: (query: object) => ["performer", "list", query] as const,
    dict: ["performer", "dict"] as const,
  },
  role: {
    all: ["role"] as const,
    list: (query: object) => ["role", "list", query] as const,
    dict: ["role", "dict"] as const,
  },
  user: {
    all: ["user-manage"] as const,
    list: (query: object) => ["user-manage", "list", query] as const,
    departments: ["user-manage", "departments"] as const,
  },
  menu: {
    all: ["menu"] as const,
    tree: ["menu", "tree"] as const,
  },
  novel: {
    all: ["novel"] as const,
    list: (query: object) => ["novel", "list", query] as const,
    chapterSize: (id: string | number) =>
      ["novel", "chapter-size", String(id)] as const,
  },
  dict: {
    all: ["dict"] as const,
    lists: ["dict", "list"] as const,
    list: (query: object) => ["dict", "list", query] as const,
    items: ["dict", "items"] as const,
    itemList: (query: object) => ["dict", "items", query] as const,
    trees: ["dict", "tree"] as const,
    tree: (dictId: string) => ["dict", "tree", dictId] as const,
  },
};
