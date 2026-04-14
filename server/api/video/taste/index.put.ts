/**
 * 更新兴趣视频
 */
import {defineApiEventHandler} from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'
import type {TasteVideoRequest} from '~/stores/types/tasteVideo'
import type {ApiResponse} from '~/types/api'

export default defineApiEventHandler({
    handler: async (event, payload: TasteVideoRequest) => {
        return await serverApiFetch<ApiResponse<boolean>>(event, '/video/taste/info', {
            method: 'PUT',
            body: payload
        })
    }
})
