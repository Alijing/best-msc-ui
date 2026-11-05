<script setup lang="ts">
useHead({
  title: "通知",
});

const notificationStore = useNotificationStore();

const typeIcon: Record<string, string> = {
  info: "i-heroicons-information-circle",
  warning: "i-heroicons-exclamation-triangle",
  success: "i-heroicons-check-circle",
};

onMounted(() => {
  notificationStore.ensureLoaded();
});
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          通知
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          最多保留 20 条
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          v-if="notificationStore.unreadCount > 0"
          variant="outline"
          @click="notificationStore.markAllAsRead()"
        >
          全部已读
        </UButton>
        <UButton
          v-if="notificationStore.list.length > 0"
          color="error"
          variant="outline"
          @click="notificationStore.clearAll()"
        >
          清空全部
        </UButton>
      </div>
    </div>

    <UCard>
      <div
        v-if="notificationStore.list.length === 0"
        class="py-12 text-center text-gray-500"
      >
        暂无通知
      </div>
      <ul
        v-else
        class="divide-y divide-gray-100 dark:divide-gray-800"
      >
        <li
          v-for="item in notificationStore.list"
          :key="item.id"
          class="flex items-start gap-3 py-3"
          :class="item.isRead ? 'opacity-60' : ''"
        >
          <UIcon
            :name="typeIcon[item.type]"
            class="w-5 h-5 mt-0.5 shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.title }}
              </h2>
              <span
                v-if="!item.isRead"
                class="w-1.5 h-1.5 rounded-full bg-red-500"
              />
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {{ item.content }}
            </p>
            <p class="mt-1 text-xs text-gray-400">
              {{ formatNotificationTime(item.createTime) }}
            </p>
          </div>
          <UButton
            v-if="!item.isRead"
            size="xs"
            variant="ghost"
            @click="notificationStore.markAsRead(item.id)"
          >
            标为已读
          </UButton>
        </li>
      </ul>
    </UCard>
  </div>
</template>
