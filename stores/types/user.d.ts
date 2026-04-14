/**
 * 用户类型定义
 */
export interface User {
  id: string | number
  email: string
  name?: string
  avatar?: string
  roles?: string[]
}

/**
 * 菜单项类型定义
 */
export interface MenuItem {
  id: string | number
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
  parentId?: string | number
  sort?: number
  permission?: string
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  user: User
}
