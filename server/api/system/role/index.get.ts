/**
 * 获取角色列表
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const querySchema = z.object({
  pageIndex: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
  name: z.string().optional(),
  code: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const { pageIndex, pageSize, name, code, status } = payload
    try {
      // 构建查询参数
      const queryParams: Record<string, any> = {
        pageIndex: pageIndex,
        pageSize: pageSize
      }
      if (name) queryParams.name = name
      if (code) queryParams.code = code
      if (status !== undefined) queryParams.status = status

      return await serverApiFetch<ApiResponse<Role[]>>(event, '/sys/role/info', {
        method: 'GET',
        query: queryParams
      }, true)
    } catch (error: any) {
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '获取角色列表失败，请稍后重试'
      })
    }
  }
})
