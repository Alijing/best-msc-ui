<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { RowSelectionState } from "@tanstack/vue-table";
import type { Novel } from "~/stores/types/novel";
import ConfirmDialog from "~/components/ConfirmDialog.vue";

type NovelRow = Novel & {
  chapterSize?: number | null;
};

const novelStore = useNovelStore();
const overlay = useOverlay();
const toast = useToast();

const queryForm = ref({
  name: "",
});

const formDialogOpen = ref(false);
const currentNovelId = ref<string | number | null>(null);
const rowSelection = ref<RowSelectionState>({});
const downloadingId = ref<string | null>(null);

const rows = computed<NovelRow[]>(() =>
  novelStore.list.map((item) => ({
    ...item,
    chapterSize: novelStore.chapterSizes[String(item.id)],
  })),
);

const selectedIds = computed(() =>
  Object.entries(rowSelection.value)
    .filter(([, selected]) => selected)
    .map(([id]) => id),
);

const columns = computed<TableColumn<NovelRow>[]>(() => {
  const currentDownloadingId = downloadingId.value;
  const UButton = resolveComponent("UButton");
  const UCheckbox = resolveComponent("UCheckbox");
  const UIcon = resolveComponent("UIcon");
  const UTooltip = resolveComponent("UTooltip");

  return [
    {
      id: "select",
      header: ({ table }) =>
        h(UCheckbox, {
          "modelValue":
            table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
              ? "indeterminate"
              : table.getIsAllRowsSelected(),
          "aria-label": "全选当前页",
          "onUpdate:modelValue": (value: boolean | "indeterminate") => {
            table.toggleAllRowsSelected(value === true);
          },
        }),
      cell: ({ row }) =>
        h(UCheckbox, {
          "modelValue": row.getIsSelected(),
          "aria-label": `选择${row.original.name || "小说"}`,
          "onUpdate:modelValue": (value: boolean | "indeterminate") => {
            row.toggleSelected(value === true);
          },
        }),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "小说名称",
      cell: ({ row }) => row.original.name?.trim() || "-",
    },
    {
      accessorKey: "path",
      header: "目录页地址",
      cell: ({ row }) => {
        const path = row.original.path?.trim() || "";
        if (!path) {
          return "-";
        }
        const href = safeHref(path);
        return h("div", { class: "flex items-center gap-1 max-w-[420px]" }, [
          h(
            UTooltip,
            { text: path },
            () =>
              h(
                "span",
                {
                  class: "truncate text-sm",
                },
                path,
              ),
          ),
          href
            ? h(UButton, {
                to: href,
                target: "_blank",
                external: true,
                variant: "ghost",
                size: "xs",
                color: "neutral",
                icon: "i-heroicons-arrow-top-right-on-square-20-solid",
                "aria-label": "打开目录页",
              })
            : null,
        ]);
      },
    },
    {
      accessorKey: "chapterSize",
      header: "章节数",
      cell: ({ row }) => formatChapterSize(row.original.chapterSize),
    },
    {
      accessorKey: "createTime",
      header: "创建时间",
      cell: ({ row }) => formatDateTime(row.original.createTime),
    },
    {
      accessorKey: "revisionTime",
      header: "修改时间",
      cell: ({ row }) => formatDateTime(row.original.revisionTime),
    },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      meta: {
        class: {
          th: "w-56 text-center",
          td: "w-56 text-center",
        },
      },
      cell: ({ row }) => {
        const novel = row.original;
        const id = String(novel.id);
        return h("div", { class: "flex gap-1 justify-center" }, [
          h(
            UButton,
            {
              variant: "ghost",
              size: "xs",
              color: "success",
              onClick: () => handleEdit(novel),
            },
            () => [h(UIcon, { name: "i-heroicons-pencil-square-20-solid" }), " 编辑"],
          ),
          h(
            UButton,
            {
              variant: "ghost",
              size: "xs",
              color: "info",
              loading: currentDownloadingId === id,
              disabled: currentDownloadingId !== null && currentDownloadingId !== id,
              onClick: () => handleDownload(novel),
            },
            () => [h(UIcon, { name: "i-heroicons-arrow-down-tray-20-solid" }), " 下载"],
          ),
          h(
            UButton,
            {
              variant: "ghost",
              size: "xs",
              color: "error",
              onClick: () => handleDelete(novel),
            },
            () => [h(UIcon, { name: "i-heroicons-trash-20-solid" }), " 删除"],
          ),
        ]);
      },
    },
  ];
});

onMounted(() => {
  void fetchList();
});

function safeHref(path: string) {
  try {
    const url = new URL(path);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return "";
  }
  return "";
}

function formatChapterSize(value: number | null | undefined) {
  if (value === undefined) {
    return "…";
  }
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return String(value);
}

