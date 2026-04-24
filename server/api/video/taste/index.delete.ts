/**
 * 删除兴趣视频
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  ids: z.array(z.union([z.string(), z.number()]))
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch<ApiResponse<boolean>>(event, '/video/taste/info', {
      method: 'DELETE',
      body: payload.ids
    })
  }
})
