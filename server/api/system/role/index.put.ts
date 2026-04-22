/**
 * 更新角色
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1, '角色名称不能为空'),
  code: z.string().min(1, '角色编码不能为空'),
  status: z.number().int().min(0).max(1),
  remark: z.string().optional()
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    try {
      return await serverApiFetch(event, '/sys/role/info', {
        method: 'PUT',
        body: payload
      })
    } catch (error: any) {
      console.error('更新角色失败:', error)
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '更新角色失败，请稍后重试'
      })
    }
  }
})
