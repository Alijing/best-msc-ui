import { defineStore } from 'pinia'

// 角色类型
export interface Role {
  id: number
  name: string
  code: string
  status: 0 | 1
  remark?: string
  createTime: Date
}

// 查询参数类型
export interface RoleQuery {
  pageIndex: number
  pageSize: number
  name?: string
  code?: string
  status?: 0 | 1
}

// 新增角色请求类型
export interface CreateRoleRequest {
  name: string
  code: string
  status: 0 | 1
  remark?: string
}

// 编辑角色请求类型
export interface UpdateRoleRequest {
  name?: string
  code?: string
  status?: 0 | 1
  remark?: string
}

// 角色列表响应类型
export interface RoleListResponse {
  total: number
  data: Role[]
}

// 角色管理 Store
export const useRoleStore = defineStore('role', () => {
  // State
  const roles = ref<Role[]>([])
  const total = ref(0)
  const loading = ref(false)
  const query = ref<RoleQuery>({
    pageIndex: 1,
    pageSize: 10,
    name: '',
    code: '',
    status: undefined
  })

  // Actions
  /**
   * 获取角色列表
   */
  async function fetchRoles() {
    loading.value = true
    try {
      const params = {
        page: query.value.pageIndex,
        pageSize: query.value.pageSize,
        name: query.value.name || '',
        code: query.value.code || '',
        status: query.value.status !== undefined ? String(query.value.status) : ''
      }
      
      const data = await $fetch<RoleListResponse>('/api/role/all', {
        method: 'GET',
        query: params
      })
      
      roles.value = data.data
      total.value = data.total
    } catch (error) {
      console.error('获取角色列表失败:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增角色
   */
  async function createRole(roleData: CreateRoleRequest) {
    loading.value = true
    try {
      await $fetch('/api/role/create', {
        method: 'POST',
        body: roleData
      })
      
      ElMessage.success('新增角色成功')
      await fetchRoles()
      return true
    } catch (error) {
      console.error('新增角色失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 编辑角色
   */
  async function updateRole(id: number, roleData: UpdateRoleRequest) {
    loading.value = true
    try {
      await $fetch(`/api/role/update/${id}`, {
        method: 'PUT',
        body: roleData
      })
      
      ElMessage.success('编辑角色成功')
      await fetchRoles()
      return true
    } catch (error) {
      console.error('编辑角色失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除角色
   */
  async function deleteRole(id: number) {
    loading.value = true
    try {
      await $fetch(`/api/role/delete/${id}`, {
        method: 'DELETE'
      })
      
      ElMessage.success('删除角色成功')
      await fetchRoles()
      return true
    } catch (error) {
      console.error('删除角色失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单个角色（用于编辑回显）
   */
  async function getRoleById(id: number): Promise<Role | null> {
    try {
      const data = await $fetch<Role>(`/api/role/${id}`)
      return data
    } catch (error) {
      console.error('获取角色详情失败:', error)
      ElMessage.error('获取角色详情失败')
      return null
    }
  }

  /**
   * 设置查询条件
   */
  function setQuery(key: keyof RoleQuery, value: any) {
    if (key !== 'pageIndex' && key !== 'pageSize') {
      query.value[key] = value
    }
  }

  /**
   * 重置查询条件
   */
  function resetQuery() {
    query.value = {
      pageIndex: 1,
      pageSize: 10,
      name: '',
      code: '',
      status: undefined
    }
  }

  /**
   * 设置分页
   */
  function setPage(page: number) {
    query.value.pageIndex = page
  }

  /**
   * 设置每页条数
   */
  function setPageSize(size: number) {
    query.value.pageSize = size
    query.value.pageIndex = 1
  }

  return {
    // State
    roles,
    total,
    loading,
    query,
    
    // Actions
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    setQuery,
    resetQuery,
    setPage,
    setPageSize
  }
})
