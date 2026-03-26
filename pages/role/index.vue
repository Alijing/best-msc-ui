<template>
  <div class="role-list-page p-6">
    <!-- 查询区域 -->
    <el-card class="search-card mb-6">
      <el-form :inline="true" :model="queryForm">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="角色名称">
              <el-input
                v-model="queryForm.name"
                placeholder="请输入角色名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="角色编码">
              <el-input
                v-model="queryForm.code"
                placeholder="请输入角色编码"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" class="full-width-select">
              <el-select
                v-model="queryForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 100%"
                @keyup.enter="handleSearch"
              >
                <el-option label="全部" :value="undefined" />
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button :loading="loading" @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="roles"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">启用</el-tag>
            <el-tag v-else-if="row.status === 0" type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        class="mt-4 flex justify-end"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <RoleFormDialog
      v-model:visible="dialogVisible"
      :role-data="currentRoleData"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
// 角色列表页面
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import RoleFormDialog from '~/modules/role/components/RoleFormDialog.vue'

// 设置页面标题
useHead({
  title: '角色管理 - BestMSC'
})

const roleStore = useRoleStore()
const { roles, total, loading, query } = storeToRefs(roleStore)

// 查询表单数据
const queryForm = ref({
  name: '',
  code: '',
  status: undefined as number | undefined
})

// 分页
const currentPage = computed({
  get: () => query.value.pageIndex,
  set: (val) => roleStore.setPage(val)
})

const pageSize = computed({
  get: () => query.value.pageSize,
  set: (val) => roleStore.setPageSize(val)
})

// 弹窗控制
const dialogVisible = ref(false)
const currentRoleData = ref()

// 格式化日期
function formatDate(date: string | Date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 查询
function handleSearch() {
  roleStore.setQuery('name', queryForm.value.name)
  roleStore.setQuery('code', queryForm.value.code)
  roleStore.setQuery('status', queryForm.value.status)
  roleStore.setPage(1)
  roleStore.fetchRoles()
}

// 重置
function handleReset() {
  queryForm.value = {
    name: '',
    code: '',
    status: undefined
  }
  roleStore.resetQuery()
  roleStore.fetchRoles()
}

// 新增
function handleCreate() {
  currentRoleData.value = undefined
  dialogVisible.value = true
}

// 编辑
async function handleEdit(row: any) {
  // 获取完整的角色详情（虽然这里直接用 row 也可以，但为了演示使用 getRoleById）
  const roleDetail = await roleStore.getRoleById(row.id)
  if (roleDetail) {
    currentRoleData.value = { ...roleDetail }
    dialogVisible.value = true
  }
}

// 删除
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该角色吗？删除后不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await roleStore.deleteRole(row.id)
  } catch (error) {
    // 用户取消删除
  }
}

// 分页变化
function handleSizeChange(size: number) {
  roleStore.setPageSize(size)
  roleStore.fetchRoles()
}

function handleCurrentChange(page: number) {
  roleStore.setPage(page)
  roleStore.fetchRoles()
}

// 弹窗成功回调
function handleDialogSuccess() {
  dialogVisible.value = false
  roleStore.fetchRoles()
}

// 初始化加载
onMounted(() => {
  roleStore.fetchRoles()
})
</script>

<style scoped>
.role-list-page {
  min-height: calc(100vh - 84px);
}

.search-card :deep(.el-card__body) {
  padding-bottom: 0;
}

/* 让下拉框占满 el-col 的宽度 */
.full-width-select :deep(.el-form-item__content) {
  width: auto !important;
  min-width: 120px;
  margin-left: 0 !important;
}
</style>
