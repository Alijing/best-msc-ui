/**
 * 批量删除小说
 * 后端 DELETE /novel/info?ids=
 * 服务端会同时删除章节和正文。
 */
import { z } from 'zod'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  ids: z.array(z.union([z.string().regex(/^\d+$/), z.number().int().positive()])).min(1, '请选择需要删除的小说')
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    const params = new URLSearchParams()
    for (const id of payload.ids) {
      params.append('ids', String(id))
    }

    return await serverApiFetch(event, `/novel/info?${params.toString()}`, {
      method: 'DELETE'
    }, true)
  }
})
