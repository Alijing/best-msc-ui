<template>
  <el-dropdown class="notification-dropdown">
    <el-badge :value="notifications.filter(n => !n.read).length" :hidden="notifications.length === 0">
      <el-button text>
        <el-icon><Bell /></el-icon>
      </el-button>
    </el-badge>

    <template #dropdown>
      <el-dropdown-menu class="w-80">
        <div class="p-4 border-b border-gray-200 flex-between">
          <span class="font-medium">通知</span>
          <el-button 
            v-if="unreadCount > 0" 
            text 
            type="primary" 
            size="small"
            @click="markAllAsRead"
          >
            全部已读
          </el-button>
        </div>

        <el-scrollbar max-height="400px">
          <div v-if="notifications.length === 0" class="p-8 text-center text-gray-400">
            <el-icon size="48"><Bell /></el-icon>
            <p class="mt-2">暂无通知</p>
          </div>

          <div v-else>
            <el-dropdown-item
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ 'bg-blue-50': !notification.read }"
              class="py-3"
            >
              <div class="flex items-start gap-3">
                <el-icon 
                  :size="20" 
                  :class="getNotificationIconColor(notification.type)"
                >
                  <component :is="getNotificationIcon(notification.type)" />
                </el-icon>
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ notification.title }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ notification.message }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ formatTime(notification.time) }}</div>
                </div>
              </div>
            </el-dropdown-item>
          </div>
        </el-scrollbar>

        <div v-if="notifications.length > 0" class="p-3 border-t border-gray-200 text-center">
          <el-button text type="primary" size="small">
            查看全部
          </el-button>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
// 通知下拉组件
interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  time: string
  read: boolean
}

// 模拟通知数据（实际应从 API 获取）
const notifications = ref<Notification[]>([
  {
    id: 1,
    title: '系统更新',
    message: '系统已完成升级，请刷新页面查看新功能',
    type: 'info',
    time: '10 分钟前',
    read: false
  },
  {
    id: 2,
    title: '任务完成',
    message: '您发起的数据处理任务已成功完成',
    type: 'success',
    time: '1 小时前',
    read: false
  }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

/**
 * 获取通知图标
 */
function getNotificationIcon(type: string) {
  const icons = {
    info: 'InfoFilled',
    success: 'SuccessFilled',
    warning: 'Warning',
    error: 'Warning'
  }
  return icons[type as keyof typeof icons] || 'InfoFilled'
}

/**
 * 获取图标颜色
 */
function getNotificationIconColor(type: string) {
  const colors = {
    info: '#909399',
    success: '#67C23A',
    warning: '#E6A23C',
    error: '#F56C6C'
  }
  return colors[type as keyof typeof colors] || '#909399'
}

/**
 * 格式化时间
 */
function formatTime(time: string) {
  return time
}

/**
 * 标记全部为已读
 */
function markAllAsRead() {
  notifications.value.forEach(n => n.read = true)
}
</script>

<style scoped>
.notification-dropdown :deep(.el-badge__content.is-fixed) {
  top: 4px;
  right: 8px;
}
</style>
