<script setup lang="ts">
// 设置页面标题
useHead({
  title: '仪表盘 - BestMSC'
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">
      欢迎使用管理系统
    </h1>

    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
          仪表盘
        </h2>
      </template>

      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          欢迎，这是您的管理控制台。
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <!-- 示例统计卡片 -->
          <UCard>
            <div class="flex items-center space-x-4">
              <UIcon name="i-heroicons-users" class="w-8 h-8 text-blue-500" />
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">用户总数</p>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">1,234</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center space-x-4">
              <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-green-500" />
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">文章数量</p>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">567</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center space-x-4">
              <UIcon name="i-heroicons-shopping-cart" class="w-8 h-8 text-yellow-500" />
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">订单数量</p>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">890</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center space-x-4">
              <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-red-500" />
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">访问量</p>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">12,345</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template>
