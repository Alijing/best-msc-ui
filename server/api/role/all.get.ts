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
const RoleQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  pageSize: z.string().transform(val => parseInt(val) || 10),
  name: z.string().optional().or(z.literal('')),
  code: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')).transform(val => {
    if (val === '' || val === undefined) return undefined
    return val === '1' ? 1 : 0
  })
})

/**
 * 获取角色列表接口（支持分页、模糊查询）
 * GET /api/role/all
 */
export default defineApiEventHandler({
  validation: RoleQuerySchema,
  
  handler: async (event, payload) => {
    const { page, pageSize, name, code, status } = payload
    
    // 过滤数据
    let filteredRoles = mockRoles.filter(role => {
      if (name && !role.name.includes(name)) return false
      if (code && !role.code.toLowerCase().includes(code.toLowerCase())) return false
      if (status !== undefined && role.status !== status) return false
      return true
    })
    
    // 分页
    const total = filteredRoles.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex)
    
    return {
      total,
      data: paginatedRoles
    }
  }
})
