<script setup lang="ts">
const userStore = useUserStore();
const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  logout: [];
}>();

const items = computed(() => [
  [
    {
      label: "个人资料",
      icon: "i-heroicons-user",
      onSelect: () => navigateTo("/profile"),
    },
    {
      label: "更换头像",
      icon: "i-heroicons-camera",
      onSelect: () => fileInput.value?.click(),
    },
    {
      label: "设置",
      icon: "i-heroicons-cog-6-tooth",
      onSelect: () => navigateTo("/settings"),
    },
  ],
  [
    {
      label: "退出登录",
      icon: "i-heroicons-arrow-left-on-rectangle",
      onSelect: () => emit("logout"),
    },
  ],
]);

async function onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) {
    return;
  }

  try {
    await userStore.uploadAvatar(file);
    toast.add({
      title: "头像已更新",
      color: "success",
    });
  } catch (error: unknown) {
    toast.add({
      title: "上传失败",
      description: error instanceof Error ? error.message : "请重试",
      color: "error",
    });
  }
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      class="hidden"
      @change="onAvatarChange"
    >
    <UDropdownMenu :items="items">
      <UButton
        color="gray"
        variant="ghost"
        class="flex items-center space-x-2"
      >
        <UAvatar
          :src="userStore.user?.avatar || undefined"
          :alt="userStore.user?.nickname || userStore.user?.username || '用户'"
          size="sm"
        />
        <span
          v-if="userStore.user?.nickname || userStore.user?.username"
          class="hidden md:block text-sm text-gray-700 dark:text-gray-200"
        >
          {{ userStore.user?.nickname || userStore.user?.username }}
        </span>
        <UIcon
          name="i-heroicons-chevron-down"
          class="w-4 h-4 text-gray-500"
        />
      </UButton>
    </UDropdownMenu>
  </div>
</template>
