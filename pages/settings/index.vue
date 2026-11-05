<script setup lang="ts">
useHead({
  title: "设置",
});

const appStore = useAppStore();
const colorMode = useColorMode();

const theme = computed({
  get: () => colorMode.preference,
  set: (value: string) => {
    colorMode.preference = value;
  },
});

const themeItems = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
  { label: "跟随系统", value: "system" },
];
</script>

<template>
  <div class="p-4 max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      设置
    </h1>

    <UCard class="mt-4 space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="font-medium text-gray-900 dark:text-white">
            外观
          </p>
          <p class="text-sm text-gray-500">
            选择界面颜色
          </p>
        </div>
        <USelect
          v-model="theme"
          :items="themeItems"
          class="w-36"
        />
      </div>

      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="font-medium text-gray-900 dark:text-white">
            折叠侧边栏
          </p>
          <p class="text-sm text-gray-500">
            收起左侧菜单，只保留图标
          </p>
        </div>
        <USwitch
          :model-value="appStore.sidebarCollapsed"
          @update:model-value="appStore.setSidebarCollapsed"
        />
      </div>
    </UCard>
  </div>
</template>
