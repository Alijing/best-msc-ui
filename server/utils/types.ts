import { z } from 'zod'

/**
 * 用户相关类型定义（服务端和客户端共享）
 */
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  roles: z.array(z.string())
})

export type User = z.infer<typeof UserSchema>

/**
 * 菜单项类型定义
 */
export interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
  permission?: string
}

/**
 * 登录请求验证 Schema
 */
export const LoginRequestSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码长度至少 6 位')
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

/**
 * 登录响应类型
 */
export interface LoginResponse {
  token: string
  user: User
  menus: MenuItem[]
  permissions?: string[]
}

/**
 * 获取用户信息响应类型
 */
export interface UserInfoResponse {
  user: User
  menus: MenuItem[]
  permissions?: string[]
}
