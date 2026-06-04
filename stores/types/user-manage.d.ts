/**
 * 用户管理相关类型定义
 */

/**
 * 用户数据模型
 */
export interface User {
  id: number | string
  account: string
  name?: string
  phone?: string
  role: string
  createTime: Date
}

/**
 * 用户查询参数
 */
export interface UserQuery {
  pageIndex: number
  pageSize: number
  account?: string
  name?: string
  phone?: string
  role?: string
}

/**
 * 用户创建/更新请求
 */
export interface UserRequest {
  id?: string | number
  account: string
  name: string
  password?: string
  phone?: string
  role: string
}