---
alwaysApply: false
description: 通用 CRUD Store 实现示例（需要时手动 #rule pinia-crud-example 引用）
---

# 通用 CRUD Store 示例

```ts
// stores/genericCrud.store.ts
import { defineStore } from "pinia";
import type { ApiResponse } from "~/types/api";
import type { User } from "~/stores/types/user";

export const useGenericCrudStore = defineStore("genericCrud", () => {
  // state
  const list = ref<User[]>([]);
  const loading = ref(false);
  const toast = useToast();

  // 通用请求方法
  const executeRequest = async <T>(
    requestFn: () => Promise<T>,
    options?: { successMsg?: string; errorMsg?: string },
  ) => {
    loading.value = true;
    try {
      const result = await requestFn();

      if (result.code !== 20000) {
        toast.add({
          title: "错误",
          description: options.errorMsg || result.msg || "操作失败",
          color: "error",
        });
      }
      if (options?.successMsg) {
        toast.add({
          title: "成功",
          description: options.successMsg,
          color: "success",
        });
      }
      return result;
    } catch (err: any) {
      toast.add({
        title: "错误",
        description: err.message || options?.errorMsg || "操作失败",
        color: "error",
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 具体业务方法
  const fetchList = async (params: any) => {
    const response = await executeRequest(
      () =>
        clientApiFetch<ApiResponse<User[]>>("/api/list", {
          method: "GET",
          query: params,
        }),
      { successMsg: "获取列表成功", errorMsg: "获取列表失败" },
    );
    list.value = response.data || [];
  };

  // 其他方法类似...

  return { list, loading, fetchList };
});
```
