import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 新增用户验证 Schema
const CreateUserSchema = z.object({
  account: z.string().min(3, '账号至少 3 个字符').max(20, '账号最多 20 个字符'),
  password: z.string().min(6, '密码至少 6 个字符'),
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最多 50 个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional().or(z.literal('')),
  role: z.enum(['admin', 'user', 'guest'], {
    errorMap: () => ({ message: '请选择正确的角色' })
  })
})

/**
 * 新增用户接口
 * POST /api/user/create
 */
export default defineApiEventHandler({
  validation: CreateUserSchema,
  
  handler: async (event, payload) => {
    const validatedData = await CreateUserSchema.parseAsync(payload)
    
    console.log('新增用户:', validatedData)
    
    return {
      success: true,
      message: '新增用户成功'
    }
  }
})
