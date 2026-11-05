/**
 * 用户管理相关类型定义
 * 字段与后端 SpiderInfo / SpiderQueryParam 对齐
 */

export interface ManagedUser {
  id: number | string
  account: string
  name?: string
  phone?: string
  roleId?: Array<number | string>
  roleName?: string
  departmentId?: Array<number | string>
  department?: string
  createTime?: string
}

export interface UserQuery {
  pageIndex: number
  pageSize: number
  account?: string
  name?: string
  departmentId?: string
}

export interface UserRequest {
  id?: string | number
  account: string
  name: string
  phone?: string
  roleId: Array<string | number>
  departmentId?: Array<string | number>
}

export interface DepartmentNode {
  id: number | string
  name: string
  children?: DepartmentNode[]
}

export interface DepartmentOption {
  id: string
  name: string
}
