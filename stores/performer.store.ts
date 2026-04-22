/**
 * 演员管理 Store
 */
import { defineStore } from 'pinia'
import type { ApiResponse } from '~/types/api'
import type { Performer, PerformerQuery, PerformerRequest } from '~/stores/types/performer'

export interface PerformerState {
  list: Performer[]
  total: number
  loading: boolean
  query: PerformerQuery
  // 姓名验证状态
  nameValidating: boolean
  nameError: string
}

export const usePerformerStore = defineStore('performer', () => {
  const state = useState<PerformerState>('performer', () => ({
    list: [],
    total: 0,
    loading: false,
    query: {
      pageIndex: 1,
      pageSize: 10,
      name: undefined
    },
    nameValidating: false,
    nameError: ''
  }))

  /**
   * 获取演员列表
   */
  async function fetchList(query?: Partial<PerformerQuery>) {
    try {
      state.value.loading = true

      if (query) {
        state.value.query = { ...state.value.query, ...query }
      }

      const response = await clientApiFetch<ApiResponse<Performer[]>>('/api/video/performer', {
        method: 'GET',
        query: {
          pageIndex: state.value.query.pageIndex,
          pageSize: state.value.query.pageSize,
          ...(state.value.query.name && { name: state.value.query.name })
        }
      })

      if (response.code === 20000) {
        state.value.list = response.data
        state.value.total = response.total || 0
      }
    } catch (error) {
      console.error('[PerformerStore] 获取演员列表失败:', error)
      state.value.list = []
      state.value.total = 0
    } finally {
      state.value.loading = false
    }
  }

  /**
   * 根据ID获取演员详情
   */
  async function fetchPerformerById(id: string | number): Promise<PerformerRequest | null> {
    const response = await clientApiFetch<ApiResponse<PerformerRequest>>(`/api/video/performer/${id}`, {
      method: 'GET'
    })

    if (response.code === 20000) {
      return response.data
    }
    return null
  }

  /**
   * 创建演员
   */
  async function createPerformer(payload: PerformerRequest) {
    const data = await clientApiFetch<ApiResponse<boolean>>('/api/video/performer', {
      method: 'POST',
      body: payload
    })

    if (data.code === 20000) {
      await fetchList()
      // 发布演员变更事件，通知其他模块刷新字典
      useEventBus().emit(EVENTS.PERFORMER_CHANGED, { action: 'create', data: payload })
    }

    return data
  }

  /**
   * 更新演员
   */
  async function updatePerformer(payload: PerformerRequest) {
    const data = await clientApiFetch<ApiResponse<boolean>>('/api/video/performer', {
      method: 'PUT',
      body: payload
    })

    if (data.code === 20000) {
      await fetchList()
      // 发布演员变更事件，通知其他模块刷新字典
      useEventBus().emit(EVENTS.PERFORMER_CHANGED, { action: 'update', data: payload })
    }

    return data
  }

  /**
   * 删除演员
   */
  async function deletePerformer(ids: (string | number)[]) {
    const response = await clientApiFetch<ApiResponse<boolean>>('/api/video/performer', {
      method: 'DELETE',
      body: { ids }
    })

    if (response.code === 20000 && response.data) {
      await fetchList()
      // 发布演员变更事件，通知其他模块刷新字典
      useEventBus().emit(EVENTS.PERFORMER_CHANGED, { action: 'delete', ids })
    }

    return response
  }

  /**
   * 重置查询条件
   */
  function resetQuery() {
    state.value.query = {
      page: 1,
      pageSize: 10,
      name: undefined
    }
  }

  /**
   * 验证演员姓名
   */
  async function validateName(name: string, excludeId?: number) {
    // 清空之前的错误
    state.value.nameError = ''

    // 如果为空，不验证
    if (!name) {
      return
    }

    state.value.nameValidating = true

    try {
      const params: any = { name }
      if (excludeId !== undefined && excludeId !== null) {
        params.excludeId = excludeId
      }

      const response = await clientApiFetch<ApiResponse<boolean>>('/api/video/performer/check-name', {
        method: 'GET',
        params
      })

      if (response.code === 20000 && !response.data) {
        state.value.nameError = response.message || '演员姓名已存在'
      }
    } catch (error) {
      console.error('[PerformerStore] 验证演员姓名失败:', error)
      state.value.nameError = '验证失败，请重试'
    } finally {
      state.value.nameValidating = false
    }
  }

  /**
   * 清除姓名验证错误
   */
  function clearNameError() {
    state.value.nameError = ''
  }

  return {
    list: computed(() => state.value.list),
    total: computed(() => state.value.total),
    loading: computed(() => state.value.loading),
    query: computed(() => state.value.query),
    nameValidating: computed(() => state.value.nameValidating),
    nameError: computed(() => state.value.nameError),
    fetchList,
    fetchPerformerById,
    createPerformer,
    updatePerformer,
    deletePerformer,
    resetQuery,
    validateName,
    clearNameError
  }
})
