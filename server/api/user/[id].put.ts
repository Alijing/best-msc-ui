import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 编辑用户验证 Schema（所有字段可选）
const UpdateUserSchema = z.object({
  account: z.string().min(3).max(20).optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  name: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional().or(z.literal('')),
  role: z.enum(['admin', 'user', 'guest']).optional()
})

/**
 * 编辑用户接口
 * PUT /api/user/update/:id
 */
export default defineApiEventHandler({
  validation: UpdateUserSchema,
  
  handler: async (event, payload) => {
    const id = event.context.params?.id
    const validatedData = await UpdateUserSchema.parseAsync(payload)
    
    console.log('编辑用户:', id, validatedData)
    
    return {
      success: true,
      message: '编辑用户成功'
    }
  }
})
