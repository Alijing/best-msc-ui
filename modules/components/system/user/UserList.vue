<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { User } from "~/stores/types/user-manage";
import type { TableColumn } from "@nuxt/ui";

const userManageStore = useUserManageStore();
const roleStore = useRoleStore();
const toast = useToast();

const columns: TableColumn<User>[] = [
  { accessorKey: "account", header: "账号" },
  { accessorKey: "name", header: "姓名" },
  {
    accessorKey: "phone",
    header: "电话",
    cell: ({ row }: any) => row.getValue("phone") || "-",
  },
  {
    accessorKey: "role",
    header: "角色",
    cell: ({ row }: any) => {
      const UBadge = resolveComponent("UBadge");
      return h(
        UBadge,
        {
          color: row.getValue("role") === "admin" ? "success" : "primary",
          variant: "soft",
        },
        () => row.getValue("role") || "-",
      );
    },
  },
  { accessorKey: "createTime", header: "创建时间" },
] as const;

const queryForm = ref({
  account: "",
  name: "",
  phone: "",
  role: "",
});

onMounted(async () => {
  await roleStore.fetchDict();
  await fetchList();
});

async function fetchList() {
  await userManageStore.fetchList({
    pageIndex: 1,
    account: queryForm.value.account || undefined,
    name: queryForm.value.name || undefined,
    phone: queryForm.value.phone || undefined,
    role: queryForm.value.role || undefined,
  });
}

function handlePageChange(pageIndex: number) {
  userManageStore.fetchList({ pageIndex });
}

function handlePageSizeChange(size: number) {
  userManageStore.fetchList({ pageSize: size, pageIndex: 1 });
}

function handleQuery() {
  fetchList();
}

function resetQuery() {
  queryForm.value = {
    account: "",
    name: "",
    phone: "",
    role: "",
  };
  userManageStore.resetQuery();
  fetchList();
}
</script>

<template>
  <div class="flex flex-col h-full">
    <UCard class="shrink-0">
      <div class="flex flex-wrap gap-3">
        <UFormGroup label="账号">
          <UInput
            v-model="queryForm.account"
            placeholder="请输入账号"
            clearable
            @keyup.enter="handleQuery"
          />
        </UFormGroup>
        <UFormGroup label="姓名">
          <UInput
            v-model="queryForm.name"
            placeholder="请输入姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </UFormGroup>
        <UFormGroup label="电话">
          <UInput
            v-model="queryForm.phone"
            placeholder="请输入电话"
            clearable
            @keyup.enter="handleQuery"
          />
        </UFormGroup>
        <UFormGroup label="角色">
          <USelect
            v-model="queryForm.role"
            placeholder="请选择角色"
            :items="
              roleStore.roleDict.map((item) => ({
                label: item.name,
                value: item.id,
              }))
            "
            clearable
            @update:model-value="handleQuery"
          />
        </UFormGroup>

        <div class="flex items-end gap-2">
          <UButton
            color="primary"
            class="cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            @click="handleQuery"
          >
            <UIcon name="i-heroicons-magnifying-glass-20-solid" class="mr-1" />
            查询
          </UButton>
          <UButton
            variant="outline"
            class="cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            @click="resetQuery"
          >
            重置
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard class="flex-1 min-h-0 mt-4 flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          用户列表
          <span
            class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400"
          >
            ({{ userManageStore.total }} 条记录)
          </span>
        </h2>
      </div>

      <div class="flex flex-col" style="max-height: calc(100vh - 420px)">
        <UTable
          :loading="userManageStore.loading"
          loading-animation="elastic"
          :columns="columns"
          :data="userManageStore.list || []"
          class="flex-1 min-h-0"
          sticky
          :ui="{
            tr: 'odd:bg-gray-50/80 dark:odd:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          }"
        />
      </div>

      <div
        class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div
          class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <span>每页显示</span>
          <USelect
            v-model="userManageStore.query.pageSize"
            :items="[10, 20, 50, 100]"
            variant="outline"
            size="sm"
            class="w-20"
            @update:model-value="handlePageSizeChange"
          />
          <span>条</span>
        </div>
        <UPagination
          v-model:page="userManageStore.query.pageIndex"
          :total="userManageStore.total"
          :items-per-page="userManageStore.query.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>
  </div>
</template>
