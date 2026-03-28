<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TasteVideo, PerformerDictItem } from '~/stores/types/tasteVideo'

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', video: TasteVideo): void
  (e: 'preview', id: number): void
}>()

const tasteVideoStore = useTasteVideoStore()

// 查询表单
const queryForm = ref({
  number: '',
  performer: undefined as number | string | undefined,
  rating: undefined as number | undefined,
  status: undefined as 0 | 1 | 2 | undefined,
  gmtCreate: [] as string[]
})

// 演员字典
const performers = ref<PerformerDictItem[]>([])

// 状态选项
const statusOptions = [
  { value: 0, label: '未下载' },
  { value: 1, label: '已下载' },
  { value: 2, label: '已观看' }
]

// 加载演员字典
onMounted(async () => {
  performers.value = await tasteVideoStore.fetchPerformerDict()
})

// 查询处理
function handleQuery() {
  tasteVideoStore.setQuery({
    pageIndex: 1,
    number: queryForm.value.number || undefined,
    performer: queryForm.value.performer,
    rating: queryForm.value.rating,
    status: queryForm.value.status,
    gmtCreate: queryForm.value.gmtCreate
  })
  tasteVideoStore.fetchList()
}

// 重置处理
function handleReset() {
  queryForm.value = {
    number: '',
    performer: undefined,
    rating: undefined,
    status: undefined,
    gmtCreate: []
  }
  tasteVideoStore.resetQuery()
  tasteVideoStore.fetchList()
}

// 分页变化
function handlePageChange(page: number) {
  tasteVideoStore.setPage(page)
  tasteVideoStore.fetchList()
}

function handleSizeChange(size: number) {
  tasteVideoStore.setPageSize(size)
  tasteVideoStore.fetchList()
}

// 删除确认
async function handleDelete(video: TasteVideo) {
  try {
    await ElMessageBox.confirm(`确定要删除视频"${video.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await tasteVideoStore.deleteVideo(video.id)
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 复制磁力链接
function handleDownload(video: TasteVideo) {
  navigator.clipboard.writeText(video.magnetUri).then(() => {
    ElMessage.success('磁力链接已复制')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 获取状态标签类型
function getStatusTagType(status: 0 | 1 | 2): 'info' | 'primary' | 'success' {
  const types = {
    0: 'info',
    1: 'primary',
    2: 'success'
  }
  return types[status]
}

</script>

<template>
  <div class="taste-video-list">
    <!-- 查询区 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="queryForm" inline label-width="100px">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="车牌号">
              <el-input
                v-model="queryForm.number"
                placeholder="请输入车牌号"
                clearable
                @blur="handleQuery"
              />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="演员">
              <el-select
                v-model="queryForm.performer"
                placeholder="请选择演员"
                filterable
                clearable
                style="width: 130px"
                @change="handleQuery"
              >
                <el-option
                  v-for="item in performers"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="评分">
              <el-rate
                v-model="queryForm.rating"
                :clearable="true"
                @change="handleQuery"
              />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="状态">
              <el-select
                v-model="queryForm.status"
                placeholder="全部状态"
                clearable
                style="width: 130px"
                @change="handleQuery"
              >
                <el-option
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="queryForm.gmtCreate"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                @change="handleQuery"
              />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item>
              <el-button type="primary" @click="handleQuery">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 列表区 -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>视频列表</span>
          <el-button type="primary" @click="emit('add')">
            <el-icon><Plus /></el-icon>
            新增视频
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="tasteVideoStore.loading"
        :data="tasteVideoStore.list"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="number" label="车牌号" width="180" />
        <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.name" placement="top">
              <span class="truncate">{{ row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="performer" label="演员" width="100" />
        <el-table-column prop="releaseDate" label="发行时间" width="120">
          <template #default="{ row }">
            {{ row.releaseDate }}
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="150">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ statusOptions.find(opt => opt.value === row.status)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间" width="160">
          <template #default="{ row }">
            {{ row.gmtCreate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="emit('preview', row.id)">
              <el-icon><Picture /></el-icon>
              预览
            </el-button>
            <el-button link type="success" size="small" @click="handleDownload(row)">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button link type="warning" size="small" @click="emit('edit', row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="tasteVideoStore.query.pageIndex"
        v-model:page-size="tasteVideoStore.query.pageSize"
        :total="tasteVideoStore.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<style scoped>
.taste-video-list {

}

.search-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-rate) {
  font-size: 14px;
}

:deep(.el-rate__text) {
  font-size: 12px;
}

.truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
