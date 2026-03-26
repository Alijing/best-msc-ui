import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 模拟角色数据库
const mockRoles = [
  { id: 1, name: '超级管理员', code: 'super_admin', status: 0 as const, remark: '拥有所有权限', createTime: new Date() },
  { id: 2, name: '普通管理员', code: 'admin', status: 0 as const, remark: '拥有基本管理权限', createTime: new Date() },
  { id: 3, name: '普通用户', code: 'user', status: 0 as const, remark: '普通用户权限', createTime: new Date() },
  { id: 4, name: '访客', code: 'guest', status: 1 as const, remark: '只读权限', createTime: new Date() },
  { id: 5, name: '运营人员', code: 'operator', status: 0 as const, remark: '运营相关权限', createTime: new Date() }
]

/**
 * 获取单个角色详情接口
 * GET /api/role/detail/:id
 */
export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    
    console.log('获取角色详情:', id)
    
    // 模拟查询角色
    const role = mockRoles.find(r => r.id === parseInt(id || '0'))
    
    if (!role) {
      throw createError({
        statusCode: 404,
        message: '角色不存在'
      })
    }
    
    return role
  }
})
