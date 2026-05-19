/**
 * 获取角色字典
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'
import type {ApiResponse, DictItem} from "~/types/api"

const querySchema = z.object({
  name: z.string().optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const { name } = payload
    // 构建查询参数
    const queryParams: Record<string, any> = {}
    if (name) queryParams.name = name

    return await serverApiFetch<ApiResponse<DictItem[]>>(event, '/sys/role/dict', {
      method: 'GET',
      query: queryParams
    }, true)
  }
})
