/**
 * 获取单个演员详情
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'
import type { ApiResponse } from '~/types/api'
import type { PerformerRequest } from '~/stores/types/performer'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    
    try {
      return await serverApiFetch<ApiResponse<PerformerRequest>>(event, `/video/performer/info/${id}`, {
        method: 'GET'
      })
    } catch (error: any) {
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '获取演员详情失败，请稍后重试'
      })
    }
  }
})
