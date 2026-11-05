<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { ExpandedState } from "@tanstack/vue-table";
import type { DictItemRecord, DictRecord } from "~/stores/types/dict";
import ConfirmDialog from "~/components/ConfirmDialog.vue";

const props = defineProps<{
  dict: DictRecord;
}>();

const dictStore = useDictStore();
const overlay = useOverlay();
const toast = useToast();

dictStore.beginTree(props.dict.id);

const keyword = ref("");
const expanded = ref<ExpandedState>({});
const formDialogOpen = ref(false);
const currentItem = ref<DictItemRecord | null>(null);
const presetParentId = ref<string>("0");
const parentOptions = ref<Array<{ label: string; value: string }>>([
  { label: "无（根节点）", value: "0" },
]);

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
const UTooltip = resolveComponent("UTooltip");

const displayTree = computed(() => filterTree(dictStore.tree, keyword.value));

const columns: TableColumn<DictItemRecord>[] = [
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) =>
      h("div", {
        class: "flex items-center gap-2",
        style: { paddingLeft: `${row.depth * 1.5}rem` },
      }, [
        h(UButton, {
          color: "neutral",
          variant: "ghost",
          size: "xs",
          icon: row.getIsExpanded() ? "i-lucide-minus" : "i-lucide-plus",
          class: row.getCanExpand() ? "" : "invisible",
          ui: {
            base: "p-0 rounded-sm",
            leadingIcon: "size-4",
          },
          onClick: row.getToggleExpandedHandler(),
        }),
        h("span", { class: "font-medium" }, row.original.name || "-"),
      ]),
  },
  {
    accessorKey: "val",
    header: "字典项值",
    cell: ({ row }) => row.original.val || "-",
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
        th: "w-72 text-center",
        td: "w-72 text-center",
      },
    },
    cell: ({ row }) => renderActions(row.original),
  },
];

watch(
  () => [keyword.value, dictStore.tree] as const,
  () => {
    if (keyword.value.trim()) {
      expanded.value = true;
      return;
    }
    const next: Record<string, boolean> = {};
    for (const node of dictStore.tree) {
      if (node.children?.length) {
        next[String(node.id)] = true;
      }
    }
    expanded.value = next;
  },
  { immediate: true },
);

onMounted(() => {
  void dictStore.fetchTree(props.dict.id);
});

function renderDesc(desc: string | null | undefined) {
  const text = desc?.trim() || "";
  if (!text) {
    return "-";
  }
  return h(UTooltip, { text }, () =>
    h("div", { class: "max-w-[220px] truncate" }, text),
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
      color: "primary",
      onClick: () => handleAdd(item),
    }, () => [
      h(UIcon, { name: "i-heroicons-plus-20-solid" }),
      " 下级",
    ]),
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

function getSubRows(row: DictItemRecord) {
  return row.children?.length ? row.children : undefined;
}

function filterTree(nodes: DictItemRecord[], rawKeyword: string): DictItemRecord[] {
  const q = rawKeyword.trim().toLowerCase();
  if (!q) {
    return nodes;
  }
  const result: DictItemRecord[] = [];
  for (const node of nodes) {
    const matched = [node.name, node.val, node.desc].some((value) =>
      value?.toLowerCase().includes(q),
    );
    if (matched) {
      result.push(node);
      continue;
    }
    const children = filterTree(node.children ?? [], rawKeyword);
    if (children.length) {
      result.push({ ...node, children });
    }
  }
  return result;
}

function findNode(nodes: DictItemRecord[], id: string): DictItemRecord | null {
  for (const node of nodes) {
    if (String(node.id) === id) {
      return node;
    }
    const child = findNode(node.children ?? [], id);
    if (child) {
      return child;
    }
  }
  return null;
}

function collectIds(item: DictItemRecord): string[] {
  return [String(item.id), ...(item.children ?? []).flatMap((child) => collectIds(child))];
}

