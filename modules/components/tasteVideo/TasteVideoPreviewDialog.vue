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
const zoomed = ref(false)
const failed = ref<Record<number, boolean>>({})

watch(open, (newVal) => {
  if (newVal && props.videoId) {
    currentImageIndex.value = 0
    zoomed.value = false
    failed.value = {}
    tasteVideoStore.fetchPreviewImages(props.videoId)
  } else {
    zoomed.value = false
    failed.value = {}
    tasteVideoStore.clearPreviewImages()
  }
})

const currentImage = computed(
  () => tasteVideoStore.previewImages[currentImageIndex.value] || ''
)

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

function markFailed(index: number) {
  failed.value = { ...failed.value, [index]: true }
}

function openZoom() {
  if (!failed.value[currentImageIndex.value] && currentImage.value) {
    zoomed.value = true
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape' && zoomed.value) {
    zoomed.value = false
    e.preventDefault()
    e.stopPropagation()
    return
  }
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown, true)
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="视频图片预览"
    :dismissible="!zoomed"
    :ui="{
      content: zoomed ? 'max-w-none w-screen h-screen rounded-none' : 'max-w-4xl w-full',
      body: zoomed ? 'p-0 h-full bg-black' : 'p-4',
      header: zoomed ? 'hidden' : 'px-4 py-3'
    }"
  >
    <template #body>
      <div
        v-if="zoomed && currentImage && !failed[currentImageIndex]"
        class="relative flex h-full min-h-[70vh] items-center justify-center"
      >
        <button
          type="button"
          class="absolute top-4 right-4 z-10 text-white"
          aria-label="关闭放大"
          @click="zoomed = false"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>
        <button
          v-if="hasMultipleImages"
          type="button"
          class="absolute left-4 z-10 text-white disabled:opacity-30"
          :disabled="!canGoPrev"
          aria-label="上一张"
          @click="prevImage"
        >
          <UIcon name="i-heroicons-chevron-left-20-solid" class="w-8 h-8" />
        </button>
        <img
          :src="currentImage"
          alt="放大预览"
          class="max-w-[92vw] max-h-[92vh] object-contain"
          @error="markFailed(currentImageIndex)"
        >
        <button
          v-if="hasMultipleImages"
          type="button"
          class="absolute right-4 z-10 text-white disabled:opacity-30"
          :disabled="!canGoNext"
          aria-label="下一张"
          @click="nextImage"
        >
          <UIcon name="i-heroicons-chevron-right-20-solid" class="w-8 h-8" />
        </button>
      </div>
      <div v-else class="flex flex-col items-center">
        <template v-if="tasteVideoStore.previewLoading">
          <div class="w-full aspect-video max-h-[400px] flex items-center justify-center">
            <USkeleton class="w-full h-full rounded-lg" />
          </div>
        </template>

        <template v-else-if="tasteVideoStore.previewImages.length > 0">
          <div class="relative w-full">
            <div class="flex justify-center items-center min-h-[300px] max-h-[400px]">
              <button
                v-if="failed[currentImageIndex]"
                type="button"
                class="flex flex-col items-center justify-center gap-2 w-full min-h-[300px] rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800"
              >
                <UIcon name="i-heroicons-photo" class="w-16 h-16 opacity-50" />
                <span class="text-sm">图片加载失败</span>
              </button>
              <button
                v-else
                type="button"
                class="cursor-zoom-in"
                aria-label="放大查看"
                @click="openZoom"
              >
                <img
                  :src="currentImage"
                  alt="预览图片"
                  class="rounded-lg object-contain max-h-[400px]"
                  @error="markFailed(currentImageIndex)"
                >
              </button>
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

          <div class="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2 w-full">
            <button
              v-for="(img, index) in tasteVideoStore.previewImages"
              :key="`${img}-${index}`"
              type="button"
              class="h-16 rounded border overflow-hidden"
              :class="index === currentImageIndex ? 'border-primary' : 'border-transparent'"
              @click="currentImageIndex = index"
            >
              <span
                v-if="failed[index]"
                class="flex h-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800"
              >
                <UIcon name="i-heroicons-photo" class="w-5 h-5" />
              </span>
              <img
                v-else
                :src="img"
                alt=""
                class="h-full w-full object-cover"
                @error="markFailed(index)"
              >
            </button>
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
