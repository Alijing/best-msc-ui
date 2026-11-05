<script setup lang="ts">
const notificationStore = useNotificationStore();
const isOpen = ref(false);
const visibleLimit = ref(8);

const typeIcon: Record<string, string> = {
  info: "i-heroicons-information-circle",
  warning: "i-heroicons-exclamation-triangle",
  success: "i-heroicons-check-circle",
};

const visibleUnread = computed(() =>
  notificationStore.unread.slice(0, visibleLimit.value),
);
const visibleRead = computed(() => {
  const remain = visibleLimit.value - visibleUnread.value.length;
  return remain > 0 ? notificationStore.read.slice(0, remain) : [];
});
const hasMore = computed(
  () => visibleLimit.value < notificationStore.list.length,
);

watch(isOpen, (open) => {
  if (!open) {
    return;
  }
  notificationStore.ensureLoaded();
  visibleLimit.value = 8;
});

onMounted(() => {
  notificationStore.ensureLoaded();
});

function loadMore() {
  if (!hasMore.value) {
    return;
  }
  visibleLimit.value = Math.min(
    visibleLimit.value + 8,
    notificationStore.list.length,
  );
}

function onScroll(event: Event) {
  const el = event.target as HTMLElement;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
    loadMore();
  }
}

function viewAll() {
  isOpen.value = false;
  navigateTo("/notifications");
}
</script>

<template>
  <UPopover
    v-model:open="isOpen"
    :content="{ side: 'bottom', align: 'end' }"
  >
    <button
      type="button"
      class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="通知"
    >
      <UIcon
        name="i-heroicons-bell"
        class="w-5 h-5 text-gray-600 dark:text-gray-300"
      />
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
      />
    </button>

    <template #content>
      <div class="w-[400px]">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            通知
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">
              {{ notificationStore.list.length }} 条
            </span>
            <UButton
              v-if="notificationStore.unreadCount > 0"
              size="xs"
              variant="ghost"
              @click="notificationStore.markAllAsRead()"
            >
              全部已读
            </UButton>
            <UButton
              v-if="notificationStore.list.length > 0"
              size="xs"
              variant="ghost"
              color="error"
              @click="notificationStore.clearAll()"
            >
              清空
            </UButton>
          </div>
        </div>

        <div
          class="max-h-80 overflow-y-auto"
          @scroll="onScroll"
        >
          <template v-if="visibleUnread.length > 0">
            <p class="px-4 pt-2 text-xs text-gray-400">
              未读
            </p>
            <button
              v-for="item in visibleUnread"
              :key="item.id"
              type="button"
              class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
              @click="notificationStore.markAsRead(item.id)"
            >
              <div class="flex items-start gap-2">
                <UIcon
                  :name="typeIcon[item.type]"
                  class="w-4 h-4 mt-0.5 shrink-0 text-primary"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {{ item.title }}
                    </h4>
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ item.content }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatNotificationTime(item.createTime) }}
                  </p>
                </div>
              </div>
            </button>
          </template>

          <template v-if="visibleRead.length > 0">
            <p class="px-4 pt-2 text-xs text-gray-400">
              已读
            </p>
            <button
              v-for="item in visibleRead"
              :key="item.id"
              type="button"
              class="w-full px-4 py-3 text-left opacity-60 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
            >
              <div class="flex items-start gap-2">
                <UIcon
                  :name="typeIcon[item.type]"
                  class="w-4 h-4 mt-0.5 shrink-0 text-gray-400"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {{ item.title }}
                  </h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ item.content }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatNotificationTime(item.createTime) }}
                  </p>
                </div>
              </div>
            </button>
          </template>

          <div
            v-if="notificationStore.list.length === 0"
            class="px-4 py-8 text-center text-gray-500"
          >
            暂无通知
          </div>
          <p
            v-else-if="hasMore"
            class="px-4 py-2 text-center text-xs text-gray-400"
          >
            继续滚动加载
          </p>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700">
          <UButton
            variant="ghost"
            class="w-full"
            icon="i-heroicons-eye"
            @click="viewAll"
          >
            查看全部
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
