/**
 * 删除角色
 */
import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  ids: z.array(z.union([z.string(), z.number()])).min(1, '至少选择一个角色')
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch(event, '/sys/role/info', {
      method: 'DELETE',
      body: payload.ids
    })
  }
})
