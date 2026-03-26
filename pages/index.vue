<template>
  <div class="dashboard-page">
    <el-card class="welcome-card mb-6">
      <div class="flex items-center gap-6">
        <el-avatar :size="80" :src="user?.avatar || ''">
          {{ user?.name?.charAt(0) || 'U' }}
        </el-avatar>
        <div>
          <h2 class="text-2xl font-bold mb-2">欢迎回来，{{ user?.name || user?.email }}！</h2>
          <p class="text-gray-500">今天是美好的一天，祝您工作愉快！</p>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="6">
        <el-statistic title="总用户数" :value="10240" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="今日访问" :value="5632" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="待处理任务" :value="28" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="系统评分" :value="96.8" />
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card class="mb-6">
      <template #header>
        <div class="flex-between">
          <span class="font-medium">快捷入口</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in shortcuts" :key="item.title">
          <div class="shortcut-item p-4 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-all" @click="navigateTo(item.path)">
            <el-icon :size="32" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
            <div class="mt-3 font-medium">{{ item.title }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近活动 -->
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="font-medium">最近活动</span>
          <el-button text type="primary">查看全部</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :timestamp="activity.time"
          placement="top"
          :color="activity.color"
        >
          <el-card>
            <p>{{ activity.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 仪表盘首页
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// 快捷入口
const shortcuts = [
  { title: '用户管理', icon: 'User', color: '#409EFF', path: '/users' },
  { title: '数据分析', icon: 'DataAnalysis', color: '#67C23A', path: '/analytics' },
  { title: '系统设置', icon: 'Setting', color: '#E6A23C', path: '/settings' },
  { title: '文档中心', icon: 'Document', color: '#F56C6C', path: '/docs' }
]

// 最近活动（模拟数据）
const activities = [
  { id: 1, content: '管理员登录了系统', time: '2024-01-15 10:30', color: '#409EFF' },
  { id: 2, content: '用户张三提交了新工单', time: '2024-01-15 09:20', color: '#67C23A' },
  { id: 3, content: '系统自动备份完成', time: '2024-01-15 08:00', color: '#909399' },
  { id: 4, content: '检测到异常登录尝试', time: '2024-01-14 23:15', color: '#F56C6C' }
]
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-card h2,
.welcome-card p {
  color: white;
}

.shortcut-item:hover {
  transform: translateY(-2px);
}
</style>
