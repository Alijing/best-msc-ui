/**
 * 删除演员
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  ids: z.array(z.union([z.string(), z.number()])).min(1, '至少选择一个演员')
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    // 调用后端接口删除演员
    return await serverApiFetch<ApiResponse<boolean>>(event, '/video/performer/info', {
      method: 'DELETE',
      body: payload.ids
    })
  }
})
