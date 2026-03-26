import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 模拟角色数据库（实际应从真实数据库获取）
const mockRoles = [
  { id: 1, name: '超级管理员', code: 'super_admin', status: 0 as const, remark: '拥有所有权限', createTime: new Date() },
  { id: 2, name: '普通管理员', code: 'admin', status: 0 as const, remark: '拥有基本管理权限', createTime: new Date() },
  { id: 3, name: '普通用户', code: 'user', status: 0 as const, remark: '普通用户权限', createTime: new Date() },
  { id: 4, name: '访客', code: 'guest', status: 1 as const, remark: '只读权限', createTime: new Date() },
  { id: 5, name: '运营人员', code: 'operator', status: 0 as const, remark: '运营相关权限', createTime: new Date() }
]

// 新增角色验证 Schema
const CreateRoleSchema = z.object({
  name: z.string().min(1, '角色名称不能为空').max(50, '角色名称最多 50 个字符'),
  code: z.string().min(1, '角色编码不能为空').max(50, '角色编码最多 50 个字符').regex(/^[a-z_]+$/, '角色编码只能包含小写字母和下划线'),
  status: z.enum(['0', '1']).transform(val => val === '1' ? 1 : 0),
  remark: z.string().max(200, '备注最多 200 个字符').optional().or(z.literal(''))
})

/**
 * 新增角色接口
 * POST /api/role/create
 */
export default defineApiEventHandler({
  validation: CreateRoleSchema,
  
  handler: async (event, payload) => {
    const validatedData = await CreateRoleSchema.parseAsync(payload)
    
    // 检查角色编码是否已存在
    const existingRole = mockRoles.find(role => role.code === validatedData.code)
    if (existingRole) {
      throw createError({
        statusCode: 422,
        message: '角色编码已存在'
      })
    }
    
    console.log('新增角色:', validatedData)
    
    return {
      success: true,
      message: '新增角色成功'
    }
  }
})