function flattenOptions(
  nodes: DictItemRecord[],
  exclude: Set<string>,
  depth = 0,
): Array<{ label: string; value: string }> {
  const options: Array<{ label: string; value: string }> = [];
  for (const node of nodes) {
    const id = String(node.id);
    if (exclude.has(id)) {
      continue;
    }
    const prefix = depth > 0 ? `${"· ".repeat(depth)}` : "";
    options.push({
      label: `${prefix}${node.name}（${node.val}）`,
      value: id,
    });
    if (node.children?.length) {
      options.push(...flattenOptions(node.children, exclude, depth + 1));
    }
  }
  return options;
}

function buildParentOptions(excludeId?: string) {
  const exclude = new Set<string>();
  if (excludeId) {
    const node = findNode(dictStore.tree, excludeId);
    if (node) {
      collectIds(node).forEach((id) => exclude.add(id));
    }
  }
  return [
    { label: "无（根节点）", value: "0" },
    ...flattenOptions(dictStore.tree, exclude),
  ];
}

function findLocked(item: DictItemRecord): DictItemRecord | null {
  if (item.allowDel === 0) {
    return item;
  }
  for (const child of item.children ?? []) {
    const locked = findLocked(child);
    if (locked) {
      return locked;
    }
  }
  return null;
}

function countNodes(item: DictItemRecord): number {
  return 1 + (item.children ?? []).reduce((sum, child) => sum + countNodes(child), 0);
}

function handleAdd(parent?: DictItemRecord) {
  currentItem.value = null;
  presetParentId.value = parent ? String(parent.id) : "0";
  parentOptions.value = buildParentOptions();
  formDialogOpen.value = true;
}

function handleEdit(item: DictItemRecord) {
  if (item.allowMdf === 0) {
    return;
  }
  currentItem.value = item;
  presetParentId.value = item.parentId === null || item.parentId === undefined ? "0" : String(item.parentId);
  parentOptions.value = buildParentOptions(String(item.id));
  formDialogOpen.value = true;
}

async function handleDelete(item: DictItemRecord) {
  if (item.allowDel === 0) {
    toast.add({
      title: "该字典项不允许删除",
      color: "warning",
    });
    return;
  }
  const locked = findLocked(item);
  if (locked && String(locked.id) !== String(item.id)) {
    toast.add({
      title: "不能删除",
      description: `下级「${locked.name}」不允许删除`,
      color: "warning",
    });
    return;
  }
  const total = countNodes(item);
  const extra = total > 1 ? `将同时删除 ${total - 1} 个下级。` : "";
  const confirmDialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true,
  });
  const confirmed = await confirmDialog.open({
    title: "删除字典项",
    message: `确定要删除「${item.name}」吗？${extra}此操作不可恢复。`,
    confirmText: "删除",
  });
  if (!confirmed) {
    return;
  }
  try {
    await dictStore.deleteItems([item.id]);
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
</script>

<template>
  <div class="flex flex-col">
    <UCard>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          字典项树
        </h2>
        <UButton
          color="primary"
          @click="handleAdd()"
        >
          <UIcon
            name="i-heroicons-plus-20-solid"
            class="mr-1"
          />
          新增根节点
        </UButton>
      </div>

      <UInput
        v-model="keyword"
        placeholder="搜索名称、值或描述"
        icon="i-heroicons-magnifying-glass"
        class="mb-4 max-w-sm"
      />

      <TableSkeleton
        v-if="dictStore.treeLoading && !dictStore.tree.length"
        :rows="6"
        :columns="columns.length"
      />
      <UTable
        v-else
        v-model:expanded="expanded"
        :loading="dictStore.treeLoading"
        loading-animation="elastic"
        :data="displayTree"
        :columns="columns"
        :get-row-id="getRowId"
        :get-sub-rows="getSubRows"
        :enable-sorting="false"
        empty="暂无字典项"
        :ui="{
          root: listTableRootClass,
          tr: 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
        }"
      />
    </UCard>

    <DictItemFormDialog
      v-model:open="formDialogOpen"
      :dict-id="dict.id"
      :structure="1"
      :item="currentItem"
      :parent-id="presetParentId"
      :parent-options="parentOptions"
    />
  </div>
</template>
