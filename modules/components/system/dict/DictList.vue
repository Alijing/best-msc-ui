<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { RowSelectionState } from "@tanstack/vue-table";
import type { DictRecord } from "~/stores/types/dict";
import ConfirmDialog from "~/components/ConfirmDialog.vue";

const dictStore = useDictStore();
const overlay = useOverlay();
const toast = useToast();

const queryForm = ref({
  code: "",
  desc: "",
  type: "all" as "all" | "0" | "1",
});

const typeItems = [
  { label: "全部", value: "all" },
  { label: "系统类", value: "0" },
  { label: "业务类", value: "1" },
];

const formDialogOpen = ref(false);
const currentDict = ref<DictRecord | null>(null);
const rowSelection = ref<RowSelectionState>({});

const selectedIds = computed(() =>
  Object.entries(rowSelection.value)
    .filter(([, selected]) => selected)
    .map(([id]) => id),
);

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UCheckbox = resolveComponent("UCheckbox");
const UIcon = resolveComponent("UIcon");
const UTooltip = resolveComponent("UTooltip");

const columns: TableColumn<DictRecord>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        "modelValue":
          table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            ? "indeterminate"
            : table.getIsAllRowsSelected(),
        "aria-label": "全选当前页可删除的字典",
        "onUpdate:modelValue": (value: boolean | "indeterminate") => {
          table.toggleAllRowsSelected(value === true);
        },
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        "modelValue": row.getIsSelected(),
        "disabled": !row.getCanSelect(),
        "aria-label": `选择${row.original.code}`,
        "onUpdate:modelValue": (value: boolean | "indeterminate") => {
          row.toggleSelected(value === true);
        },
      }),
    enableSorting: false,
  },
  {
    accessorKey: "code",
    header: "字典编码",
    cell: ({ row }) => row.original.code || "-",
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }) => {
      const system = row.original.type === 0;
      return h(UBadge, {
        color: system ? "neutral" : "primary",
        variant: "soft",
      }, () => (system ? "系统类" : "业务类"));
    },
  },
  {
    accessorKey: "structure",
    header: "数据结构",
    cell: ({ row }) => {
      const tree = row.original.structure === 1;
      return h(UBadge, {
        color: tree ? "warning" : "info",
        variant: "soft",
      }, () => (tree ? "树形" : "列表"));
    },
  },
  {
    accessorKey: "desc",
    header: "描述",
    cell: ({ row }) => {
      const desc = row.original.desc?.trim() || "";
      if (!desc) {
        return "-";
      }
      return h(UTooltip, { text: desc }, () =>
        h("div", { class: "max-w-[280px] truncate" }, desc),
      );
    },
  },
  {
    accessorKey: "createTime",
    header: "创建时间",
    cell: ({ row }) => formatDateTime(row.original.createTime),
  },
  {
    id: "actions",
    header: "操作",
    enableSorting: false,
    meta: {
      class: {
        th: "w-64 text-center",
        td: "w-64 text-center",
      },
    },
    cell: ({ row }) => {
      const dict = row.original;
      const buttons = [
        h(UButton, {
          variant: "ghost",
          size: "xs",
          color: "primary",
          onClick: () => openItems(dict),
        }, () => [
          h(UIcon, {
            name: dict.structure === 1
              ? "i-heroicons-share-20-solid"
              : "i-heroicons-list-bullet-20-solid",
          }),
          " 字典项",
        ]),
        h(UButton, {
          variant: "ghost",
          size: "xs",
          color: "success",
          onClick: () => handleEdit(dict),
        }, () => [
          h(UIcon, { name: "i-heroicons-pencil-square-20-solid" }),
          " 编辑",
        ]),
      ];
      if (dict.type !== 0) {
        buttons.push(h(UButton, {
          variant: "ghost",
          size: "xs",
          color: "error",
          onClick: () => handleDelete(dict),
        }, () => [
          h(UIcon, { name: "i-heroicons-trash-20-solid" }),
          " 删除",
        ]));
      }
      return h("div", { class: "flex justify-center gap-1" }, buttons);
    },
  },
];

onMounted(() => {
  void loadList();
});

function formatDateTime(value: DictRecord["createTime"]) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "string") {
    return value.replace("T", " ").replace(/\.\d+$/, "");
  }
  if (typeof value === "number") {
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0] = value;
    const pad = (part: number) => String(part).padStart(2, "0");
    return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }
  return String(value);
}

function getRowId(row: DictRecord) {
  return String(row.id);
}

function canSelectDict(row: { original: DictRecord }) {
  return row.original.type !== 0;
}

async function loadList() {
  rowSelection.value = {};
  const type = queryForm.value.type;
  await dictStore.fetchList({
    pageIndex: 1,
    code: queryForm.value.code.trim() || undefined,
    desc: queryForm.value.desc.trim() || undefined,
    type: type === "all" ? undefined : Number(type),
  });
}

function handlePageChange(pageIndex: number) {
  rowSelection.value = {};
  void dictStore.fetchList({ pageIndex });
}

