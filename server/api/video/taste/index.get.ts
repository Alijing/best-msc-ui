import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { z } from 'zod'
import {serverApiFetch} from "~/utils/api";
import type {ApiResponse} from "~/types/api";
import type {TasteVideo} from "~/stores/types/tasteVideo";

const querySchema = z.object({
  pageIndex: z.string().transform(Number),
  pageSize: z.string().transform(Number),
  number: z.string().optional(),
  performer: z.string().optional(),
  rating: z.string().transform(Number).optional(),
  status: z.enum(['0', '1', '2']).transform(Number).optional(),
  gmtCreate: z.union([z.string(), z.array(z.string())]).transform(val => {
    // 如果是字符串，转为数组
    if (typeof val === 'string') {
      return [val]
    }
    return val
  }).optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const { pageIndex, pageSize, number, performer, rating, status, gmtCreate } = payload
    try {
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
    } catch (error: any) {
      console.error('❌ [user.all.get.ts] 获取视频列表失败:', error)
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '获取视频列表失败，请稍后重试'
      })
    }
  }
})
