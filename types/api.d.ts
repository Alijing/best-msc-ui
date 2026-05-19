/**
 * API 统一响应结构
 */
export interface ApiResponse<T = any> {
  code: number      // 20000 表示成功
  data: T
  message: string
  success: boolean
  total?: number    // 列表接口可能有 total
}

/**
 * 字典项
 */
export interface DictItem {
  id: string | number
  name: string
}