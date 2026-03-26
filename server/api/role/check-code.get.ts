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

// 查询参数验证 Schema
const CheckCodeSchema = z.object({
  code: z.string().min(1, '角色编码不能为空'),
  excludeId: z.string().optional() // 编辑时排除自身 ID
})

/**
 * 检查角色编码是否已存在
 * GET /api/role/check-code
 */
export default defineApiEventHandler({
  validation: CheckCodeSchema,
  
  handler: async (event, payload) => {
    const { code, excludeId } = payload
    
    // 查找角色（编辑时排除自身）
    const existingRole = mockRoles.find(role => {
      if (excludeId) {
        return role.code === code && role.id !== parseInt(excludeId)
      }
      return role.code === code
    })
    
    console.log('检查角色编码:', code, '排除 ID:', excludeId, '结果:', !!existingRole)
    
    return {
      exists: !!existingRole
    }
  }
})
