<template>
  <el-popover
    placement="bottom-start"
    :width="400"
    trigger="click"
  >
    <template #reference>
      <div class="icon-picker-trigger">
        <el-input
          :model-value="modelValue"
          placeholder="请选择或输入图标名称"
          readonly
          class="icon-input"
        >
          <template #prefix>
            <el-icon v-if="modelValue" :size="18">
              <component :is="modelValue" />
            </el-icon>
          </template>
          <template #suffix>
            <el-icon :size="16" class="arrow-icon">
              <ArrowDown />
            </el-icon>
          </template>
        </el-input>
      </div>
    </template>

    <div class="icon-picker-panel">
      <el-input
        v-model="searchText"
        placeholder="搜索图标..."
        clearable
        size="small"
        class="mb-3"
      />

      <div class="icon-grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ active: modelValue === icon }"
          @click="selectIcon(icon)"
        >
          <el-icon :size="20">
            <component :is="icon" />
          </el-icon>
          <span class="icon-name">{{ icon }}</span>
        </div>
      </div>

      <div v-if="filteredIcons.length === 0" class="empty-text">
        未找到匹配的图标
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'

// 从全局注册的图标中获取所有可用的图标名称
// 由于图标已经全局注册，我们可以直接使用字符串名称
const commonIcons = [
  // 系统相关
  'Setting', 'User', 'Avatar', 'Lock', 'Unlock', 'Key',
  // 导航相关
  'Menu', 'Fold', 'Expand', 'DArrowLeft', 'DArrowRight', 'ArrowLeft', 'ArrowRight',
  'Top', 'Bottom', 'Back', 'Position',
  // 操作相关
  'Plus', 'Minus', 'Close', 'Check', 'Edit', 'Delete', 'Search', 'Refresh',
  'Star', 'Warning', 'InfoFilled', 'SuccessFilled',
  // 数据相关
  'DataAnalysis', 'DataBoard', 'DataLine', 'TrendCharts', 'PieChart',
  'Document', 'Files', 'Notebook', 'Tickets', 'Postcard',
  // 消息相关
  'Bell', 'Message', 'ChatDotRound', 'ChatLineRound', 'QuestionFilled',
  // 时间相关
  'Clock', 'Calendar', 'Timer', 'Watch',
  // 其他
  'OfficeBuilding', 'School', 'Shop', 'Camera', 'Picture',
  'Upload', 'Download', 'Printer', 'VideoPlay', 'VideoPause'
]

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const searchText = ref('')

// 过滤图标列表
const filteredIcons = computed(() => {
  if (!searchText.value) {
    return commonIcons
  }
  return commonIcons.filter(icon => 
    icon.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 选择图标
function selectIcon(icon: string) {
  emit('update:modelValue', icon)
}
</script>

<style scoped>
.icon-picker-trigger {
  width: 100%;
  cursor: pointer;
}

.icon-input {
  cursor: pointer;
}

.icon-input:hover {
  border-color: #409eff;
}

.icon-input:hover .arrow-icon {
  color: #409eff;
}

.arrow-icon {
  transition: transform 0.3s;
}

.icon-picker-trigger:hover .arrow-icon {
  transform: rotate(180deg);
}

.icon-picker-panel {
  max-height: 400px;
  overflow-y: auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #409eff;
    background-color: #f5f7fa;
  }
  
  &.active {
    border-color: #409eff;
    background-color: #ecf5ff;
  }
}

.icon-name {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
}

.empty-text {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.mb-3 {
  margin-bottom: 12px;
}
</style>
