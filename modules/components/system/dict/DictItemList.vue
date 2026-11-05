<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { RowSelectionState } from "@tanstack/vue-table";
import type { DictItemRecord, DictRecord } from "~/stores/types/dict";
import ConfirmDialog from "~/components/ConfirmDialog.vue";

const props = defineProps<{
  dict: DictRecord;
}>();

const dictStore = useDictStore();
const overlay = useOverlay();
const toast = useToast();

const queryForm = ref({
  val: "",
  name: "",
  desc: "",
});

dictStore.beginItems(props.dict.id);

const formDialogOpen = ref(false);
const currentItem = ref<DictItemRecord | null>(null);
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

const columns: TableColumn<DictItemRecord>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        "modelValue":
          table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            ? "indeterminate"
            : table.getIsAllRowsSelected(),
        "aria-label": "全选当前页可删除的字典项",
        "onUpdate:modelValue": (value: boolean | "indeterminate") => {
          table.toggleAllRowsSelected(value === true);
        },
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        "modelValue": row.getIsSelected(),
        "disabled": !row.getCanSelect(),
        "aria-label": `选择${row.original.name}`,
        "onUpdate:modelValue": (value: boolean | "indeterminate") => {
          row.toggleSelected(value === true);
        },
      }),
    enableSorting: false,
  },
  {
    accessorKey: "val",
    header: "字典项值",
    cell: ({ row }) => row.original.val || "-",
  },
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) => row.original.name || "-",
  },
  {
    accessorKey: "desc",
    header: "描述",
    cell: ({ row }) => renderDesc(row.original.desc),
  },
  {
    accessorKey: "sort",
    header: "排序",
    cell: ({ row }) => formatSort(row.original.sort),
  },
  {
    accessorKey: "allowMdf",
    header: "允许修改",
    cell: ({ row }) => renderFlag(row.original.allowMdf),
  },
  {
    accessorKey: "allowDel",
    header: "允许删除",
    cell: ({ row }) => renderFlag(row.original.allowDel),
  },
  {
    id: "actions",
    header: "操作",
    enableSorting: false,
    meta: {
      class: {
        th: "w-44 text-center",
        td: "w-44 text-center",
      },
    },
    cell: ({ row }) => renderActions(row.original),
  },
];

onMounted(() => {
  void loadList();
});

function renderDesc(desc: string | null | undefined) {
  const text = desc?.trim() || "";
  if (!text) {
    return "-";
  }
  return h(UTooltip, { text }, () =>
    h("div", { class: "max-w-[240px] truncate" }, text),
  );
}

function renderFlag(value: number) {
  const allowed = value !== 0;
  return h(UBadge, {
    color: allowed ? "success" : "neutral",
    variant: "soft",
  }, () => (allowed ? "允许" : "禁止"));
}

function renderActions(item: DictItemRecord) {
  return h("div", { class: "flex justify-center gap-1" }, [
    h(UButton, {
      variant: "ghost",
      size: "xs",
      color: "success",
      disabled: item.allowMdf === 0,
      onClick: () => handleEdit(item),
    }, () => [
      h(UIcon, { name: "i-heroicons-pencil-square-20-solid" }),
      " 编辑",
    ]),
    h(UButton, {
      variant: "ghost",
      size: "xs",
      color: "error",
      disabled: item.allowDel === 0,
      onClick: () => handleDelete(item),
    }, () => [
      h(UIcon, { name: "i-heroicons-trash-20-solid" }),
      " 删除",
    ]),
  ]);
}

function formatSort(value: DictItemRecord["sort"]) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

function getRowId(row: DictItemRecord) {
  return String(row.id);
}

function canSelectItem(row: { original: DictItemRecord }) {
  return row.original.allowDel !== 0;
}

async function loadList() {
  rowSelection.value = {};
  await dictStore.fetchItems({
    pageIndex: 1,
    dictId: String(props.dict.id),
    val: queryForm.value.val.trim() || undefined,
    name: queryForm.value.name.trim() || undefined,
    desc: queryForm.value.desc.trim() || undefined,
  });
}

function handlePageChange(pageIndex: number) {
  rowSelection.value = {};
  void dictStore.fetchItems({ pageIndex });
}

