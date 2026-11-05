/**
 * 小说详情
 * 后端 GET /novel/info/{novelId}
 */
import { createError } from 'h3'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'
import type { ApiResponse } from '~/types/api'
import type { Novel } from '~/stores/types/novel'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id || !/^\d+$/.test(id)) {
      throw createError({ statusCode: 422, message: '小说 ID 无效' })
    }

    return await serverApiFetch<ApiResponse<Novel>>(event, `/novel/info/${id}`, {
      method: 'GET'
    }, true)
  }
})
