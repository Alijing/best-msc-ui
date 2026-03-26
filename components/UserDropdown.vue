<template>
  <el-dropdown class="user-dropdown">
    <div class="user-info flex items-center gap-2 cursor-pointer">
      <el-avatar :size="32" :src="user?.avatar || ''">
        {{ user?.name?.charAt(0) || 'U' }}
      </el-avatar>
      <span class="user-name text-gray-700">{{ user?.name || user?.email }}</span>
      <el-icon><ArrowDown /></el-icon>
    </div>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>
          <el-icon><User /></el-icon>
          个人中心
        </el-dropdown-item>
        <el-dropdown-item>
          <el-icon><Setting /></el-icon>
          设置
        </el-dropdown-item>
        <el-dropdown-item divided @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
// 用户下拉菜单组件
import { ArrowDown, User, Setting, SwitchButton } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const { user } = storeToRefs(userStore)

/**
 * 退出登录
 */
async function handleLogout() {
  try {
    await userStore.logout()
    ElMessage.success('已退出登录')
    await navigateTo('/login')
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.user-dropdown:hover .user-name {
  color: #409EFF;
}
</style>