function handlePageSizeChange(size: number | string) {
  const pageSize = Number(size);
  if (!Number.isFinite(pageSize)) {
    return;
  }
  rowSelection.value = {};
  void dictStore.fetchList({ pageSize, pageIndex: 1 });
}

function resetQuery() {
  queryForm.value = { code: "", desc: "", type: "all" };
  dictStore.resetQuery();
  void loadList();
}

function handleAdd() {
  currentDict.value = null;
  formDialogOpen.value = true;
}

function handleEdit(dict: DictRecord) {
  currentDict.value = dict;
  formDialogOpen.value = true;
}

function openItems(dict: DictRecord) {
  void navigateTo(`/system/dict/${encodeURIComponent(dict.code)}`);
}

async function confirmDelete(title: string, message: string) {
  const confirmDialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true,
  });
  return await confirmDialog.open({
    title,
    message,
    confirmText: "删除",
  });
}

async function removeDicts(ids: Array<string | number>, successTitle: string) {
  try {
    await dictStore.deleteDicts(ids);
    rowSelection.value = {};
    toast.add({
      title: successTitle,
      color: "success",
    });
  } catch (error: unknown) {
    toast.add({
      title: "删除失败",
      description: readApiError(error),
      color: "error",
    });
  }
}

async function handleDelete(dict: DictRecord) {
  if (dict.type === 0) {
    toast.add({
      title: "系统类字典不能删除",
      color: "warning",
    });
    return;
  }
  const confirmed = await confirmDelete(
    "删除字典",
    `确定要删除字典「${dict.code}」吗？其字典项会一并删除，此操作不可恢复。`,
  );
  if (!confirmed) {
    return;
  }
  await removeDicts([dict.id], "删除成功");
}

async function handleBatchDelete() {
  const ids = selectedIds.value;
  if (!ids.length) {
    return;
  }
  const blocked = dictStore.list.filter(
    (item) => ids.includes(String(item.id)) && item.type === 0,
  );
  if (blocked.length) {
    toast.add({
      title: "系统类字典不能删除",
      description: blocked.map((item) => item.code).join("、"),
      color: "warning",
    });
    return;
  }
  const confirmed = await confirmDelete(
    "批量删除字典",
    `确定要删除选中的 ${ids.length} 个字典吗？字典项会一并删除，此操作不可恢复。`,
  );
  if (!confirmed) {
    return;
  }
  await removeDicts(ids, "删除成功");
}
</script>

<template>
  <div class="flex h-full flex-col">
    <UCard class="shrink-0">
      <div class="flex flex-wrap gap-3">
        <UFormField label="字典编码">
          <UInput
            v-model="queryForm.code"
            placeholder="请输入编码"
            class="w-[200px]"
            @blur="loadList"
            @keyup.enter="loadList"
          />
        </UFormField>
        <UFormField label="描述">
          <UInput
            v-model="queryForm.desc"
            placeholder="请输入描述"
            class="w-[220px]"
            @blur="loadList"
            @keyup.enter="loadList"
          />
        </UFormField>
        <UFormField label="类型">
          <USelect
            v-model="queryForm.type"
            :items="typeItems"
            class="w-[140px]"
          />
        </UFormField>
        <div class="flex items-end gap-2">
          <UButton
            color="primary"
            @click="loadList"
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

    <UCard class="mt-4 flex min-h-0 flex-1 flex-col">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          字典列表
          <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ dictStore.total }} 条记录)
          </span>
        </h2>
        <div class="flex items-center gap-2">
          <UButton
            color="error"
            variant="outline"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            删除所选
            <span v-if="selectedIds.length">({{ selectedIds.length }})</span>
          </UButton>
          <UButton
            color="primary"
            @click="handleAdd"
          >
            <UIcon
              name="i-heroicons-plus-20-solid"
              class="mr-1"
            />
            新增字典
          </UButton>
        </div>
      </div>

      <TableSkeleton
        v-if="dictStore.loading && !dictStore.list.length"
        :rows="Math.min(dictStore.query.pageSize, 8)"
        :columns="columns.length"
      />
      <UTable
        v-else
        v-model:row-selection="rowSelection"
        :row-selection-options="{ enableRowSelection: canSelectDict }"
        :loading="dictStore.loading"
        loading-animation="elastic"
        :columns="columns"
        :data="dictStore.list"
        :get-row-id="getRowId"
        :enable-sorting="false"
        :virtualize="listTableVirtualize"
        empty="暂无字典"
        class="min-h-0 flex-1"
        :ui="{
          root: listTableRootClass,
          tr: 'odd:bg-gray-50/80 dark:odd:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        }"
      />

      <div class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>每页显示</span>
          <USelect
            :model-value="dictStore.query.pageSize"
            :items="[10, 20, 50, 100]"
            variant="outline"
            size="sm"
            class="w-20"
            @update:model-value="handlePageSizeChange"
          />
          <span>条</span>
        </div>
        <UPagination
          :page="dictStore.query.pageIndex"
          :total="dictStore.total"
          :items-per-page="dictStore.query.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <DictFormDialog
      v-model:open="formDialogOpen"
      :dict="currentDict"
    />
  </div>
</template>
