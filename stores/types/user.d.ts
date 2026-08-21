/**
 * 用户类型定义
 * 登录接口返回的用户信息
 */
export interface User {
  id: string | number;
  username: string;
  nickname?: string;
  avatar?: string | null;
  menus?: MenuNode[];
  perms?: string[];
  roles?: string[];
}

/**
 * 登录响应数据
 * 登录接口成功后返回的完整数据
 */
export interface LoginResponse {
  token: string;
  expireTime?: number;
  avatar?: string | null;
  menus?: MenuNode[];
  nickname?: string;
  perms?: string[];
  roles?: string[];
  userId: string | number;
  username: string;
}

/**
 * Token 信息（向后兼容）
 */
export interface TokenInfo {
  token: string;
  expireTime?: number;
}

/**
 * 菜单项类型（兼容旧代码）
 * 等同于 MenuNode
 */
export type MenuItem = MenuNode;
