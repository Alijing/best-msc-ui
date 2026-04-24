/**
 * 获取单个演员详情
 */
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'
import type { ApiResponse } from '~/types/api'
import type { PerformerRequest } from '~/stores/types/performer'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    return await serverApiFetch<ApiResponse<PerformerRequest>>(event, `/video/performer/info/${id}`, {
      method: 'GET'
    })
  }
})
