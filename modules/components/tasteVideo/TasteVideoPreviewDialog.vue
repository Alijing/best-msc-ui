<script setup lang="ts">
import {watch} from 'vue'

// ✅ 使用 defineModel 实现双向绑定
const open = defineModel<boolean>('open', {default: false})
const props = withDefaults(defineProps<{
  videoId?: string | number | null
}>(), {
  videoId: null
})

const tasteVideoStore = useTasteVideoStore()

// 当前图片索引
const currentImageIndex = ref(0)

// 打开对话框时加载图片
watch(open, (newVal) => {
  if (newVal && props.videoId) {
    currentImageIndex.value = 0
    tasteVideoStore.fetchPreviewImages(props.videoId)
  } else {
    tasteVideoStore.clearPreviewImages()
  }
})

// 上一张
function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// 下一张
function nextImage() {
  if (currentImageIndex.value < tasteVideoStore.previewImages.length - 1) {
    currentImageIndex.value++
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="视频图片预览"
    :dismissible="false"
    :ui="{
      content: 'max-w-4xl w-full h-[520px]',
      body: 'p-6'
    }"
  >
    <template #body>
      <!-- 图片展示区 -->
      <div class="flex flex-col items-center">
        <!-- 加载中状态 -->
        <template v-if="tasteVideoStore.previewLoading">
          <USkeleton class="h-[380px] w-[550px] rounded-lg" />
        </template>

        <!-- 图片列表 -->
        <template v-else-if="tasteVideoStore.previewImages.length > 0">
          <div class="relative w-full">
            <!-- 图片展示容器 - 固定高度防止撑大 -->
            <div class="flex justify-center items-center h-[360px]">
              <NuxtImg
                v-for="(img, index) in tasteVideoStore.previewImages"
                :src="img"
                :placeholder="[50, 25, 75, 5]"
                alt="预览图片"
                width="640"
                height="360"
                class="rounded-lg"
                :class="{ 'hidden': index !== currentImageIndex }"
                fit="contain"
                quality="80"
                format="webp"
                loading="eager"
              />
            </div>

            <!-- 切换按钮 -->
            <div class="absolute top-1/2 -translate-y-1/2 left-0">
              <UButton
                variant="ghost"
                size="lg"
                :disabled="currentImageIndex === 0"
                @click="prevImage"
              >
                <UIcon name="i-heroicons-chevron-left-20-solid" />
              </UButton>
            </div>
            <div class="absolute top-1/2 -translate-y-1/2 right-0">
              <UButton
                variant="ghost"
                size="lg"
                :disabled="currentImageIndex === tasteVideoStore.previewImages.length - 1"
                @click="nextImage"
              >
                <UIcon name="i-heroicons-chevron-right-20-solid" />
              </UButton>
            </div>

            <!-- 指示器 -->
            <div class="mt-3 text-sm text-gray-500 h-8 flex items-center justify-center gap-8">
              {{ currentImageIndex + 1 }} / {{ tasteVideoStore.previewImages.length }}
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <template v-else>
          <div class="h-[360px] flex items-center justify-center text-gray-400">
            暂无预览图片
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
