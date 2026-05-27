<template>
  <div class="menu-tree">
    <!-- 搜索框 -->
    <div class="mb-4">
      <UInput
        :model-value="nameFilterValue"
        placeholder="搜索菜单名称..."
        icon="i-heroicons-magnifying-glass"
        :ui="{ trailing: 'pe-1' }"
        @update:model-value="debouncedSearch"
      >
        <template v-if="nameFilterValue?.length" #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-circle-x"
            aria-label="Clear input"
            @click="setNameFilterValue('')"
          />
        </template>
      </UInput>
    </div>

    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:column-filters="columnFilters"
      :data="menuStore.getMenuTree"
      :columns="columns"
      :loading="menuStore.isLoading"
      :get-row-id="(row: MenuNode) => String(row.id)"
      :get-sub-rows="(row: MenuNode) => row.children || []"
      class="flex-1"
      :ui="{
        base: 'border-separate border-spacing-0',
        tbody: 'menu-tbody [&>tr]:last:[&>td]:border-b-0',
        tr: 'group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
        td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default',
      }"
    />

    <!-- 新增/编辑菜单弹窗 -->
    <MenuFormDialog
      v-model:open="showMenuDialog"
      :menu-id="currentMenuId"
      :mode="dialogMode"
      @success="onMenuSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  h,
  resolveComponent,
  ref,
  onMounted,
  useTemplateRef,
} from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useSortable } from "@vueuse/integrations/useSortable";
import type { TableColumn } from "@nuxt/ui";
import type { MenuNode } from "~/stores/types/menu";
import { useMenuStore } from "~/stores/menu.store";

const menuStore = useMenuStore();
const UTable = resolveComponent("UTable");
const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const table = useTemplateRef<any>("table");

// 菜单弹窗状态
const showMenuDialog = ref(false);
const currentMenuId = ref<number | string | null>(null);
const dialogMode = ref<"add" | "edit">("add");

// 打开新增弹窗
function openAddDialog(parentMenu?: MenuNode) {
  currentMenuId.value = parentMenu?.id || null;
  dialogMode.value = "add";
  showMenuDialog.value = true;
}

// 打开编辑弹窗
function openEditDialog(menu: MenuNode) {
  currentMenuId.value = menu.id;
  dialogMode.value = "edit";
  showMenuDialog.value = true;
}

// 菜单提交成功后的回调
function onMenuSuccess() {
  loadMenuTree();
}

// 处理删除按钮点击
function handleDeleteClick(menu: MenuNode) {
  emit("delete", menu);
}

// 拖动手柄图标
const DragHandle = h(
  "div",
  {
    class:
      "drag-handle cursor-move p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded",
  },
  [
    h(UIcon, {
      name: "i-lucide-grip-vertical",
      class: "w-4 h-4 text-gray-400",
    }),
  ],
);

// 获取名称列的过滤值
const nameFilterValue = computed(
  () => table.value?.tableApi?.getColumn("name")?.getFilterValue() as string,
);

// 设置名称列的过滤值
function setNameFilterValue(value: string) {
  table.value?.tableApi?.getColumn("name")?.setFilterValue(value);
}

// 启用拖动排序
useSortable<MenuNode>(".menu-tbody", menuStore.menus, {
  animation: 150,
  handle: ".drag-handle",
  onEnd: async (evt) => {
    const { oldIndex, newIndex } = evt;
    if (
      oldIndex === undefined ||
      newIndex === undefined ||
      oldIndex === newIndex
    ) {
      return;
    }

    const item = menuStore.menus.splice(oldIndex, 1)[0];
    if (!item) return;
    menuStore.menus.splice(newIndex, 0, item);

    const sortData = menuStore.menus.map((menu: MenuNode, index: number) => ({
      id: menu.id,
      sort: index,
    }));

    await menuStore.sortMenu(sortData);
  },
});

