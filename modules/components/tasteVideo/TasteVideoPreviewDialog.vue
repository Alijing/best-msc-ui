<script setup lang="ts">
import { watch } from 'vue'

const open = defineModel<boolean>('open', { default: false })
const props = withDefaults(defineProps<{
  videoId?: string | number | null
}>(), {
  videoId: null
})

const tasteVideoStore = useTasteVideoStore()

const currentImageIndex = ref(0)

watch(open, (newVal) => {
  if (newVal && props.videoId) {
    currentImageIndex.value = 0
    tasteVideoStore.fetchPreviewImages(props.videoId)
  } else {
    tasteVideoStore.clearPreviewImages()
  }
})

const hasMultipleImages = computed(() => tasteVideoStore.previewImages.length > 1)
const canGoPrev = computed(() => currentImageIndex.value > 0)
const canGoNext = computed(() => currentImageIndex.value < tasteVideoStore.previewImages.length - 1)

function prevImage() {
  if (canGoPrev.value) {
    currentImageIndex.value--
  }
}

function nextImage() {
  if (canGoNext.value) {
    currentImageIndex.value++
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="视频图片预览"
    :dismissible="true"
    :ui="{
      content: 'max-w-4xl w-full',
      body: 'p-4',
      header: 'px-4 py-3'
    }"
  >
    <template #body>
      <div class="flex flex-col items-center">
        <template v-if="tasteVideoStore.previewLoading">
          <div class="w-full aspect-video max-h-[400px] flex items-center justify-center">
            <USkeleton class="w-full h-full rounded-lg" />
          </div>
        </template>

        <template v-else-if="tasteVideoStore.previewImages.length > 0">
          <div class="relative w-full">
            <div class="flex justify-center items-center min-h-[300px] max-h-[400px]">
              <NuxtImg
                v-for="(img, index) in tasteVideoStore.previewImages"
                :key="img"
                :src="img"
                :placeholder="[50, 25, 75, 5]"
                alt="预览图片"
                width="640"
                height="360"
                class="rounded-lg object-contain transition-opacity duration-300 max-h-[400px]"
                :class="{ 'hidden': index !== currentImageIndex, 'block': index === currentImageIndex }"
                fit="contain"
                quality="80"
                format="webp"
                loading="eager"
              />
            </div>

            <template v-if="hasMultipleImages">
              <UButton
                variant="ghost"
                size="lg"
                :disabled="!canGoPrev"
                class="absolute top-1/2 -translate-y-1/2 left-2 cursor-pointer transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                @click="prevImage"
              >
                <UIcon name="i-heroicons-chevron-left-20-solid" class="w-6 h-6" />
              </UButton>
              <UButton
                variant="ghost"
                size="lg"
                :disabled="!canGoNext"
                class="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                @click="nextImage"
              >
                <UIcon name="i-heroicons-chevron-right-20-solid" class="w-6 h-6" />
              </UButton>
            </template>
          </div>

          <div v-if="hasMultipleImages" class="mt-4 flex items-center justify-center gap-3">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300 tabular-nums">
              {{ currentImageIndex + 1 }} / {{ tasteVideoStore.previewImages.length }}
            </span>
            <div class="flex gap-1.5">
              <button
                v-for="(_, index) in tasteVideoStore.previewImages"
                :key="index"
                class="w-2 h-2 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="index === currentImageIndex ? 'bg-primary-500 w-4' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'"
                :aria-label="`跳转到第 ${index + 1} 张图片`"
                @click="currentImageIndex = index"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="w-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
            <UIcon name="i-heroicons-photo" class="w-16 h-16 opacity-50" />
            <span class="text-sm">暂无预览图片</span>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
