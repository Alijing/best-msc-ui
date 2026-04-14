<script setup lang="ts">
import { useUserStore } from '~/stores/user.store'

const userStore = useUserStore()

const emit = defineEmits<{
  logout: []
}>()

// 菜单项配置
const items = computed(() => [[
  {
    label: '个人资料',
    icon: 'i-heroicons-user',
    onSelect: () => {
      console.log('📝 [UserDropdown] 点击个人资料')
      navigateTo('/profile')
    }
  },
  {
    label: '设置',
    icon: 'i-heroicons-cog-6-tooth',
    onSelect: () => {
      console.log('⚙️ [UserDropdown] 点击设置')
      navigateTo('/settings')
    }
  },
  {
    label: '退出登录',
    icon: 'i-heroicons-arrow-left-on-rectangle',
    onSelect: () => {
      console.log('👋 [UserDropdown] 点击退出登录')
      emit('logout')
    }
  }
]])
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton 
      color="gray" 
      variant="ghost"
      class="flex items-center space-x-2"
    >
      <UAvatar
        :src="userStore.user?.avatar"
        :alt="userStore.user?.name || '用户'"
        size="sm"
      />
      <span v-if="userStore.user?.name" class="hidden md:block text-sm text-gray-700 dark:text-gray-200">
        {{ userStore.user.name }}
      </span>
      <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-500" />
    </UButton>
  </UDropdownMenu>
</template>
