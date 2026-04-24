/**
 * 检查演员姓名唯一性
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

const querySchema = z.object({
  name: z.string().min(1, '演员姓名不能为空'),
  excludeId: z.coerce.number().optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const { name, excludeId } = payload

    const queryParams: Record<string, any> = { name }
    if (excludeId !== undefined) {
      queryParams.excludeId = String(excludeId)
    }

    return await serverApiFetch<ApiResponse<boolean>>(event, '/video/performer/name/valid', {
      method: 'GET',
      query: queryParams
    })
  }
})
