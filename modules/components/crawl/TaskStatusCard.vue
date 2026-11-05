<script setup lang="ts">
import ConfirmDialog from "~/components/ConfirmDialog.vue";

const emit = defineEmits<{
  reconfigure: [];
}>();

const store = useCrawlStore();
const toast = useToast();
const overlay = useOverlay();

const statusLabel: Record<string, string> = {
  pending: "尚未开始",
  running: "正在运行",
  completed: "已完成",
  failed: "失败",
};

const stageLabel: Record<string, string> = {
  pending: "尚未开始",
  catalog: "正在抓目录",
  content: "正在抓正文",
  done: "结束",
};

const statusColor: Record<string, "neutral" | "primary" | "success" | "error"> = {
  pending: "neutral",
  running: "primary",
  completed: "success",
  failed: "error",
};

const statusText = computed(() => {
  const status = store.task?.status;
  if (!status) {
    return "—";
  }
  return statusLabel[status] || status;
});

const stageText = computed(() => {
  const stage = store.task?.stage;
  if (!stage) {
    return "—";
  }
  return stageLabel[stage] || stage;
});

const badgeColor = computed(() => {
  const status = store.task?.status || "";
  return statusColor[status] || "neutral";
});

const hasSelectedNovel = computed(() => /^\d+$/.test(store.selectedNovelId));

const canImport = computed(
  () => store.task?.resultAvailable === true && hasSelectedNovel.value,
);

function displayCount(value: number | null | undefined) {
  return value == null ? "—" : String(value);
}

async function handleImport() {
  if (!hasSelectedNovel.value) {
    toast.add({
      title: "请先选择小说",
      description: "导入目标来自左侧下拉框中选中的小说。",
      color: "error",
    });
    return;
  }
  const novelName = store.selectedNovelName || "所选小说";
  const dialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true,
  });
  const confirmed = await dialog.open({
    title: "导入到小说",
    message: `将把本次采集结果写入「${novelName}」。接口不返回章节列表，提交成功只表示请求已被接受。`,
    confirmText: "确认导入",
  });
  if (!confirmed) {
    return;
  }
  const submitted = await store.importNovel(store.selectedNovelId);
  if (!submitted) {
    return;
  }
  toast.add({
    title: "已提交导入",
    description: `采集结果已提交写入「${novelName}」。接口不返回章节列表。`,
    color: "success",
  });
}

async function handleRemove() {
  const dialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true,
  });
  const confirmed = await dialog.open({
    title: "取消任务",
    message: "确定取消当前采集任务吗？取消后需要重新启动。",
    confirmText: "取消任务",
  });
  if (!confirmed) {
    return;
  }
  const removed = await store.removeTask();
  if (removed) {
    toast.add({
      title: "任务已取消",
      color: "success",
    });
  }
}
</script>

<template>
  <UCard v-if="store.task">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">任务进度</h2>
        <UBadge :color="badgeColor" variant="subtle">{{ statusText }}</UBadge>
      </div>
    </template>

    <dl class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
      <div class="col-span-2 sm:col-span-3">
        <dt class="text-gray-500">任务 ID</dt>
        <dd class="mt-1 font-mono text-xs break-all">{{ store.task.taskId }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">阶段</dt>
        <dd class="mt-1">{{ stageText }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">当前页</dt>
        <dd class="mt-1">{{ displayCount(store.task.currentPage) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">已爬页数</dt>
        <dd class="mt-1">{{ displayCount(store.task.pagesCrawled) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">当前章</dt>
        <dd class="mt-1">{{ displayCount(store.task.currentChapter) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">章节数</dt>
        <dd class="mt-1">{{ displayCount(store.task.chapterCount) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">总章节</dt>
        <dd class="mt-1">{{ displayCount(store.task.totalChapters) }}</dd>
      </div>
    </dl>

    <UAlert
      v-if="store.task.status === 'running' || store.task.status === 'pending'"
      class="mt-4"
      color="info"
      variant="subtle"
      title="正在采集"
      description="页面每 2 秒刷新一次进度。"
    />

    <UAlert
      v-if="store.task.error || store.task.status === 'failed'"
      class="mt-4"
      color="error"
      variant="subtle"
      title="采集失败"
      :description="store.task.error || '任务失败，可以修改参数后重新启动。'"
    />

    <div class="mt-4 flex flex-wrap gap-2">
      <UButton
        icon="i-heroicons-arrow-down-tray"
        :loading="store.importing"
        :disabled="!canImport || store.importing"
        @click="handleImport"
      >
        导入到小说
      </UButton>
      <UButton
        v-if="store.analyzeResult && store.task.status === 'completed'"
        color="neutral"
        variant="outline"
        @click="emit('reconfigure')"
      >
        调整参数重新采集
      </UButton>
      <UButton
        color="error"
        variant="outline"
        :loading="store.removing"
        @click="handleRemove"
      >
        取消任务
      </UButton>
    </div>
    <p v-if="store.task.resultAvailable !== true" class="mt-2 text-sm text-gray-500">
      结果尚未就绪，采集完成且结果可用后才能导入。
    </p>
    <p v-else-if="!hasSelectedNovel" class="mt-2 text-sm text-gray-500">
      请先在左侧选择要写入的小说。
    </p>
  </UCard>
</template>
