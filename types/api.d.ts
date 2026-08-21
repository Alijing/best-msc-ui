/**
 * 后端统一响应结构 R<T>
 *
 * 响应示例：
 * { "code": 200, "msg": "ok", "data": { ... } }
 * { "code": 500, "msg": "系统异常", "data": null }
 *
 * 业务状态码：
 * - 200: 成功
 * - 400: 参数错误
 * - 401: 未登录 / Token 失效
 * - 403: 无权限
 * - 404: 资源不存在
 * - 500: 服务器错误
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 列表响应数据
 */
export interface ListResponse<T = any> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 字典项
 */
export interface DictItem {
  id: string | number;
  name: string;
}
