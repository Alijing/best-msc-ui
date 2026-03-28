<script setup lang="ts">
import { clientApiFetch } from '~/utils/api'

const props = withDefaults(defineProps<{
  modelValue: boolean
  videoId?: number | null
}>(), {
  modelValue: false,
  videoId: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 预览图片列表
const imageUrls = ref<string[]>([])
const loading = ref(false)

// 监听弹窗打开
watch(() => props.modelValue, async (val) => {
  if (val && props.videoId) {
    await loadPreviewImages(props.videoId)
  } else if (!val) {
    // 关闭时清空图片
    imageUrls.value = []
  }
})

// 加载预览图片
async function loadPreviewImages(videoId: number) {
  loading.value = true
  try {
    const response = await clientApiFetch<string[]>(`/api/video/taste/preview/${videoId}`)
    imageUrls.value = response
  } catch (error) {
    console.error('加载预览图片失败:', error)
    imageUrls.value = []
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="视频预览"
    width="800px"
    @close="handleClose"
  >
    <div v-loading="loading" class="preview-container">
      <template v-if="imageUrls.length > 0">
        <div class="image-list">
          <el-image
            v-for="(url, index) in imageUrls"
            :key="index"
            :src="url"
            :preview-src-list="imageUrls"
            :initial-index="index"
            fit="cover"
            class="preview-image"
          >
            <template #placeholder>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
                <span>加载中...</span>
              </div>
            </template>
          </el-image>
        </div>
      </template>
      
      <el-empty v-else-if="!loading" description="暂无预览图片" />
    </div>
  </el-dialog>
</template>

<style scoped>
.preview-container {
  min-height: 400px;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.preview-image {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.preview-image:hover {
  transform: scale(1.05);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: #f5f7fa;
  color: #909399;
}

.image-placeholder .el-icon {
  font-size: 40px;
  margin-bottom: 8px;
}
</style>
