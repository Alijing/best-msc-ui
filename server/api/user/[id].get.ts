import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 编辑用户验证 Schema（所有字段可选）
const UpdateUserSchema = z.object({
  account: z.string().min(3).max(20).optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  name: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional().or(z.literal(''))
})

/**
 * 获取单个用户信息接口
 * GET /api/user/detail/:id
 */
export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    
    console.log('获取用户:', id)
    
    // 模拟返回用户信息
    return {
      id: parseInt(id || '1'),
      account: 'admin',
      name: '管理员',
      phone: '13800138000',
      role: 'admin'
    }
  }
})
