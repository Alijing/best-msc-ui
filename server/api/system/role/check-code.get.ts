/**
 * 检查角色编码唯一性
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

export default defineApiEventHandler({
  validation: z.object({
    code: z.string().min(1, '请输入角色编码'),
    id: z.union([z.string(), z.number()]).optional()
  }),
  handler: async (event, payload) => {
    const queryParams: Record<string, any> = {
      code: payload.code
    }
    if (payload.id !== undefined && payload.id !== null) {
      queryParams.id = String(payload.id)
    }

    return await serverApiFetch(event, '/sys/role/code/valid', {
      method: 'GET',
      query: queryParams
    })
  }
})
