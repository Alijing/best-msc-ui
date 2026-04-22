<script setup lang="ts">
import {h, resolveComponent} from 'vue'
import {useDebounceFn} from '@vueuse/core'
import type {TasteVideo, VideoStatus} from '~/stores/types/tasteVideo'
import {CalendarDate, DateFormatter, getLocalTimeZone} from '@internationalized/date'
import {ConfirmDialog} from '#components'

const tasteVideoStore = useTasteVideoStore()
const overlay = useOverlay()
const toast = useToast()

// 创建确认对话框实例
const confirmDialog = overlay.create(ConfirmDialog, {
  destroyOnClose: true
})

// 表格列定义
const columns: TableColumn<TasteVideo>[] = [
  {accessorKey: 'number', header: '车牌号'},
  {
    accessorKey: 'name',
    header: '视频名称',
    cell: ({row}) => {
      const name = row.getValue('name') as string
      const UTooltip = resolveComponent('UTooltip')

      return h(UTooltip, {
            text: name
          }, () =>
              h('div', {
                style: {
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px'
                }
              }, name)
      )
    }
  },
  {accessorKey: 'performer', header: '演员'},
  {
    accessorKey: 'releaseDate',
    header: '发行时间',
    cell: ({row}: any) => new Date(row.getValue('releaseDate')).toLocaleDateString('zh-CN')
  },
  {
    accessorKey: 'rating',
    header: '评分',
    cell: ({row}: any) => h('div', {class: 'flex gap-1'},
        Array.from({length: 5}).map((_, i) => {
          const star = i + 1
          return h('span', {
            class: star <= row.getValue('rating') ? 'text-yellow-500' : 'text-gray-300'
          }, star <= row.getValue('rating') ? '★' : '☆')
        })
    )
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({row}: any) => {
      const status = row.getValue('status') as VideoStatus
      const colorMap = {'未下载': 'primary', '已下载': 'info', '已观看': 'error'}
      return h(resolveComponent('UBadge'), {
        color: colorMap[status],
        class: 'capitalize'
      }, () => status)
    }
  },
  {
    accessorKey: 'gmtCreate',
    header: '创建时间',
    cell: ({row}: any) => new Date(row.getValue('gmtCreate')).toLocaleString('zh-CN')
  },
  {
    accessorKey: 'actions',
    header: '操作',
    enableSorting: false,
    meta: {
      class: {
        th: 'w-32 text-center',
        td: 'w-32 text-center'   // 应用到每个单元格
      }
    },
    cell: ({row}: any) => {
      const video = row.original as TasteVideo
      return h('div', {class: 'flex gap-2'}, [
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'sm',
          onClick: () => handlePreview(video)
        }, () => [
          h(resolveComponent('UIcon'), {name: 'i-heroicons-eye-20-solid'}),
          ' 预览'
        ]),
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'sm',
          color: 'info',
          onClick: () => handleDownload(video)
        }, () => [
          h(resolveComponent('UIcon'), {name: 'i-heroicons-arrow-down-tray-20-solid'}),
          ' 下载'
        ]),
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'sm',
          color: 'success',
          onClick: () => handleEdit(video)
        }, () => [
          h(resolveComponent('UIcon'), {name: 'i-heroicons-pencil-square-20-solid'}),
          ' 编辑'
        ]),
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'sm',
          color: 'error',
          onClick: () => handleDelete(video)
        }, () => [
          h(resolveComponent('UIcon'), {name: 'i-heroicons-trash-20-solid'}),
          ' 删除'
        ])
      ])
    }
  }
] as const

// 表单查询条件
const queryForm = ref({
  number: '',
  performer: '' as string | number | undefined,
  rating: undefined as number | undefined,
  status: undefined as VideoStatus | undefined
})

const modelValue = shallowRef({
  start: null as CalendarDate | null,
  end: null as CalendarDate | null
})

// 日期格式化
const df = new DateFormatter('zh-CN', {
  dateStyle: 'medium'
})

const formDialogOpen = ref(false)
const previewDialogOpen = ref(false)
const currentVideoId = ref<string | number | null>(null)

// 加载演员字典并获取列表
onMounted(async () => {
  await tasteVideoStore.fetchPerformerDict()
  // 默认调用查询接口，不传参数使用默认分页
  await fetchList()
})

// 获取列表
async function fetchList() {
  // 转换日期格式：开始时间 00:00:00，结束时间 23:59:59
  const gmtCreate = modelValue.value.start && modelValue.value.end
      ? [
          `${modelValue.value.start.toString()} 00:00:00`,
          `${modelValue.value.end.toString()} 23:59:59`
        ]
      : undefined
  await tasteVideoStore.fetchList({
    pageIndex: 1,
    number: queryForm.value.number || undefined,
    performer: queryForm.value.performer || undefined,
    rating: queryForm.value.rating || undefined,
    status: queryForm.value.status || undefined,
    gmtCreate
  })
}

// 分页变化
function handlePageChange(page: number) {
  tasteVideoStore.fetchList({pageIndex: page})
}

// 页面大小变化
function handlePageSizeChange(size: number) {
  tasteVideoStore.fetchList({pageSize: size, pageIndex: 1})
}

// 查询条件变化（防抖）
const debouncedFetch = useDebounceFn(() => {
  fetchList()
}, 500)

function handleQueryChange() {
  debouncedFetch()
}

