import { z } from 'zod'
import type { H3Event } from 'h3'
import { createError } from 'h3'

/**
 * API 统一处理器
 * 封装验证、守卫和错误处理逻辑
 */
export function defineApiEventHandler<T extends z.ZodTypeAny>(config: {
  validation?: T  // Zod 验证 schema
  guards?: Array<(event: H3Event, payload: z.infer<T>) => Promise<void>>  // 守卫函数
  handler: (event: H3Event, payload: z.infer<T>) => Promise<any>  // 处理函数
}) {
  return defineEventHandler(async (event) => {
    try {
      // 1. 获取并合并参数（body + query）
      const method = event.method.toUpperCase()
      let body: any = {}
      let query: any = {}

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        body = await readBody(event)
      } else {
        query = getQuery(event)
      }

      const payload = { ...query, ...body }

      // 2. Zod 验证（如果提供了 validation schema）
      if (config.validation) {
        try {
          const validatedData = config.validation.parse(payload)
          // 执行守卫
          if (config.guards) {
            for (const guard of config.guards) {
              await guard(event, validatedData)
            }
          }
          
          // 执行处理函数
          return await config.handler(event, validatedData)
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            throw createError({
              statusCode: 422,
              message: '验证失败',
              data: {
                errors: validationError.errors.map(err => ({
                  field: err.path.join('.'),
                  message: err.message
                }))
              }
            })
          }
          throw validationError
        }
      } else {
        // 无验证，直接执行守卫和处理
        if (config.guards) {
          for (const guard of config.guards) {
            await guard(event, payload)
          }
        }
        
        return await config.handler(event, payload)
      }
    } catch (error: any) {
      // 5. 统一错误处理
      if (error.statusCode) {
        // H3Error 直接抛出
        throw error
      }
      
      // 其他错误转为 500
      console.error('API Error:', error)
      throw createError({
        statusCode: 500,
        message: error.message || '服务器内部错误'
      })
    }
  })
}
