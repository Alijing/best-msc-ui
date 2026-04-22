/**
 * 角色管理 Store
 */
import { defineStore } from 'pinia'
import type { ApiResponse } from '~/types/api'
import type { Role, RoleQuery, RoleRequest } from '~/stores/types/role'

export interface RoleState {
  list: Role[]
  total: number
  loading: boolean
  query: RoleQuery
  // 编码验证状态
  codeValidating: boolean
  codeError: string
}

export const useRoleStore = defineStore('role', () => {
  const state = useState<RoleState>('role', () => ({
    list: [],
    total: 0,
    loading: false,
    query: {
      pageIndex: 1,
      pageSize: 10,
      name: undefined,
      code: undefined,
      status: undefined
    },
    codeValidating: false,
    codeError: ''
  }))

  /**
   * 获取角色列表
   */
  async function fetchList(query?: Partial<RoleQuery>) {
    try {
      state.value.loading = true

      if (query) {
        state.value.query = { ...state.value.query, ...query }
      }

      const response = await clientApiFetch('/api/system/role', {
        method: 'GET',
        query: {
          pageIndex: state.value.query.pageIndex,
          pageSize: state.value.query.pageSize,
          ...(state.value.query.name && { name: state.value.query.name }),
          ...(state.value.query.code && { code: state.value.query.code }),
          ...(state.value.query.status !== undefined && { status: state.value.query.status })
        }
      })

      if (response.code === 20000) {
        state.value.list = response.data
        state.value.total = response.total || 0
      }
    } catch (error) {
      console.error('[RoleStore] 获取角色列表失败:', error)
      state.value.list = []
      state.value.total = 0
    } finally {
      state.value.loading = false
    }
  }

  /**
   * 根据ID获取角色详情
   */
  async function fetchRoleById(id: string | number): Promise<RoleRequest | null> {
    const response = await clientApiFetch(`/api/system/role/${id}`, {
      method: 'GET'
    })

    if (response.code === 20000) {
      return response.data
    }
    return null
  }

  /**
   * 创建角色
   */
  async function createRole(payload: RoleRequest) {
    const data = await clientApiFetch('/api/system/role', {
      method: 'POST',
      body: payload
    })

    if (data.code === 20000) {
      await fetchList()
    }

    return data
  }

  /**
   * 更新角色
   */
  async function updateRole(payload: RoleRequest) {
    const data = await clientApiFetch('/api/system/role', {
      method: 'PUT',
      body: payload
    })

    if (data.code === 20000) {
      await fetchList()
    }

    return data
  }

  /**
   * 删除角色
   */
  async function deleteRole(ids: (string | number)[]) {
    const response = await clientApiFetch('/api/system/role', {
      method: 'DELETE',
      body: { ids }
    })

    if (response.code === 20000 && response.data) {
      await fetchList()
    }

    return response
  }

  /**
   * 重置查询条件
   */
  function resetQuery() {
    state.value.query = {
      pageIndex: 1,
      pageSize: 10,
      name: undefined,
      code: undefined,
      status: undefined
    }
  }

  /**
   * 验证角色编码唯一性
   */
  async function validateCode(code: string, excludeId?: string | number) {
    // 清空之前的错误
    state.value.codeError = ''

    // 如果为空，不验证
    if (!code) {
      return
    }

    state.value.codeValidating = true

    try {
      const params: any = { code }
      if (excludeId !== undefined && excludeId !== null) {
        params.id = String(excludeId)
      }

      const response = await clientApiFetch<ApiResponse<boolean>>('/api/system/role/check-code', {
        method: 'GET',
        params
      })

      if (response.code === 20000 && !response.data.available) {
        state.value.codeError = response.data.message || '角色编码已存在'
      }
    } catch (error) {
      console.error('[RoleStore] 验证角色编码失败:', error)
      state.value.codeError = '验证失败，请重试'
    } finally {
      state.value.codeValidating = false
    }
  }

  /**
   * 清除编码验证错误
   */
  function clearCodeError() {
    state.value.codeError = ''
  }

  return {
    list: computed(() => state.value.list),
    total: computed(() => state.value.total),
    loading: computed(() => state.value.loading),
    query: computed(() => state.value.query),
    codeValidating: computed(() => state.value.codeValidating),
    codeError: computed(() => state.value.codeError),
    fetchList,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    resetQuery,
    validateCode,
    clearCodeError
  }
})
