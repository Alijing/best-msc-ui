/**
 * 兴趣视频相关类型定义
 */

/**
 * 视频状态枚举
 * 0 - 未下载，1 - 已下载，2 - 已观看
 */
export type VideoStatus = 0 | 1 | 2

/**
 * 兴趣视频数据模型（列表显示用，字段为文本）
 */
export interface TasteVideo {
  id: string | number
  number: string
  name: string
  performer: string
  releaseDate: string
  rating: number
  status: '未下载' | '已下载' | '已观看'
  magnetUri: string
  gmtCreate: string
}

/**
 * 兴趣视频查询参数
 */
export interface TasteVideoQuery {
  pageIndex: number
  pageSize: number
  number?: string
  performer?: string | number
  rating?: number
  status?: VideoStatus
  gmtCreate?: string[]
}

/**
 * 兴趣视频创建请求
 */
export interface TasteVideoRequest {
  number: string
  name: string
  performer: string
  releaseDate: string
  rating: number
  status: VideoStatus
  magnetUri: string
}



/**
 * 视频预览响应
 */
export interface VideoPreviewResponse {
  images: string[]
}
