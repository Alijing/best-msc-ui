<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Role } from '~/stores/types/role'
import RoleFormDialog from './RoleFormDialog.vue'
import { ConfirmDialog } from '#components'

const roleStore = useRoleStore()
const overlay = useOverlay()
const toast = useToast()

// 表格列定义
const columns: TableColumn<Role>[] = [
  { accessorKey: 'name', header: '角色名称' },
  { accessorKey: 'code', header: '角色编码' },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }: any) => {
      const status = row.getValue('status')
      const UBadge = resolveComponent('UBadge')
      
      return h(UBadge, {
        color: status === '启用' ? 'success' : 'error',
        variant: 'soft'
      }, () => status )
    }
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
    accessorKey: 'createTime',
    header: '创建时间'
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
      const role = row.original as Role
      return h('div', { class: 'flex gap-2 justify-center' }, [
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'xs',
          color: 'success',
          onClick: () => handleEdit(role)
        }, () => [
          h(resolveComponent('UIcon'), { name: 'i-heroicons-pencil-square-20-solid' }),
          ' 编辑'
        ]),
        h(resolveComponent('UButton'), {
          variant: 'ghost',
          size: 'xs',
          color: 'error',
          onClick: () => handleDelete(role)
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
  name: '',
  code: '',
  status: undefined as number | undefined
})

const formDialogOpen = ref(false)
const currentRoleId = ref<string | number | null>(null)

// 加载列表
onMounted(async () => {
  await fetchList()
})

// 获取列表
async function fetchList() {
  await roleStore.fetchList({
    pageIndex: 1,
    name: queryForm.value.name || undefined,
    code: queryForm.value.code || undefined,
    status: queryForm.value.status
  })
}

// 分页变化
function handlePageChange(pageIndex: number) {
  roleStore.fetchList({ pageIndex })
}

// 页面大小变化
function handlePageSizeChange(size: number) {
  roleStore.fetchList({ pageSize: size, pageIndex: 1 })
}

// 查询
function handleQuery() {
  fetchList()
}

// 重置查询
function resetQuery() {
  queryForm.value.name = ''
  queryForm.value.code = ''
  queryForm.value.status = undefined
  roleStore.resetQuery()
  fetchList()
}

// 打开新增对话框
function handleAdd() {
  currentRoleId.value = null
  formDialogOpen.value = true
}

// 打开编辑对话框
function handleEdit(role: Role) {
  currentRoleId.value = role.id
  formDialogOpen.value = true
}

// 删除确认
async function handleDelete(role: Role) {
  // 每次都创建新的对话框实例
  const confirmDialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true
  })

  const confirmed = await confirmDialog.open({
    title: '删除角色',
    message: `确定要删除角色【${role.name}】吗？此操作不可恢复。`,
    confirmText: '删除'
  })

  if (confirmed) {
    try {
      await roleStore.deleteRole([role.id])
      toast.add({
        title: '删除成功',
        color: 'success'
      })
      // 如果当前页只有一条数据且不是第一页，返回上一页
      if (roleStore.list.length === 1 && roleStore.query.pageIndex > 1) {
        await roleStore.fetchList({ pageIndex: roleStore.query.pageIndex - 1 })
      } else {
        await roleStore.fetchList()
      }
    } catch {
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
        <UFormGroup label="角色名称">
          <UInput
            v-model="queryForm.name"
            placeholder="请输入角色名称"
            clearable
            class="w-[200px]"
            @keyup.enter="handleQuery"
          />
        </UFormGroup>

        <UFormGroup label="角色编码">
          <UInput
            v-model="queryForm.code"
            placeholder="请输入角色编码"
            clearable
            class="w-[200px]"
            @keyup.enter="handleQuery"
          />
        </UFormGroup>

        <UFormGroup label="状态">
          <USelect
            v-model="queryForm.status"
            :items="[
              { label: '全部', value: undefined },
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]"
            placeholder="请选择状态"
            class="w-[150px]"
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
        新增角色
      </UButton>
    </div>

    <!-- 表格区域 -->
    <UCard>
      <UTable
        :loading="roleStore.loading"
        loading-animation="elastic"
        :columns="columns"
        :data="roleStore.list || []"
        class="table-fixed"
      />
      <!-- 分页 -->
      <div class="mt-4 flex items-center justify-between">
        <USelect
          v-model="roleStore.query.pageSize"
          :items="[10, 20, 50, 100]"
          @update:model-value="handlePageSizeChange"
        />
        <UPagination
          v-model:page="roleStore.query.pageIndex"
          :total="roleStore.total"
          :items-per-page="roleStore.query.pageSize"
          color="success"
          variant="outline"
          @update:page="handlePageChange"
        />
      </div>
    </UCard>

    <!-- 表单对话框 -->
    <RoleFormDialog
      v-model:open="formDialogOpen"
      :role-id="currentRoleId"
      @success="handleFormSuccess"
    />
  </div>
</template>
