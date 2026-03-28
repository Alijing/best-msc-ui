export interface TasteVideo {
  id: number
  number: string
  name: string
  performer: string
  performerId?: number | string
  releaseDate: string
  rating: number
  status: 0 | 1 | 2
  magnetUri: string
  gmtCreate: string
}

export interface TasteVideoQuery {
  pageIndex: number
  pageSize: number
  number?: string
  performer?: number | string
  rating?: number
  status?: 0 | 1 | 2
  gmtCreate?: string[]
}

export interface TasteVideoRequest {
  number: string
  name: string
  performer: number | string
  releaseDate: string
  rating: number
  status: 0 | 1 | 2
  magnetUri: string
}

export interface PerformerDictItem {
  id: number | string
  name: string
}
