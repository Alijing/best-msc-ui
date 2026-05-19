type MenuNode = {
    id: number | string
    parentId: number | string
    name: string
    path: string
    icon?: string
    children?: MenuNode[]
    permission?: string
    status?: number
    remark?: string
    i18n?: Array<{
        locale: string
        name: string
    }>
}

type CreateMenuRequest = {
    parentId?: number | string
    name: string
    path: string
    icon?: string
    status?: number
    remark?: string
    i18n: Array<{
        locale: string
        name: string
    }>
    permission?: string
}

type UpdateMenuRequest = {
    id: number | string
    parentId?: number | string
    name?: string
    path?: string
    icon?: string
    status?: number
    remark?: string
    i18n?: Array<{
        locale: string
        name: string
    }>
    permission?: string
}

type UpdateMenu = {
    id?: number | string | null
    parentId: number | string
    path: string
    i18ns: Array<{
        id: 0 | 1
        name: string
    }>
    icon: string
    permKey?: string
    status?: number
    sort?: number
}

type SortMenu = {
    id: number | string
    sort: number
}

export type {
    MenuNode,
    CreateMenuRequest,
    UpdateMenuRequest,
    UpdateMenu,
    SortMenu
}