function formatDateTime(value: Novel["createTime"]) {
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

function getRowId(row: NovelRow) {
  return String(row.id);
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

function filenameFromDisposition(header: string | null, fallbackName: string) {
  const fallback = `${fallbackName.replace(/[\\/:*?"<>|]/g, "_").trim() || "novel"}.txt`;
  if (!header) {
    return fallback;
  }
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return encoded[1];
    }
  }
  const plain = header.match(/filename="?([^";]+)"?/i);
  if (plain?.[1]) {
    try {
      return decodeURIComponent(plain[1].replace(/\+/g, "%20"));
    } catch {
      return plain[1];
    }
  }
  return fallback;
}

async function fetchList() {
  rowSelection.value = {};
  await novelStore.fetchList({
    pageIndex: 1,
    name: queryForm.value.name.trim() || undefined,
  });
}

function handlePageChange(pageIndex: number) {
  rowSelection.value = {};
  void novelStore.fetchList({ pageIndex });
}

function handlePageSizeChange(size: number) {
  rowSelection.value = {};
  void novelStore.fetchList({ pageSize: size, pageIndex: 1 });
}

function handleQuery() {
  void fetchList();
}

function resetQuery() {
  queryForm.value.name = "";
  novelStore.resetQuery();
  void fetchList();
}

function handleAdd() {
  currentNovelId.value = null;
  formDialogOpen.value = true;
}

function handleEdit(novel: Novel) {
  currentNovelId.value = novel.id;
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

async function removeNovels(ids: Array<string | number>, successTitle: string) {
  const pageIndex = novelStore.query.pageIndex;
  const willEmptyPage = novelStore.list.length <= ids.length && pageIndex > 1;
  try {
    await novelStore.deleteNovels(ids);
    rowSelection.value = {};
    toast.add({
      title: successTitle,
      color: "success",
    });
    if (willEmptyPage) {
      await novelStore.fetchList({ pageIndex: pageIndex - 1 });
    }
  } catch (error: unknown) {
    toast.add({
      title: "删除失败",
      description: getErrorMessage(error),
      color: "error",
    });
  }
}

async function handleDelete(novel: Novel) {
  const name = novel.name?.trim() || "该小说";
  const confirmed = await confirmDelete(
    "删除小说",
    `确定要删除「${name}」吗？章节和正文会一并删除，此操作不可恢复。`,
  );
  if (!confirmed) {
    return;
  }
  await removeNovels([novel.id], "删除成功");
}

async function handleBatchDelete() {
  const ids = selectedIds.value;
  if (!ids.length) {
    return;
  }
  const confirmed = await confirmDelete(
    "批量删除小说",
    `确定要删除选中的 ${ids.length} 本小说吗？章节和正文会一并删除，此操作不可恢复。`,
  );
  if (!confirmed) {
    return;
  }
  await removeNovels(ids, "删除成功");
}

async function handleDownload(novel: Novel) {
  const id = String(novel.id);
  if (downloadingId.value) {
    return;
  }
  downloadingId.value = id;
  try {
    interceptApiRequest(`/api/book/novel/${id}/download`);
    const response = await $fetch.raw<Blob>(`/api/book/novel/${id}/download`, {
      responseType: "blob",
      credentials: "include",
    });
    const blob = response._data;
    if (!blob || blob.size === 0) {
      throw new Error("没有可下载的内容");
    }
    if (blob.type.includes("json") || blob.type.includes("text/html")) {
      const text = await blob.text();
      throw new Error(text || "下载失败");
    }
    const filename = filenameFromDisposition(
      response.headers.get("content-disposition"),
      novel.name?.trim() || "novel",
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.add({
      title: "开始下载",
      color: "success",
    });
  } catch (error: unknown) {
    toast.add({
      title: "下载失败",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    downloadingId.value = null;
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <UCard class="shrink-0">
      <div class="flex flex-wrap gap-3">
        <UFormField label="小说名称">
          <UInput
            v-model="queryForm.name"
            placeholder="请输入小说名称"
            class="w-[240px]"
            @blur="handleQuery"
            @keyup.enter="handleQuery"
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
      <div class="flex items-center justify-between mb-4 gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          小说列表
          <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ novelStore.total }} 条记录)
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
            新增小说
          </UButton>
        </div>
      </div>

      <div class="flex flex-col">
        <TableSkeleton
          v-if="novelStore.loading && !novelStore.list.length"
          :rows="Math.min(novelStore.query.pageSize, 8)"
          :columns="columns.length"
        />
        <UTable
          v-else
          v-model:row-selection="rowSelection"
          :loading="novelStore.loading"
          loading-animation="elastic"
          :columns="columns"
          :data="rows"
          :get-row-id="getRowId"
          :enable-sorting="false"
          :virtualize="listTableVirtualize"
          empty="暂无小说"
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
            v-model="novelStore.query.pageSize"
            :items="[10, 20, 50, 100]"
            variant="outline"
            size="sm"
            class="w-20"
            @update:model-value="handlePageSizeChange"
          />
          <span>条</span>
        </div>
        <UPagination
          v-model:page="novelStore.query.pageIndex"
          :total="novelStore.total"
          :items-per-page="novelStore.query.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <NovelFormDialog
      v-model:open="formDialogOpen"
      :novel-id="currentNovelId"
    />
  </div>
</template>
