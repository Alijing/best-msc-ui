/**
 * 删除用户
 * 后端 DELETE /sys/spider/info?ids=
 */
import { z } from 'zod'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  ids: z.array(z.union([z.string(), z.number()])).min(1, '请选择需要删除的用户')
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    const params = new URLSearchParams()
    for (const id of payload.ids) {
      params.append('ids', String(id))
    }

    return await serverApiFetch(event, `/sys/spider/info?${params.toString()}`, {
      method: 'DELETE'
    }, true)
  }
})
