import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { z } from 'zod'

// 查询参数验证 schema
const querySchema = z.object({
  path: z.string().min(1, '路径不能为空'),
  excludeId: z.number().optional()
})

export default defineApiEventHandler({
  // 验证查询参数
  validation: querySchema,
  
  // 处理 GET 请求
  handler: async (event, payload) => {
    try {
      // 这里应该实现检查路径是否存在的逻辑
      // 模拟路径唯一
      const isUnique = true
      
      // 返回检查结果
      return {
        code: 20000,
        message: '路径可用',
        data: {
          available: isUnique,
          message: isUnique ? '路径可用' : '路径已存在'
        },
        success: true
      }
    } catch (error: any) {
      // 处理异常
      throw createError({
        status: error.statusCode || 500,
        message: error.data?.message || error.message || '路径检查失败'
      })
    }
  }
})