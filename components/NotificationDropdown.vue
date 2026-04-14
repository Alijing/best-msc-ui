<script setup lang="ts">
const isOpen = ref(false)

// 模拟通知数据
const notifications = ref([
  { id: '1', title: '系统通知', message: '欢迎使用管理系统', time: '5 分钟前', read: false },
  { id: '2', title: '更新提示', message: '系统已更新到最新版本', time: '1 小时前', read: false }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function markAsRead(id: string) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

function viewAll() {
  console.log('查看全部')
}
</script>

<template>
  <UDropdown v-model:open="isOpen" :items="[]">
    <button class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <UIcon name="i-heroicons-bell" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
      
      <UBadge
        v-if="unreadCount > 0"
        color="red"
        size="xs"
        class="absolute top-1 right-1"
      />
    </button>
    
    <template #panel>
      <div class="w-80">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">通知</h3>
          <span class="text-xs text-gray-500">{{ notifications.length }} 条</span>
        </div>
        
        <div class="max-h-64 overflow-y-auto">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="markAsRead(notification.id)"
            :class="[
              'px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800',
              notification.read ? 'opacity-60' : ''
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {{ notification.title }}
                </h4>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ notification.message }}
                </p>
              </div>
              <span class="text-xs text-gray-400">{{ notification.time }}</span>
            </div>
          </div>
          
          <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-500">
            暂无通知
          </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700">
          <UButton
            @click="viewAll"
            variant="ghost"
            class="w-full"
          >
            <template #leading>
              <UIcon name="i-heroicons-eye" class="w-4 h-4" />
            </template>
            查看全部
          </UButton>
        </div>
      </div>
    </template>
  </UDropdown>
</template>
