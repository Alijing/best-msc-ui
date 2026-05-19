/**
 * 创建兴趣视频
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  number: z.string(),
  name: z.string(),
  performer: z.union([z.string(), z.number()]),
  releaseDate: z.string(),
  rating: z.number().min(1).max(5),
  status: z.number().min(0).max(2),
  magnetUri: z.string()
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    // 调用后端接口创建视频
    return await serverApiFetch<ApiResponse<boolean>>(event, '/video/taste/info', {
      method: 'POST',
      body: payload
    })
  }
})
