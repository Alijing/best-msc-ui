import { z } from 'zod'
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

// 验证请求 Schema
const CheckNumberRequestSchema = z.object({
  number: z.string().min(1, '车牌号不能为空'),
  excludeId: z.number().optional() // 编辑时排除当前记录
})

/**
 * 检查车牌号是否已存在
 * GET /api/video/taste/check-number
 */
export default defineApiEventHandler({
  validation: CheckNumberRequestSchema,
  
  handler: async (event, payload) => {
    const { number, excludeId } = payload
    
    try {
      // 调用后端接口检查车牌号
      return await serverApiFetch(event, '/video/taste/number/valid', {
        method: 'GET',
        params: {
          number,
          excludeId
        }
      })
    } catch (error: any) {
      console.error('检查车牌号失败:', error)
      throw error
    }
  }
})
