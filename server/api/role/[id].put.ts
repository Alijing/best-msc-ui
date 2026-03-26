import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 模拟角色数据库
const mockRoles = [
  { id: 1, name: '超级管理员', code: 'super_admin', status: 0 as const, remark: '拥有所有权限', createTime: new Date() },
  { id: 2, name: '普通管理员', code: 'admin', status: 0 as const, remark: '拥有基本管理权限', createTime: new Date() },
  { id: 3, name: '普通用户', code: 'user', status: 0 as const, remark: '普通用户权限', createTime: new Date() },
  { id: 4, name: '访客', code: 'guest', status: 1 as const, remark: '只读权限', createTime: new Date() },
  { id: 5, name: '运营人员', code: 'operator', status: 0 as const, remark: '运营相关权限', createTime: new Date() }
]

// 编辑角色验证 Schema（所有字段可选）
const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  code: z.string().min(1).max(50).regex(/^[a-z_]+$/).optional(),
  status: z.enum(['0', '1']).transform(val => val === '1' ? 1 : 0).optional(),
  remark: z.string().max(200).optional().or(z.literal(''))
})

/**
 * 编辑角色接口
 * PUT /api/role/update/:id
 */
export default defineApiEventHandler({
  validation: UpdateRoleSchema,
  
  handler: async (event, payload) => {
    const id = event.context.params?.id
    const validatedData = await UpdateRoleSchema.parseAsync(payload)
    
    // 检查角色编码是否已存在（排除自身）
    if (validatedData.code) {
      const existingRole = mockRoles.find(role => role.code === validatedData.code && role.id !== parseInt(id || '0'))
      if (existingRole) {
        throw createError({
          statusCode: 422,
          message: '角色编码已存在'
        })
      }
    }
    
    console.log('编辑角色:', id, validatedData)
    
    return {
      success: true,
      message: '编辑角色成功'
    }
  }
})
