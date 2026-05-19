/**
 * 获取兴趣视频列表
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'
import type {ApiResponse} from "~/types/api"
import type {TasteVideo} from "~/stores/types/tasteVideo";

const querySchema = z.object({
  pageIndex: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
  number: z.string().optional(),
  performer: z.union([z.string(), z.number()]).optional(),
  rating: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
  gmtCreate: z.array(z.string()).optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const { pageIndex, pageSize, number, performer, rating, status, gmtCreate } = payload
    // 构建查询参数
    const queryParams: Record<string, any> = {
      pageIndex: String(pageIndex),
      pageSize: String(pageSize)
    }
    if (number) queryParams.number = number
    if (performer) queryParams.performer = performer
    if (rating !== undefined) queryParams.rating = String(rating)
    if (status !== undefined) queryParams.status = String(status)
    // 处理 gmtCreate，可能是字符串或数组
    if (gmtCreate) {
      const gmtCreateArray = Array.isArray(gmtCreate) ? gmtCreate : [gmtCreate]
      if (gmtCreateArray.length > 0) {
        queryParams.gmtCreate = gmtCreateArray
      }
    }

    return await serverApiFetch<ApiResponse<TasteVideo[]>>(event, '/video/taste/list', {
      method: 'GET',
      query: queryParams
    }, true)
  }
})
