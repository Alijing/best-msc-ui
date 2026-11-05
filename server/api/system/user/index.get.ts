/**
 * 获取用户列表
 */
import { z } from 'zod'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'
import type { ApiResponse, ListResponse } from '~/types/api'
import type { ManagedUser } from '~/stores/types/user-manage'

const querySchema = z.object({
  pageIndex: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
  account: z.string().optional(),
  name: z.string().optional(),
  departmentId: z.union([z.string(), z.number()]).optional()
})

export default defineApiEventHandler({
  validation: querySchema,
  handler: async (event, payload) => {
    const { pageIndex, pageSize, account, name, departmentId } = payload
    const queryParams: Record<string, string | number> = {
      pageIndex: pageIndex,
      pageSize: pageSize
    }
    if (account) queryParams.account = account
    if (name) queryParams.name = name
    if (departmentId) queryParams.departmentId = departmentId

    return await serverApiFetch<ApiResponse<ListResponse<ManagedUser>>>(event, '/sys/spider/list', {
      method: 'GET',
      query: queryParams
    }, true)
  }
})