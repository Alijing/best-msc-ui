<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Performer } from '~/stores/types/performer'
import PerformerFormDialog from './PerformerFormDialog.vue'
import { ConfirmDialog } from '#components'

const performerStore = usePerformerStore()
const overlay = useOverlay()
const toast = useToast()

// 表格列定义
const columns: TableColumn<Performer>[] = [
  { accessorKey: 'name', header: '演员姓名' },
  { accessorKey: 'enUsName', header: '英文名' },
  {
    accessorKey: 'birthday',
    header: '出生日期',
    cell: ({ row }: any) => row.getValue('birthday') || '-'
  },
  {
    accessorKey: 'height',
    header: '身高(cm)',
    cell: ({ row }: any) => row.getValue('height') || '-'
  },
  {
    accessorKey: 'bust',
    header: '胸围(cm)',
    cell: ({ row }: any) => row.getValue('bust') || '-'
  },
  {
    accessorKey: 'waistSize',
    header: '腰围(cm)',
    cell: ({ row }: any) => row.getValue('waistSize') || '-'
  },
  {
    accessorKey: 'hipCircumference',
    header: '臀围(cm)',
    cell: ({ row }: any) => row.getValue('hipCircumference') || '-'
  },
  {
    accessorKey: 'cupSize',
    header: '罩杯',
    cell: ({ row }: any) => row.getValue('cupSize') || '-'
  },
  {
    accessorKey: 'remark',
    header: '备注',
    cell: ({ row }: any) => {
      const remark = row.getValue('remark') as string
      if (!remark) return '-'
      
      const UTooltip = resolveComponent('UTooltip')
      return h(UTooltip, {
        text: remark
      }, () =>
        h('div', {
          style: {
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '200px'
          }
        }, remark)
      )
    }
  },
  {
    accessorKey: 'actions',
    header: '操作',
    enableSorting: false,
    meta: {
      class: {
        th: 'w-32 text-center',
        td: 'w-32 text-center'
      }
    },
    cell: ({ row }: any) => {
      const performer = row.original as Performer
      return h('div', { class: 'flex gap-2 justify-center' }, [
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'xs',
          color: 'success',
          onClick: () => handleEdit(performer)
        }, () => [
          h(resolveComponent('UIcon'), { name: 'i-heroicons-pencil-square-20-solid' }),
          ' 编辑'
        ]),
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'xs',
          color: 'error',
          onClick: () => handleDelete(performer)
        }, () => [
          h(resolveComponent('UIcon'), { name: 'i-heroicons-trash-20-solid' }),
          ' 删除'
        ])
      ])
    }
  }
] as const

// 查询条件
const queryForm = ref({
  name: ''
})

const formDialogOpen = ref(false)
const currentPerformerId = ref<string | number | null>(null)

// 加载列表
onMounted(async () => {
  await fetchList()
})

// 获取列表
async function fetchList() {
  await performerStore.fetchList({
    pageIndex: 1,
    name: queryForm.value.name || undefined
  })
}

// 分页变化
function handlePageChange(pageIndex: number) {
  performerStore.fetchList({ pageIndex })
}

// 页面大小变化
function handlePageSizeChange(size: number) {
  performerStore.fetchList({ pageSize: size, pageIndex: 1 })
}

// 查询
function handleQuery() {
  fetchList()
}

// 重置查询
function resetQuery() {
  queryForm.value.name = ''
  performerStore.resetQuery()
  fetchList()
}

// 打开新增对话框
function handleAdd() {
  currentPerformerId.value = null
  formDialogOpen.value = true
}

// 打开编辑对话框
function handleEdit(performer: Performer) {
  currentPerformerId.value = performer.id
  formDialogOpen.value = true
}

// 删除确认
async function handleDelete(performer: Performer) {
  // 每次都创建新的对话框实例
  const confirmDialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true
  })

  const confirmed = await confirmDialog.open({
    title: '删除演员',
    message: `确定要删除演员【${performer.name}】吗？此操作不可恢复。`,
    confirmText: '删除'
  })

  if (confirmed) {
    try {
      await performerStore.deletePerformer([performer.id])
      toast.add({
        title: '删除成功',
        color: 'success'
      })
      // 如果当前页只有一条数据且不是第一页，返回上一页
      if (performerStore.list.length === 1 && performerStore.query.pageIndex > 1) {
        await performerStore.fetchList({ pageIndex: performerStore.query.pageIndex - 1 })
      } else {
        await performerStore.fetchList()
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
      <div class="flex flex-wrap gap-3 items-end">
        <UFormGroup label="演员姓名">
          <UInput
            v-model="queryForm.name"
            placeholder="请输入演员姓名"
            clearable
            class="w-[240px]"
            @keyup.enter="handleQuery"
          />
        </UFormGroup>

        <div class="flex items-end gap-2">
          <UButton
            color="primary"
            @click="handleQuery"
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
        新增演员
      </UButton>
    </div>

    <!-- 表格区域 -->
    <UCard>
      <UTable
        :loading="performerStore.loading"
        loading-animation="elastic"
        :columns="columns"
        :data="performerStore.list || []"
        class="table-fixed"
      />
      <!-- 分页 -->
      <div class="mt-4 flex items-center justify-between">
        <USelect
          v-model="performerStore.query.pageSize"
          :items="[10, 20, 50, 100]"
          @update:model-value="handlePageSizeChange"
        />
        <UPagination
          v-model:page="performerStore.query.pageIndex"
          :total="performerStore.total"
          :items-per-page="performerStore.query.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <!-- 表单对话框 -->
    <PerformerFormDialog
      v-model:open="formDialogOpen"
      :performer-id="currentPerformerId"
      @success="handleFormSuccess"
    />
  </div>
</template>
