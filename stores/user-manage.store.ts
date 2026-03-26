import {defineStore} from 'pinia'

// 角色类型
export type RoleCode = 'admin' | 'user' | 'guest'

// 角色信息
export interface UserRole {
    id: number
    code: RoleCode
    name: string
    description?: string
}

// 查询参数类型
export interface UserQuery {
    pageIndex: number
    pageSize: number
    account?: string
    name?: string
    phone?: string
    role?: RoleCode
}

// 新增用户请求类型
export interface CreateUserRequest {
    account: string
    password: string
    name: string
    phone?: string
    role: RoleCode
}

// 编辑用户请求类型
export interface UpdateUserRequest {
    account?: string
    password?: string
    name?: string
    phone?: string
    role?: RoleCode
}

// 用户列表响应类型
export interface UserListResponse {
    total: number
    data: UserManage[]
}

// 用户管理类型（避免与 user.store.ts 中的 User 冲突）
export interface UserManage {
    id: number
    account: string
    name: string
    phone?: string
    role: RoleCode
    createTime: Date
}

// 用户管理 Store
export const useUserManageStore = defineStore('userManage', () => {
    // State
    const users = ref<UserManage[]>([])
    const total = ref(0)
    const loading = ref(false)
    const roles = ref<UserRole[]>([]) // 角色列表
    const query = ref<UserQuery>({
        pageIndex: 1,
        pageSize: 10,
        account: '',
        name: '',
        phone: '',
        role: undefined
    })

    // Actions
    /**
     * 获取角色列表
     */
    async function fetchRoles() {
        try {
            const data = await $fetch<{ success: boolean; data: UserRole[] }>('/api/role/all', {
                method: 'GET',
                query: {
                    page: 1,
                    pageSize: 1000 // 获取所有角色
                }
            })
            roles.value = data.data
            return roles.value
        } catch (error) {
            console.error('获取角色列表失败:', error)
            ElMessage.error('获取角色列表失败')
            return []
        }
    }

    /**
     * 获取用户列表
     */
    async function fetchUsers() {
        loading.value = true
        try {
            const params = {
                page: query.value.pageIndex,
                pageSize: query.value.pageSize,
                account: query.value.account || '',
                name: query.value.name || '',
                phone: query.value.phone || '',
                role: query.value.role || ''
            }

            const data = await clientApiFetch<UserListResponse>('/api/user/all', {
                method: 'GET',
                query: params
            })

            users.value = data.data
            total.value = data.total
        } catch (error) {
            console.error('获取用户列表失败:', error)
            ElMessage.error(error.message ? error.message : '获取用户列表失败')
        } finally {
            loading.value = false
        }
    }

    /**
     * 新增用户
     */
    async function createUser(userData: CreateUserRequest) {
        loading.value = true
        try {
            await $fetch('/api/user/create', {
                method: 'POST',
                body: userData
            })

            ElMessage.success('新增用户成功')
            await fetchUsers()
            return true
        } catch (error) {
            console.error('新增用户失败:', error)
            ElMessage.error('新增用户失败')
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * 编辑用户
     */
    async function updateUser(id: number, userData: UpdateUserRequest) {
        loading.value = true
        try {
            await $fetch(`/api/user/update/${id}`, {
                method: 'PUT',
                body: userData
            })

            ElMessage.success('编辑用户成功')
            await fetchUsers()
            return true
        } catch (error) {
            console.error('编辑用户失败:', error)
            ElMessage.error('编辑用户失败')
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * 删除用户
     */
    async function deleteUser(id: number) {
        loading.value = true
        try {
            await $fetch(`/api/user/delete/${id}`, {
                method: 'DELETE'
            })

            ElMessage.success('删除用户成功')
            await fetchUsers()
            return true
        } catch (error) {
            console.error('删除用户失败:', error)
            ElMessage.error('删除用户失败')
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * 设置查询条件
     */
    function setQuery(key: keyof UserQuery, value: any) {
        if (key !== 'pageIndex' && key !== 'pageSize') {
            query.value[key] = value
        }
    }

    /**
     * 重置查询条件
     */
    function resetQuery() {
        query.value = {
            pageIndex: 1,
            pageSize: 10,
            account: '',
            name: '',
            phone: '',
            role: undefined
        }
    }

    /**
     * 设置分页
     */
    function setPage(page: number) {
        query.value.pageIndex = page
    }

    /**
     * 设置每页条数
     */
    function setPageSize(size: number) {
        query.value.pageSize = size
        query.value.pageIndex = 1
    }

    return {
        // State
        users,
        total,
        loading,
        roles,
        query,

        // Actions
        fetchUsers,
        fetchRoles,
        createUser,
        updateUser,
        deleteUser,
        setQuery,
        resetQuery,
        setPage,
        setPageSize
    }
})
