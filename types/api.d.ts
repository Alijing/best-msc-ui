/**
 * API 响应统一结构
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
  total?: number  // 列表接口可能有 total
}

/**
 * 分页列表响应
 */
export interface ListResponse<T = any> {
  list: T[]
  total: number
}
