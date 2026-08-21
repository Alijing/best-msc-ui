<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { useDebounceFn } from "@vueuse/core";
import type { TasteVideo, VideoStatus } from "~/stores/types/tasteVideo";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import type { TableColumn } from "@nuxt/ui";

const tasteVideoStore = useTasteVideoStore();
const overlay = useOverlay();
const toast = useToast();

const confirmDialog = overlay.create(ConfirmDialog, {
  destroyOnClose: true,
});

const df = new DateFormatter("zh-CN", { dateStyle: "medium" });

const columns: TableColumn<TasteVideo>[] = [
  { accessorKey: "number", header: "车牌号" },
  {
    accessorKey: "name",
    header: "视频名称",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const UTooltip = resolveComponent("UTooltip");

      return h(
        UTooltip,
        {
          text: name,
        },
        () =>
          h(
            "div",
            {
              style: {
                cursor: "pointer",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "300px",
              },
            },
            name,
          ),
      );
    },
  },
  { accessorKey: "performer", header: "演员" },
  {
    accessorKey: "releaseDate",
    header: "发行时间",
    cell: ({ row }: any) =>
      new Date(row.getValue("releaseDate")).toLocaleDateString("zh-CN"),
  },
  {
    accessorKey: "rating",
    header: "评分",
    cell: ({ row }: any) =>
      h(
        "div",
        { class: "flex gap-1" },
        Array.from({ length: 5 }).map((_, i) => {
          const star = i + 1;
          return h(
            "span",
            {
              class:
                star <= row.getValue("rating")
                  ? "text-yellow-500"
                  : "text-gray-300",
            },
            star <= row.getValue("rating") ? "★" : "☆",
          );
        }),
      ),
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      console.log(status);
      const colorMap = { 未下载: "primary", 已下载: "info", 已观看: "error" };
      return h(
        resolveComponent("UBadge"),
        {
          color: colorMap[status as keyof typeof colorMap],
          class: "capitalize",
        },
        () => status,
      );
    },
  },
  {
    accessorKey: "actions",
    header: "操作",
    enableSorting: false,
    meta: {
      class: {
        th: "w-32 text-center",
        td: "w-32 text-center",
      },
    },
    cell: ({ row }: any) => {
      const video = row.original as TasteVideo;
      return h("div", { class: "flex gap-2" }, [
        h(
          resolveComponent("UButton"),
          {
            variant: "ghost",
            size: "sm",
            onClick: () => handlePreview(video),
          },
          () => [
            h(resolveComponent("UIcon"), { name: "i-heroicons-eye-20-solid" }),
            " 预览",
          ],
        ),
        h(
          resolveComponent("UButton"),
          {
            variant: "ghost",
            size: "sm",
            color: "info",
            onClick: () => handleDownload(video),
          },
          () => [
            h(resolveComponent("UIcon"), {
              name: "i-heroicons-arrow-down-tray-20-solid",
            }),
            " 下载",
          ],
        ),
        h(
          resolveComponent("UButton"),
          {
            variant: "ghost",
            size: "sm",
            color: "success",
            onClick: () => handleEdit(video),
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
            size: "sm",
            color: "error",
            onClick: () => handleDelete(video),
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
] as const;

const queryForm = ref({
  number: "",
  performer: "" as string | number | undefined,
  rating: undefined as number | undefined,
  status: undefined as VideoStatus | undefined,
});

const modelValue = shallowRef({
  start: null as CalendarDate | null,
  end: null as CalendarDate | null,
});

const formDialogOpen = ref(false);
const previewDialogOpen = ref(false);
const currentVideoId = ref<string | number | null>(null);

onMounted(async () => {
  await tasteVideoStore.fetchPerformerDict();
  await fetchList();
});

async function fetchList() {
  const gmtCreate =
    modelValue.value.start && modelValue.value.end
      ? [modelValue.value.start.toString(), modelValue.value.end.toString()]
      : undefined;
  await tasteVideoStore.fetchList({
    pageIndex: 1,
    number: queryForm.value.number || undefined,
    performer: queryForm.value.performer || undefined,
    rating: queryForm.value.rating || undefined,
    status: queryForm.value.status || undefined,
    gmtCreate,
  });
}

function handlePageChange(page: number) {
  tasteVideoStore.fetchList({ pageIndex: page });
}

function handlePageSizeChange(size: number) {
  tasteVideoStore.fetchList({ pageSize: size, pageIndex: 1 });
}

const debouncedFetch = useDebounceFn(() => {
  fetchList();
}, 500);

function handleQueryChange() {
  debouncedFetch();
}

function resetQuery() {
  queryForm.value = {
    number: "",
    performer: undefined,
    rating: undefined,
    status: undefined,
  };
  modelValue.value = { start: null, end: null };
  tasteVideoStore.resetQuery();
  fetchList();
}

function handleAdd() {
  currentVideoId.value = null;
  formDialogOpen.value = true;
}

function handleEdit(video: TasteVideo) {
  currentVideoId.value = video.id;
  formDialogOpen.value = true;
}

function handlePreview(video: TasteVideo) {
  currentVideoId.value = video.id;
  previewDialogOpen.value = true;
}

function handleDownload(video: TasteVideo) {
  navigator.clipboard
    .writeText(video.magnetUri)
    .then(() => {
      toast.add({
        title: "复制成功",
        description: "磁力链接已复制到剪贴板",
        icon: "i-heroicons-check-circle",
      });
    })
    .catch(() => {
      toast.add({
        title: "复制失败",
        description: "请手动复制磁力链接",
        color: "error",
        icon: "i-heroicons-exclamation-circle",
      });
    });
}

async function handleDelete(video: TasteVideo) {
  const dialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true,
  });

  const confirmed = await dialog.open({
    title: "删除视频",
    message: `确定要删除视频【${video.name}】吗？此操作不可恢复。`,
    confirmText: "删除",
  });

  if (confirmed) {
    try {
      await tasteVideoStore.deleteVideo([video.id]);
      toast.add({
        title: "删除成功",
        color: "success",
      });
      if (
        tasteVideoStore.list.length === 1 &&
        tasteVideoStore.query.pageIndex > 1
      ) {
        await tasteVideoStore.fetchList({
          pageIndex: tasteVideoStore.query.pageIndex - 1,
        });
      } else {
        await tasteVideoStore.fetchList();
      }
    } catch (error) {
      toast.add({
        title: "删除失败",
        description: "请重试",
        color: "error",
      });
    }
  }
}

function handleFormSuccess() {
  fetchList();
}
</script>

<template>
  <div class="flex flex-col h-full">
    <UCard class="shrink-0">
      <div class="flex flex-wrap gap-3">
        <UFormGroup label="车牌号">
          <UInput
            v-model="queryForm.number"
            placeholder="请输入车牌号"
            clearable
            @blur="handleQueryChange"
            @keydown.enter="fetchList"
          />
        </UFormGroup>

        <UFormGroup label="演员">
          <USelect
            v-model="queryForm.performer"
            placeholder="请选择演员"
            :items="
              tasteVideoStore.performerDict
                ? tasteVideoStore.performerDict.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))
                : []
            "
            searchable
            clearable
            @update:model-value="handleQueryChange"
          />
        </UFormGroup>

        <UFormGroup label="状态">
          <USelect
            v-model="queryForm.status"
            placeholder="请选择状态"
            :items="[
              { label: '未下载', value: 0 },
              { label: '已下载', value: 1 },
              { label: '已观看', value: 2 },
            ]"
            clearable
            @update:model-value="handleQueryChange"
          />
        </UFormGroup>

        <UFormGroup label="创建时间">
          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-[280px] justify-start"
            >
              {{
                modelValue.start && modelValue.end
                  ? `${df.format(modelValue.start.toDate(getLocalTimeZone()))} - ${df.format(modelValue.end.toDate(getLocalTimeZone()))}`
                  : "请选择日期范围"
              }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="modelValue as any"
                class="p-2"
                locale="zh-CN"
                :number-of-months="2"
                range
                @update:model-value="handleQueryChange"
              />
            </template>
          </UPopover>
        </UFormGroup>

        <div class="flex items-end gap-2">
          <UButton
            color="primary"
            class="cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            @click="fetchList"
          >
            <UIcon name="i-heroicons-magnifying-glass-20-solid" class="mr-1" />
            查询
          </UButton>
          <UButton
            class="cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            @click="resetQuery"
          >
            重置
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard class="flex-1 min-h-0 mt-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">
          视频列表
          <span class="ml-2 text-sm font-normal text-gray-500"
            >({{ tasteVideoStore.total }} 条记录)</span
          >
        </h3>
        <UButton
          color="primary"
          class="cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          @click="handleAdd"
        >
          <UIcon name="i-heroicons-plus-20-solid" class="mr-1" />
          新增视频
        </UButton>
      </div>

      <div class="flex flex-col" style="max-height: calc(100vh - 420px)">
        <UTable
          :loading="tasteVideoStore.loading"
          loading-animation="elastic"
          :columns="columns"
          :data="tasteVideoStore.list || []"
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
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>每页显示</span>
          <USelect
            v-model="tasteVideoStore.query.pageSize"
            :items="[10, 20, 50, 100]"
            variant="outline"
            size="sm"
            class="w-20"
            @update:model-value="handlePageSizeChange"
          />
          <span>条</span>
        </div>
        <UPagination
          v-model:page="tasteVideoStore.query.pageIndex"
          :total="tasteVideoStore.total"
          :items-per-page="tasteVideoStore.query.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <TasteVideoFormDialog
      v-model:open="formDialogOpen"
      :video-id="currentVideoId"
      :performer-dict="tasteVideoStore.performerDict"
      @success="handleFormSuccess"
    />

    <TasteVideoPreviewDialog
      v-model:open="previewDialogOpen"
      :video-id="currentVideoId"
    />
  </div>
</template>
