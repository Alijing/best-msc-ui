<script setup lang="ts">
const store = useCrawlStore();

const reconfigure = ref(false);
let pollTimer: ReturnType<typeof setInterval> | undefined;
let pollLocked = false;

const showForm = computed(() => {
  if (!store.analyzeResult) {
    return false;
  }
  if (!store.task) {
    return true;
  }
  if (store.task.status === "failed") {
    return true;
  }
  return reconfigure.value;
});

const showEmpty = computed(() => !store.analyzeResult && !store.task);

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
}

async function pollStatus() {
  const status = store.task?.status;
  if (status !== "pending" && status !== "running") {
    stopPolling();
    return;
  }
  if (pollLocked) {
    return;
  }
  pollLocked = true;
  try {
    await store.refreshStatus(true);
  } finally {
    pollLocked = false;
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(() => {
    void pollStatus();
  }, 2000);
}

watch(
  () => store.task?.status,
  (status) => {
    if (status === "pending" || status === "running") {
      reconfigure.value = false;
      startPolling();
      return;
    }
    stopPolling();
  },
);

watch(
  () => store.task?.taskId,
  () => {
    reconfigure.value = false;
  },
);

onMounted(async () => {
  await store.restoreTask();
  const status = store.task?.status;
  if (status === "pending" || status === "running") {
    startPolling();
  }
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <div class="grid min-h-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
      <AnalyzePanel />

      <div class="flex min-h-0 flex-col gap-4">
        <TaskStatusCard
          v-if="store.task"
          @reconfigure="reconfigure = true"
        />
        <CrawlTaskPanel v-if="showForm" />
        <UCard v-else-if="showEmpty">
          <div class="py-8 text-center">
            <p class="text-base font-medium">还没有采集任务</p>
            <p class="mt-2 text-sm text-gray-500">
              先在左侧分析目录页，确认选择器后再启动采集。
            </p>
          </div>
        </UCard>
      </div>
    </div>

  </div>
</template>
