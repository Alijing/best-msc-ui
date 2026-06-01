/**
 * 用户类型定义
 */
export interface User {
  id: string | number;
  account: string;
  name?: string;
  role?: string;
  menus?: MenuNode[];
  permission?: string[];
}

/**
 * 登录响应
 */
export interface TokenInfo {
  token: string;
  expireTime: number;
}
