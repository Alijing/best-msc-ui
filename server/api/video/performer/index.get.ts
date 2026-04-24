/**
 * 获取演员列表
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'
import type { ApiResponse } from '~/types/api'
import type { Performer } from '~/stores/types/performer'

const querySchema = z.object({
  pageIndex: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
  name: z.string().optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const { pageIndex, pageSize, name } = payload
    // 构建查询参数
    const queryParams: Record<string, any> = {
      pageIndex: pageIndex,
      pageSize: pageSize
    }
    if (name) queryParams.name = name

    return await serverApiFetch<ApiResponse<Performer[]>>(event, '/video/performer/info', {
      method: 'GET',
      query: queryParams
    }, true)
  }
})
