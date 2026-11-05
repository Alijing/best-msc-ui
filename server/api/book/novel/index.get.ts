/**
 * 小说分页列表
 * 后端 GET /novel/list?name&pageIndex&pageSize
 */
import { z } from 'zod'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'
import type { ApiResponse, ListResponse } from '~/types/api'
import type { Novel } from '~/stores/types/novel'

const querySchema = z.object({
  pageIndex: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  name: z.string().trim().optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const queryParams: Record<string, string | number> = {
      pageIndex: payload.pageIndex,
      pageSize: payload.pageSize
    }
    if (payload.name) {
      queryParams.name = payload.name
    }

    return await serverApiFetch<ApiResponse<ListResponse<Novel>>>(event, '/novel/list', {
      method: 'GET',
      query: queryParams
    }, true)
  }
})
