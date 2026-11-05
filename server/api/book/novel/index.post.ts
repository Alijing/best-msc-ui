/**
 * 新增小说
 * 后端 POST /novel/info
 */
import { z } from 'zod'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const httpUrl = z.string().trim().min(1, '目录页地址不能为空').max(2000).refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}, '目录页地址需以 http 或 https 开头')

const bodySchema = z.object({
  name: z.string().trim().min(1, '小说名称不能为空').max(200),
  path: httpUrl
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch(event, '/novel/info', {
      method: 'POST',
      body: {
        name: payload.name,
        path: payload.path
      }
    }, true)
  }
})
