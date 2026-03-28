<script setup lang="ts">
import type { TasteVideo } from '~/stores/types/tasteVideo'
import TasteVideoList from '~/modules/tasteVideo/components/TasteVideoList.vue'
import TasteVideoFormDialog from '~/modules/tasteVideo/components/TasteVideoFormDialog.vue'
import TasteVideoPreviewDialog from '~/modules/tasteVideo/components/TasteVideoPreviewDialog.vue'

// 控制弹窗显示
const formDialogVisible = ref(false)
const previewDialogVisible = ref(false)

// 当前编辑的视频
const currentVideo = ref<TasteVideo | null>(null)

// 当前预览的视频 ID
const previewVideoId = ref<number | null>(null)

// 获取 store
const tasteVideoStore = useTasteVideoStore()

// 进入页面时自动查询列表
onMounted(() => {
  tasteVideoStore.fetchList()
})

// 新增视频
function handleAdd() {
  currentVideo.value = null
  formDialogVisible.value = true
}

// 编辑视频
function handleEdit(video: TasteVideo) {
  currentVideo.value = video
  formDialogVisible.value = true
}

// 预览视频
function handlePreview(id: number) {
  previewVideoId.value = id
  previewDialogVisible.value = true
}

// 表单操作成功，刷新列表
function handleFormSuccess() {
  tasteVideoStore.fetchList()
}
</script>

<template>
  <div class="taste-video-page p-6">
    <!-- 视频列表组件 -->
    <TasteVideoList
      @add="handleAdd"
      @edit="handleEdit"
      @preview="handlePreview"
    />

    <!-- 表单弹窗（新增/编辑） -->
    <TasteVideoFormDialog
      v-model="formDialogVisible"
      :video="currentVideo"
      @success="handleFormSuccess"
    />

    <!-- 预览弹窗 -->
    <TasteVideoPreviewDialog
      v-model="previewDialogVisible"
      :video-id="previewVideoId"
    />
  </div>
</template>

<style scoped>
.taste-video-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}
</style>
