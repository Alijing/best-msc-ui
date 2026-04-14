/**
 * 创建演员
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  name: z.string().min(1, '演员姓名不能为空'),
  enUsName: z.string().optional(),
  birthday: z.string().optional(),
  height: z.number().positive().int().optional(),
  bust: z.number().positive().int().optional(),
  waistSize: z.number().positive().int().optional(),
  hipCircumference: z.number().positive().int().optional(),
  cupSize: z.string().optional(),
  hobby: z.string().optional(),
  remark: z.string().optional()
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    try {
      // 调用后端接口创建演员
      return await serverApiFetch<ApiResponse<boolean>>(event, '/video/performer/info', {
        method: 'POST',
        body: payload
      })
    } catch (error: any) {
      console.error('创建演员失败:', error)
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '创建演员失败，请稍后重试'
      })
    }
  }
})
