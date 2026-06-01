<script setup lang="ts">
const stats: {
  label: string;
  value: string;
  icon: string;
  color: ColorKey;
  trend: string;
}[] = [
  {
    label: "用户总数",
    value: "1,234",
    icon: "i-heroicons-users",
    color: "blue",
    trend: "+12%",
  },
  {
    label: "文章数量",
    value: "567",
    icon: "i-heroicons-document-text",
    color: "green",
    trend: "+8%",
  },
  {
    label: "订单数量",
    value: "890",
    icon: "i-heroicons-shopping-cart",
    color: "amber",
    trend: "+23%",
  },
  {
    label: "访问量",
    value: "12,345",
    icon: "i-heroicons-chart-bar",
    color: "red",
    trend: "+5%",
  },
];

const colorMap = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500",
  },
  gray: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-500",
  },
} as const;

type ColorKey = keyof typeof colorMap;

const quickActions: { label: string; icon: string; color: ColorKey }[] = [
  { label: "创建文章", icon: "i-heroicons-plus", color: "blue" },
  { label: "查看订单", icon: "i-heroicons-shopping-bag", color: "green" },
  { label: "数据分析", icon: "i-heroicons-chart-pie", color: "amber" },
  { label: "系统设置", icon: "i-heroicons-cog-6-tooth", color: "gray" },
];
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">欢迎回来</h1>
      <p class="text-gray-500 dark:text-gray-400">这是您的业务概览</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <UCard
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate"
            >
              {{ stat.label }}
            </p>
            <p
              class="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums"
            >
              {{ stat.value }}
            </p>
            <div class="mt-2 flex items-center gap-1">
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4 text-green-500"
              />
              <span
                class="text-sm font-medium text-green-600 dark:text-green-400"
              >
                {{ stat.trend }}
              </span>
              <span class="text-sm text-gray-400">较上周</span>
            </div>
          </div>
          <div
            :class="[
              'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
              colorMap[stat.color].bg,
              colorMap[stat.color].text,
            ]"
          >
            <UIcon :name="stat.icon" class="w-6 h-6" />
          </div>
        </div>
        <div
          :class="[
            'absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            colorMap[stat.color].border,
          ]"
        />
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              近期活动
            </h2>
            <UButton variant="ghost" size="sm" class="cursor-pointer">
              查看全部
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
            </UButton>
          </div>
        </template>
        <div class="space-y-4">
          <div
            v-for="i in 4"
            :key="i"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
          >
            <div
              class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-user-plus"
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                新用户注册
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">2 分钟前</p>
            </div>
            <UIcon
              name="i-heroicons-chevron-right"
              class="w-4 h-4 text-gray-400"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              快速操作
            </h2>
          </div>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            v-for="action in quickActions"
            :key="action.label"
            variant="outline"
            class="justify-start h-auto py-3 cursor-pointer transition-all duration-150 hover:scale-[1.02]"
          >
            <template #leading>
              <div
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  colorMap[action.color].bg,
                ]"
              >
                <UIcon :name="action.icon" class="w-4 h-4" />
              </div>
            </template>
            {{ action.label }}
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
