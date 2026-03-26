import { z } from 'zod'
import type { H3Event } from 'h3'
import {H3Error} from "h3";

/**
 * API 统一处理器
 * 封装验证、守卫逻辑，统一错误处理
 */
export function defineApiEventHandler<T extends z.ZodTypeAny>(config: {
  /**
   * Zod 验证 schema
   */
  validation?: T
  
  /**
   * 守卫函数数组（验证通过后执行）
   */
  guards?: Array<(event: H3Event, payload: z.infer<T>) => Promise<void>>
  
  /**
   * 实际处理函数
   */
  handler: (event: H3Event, payload: z.infer<T>) => Promise<any>
}) {
  return defineEventHandler(async (event) => {
    try {
      // 获取请求参数
      const method = event.method
      let body: any = {}
      let query: any = {}

      // 根据请求方法获取参数
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        body = await readBody(event)
      } else {
        query = getQuery(event)
      }

      // 合并参数
      const allParams = { ...body, ...query }

      // Zod 验证
      let validatedData: z.infer<T> = allParams
      
      if (config.validation) {
        try {
          validatedData = await config.validation.parseAsync(allParams)
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw createError({
              statusCode: 422,
              message: '参数验证失败',
              data: error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
              }))
            })
          }
          throw error
        }
      }

      // 执行守卫
      if (config.guards) {
        for (const guard of config.guards) {
          await guard(event, validatedData)
        }
      }

      // 执行处理函数
      const result = await config.handler(event, validatedData)
      
      return result
    } catch (error) {
      // 统一错误处理
      if (error instanceof H3Error) {
        throw error
      }
      
      console.error('API 错误:', error)
      
      throw createError({
        statusCode: 500,
        message: error instanceof Error ? error.message : '服务器内部错误'
      })
    }
  })
}
