import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { z } from 'zod'

const bodySchema = z.object({
  number: z.string().min(1, '车牌号不能为空'),
  name: z.string().min(1, '名称不能为空'),
  performer: z.union([z.number(), z.string()]),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  rating: z.number().min(1).max(5),
  status: z.enum(['0', '1', '2']).transform(Number),
  magnetUri: z.string().min(1, '磁力链接不能为空')
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    const id = event.context.params?.id ? Number(event.context.params.id) : 0
    
    // TODO: 更新真实数据库
    console.log('更新视频:', id, payload)
    
    return {
      code: 20000,
      data: { success: true },
      message: '更新成功',
      success: true
    }
  }
})
