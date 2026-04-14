/**
 * 菜单相关类型定义
 */
import type { MenuItem } from './user.d'

export interface MenuState {
  menuTree: MenuItem[]
}

export interface MenuCreatePayload {
  name: string
  path: string
  icon?: string
  parentId?: string | number
  sort?: number
  permission?: string
}

export interface MenuUpdatePayload extends Partial<MenuCreatePayload> {
  id: string | number
}
