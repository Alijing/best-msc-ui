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
    try {
      return await serverApiFetch<ApiResponse<boolean>>(event, '/video/taste/info', {
        method: 'DELETE',
        body: payload.ids
      })
    } catch (error: any) {
      console.error('删除视频失败:', error)
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '删除视频失败，请稍后重试'
      })
    }
  }
})
