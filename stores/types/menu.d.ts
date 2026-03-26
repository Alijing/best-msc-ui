// 多语言条目
export interface I18nEntry {
  locale: string        // 语言代码，如 'zh-CN', 'en-US'
  name: string          // 该语言下的菜单名称
  description?: string  // 该语言下的菜单描述
}

// 菜单节点
export interface MenuNode {
  id: number
  parentId: number | null
  i18n: I18nEntry[]
  icon?: string
  path?: string
  sort: number
  status: 0 | 1
  children?: MenuNode[]
  createTime: Date
}

// 新增菜单请求
export interface CreateMenuRequest {
  parentId: number | null
  i18n: I18nEntry[]
  icon?: string
  path?: string
  sort?: number
  status: 0 | 1
}

// 编辑菜单请求
export interface UpdateMenuRequest {
  parentId?: number | null
  i18n?: I18nEntry[]
  icon?: string
  path?: string
  sort?: number
  status?: 0 | 1
}

// 批量更新项
export interface BatchUpdateItem {
  id: number
  parentId: number | null
  sort: number
}

// 查询参数
export interface MenuQuery {
  keyword?: string
}
