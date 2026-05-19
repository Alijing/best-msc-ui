/**
 * 兴趣视频管理 Store
 */
import {defineStore} from 'pinia'
import {useDebounceFn} from '@vueuse/core'
import type {ApiResponse} from '~/types/api'
import type {TasteVideo, TasteVideoQuery, TasteVideoRequest} from '~/stores/types/tasteVideo'

export interface TasteVideoState {
    list: TasteVideo[]
    total: number
    loading: boolean
    query: TasteVideoQuery
    performerDict: PerformerDictItem[]
    // 车牌号验证状态
    numberValidating: boolean
    numberError: string
    // 预览图片
    previewImages: string[]
    previewLoading: boolean
}

export const useTasteVideoStore = defineStore('tasteVideo', () => {
    const state = useState<TasteVideoState>('tasteVideo', () => ({
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
            gmtCreate: undefined
        },
        performerDict: [],
        numberValidating: false,
        numberError: '',
        previewImages: [],
        previewLoading: false
    }))

    // 初始化时监听演员变更事件
    if (import.meta.client) {
        const { on } = useEventBus()
        on(EVENTS.PERFORMER_CHANGED, async ({ action }) => {
            console.log('[TasteVideoStore] 检测到演员变更:', action)
            // 清除缓存，强制重新请求
            const cached = useState<DictItem[]>('performerDict', () => [])
            cached.value = []
            state.value.performerDict = []
            // 刷新字典
            await fetchPerformerDict()
        })
    }

    /**
     * 获取视频列表
     */
    async function fetchList(query?: Partial<TasteVideoQuery>) {
        try {
            state.value.loading = true

            if (query) {
                state.value.query = {...state.value.query, ...query}
            }

            const response = await clientApiFetch<ApiResponse<TasteVideo[]>>('/api/video/taste', {
                method: 'GET',
                query: {
                    pageIndex: state.value.query.pageIndex,
                    pageSize: state.value.query.pageSize,
                    ...(state.value.query.number && {number: state.value.query.number}),
                    ...(state.value.query.performer && {performer: state.value.query.performer}),
                    ...(state.value.query.rating !== undefined && {rating: state.value.query.rating}),
                    ...(state.value.query.status !== undefined && {status: state.value.query.status}),
                    ...(state.value.query.gmtCreate && {gmtCreate: state.value.query.gmtCreate})
                }
            })

            if (response.code === 20000) {
                state.value.list = response.data
                state.value.total = response.total
            }
        } catch (error) {
            console.error('[TasteVideoStore] 获取视频列表失败:', error)
            state.value.list = []
            state.value.total = 0
        } finally {
            state.value.loading = false
        }
    }

    /**
     * 根据ID获取视频详情
     */
    async function fetchVideoById(id: string | number): Promise<TasteVideoRequest | null> {
        const response = await clientApiFetch<ApiResponse<TasteVideoRequest>>(`/api/video/taste/${id}`, {
            method: 'GET'
        })

        if (response.code === 20000) {
            return response.data
        }
        return null
    }

    /**
     * 创建视频
     */
    async function createVideo(payload: TasteVideoRequest) {
        const data = await clientApiFetch<ApiResponse<boolean>>('/api/video/taste', {
            method: 'POST',
            body: payload
        })

        if (data.code === 20000) {
            await fetchList()
        }

        return data
    }

    /**
     * 更新视频
     */
    async function updateVideo(payload: Partial<TasteVideoRequest>) {
        const data = await clientApiFetch<ApiResponse<boolean>>('/api/video/taste', {
            method: 'PUT',
            body: payload
        })

        if (data.code === 20000) {
            await fetchList()
        }

        return data
    }

    /**
     * 删除视频
     */
    async function deleteVideo(ids: (string | number)[]) {
        const response = await clientApiFetch<ApiResponse<boolean>>(`/api/video/taste`, {
            method: 'DELETE',
            body: { ids }
        })

        if (response.code === 20000 && response.data) {
            await fetchList()
        }

        return response
    }

    /**
     * 获取演员字典
     */
    async function fetchPerformerDict() {
        const cached = useState<DictItem[]>('performerDict', () => [])

        if (cached.value.length > 0) {
            state.value.performerDict = cached.value
            return cached.value
        }

        const response = await clientApiFetch<ApiResponse<DictItem[]>>('/api/video/performer/dict',{
            method: 'GET'
        })

        if (response.code === 20000) {
            state.value.performerDict = response.data
            cached.value = response.data
        }
        return response.data
    }

    /**
     * 重置查询条件
     */
    function resetQuery() {
        state.value.query = {
            pageIndex: 1,
            pageSize: 10,
            number: undefined,
            performer: undefined,
            rating: undefined,
            status: undefined,
            gmtCreate: undefined
        }
    }

    /**
     * 验证车牌号
     */
    async function validateNumber(number: string, excludeId?: number) {
        // 清空之前的错误
        state.value.numberError = ''
        
        // 如果为空，不验证
        if (!number) {
            return
        }
        
        state.value.numberValidating = true
        
        try {
            const params: any = { number }
            if (excludeId !== undefined && excludeId !== null) {
                params.excludeId = excludeId
            }
            
            const response = await clientApiFetch<ApiResponse<boolean>>('/api/video/taste/check-number', {
                method: 'GET',
                params
            })
            
            if (response.code === 20000 && !response.data) {
                state.value.numberError = response.message || '车牌号已存在'
            }
        } catch (error) {
            console.error('[TasteVideoStore] 验证车牌号失败:', error)
            state.value.numberError = '验证失败，请重试'
        } finally {
            state.value.numberValidating = false
        }
    }

    // 创建防抖函数（只创建一次）
    const debouncedValidateNumber = useDebounceFn((number: string, excludeId?: number) => {
        void validateNumber(number, excludeId)
    }, 500)

    /**
     * 失焦时验证车牌号（带防抖）
     */
    function validateNumberOnBlur(number: string, excludeId?: number) {
        void debouncedValidateNumber(number, excludeId)
    }

    /**
     * 清除车牌号验证错误
     */
    function clearNumberError() {
        state.value.numberError = ''
    }

    /**
     * 获取预览图片
     */
    async function fetchPreviewImages(videoId: number) {
        state.value.previewLoading = true
        state.value.previewImages = []
        
        try {
            const response = await clientApiFetch<ApiResponse<string[]>>(`/api/video/taste/preview/${videoId}`)
            console.log('[TasteVideoStore] 获取预览图片:', response)
            
            if (response.code === 20000) {
                state.value.previewImages = response.data.filter(img => img)
            }
        } catch (error) {
            console.error('[TasteVideoStore] 获取预览图片失败:', error)
            state.value.previewImages = []
            // ✅ 在这里弹出 toast
            const toast = useToast()
            toast.add({
                title: '加载失败',
                description: error.message || '获取预览图片失败',
                color: 'error',
                icon: 'i-heroicons-exclamation-circle'
            })
        } finally {
            state.value.previewLoading = false
        }
    }

    /**
     * 清除预览图片
     */
    function clearPreviewImages() {
        state.value.previewImages = []
        state.value.previewLoading = false
    }

    return {
        list: computed(() => state.value.list),
        total: computed(() => state.value.total),
        loading: computed(() => state.value.loading),
        query: computed(() => state.value.query),
        performerDict: computed(() => state.value.performerDict),
        numberValidating: computed(() => state.value.numberValidating),
        numberError: computed(() => state.value.numberError),
        previewImages: computed(() => state.value.previewImages),
        previewLoading: computed(() => state.value.previewLoading),
        fetchList,
        fetchVideoById,
        createVideo,
        updateVideo,
        deleteVideo,
        fetchPerformerDict,
        resetQuery,
        validateNumberOnBlur,
        clearNumberError,
        fetchPreviewImages,
        clearPreviewImages
    }
})