// 表格列定义
const columns: TableColumn<MenuNode>[] = [
  {
    accessorKey: "name",
    header: "名称",
    enableColumnFilter: true,
    // 自定义树形过滤函数
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const searchValue = filterValue.toLowerCase();

      // 递归检查节点及其所有子节点
      function checkNode(node: MenuNode): boolean {
        // 检查当前节点
        if (node.name?.toLowerCase().includes(searchValue)) {
          return true;
        }

        // 检查子节点
        if (node.children && node.children.length > 0) {
          return node.children.some((child) => checkNode(child));
        }

        return false;
      }

      return checkNode(row.original);
    },
    cell: ({ row }) => {
      return h(
        "div",
        {
          style: {
            paddingLeft: `${row.depth * 1.5}rem`,
          },
          class: "flex items-center gap-2",
        },
        [
          // 拖动手柄（仅第一级菜单显示）
          row.depth === 0 ? DragHandle : null,
          h(UButton, {
            key: `expand-${String(row.id)}-${row.getIsExpanded()}`,
            color: "neutral",
            variant: "ghost",
            size: "xs",
            icon: row.getIsExpanded() ? "i-lucide-minus" : "i-lucide-plus",
            class: !row.getCanExpand() && "invisible",
            ui: {
              base: "p-0 rounded-sm",
              leadingIcon: "size-4",
            },
            onClick: row.getToggleExpandedHandler(),
          }),
          row.original.icon
            ? h(UIcon, { name: row.original.icon, class: "w-5 h-5" })
            : null,
          h("span", { class: "font-medium" }, row.getValue("name")),
        ],
      );
    },
  },
  {
    accessorKey: "path",
    header: "菜单地址",
    cell: ({ row }) => {
      const path = row.getValue("path") as string;
      return h(
        "span",
        { class: "text-sm text-gray-600 dark:text-gray-400" },
        path || "-",
      );
    },
  },
  {
    accessorKey: "permKey",
    header: "权限Key",
    cell: ({ row }) => {
      const permKey = row.getValue("permKey") as string;
      return h(
        "span",
        { class: "text-sm text-gray-600 dark:text-gray-400" },
        permKey || "-",
      );
    },
  },
  {
    id: "actions",
    header: "操作",
    enableSorting: false,
    meta: {
      class: {
        th: "w-48 text-center",
        td: "w-48 text-center",
      },
    },
    cell: ({ row }) => {
      const menu = row.original;
      return h("div", { class: "flex gap-2 justify-center" }, [
        h(
          UButton,
          {
            size: "xs",
            variant: "ghost",
            icon: "i-heroicons-plus",
            color: "primary",
            onClick: () => openAddDialog(menu),
          },
          () => "新增",
        ),
        h(
          UButton,
          {
            size: "xs",
            variant: "ghost",
            icon: "i-heroicons-pencil",
            color: "info",
            onClick: () => openEditDialog(menu),
          },
          () => "编辑",
        ),
        h(
          UButton,
          {
            size: "xs",
            variant: "ghost",
            icon: "i-heroicons-trash",
            color: "error",
            onClick: () => handleDeleteClick(menu),
          },
          () => "删除",
        ),
      ]);
    },
  },
];

// 展开状态 - 使用行 ID 作为键
const expanded = ref<Record<string | number, boolean>>({});

// 列过滤状态
const columnFilters = ref([
  {
    id: "name",
    value: "",
  },
]);

// 防抖处理搜索
const debouncedSearch = useDebounceFn((value: string) => {
  setNameFilterValue(value);

  // 如果有搜索条件，自动展开所有匹配的节点路径
  if (value) {
    expandMatchingNodes(menuStore.getMenuTree, value.toLowerCase());
  } else {
    // 清空搜索时，只展开第一层
    const firstNodeId = menuStore.getMenuTree[0]?.id;
    expanded.value = firstNodeId ? { [firstNodeId]: true } : {};
  }
}, 500);

// 递归查找并展开匹配的节点路径
function expandMatchingNodes(nodes: MenuNode[], searchValue: string): boolean {
  let hasMatch = false;

  function checkAndExpand(
    node: MenuNode,
    parentIds: (string | number)[] = [],
  ): boolean {
    // 检查当前节点是否匹配
    const isMatch = node.name?.toLowerCase().includes(searchValue);

    // 检查子节点是否有匹配
    let hasMatchingChild = false;
    if (node.children && node.children.length > 0) {
      hasMatchingChild = node.children.some((child) =>
        checkAndExpand(child, [...parentIds, node.id]),
      );
    }

    // 如果当前节点或子节点匹配，展开父路径
    if (isMatch || hasMatchingChild) {
      hasMatch = true;
      // 展开所有父级节点
      parentIds.forEach((id) => {
        expanded.value[id] = true;
      });
      // 展开当前节点（如果有子节点）
      if (node.children && node.children.length > 0) {
        expanded.value[node.id] = true;
      }
    }

    return isMatch || hasMatchingChild;
  }

  nodes.forEach((node) => checkAndExpand(node));

  return hasMatch;
}

const emit = defineEmits<{
  delete: [node: MenuNode];
}>();

// 加载菜单树
async function loadMenuTree() {
  try {
    await menuStore.fetchMenuTree();
    // 默认展开第一层
    const firstNodeId = menuStore.getMenuTree[0]?.id;
    expanded.value = firstNodeId ? { [firstNodeId]: true } : {};
  } catch (error) {
    console.error("[MenuTree] 加载菜单树失败:", error);
  }
}

defineExpose({
  loadMenuTree,
  openAddDialog,
});

// 初始化加载菜单树
onMounted(async () => {
  await loadMenuTree();
});
</script>

<style scoped>
.menu-tree {
  width: 100%;
}
</style>
