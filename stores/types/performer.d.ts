/**
 * 演员管理相关类型定义
 */

/**
 * 演员数据模型
 */
export interface Performer {
  id: string | number
  name: string
  enUsName?: string
  birthday?: string
  height?: number
  bust?: number
  waistSize?: number
  hipCircumference?: number
  cupSize?: string
  hobby?: string
  remark?: string
}

/**
 * 演员查询参数
 */
export interface PerformerQuery {
  pageIndex: number
  pageSize: number
  name?: string
}

/**
 * 演员创建/更新请求
 */
export interface PerformerRequest {
  id?: string | number
  name: string
  enUsName?: string
  birthday?: string
  height?: number
  bust?: number
  waistSize?: number
  hipCircumference?: number
  cupSize?: string
  hobby?: string
  remark?: string
}