function handlePageSizeChange(size: number | string) {
  const pageSize = Number(size);
  if (!Number.isFinite(pageSize)) {
    return;
  }
  rowSelection.value = {};
  void dictStore.fetchItems({ pageSize, pageIndex: 1 });
}

function resetQuery() {
  queryForm.value = { val: "", name: "", desc: "" };
  void dictStore.fetchItems({
    pageIndex: 1,
    pageSize: 10,
    dictId: String(props.dict.id),
    val: undefined,
    name: undefined,
    desc: undefined,
  });
  rowSelection.value = {};
}

function handleAdd() {
  currentItem.value = null;
  formDialogOpen.value = true;
}

function handleEdit(item: DictItemRecord) {
  if (item.allowMdf === 0) {
    return;
  }
  currentItem.value = item;
  formDialogOpen.value = true;
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

async function removeItems(ids: Array<string | number>) {
  try {
    await dictStore.deleteItems(ids);
    rowSelection.value = {};
    toast.add({
      title: "删除成功",
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

async function handleDelete(item: DictItemRecord) {
  if (item.allowDel === 0) {
    toast.add({
      title: "该字典项不允许删除",
      color: "warning",
    });
    return;
  }
  const confirmed = await confirmDelete(
    "删除字典项",
    `确定要删除「${item.name}」吗？此操作不可恢复。`,
  );
  if (!confirmed) {
    return;
  }
  await removeItems([item.id]);
}

async function handleBatchDelete() {
  const ids = selectedIds.value;
  if (!ids.length) {
    return;
  }
  const blocked = dictStore.items.filter(
    (item) => ids.includes(String(item.id)) && item.allowDel === 0,
  );
  if (blocked.length) {
    toast.add({
      title: "包含不允许删除的字典项",
      description: blocked.map((item) => item.name).join("、"),
      color: "warning",
    });
    return;
  }
  const confirmed = await confirmDelete(
    "批量删除字典项",
    `确定要删除选中的 ${ids.length} 个字典项吗？此操作不可恢复。`,
  );
  if (!confirmed) {
    return;
  }
  await removeItems(ids);
}
</script>

<template>
  <div class="flex flex-col">
    <UCard class="shrink-0">
      <div class="flex flex-wrap gap-3">
        <UFormField label="字典项值">
          <UInput
            v-model="queryForm.val"
            placeholder="请输入值"
            class="w-[180px]"
            @keyup.enter="loadList"
          />
        </UFormField>
        <UFormField label="名称">
          <UInput
            v-model="queryForm.name"
            placeholder="请输入名称"
            class="w-[180px]"
            @keyup.enter="loadList"
          />
        </UFormField>
        <UFormField label="描述">
          <UInput
            v-model="queryForm.desc"
            placeholder="请输入描述"
            class="w-[200px]"
            @keyup.enter="loadList"
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

    <UCard class="mt-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          字典项
          <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ dictStore.itemTotal }} 条记录)
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
            新增字典项
          </UButton>
        </div>
      </div>

      <TableSkeleton
        v-if="dictStore.itemLoading && !dictStore.items.length"
        :rows="Math.min(dictStore.itemQuery.pageSize, 8)"
        :columns="columns.length"
      />
      <UTable
        v-else
        v-model:row-selection="rowSelection"
        :row-selection-options="{ enableRowSelection: canSelectItem }"
        :loading="dictStore.itemLoading"
        loading-animation="elastic"
        :columns="columns"
        :data="dictStore.items"
        :get-row-id="getRowId"
        :enable-sorting="false"
        :virtualize="listTableVirtualize"
        empty="暂无字典项"
        :ui="{
          root: listTableRootClass,
          tr: 'odd:bg-gray-50/80 dark:odd:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        }"
      />

      <div class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>每页显示</span>
          <USelect
            :model-value="dictStore.itemQuery.pageSize"
            :items="[10, 20, 50, 100]"
            variant="outline"
            size="sm"
            class="w-20"
            @update:model-value="handlePageSizeChange"
          />
          <span>条</span>
        </div>
        <UPagination
          :page="dictStore.itemQuery.pageIndex"
          :total="dictStore.itemTotal"
          :items-per-page="dictStore.itemQuery.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <DictItemFormDialog
      v-model:open="formDialogOpen"
      :dict-id="dict.id"
      :structure="dict.structure"
      :item="currentItem"
    />
  </div>
</template>
