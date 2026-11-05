<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { ManagedUser } from "~/stores/types/user-manage";
import ConfirmDialog from "~/components/ConfirmDialog.vue";

const userManageStore = useUserManageStore();
const userStore = useUserStore();
const overlay = useOverlay();
const toast = useToast();

const columns: TableColumn<ManagedUser>[] = [
  { accessorKey: "account", header: "账号" },
  {
    accessorKey: "name",
    header: "姓名",
    cell: ({ row }) => row.getValue("name") || "-",
  },
  {
    accessorKey: "phone",
    header: "电话",
    cell: ({ row }) => row.getValue("phone") || "-",
  },
  {
    accessorKey: "roleName",
    header: "角色",
    cell: ({ row }) => row.getValue("roleName") || "-",
  },
  {
    accessorKey: "department",
    header: "部门",
    cell: ({ row }) => row.getValue("department") || "-",
  },
  { accessorKey: "createTime", header: "创建时间" },
  {
    accessorKey: "actions",
    header: "操作",
    enableSorting: false,
    meta: {
      class: {
        th: "w-40 text-center",
        td: "w-40 text-center",
      },
    },
    cell: ({ row }) => {
      const user = row.original;
      return h("div", { class: "flex gap-2 justify-center" }, [
        h(
          resolveComponent("UButton"),
          {
            variant: "ghost",
            size: "xs",
            color: "success",
            onClick: () => handleEdit(user),
          },
          () => [
            h(resolveComponent("UIcon"), {
              name: "i-heroicons-pencil-square-20-solid",
            }),
            " 编辑",
          ],
        ),
        h(
          resolveComponent("UButton"),
          {
            variant: "ghost",
            size: "xs",
            color: "error",
            onClick: () => handleDelete(user),
          },
          () => [
            h(resolveComponent("UIcon"), {
              name: "i-heroicons-trash-20-solid",
            }),
            " 删除",
          ],
        ),
      ]);
    },
  },
];

const queryForm = ref({
  account: "",
  name: "",
  departmentId: undefined as string | undefined,
});

const formDialogOpen = ref(false);
const editingUser = ref<ManagedUser | null>(null);

const departmentItems = computed(() =>
  userManageStore.departments.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

onMounted(async () => {
  try {
    await userManageStore.fetchDepartments();
  } catch (error) {
    console.error("[UserList] 获取部门失败:", error);
  }
  await fetchList();
});

async function fetchList() {
  await userManageStore.fetchList({
    pageIndex: 1,
    account: queryForm.value.account || undefined,
    name: queryForm.value.name || undefined,
    departmentId: queryForm.value.departmentId || undefined,
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
    departmentId: undefined,
  };
  userManageStore.resetQuery();
  fetchList();
}

function handleAdd() {
  editingUser.value = null;
  formDialogOpen.value = true;
}

function handleEdit(user: ManagedUser) {
  editingUser.value = user;
  formDialogOpen.value = true;
}

function isCurrentUser(user: ManagedUser) {
  const current = userStore.user;
  if (!current) {
    return false;
  }
  return (
    String(current.id) === String(user.id) ||
    (!!current.username && current.username === user.account)
  );
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const detail = error as {
      message?: string;
      statusMessage?: string;
      data?: { msg?: string; message?: string };
    };
    return (
      detail.data?.msg ||
      detail.data?.message ||
      detail.statusMessage ||
      detail.message ||
      "请重试"
    );
  }
  return "请重试";
}

async function handleDelete(user: ManagedUser) {
  if (isCurrentUser(user)) {
    toast.add({
      title: "不能删除自己",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
    return;
  }

  const confirmDialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true,
  });

  const confirmed = await confirmDialog.open({
    title: "删除用户",
    message: `确定要删除用户【${user.name || user.account}】吗？此操作不可恢复。`,
    confirmText: "删除",
  });

  if (!confirmed) {
    return;
  }

  const onlyOneOnPage =
    userManageStore.list.length === 1 && userManageStore.query.pageIndex > 1;

  try {
    await userManageStore.deleteUsers([user.id]);
    toast.add({
      title: "删除成功",
      color: "success",
    });
    if (onlyOneOnPage) {
      await userManageStore.fetchList({
        pageIndex: userManageStore.query.pageIndex - 1,
      });
    }
  } catch (error: unknown) {
    toast.add({
      title: "删除失败",
      description: getErrorMessage(error),
      color: "error",
    });
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <UCard class="shrink-0">
      <div class="flex flex-wrap gap-3">
        <UFormField label="账号">
          <UInput
            v-model="queryForm.account"
            placeholder="请输入账号"
            class="w-[200px]"
            @blur="handleQuery"
            @keyup.enter="handleQuery"
          />
        </UFormField>
        <UFormField label="姓名">
          <UInput
            v-model="queryForm.name"
            placeholder="请输入姓名"
            class="w-[200px]"
            @blur="handleQuery"
            @keyup.enter="handleQuery"
          />
        </UFormField>
        <UFormField label="部门">
          <USelect
            v-model="queryForm.departmentId"
            placeholder="请选择部门"
            :items="departmentItems"
            class="w-[220px]"
            @update:model-value="handleQuery"
          />
        </UFormField>

        <div class="flex items-end gap-2">
          <UButton
            color="primary"
            @click="handleQuery"
          >
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="mr-1"
            />
            查询
          </UButton>
          <UButton
            variant="outline"
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
          <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ userManageStore.total }} 条记录)
          </span>
        </h2>
        <UButton
          color="primary"
          @click="handleAdd"
        >
          <UIcon
            name="i-heroicons-plus-20-solid"
            class="mr-1"
          />
          新增用户
        </UButton>
      </div>

      <div class="flex flex-col">
        <TableSkeleton
          v-if="userManageStore.loading && !userManageStore.list.length"
          :rows="Math.min(userManageStore.query.pageSize, 8)"
          :columns="columns.length"
        />
        <UTable
          v-else
          :loading="userManageStore.loading"
          loading-animation="elastic"
          :columns="columns"
          :data="userManageStore.list || []"
          :virtualize="listTableVirtualize"
          class="flex-1 min-h-0"
          :ui="{
            root: listTableRootClass,
            tr: 'odd:bg-gray-50/80 dark:odd:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          }"
        />
      </div>

      <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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

    <UserFormDialog
      v-model:open="formDialogOpen"
      :user="editingUser"
      @success="fetchList"
    />
  </div>
</template>
