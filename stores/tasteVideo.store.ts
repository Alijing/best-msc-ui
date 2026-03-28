import { defineStore } from 'pinia'
import type { TasteVideo, TasteVideoQuery, TasteVideoRequest, PerformerDictItem } from '~/stores/types/tasteVideo'
import type { ApiResponse } from '~/types/api'
import { clientApiFetch } from '~/utils/api'

interface TasteVideoState {
  list: TasteVideo[]
  total: number
  loading: boolean
  query: TasteVideoQuery
  performerDict: PerformerDictItem[]
}

export const useTasteVideoStore = defineStore('tasteVideo', () => {
  const state = useState<TasteVideoState>('tasteVideoState', () => ({
    list: [],
    total: 0,
    loading: false,
    query: {
      pageIndex: 1,
      pageSize: 10,
      number: undefined,
      performer: undefined,
      rating: undefined,
      status: undefined,
      gmtCreate: [] as string[]
    },
    performerDict: []
  }))

  // Getters
  const getList = computed(() => state.value.list)
  const getTotal = computed(() => state.value.total)
  const getLoading = computed(() => state.value.loading)
  const getQuery = computed(() => state.value.query)
  const getPerformerDict = computed(() => state.value.performerDict)

  // Actions
  async function fetchPerformerDict() {
    if (state.value.performerDict.length > 0) {
      return state.value.performerDict
    }
    
    try {
      const data = await clientApiFetch<PerformerDictItem[]>('/api/video/performer/dict')
      state.value.performerDict = data
      return data
    } catch (error) {
      console.error('获取演员字典失败:', error)
      return []
    }
  }

  async function fetchList() {
    state.value.loading = true
    try {
      const params = {
        pageIndex: getQuery.value.pageIndex,
        pageSize: getQuery.value.pageSize,

        number: getQuery.value.number || undefined,
        performer: getQuery.value.performer || undefined,
        rating: getQuery.value.rating || undefined,
        status: getQuery.value.status || undefined,
        gmtCreate: getQuery.value.gmtCreate || undefined
      }

      const response = await clientApiFetch<ApiResponse<TasteVideo[]>>('/api/video/taste', {
        method: 'GET',
        query: params
      })

      state.value.list = response.data
      state.value.total = response.total
    } catch (error) {
      console.error('获取视频列表失败:', error)
      state.value.list = []
      state.value.total = 0
    } finally {
      state.value.loading = false
    }
  }

  async function createVideo(data: TasteVideoRequest) {
    try {
      await clientApiFetch('/api/video/taste', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      await fetchList()
      return { success: true }
    } catch (error) {
      console.error('创建视频失败:', error)
      throw error
    }
  }

  async function updateVideo(id: number, data: TasteVideoRequest) {
    try {
      await clientApiFetch(`/api/video/taste/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      await fetchList()
      return { success: true }
    } catch (error) {
      console.error('更新视频失败:', error)
      throw error
    }
  }

  async function deleteVideo(id: number) {
    try {
      await clientApiFetch(`/api/video/taste/${id}`, {
        method: 'DELETE'
      })
      await fetchList()
      return { success: true }
    } catch (error) {
      console.error('删除视频失败:', error)
      throw error
    }
  }

  async function getVideo(id: number): Promise<TasteVideo | null> {
    try {
      const data = await clientApiFetch<TasteVideo>(`'/api/video/taste/${id}'`)
      return data
    } catch (error) {
      console.error('获取视频详情失败:', error)
      return null
    }
  }

  function setQuery(updates: Partial<TasteVideoQuery>) {
    state.value.query = {
      ...state.value.query,
      ...updates
    }
  }

  function resetQuery() {
    state.value.query = {
      pageIndex: 1,
      pageSize: 10,
      number: undefined,
      performer: undefined,
      rating: undefined,
      status: undefined,
      gmtCreate: [] as string[]
    }
  }

  function setPage(page: number) {
    state.value.query.pageIndex = page
  }

  function setPageSize(size: number) {
    state.value.query.pageSize = size
    state.value.query.pageIndex = 1
  }

  return {
    list: getList,
    total: getTotal,
    loading: getLoading,
    query: getQuery,
    performerDict: getPerformerDict,
    fetchPerformerDict,
    fetchList,
    createVideo,
    updateVideo,
    deleteVideo,
    getVideo,
    setQuery,
    resetQuery,
    setPage,
    setPageSize
  }
})
