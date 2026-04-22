/**
 * 角色管理相关类型定义
 */

/**
 * 角色数据模型
 */
export interface Role {
  id: string | number
  name: string
  code: string
  status: 0 | 1
  remark?: string
  createTime: string
}

/**
 * 角色查询参数
 */
export interface RoleQuery {
  pageIndex: number
  pageSize: number
  name?: string
  code?: string
  status?: 0 | 1
}

/**
 * 角色创建/更新请求
 */
export interface RoleRequest {
  id?: string | number
  name: string
  code: string
  status: 0 | 1
  remark?: string
}
