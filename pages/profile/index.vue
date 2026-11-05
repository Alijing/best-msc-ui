<script setup lang="ts">
useHead({
  title: "个人资料",
});

const userStore = useUserStore();
const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);

const displayName = computed(
  () => userStore.user?.nickname || userStore.user?.username || "用户",
);
const roles = computed(() => userStore.user?.roles?.join("、") || "-");

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
  <div class="p-4 max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      个人资料
    </h1>

    <UCard class="mt-4">
      <div class="flex items-center gap-4">
        <UAvatar
          :src="userStore.user?.avatar || undefined"
          :alt="displayName"
          size="xl"
        />
        <div>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            {{ displayName }}
          </p>
          <UButton
            class="mt-2"
            size="sm"
            variant="outline"
            icon="i-heroicons-camera"
            @click="fileInput?.click()"
          >
            更换头像
          </UButton>
          <p class="mt-1 text-xs text-gray-500">
            支持 png、jpg、webp，不超过 2MB
          </p>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        class="hidden"
        @change="onAvatarChange"
      >

      <dl class="mt-6 space-y-3 text-sm">
        <div class="flex gap-4">
          <dt class="w-20 text-gray-500">
            账号
          </dt>
          <dd class="text-gray-900 dark:text-white">
            {{ userStore.user?.username || "-" }}
          </dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-20 text-gray-500">
            昵称
          </dt>
          <dd class="text-gray-900 dark:text-white">
            {{ userStore.user?.nickname || "-" }}
          </dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-20 text-gray-500">
            角色
          </dt>
          <dd class="text-gray-900 dark:text-white">
            {{ roles }}
          </dd>
        </div>
      </dl>
    </UCard>
  </div>
</template>
