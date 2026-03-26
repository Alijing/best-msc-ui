<template>
  <div class="user-list-page p-6">
    <!-- 查询区域 -->
    <el-card class="search-card mb-6">
      <el-form :inline="true" :model="queryForm">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="账号">
              <el-input
                v-model="queryForm.account"
                placeholder="请输入账号"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="姓名">
              <el-input
                v-model="queryForm.name"
                placeholder="请输入姓名"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input
                v-model="queryForm.phone"
                placeholder="请输入联系电话"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="角色" class="full-width-select">
              <el-select
                v-model="queryForm.role"
                placeholder="请选择角色"
                clearable
                :loading="rolesLoading"
                style="width: 100%"
                @keyup.enter="handleSearch"
              >
                <el-option
                  v-for="role in roles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增用户
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
        :data="users"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="account" label="账号"  />
        <el-table-column prop="name" label="姓名"  />
        <el-table-column prop="phone" label="联系电话"  />
        <el-table-column prop="role" label="角色" >
          <template #default="{ row }">
            <el-tag v-if="row.role === 'admin'" type="danger">管理员</el-tag>
            <el-tag v-else-if="row.role === 'user'" type="primary">普通用户</el-tag>
            <el-tag v-else-if="row.role === 'guest'" type="info">访客</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" >
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
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
    <UserFormDialog
      v-model:visible="dialogVisible"
      :user-data="currentUserData"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
// 用户列表页面
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import UserFormDialog from '~/modules/user/components/UserFormDialog.vue'

// 设置页面标题
useHead({
  title: '用户管理 - BestMSC'
})

const userManageStore = useUserManageStore()
const { users, total, loading, query, roles } = storeToRefs(userManageStore)

const rolesLoading = ref(false)

// 查询表单数据
const queryForm = ref({
  account: '',
  name: '',
  phone: '',
  role: ''
})

// 分页
const currentPage = computed({
  get: () => query.value.pageIndex,
  set: (val) => userManageStore.setPage(val)
})

const pageSize = computed({
  get: () => query.value.pageSize,
  set: (val) => userManageStore.setPageSize(val)
})

// 弹窗控制
const dialogVisible = ref(false)
const currentUserData = ref()

// 加载角色列表（失败不影响用户列表）
async function loadRoles() {
  rolesLoading.value = true
  try {
    await userManageStore.fetchRoles()
  } catch (error) {
    // 静默处理错误，不影响用户列表加载
  } finally {
    rolesLoading.value = false
  }
}

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
  userManageStore.setQuery('account', queryForm.value.account)
  userManageStore.setQuery('name', queryForm.value.name)
  userManageStore.setQuery('phone', queryForm.value.phone)
  userManageStore.setQuery('role', queryForm.value.role)
  userManageStore.setPage(1)
  userManageStore.fetchUsers()
}

// 重置
function handleReset() {
  queryForm.value = {
    account: '',
    name: '',
    phone: '',
    role: ''
  }
  userManageStore.resetQuery()
  userManageStore.fetchUsers()
}

// 新增
function handleCreate() {
  currentUserData.value = undefined
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: any) {
  currentUserData.value = { ...row }
  dialogVisible.value = true
}

// 删除
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await userManageStore.deleteUser(row.id)
  } catch (error) {
    // 用户取消删除
  }
}

// 分页变化
function handleSizeChange(size: number) {
  userManageStore.setPageSize(size)
  userManageStore.fetchUsers()
}

function handleCurrentChange(page: number) {
  userManageStore.setPage(page)
  userManageStore.fetchUsers()
}

// 弹窗成功回调
function handleDialogSuccess() {
  dialogVisible.value = false
  userManageStore.fetchUsers()
}

// 初始化加载
onMounted(() => {
  loadRoles()
  userManageStore.fetchUsers()
})
</script>

<style scoped>
.user-list-page {
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