// 重置查询
function resetQuery() {
  queryForm.value = {
    number: '',
    performer: undefined,
    rating: undefined,
    status: undefined
  }
  modelValue.value = {
    start: null,
    end: null
  }
  tasteVideoStore.resetQuery()
  fetchList()
}

// 打开新增对话框
function handleAdd() {
  currentVideoId.value = null
  formDialogOpen.value = true
}

// 打开编辑对话框
function handleEdit(video: TasteVideo) {
  currentVideoId.value = video.id
  formDialogOpen.value = true
}

// 打开预览对话框
function handlePreview(video: TasteVideo) {
  currentVideoId.value = video.id
  previewDialogOpen.value = true
}

// 下载（复制磁力链接）
function handleDownload(video: TasteVideo) {
  navigator.clipboard.writeText(video.magnetUri).then(() => {
    const toast = useToast()
    toast.add({
      title: '复制成功',
      description: '磁力链接已复制到剪贴板',
      icon: 'i-heroicons-check-circle'
    })
  }).catch(() => {
    const toast = useToast()
    toast.add({
      title: '复制失败',
      description: '请手动复制磁力链接',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  })
}

// 删除确认
async function handleDelete(video: TasteVideo) {
  // 每次都创建新的对话框实例
  const confirmDialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true
  })

  const confirmed = await confirmDialog.open({
    title: '删除视频',
    message: `确定要删除视频【${video.name}】吗？此操作不可恢复。`,
    confirmText: '删除'
  })

  if (confirmed) {
    try {
      await tasteVideoStore.deleteVideo([video.id])
      toast.add({
        title: '删除成功',
        color: 'success'
      })
      // 如果当前页只有一条数据且不是第一页，返回上一页
      if (tasteVideoStore.list.length === 1 && tasteVideoStore.query.pageIndex > 1) {
        await tasteVideoStore.fetchList({pageIndex: tasteVideoStore.query.pageIndex - 1})
      } else {
        await tasteVideoStore.fetchList()
      }
    } catch (error) {
      toast.add({
        title: '删除失败',
        description: '请重试',
        color: 'error'
      })
    }
  }
}

// 表单提交成功
function handleFormSuccess() {
  fetchList()
}

</script>

<template>
  <div class="p-4">
    <!-- 查询区域 -->
    <UCard class="mb-4">
      <div class="flex flex-wrap gap-3">
        <UFormGroup label="车牌号">
          <UInput
            v-model="queryForm.number"
            placeholder="请输入车牌号"
            clearable
            @blur="handleQueryChange"
          />
        </UFormGroup>

        <UFormGroup label="演员">
          <USelect
            v-model="queryForm.performer"
            placeholder="请选择演员"
            :items="tasteVideoStore.performerDict ? tasteVideoStore.performerDict.map(item => ({ label: item.name, value: item.id })) : []"
            searchable
            clearable
            @update:model-value="handleQueryChange"
          />
        </UFormGroup>

        <UFormGroup label="状态">
          <USelect
            v-model="queryForm.status"
            placeholder="请选择状态"
            :items="[
              { label: '未下载', value: 0 },
              { label: '已下载', value: 1 },
              { label: '已观看', value: 2 }
            ]"
            clearable
            @update:model-value="handleQueryChange"
          />
        </UFormGroup>

        <UFormGroup label="创建时间">
          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-[280px] justify-start"
            >
              {{ modelValue.start && modelValue.end ? `${df.format(modelValue.start.toDate(getLocalTimeZone()))} - ${df.format(modelValue.end.toDate(getLocalTimeZone()))}` : '请选择日期范围' }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="modelValue"
                class="p-2"
                locale="zh-CN"
                :number-of-months="2"
                range
                @update:model-value="handleQueryChange"
              />
            </template>
          </UPopover>
        </UFormGroup>

        <div class="flex items-end gap-2">
          <UButton
            color="primary"
            @click="fetchList"
          >
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="mr-1"
            />
            查询
          </UButton>
          <UButton @click="resetQuery">
            重置
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- 操作按钮 -->
    <div class="mb-4 flex justify-between items-center">
      <UButton
        color="primary"
        @click="handleAdd"
      >
        <UIcon
          name="i-heroicons-plus-20-solid"
          class="mr-1"
        />
        新增视频
      </UButton>
    </div>

    <!-- 表格区域 -->
    <UCard>
      <UTable
        :loading="tasteVideoStore.loading"
        loading-animation="elastic"
        :columns="columns"
        :data="tasteVideoStore.list || []"
        class="table-fixed"
      />
      <!-- 分页 -->
      <div class="mt-4 flex items-center justify-between">
        <USelect
          v-model="tasteVideoStore.query.pageSize"
          :items="[10, 20, 50, 100]"
          @update:model-value="handlePageSizeChange"
        />
        <UPagination
          v-model:page="tasteVideoStore.query.pageIndex"
          :total="tasteVideoStore.total"
          :items-per-page="tasteVideoStore.query.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <!-- 表单对话框 -->
    <TasteVideoFormDialog
      v-model:open="formDialogOpen"
      :video-id="currentVideoId"
      :performer-dict="tasteVideoStore.performerDict"
      @success="handleFormSuccess"
    />

    <!-- 预览对话框 -->
    <TasteVideoPreviewDialog
      v-model:open="previewDialogOpen"
      :video-id="currentVideoId"
    />
  </div>
</template>
