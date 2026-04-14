/**
 * 获取兴趣视频详情
 */
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'
import type { TasteVideoRequest } from '~/stores/types/tasteVideo'
import type { ApiResponse } from '~/types/api'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id

    return await serverApiFetch<ApiResponse<TasteVideoRequest>>(event, `/video/taste/info/${id}`, {
      method: 'GET'
    })
  }
})
