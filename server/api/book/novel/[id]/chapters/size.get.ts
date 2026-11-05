/**
 * 小说章节数量
 * 后端 GET /novel/chapter/size/{novelId}
 */
import { createError } from 'h3'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id || !/^\d+$/.test(id)) {
      throw createError({ statusCode: 422, message: '小说 ID 无效' })
    }

    return await serverApiFetch(event, `/novel/chapter/size/${id}`, {
      method: 'GET'
    }, true)
  }
})
