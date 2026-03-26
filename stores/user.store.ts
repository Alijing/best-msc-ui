import {defineStore} from 'pinia'

// token 信息定义
export interface TokenInfo {
    token: string
    expireTime: number
}

// 用户类型定义
export interface User {
    id: number
    email: string
    name?: string
    avatar?: string
    roles: string[]
}

// 菜单项类型定义
export interface MenuItem {
    path: string
    name: string
    icon?: string
    children?: MenuItem[]
    permission?: string
}

// 用户 Store - 管理用户信息、菜单和权限
export const useUserStore = defineStore('user', () => {
    // State
    const user = ref<User | null>(null)
    const menus = ref<MenuItem[]>([])
    const permissions = ref<string[]>([])

    // Getters
    const isLoggedIn = computed(() => !!user.value)
    const hasPermission = (permission: string) => {
        if (!user.value) return false
        const userPermissions = permissions.value || []
        const userRoles = user.value.roles || []
        return userPermissions.includes(permission) || userRoles.includes('admin')
    }

    // Actions
    /**
     * 获取用户信息（调用服务端 API）
     */
    async function fetchUserInfo() {
        try {
            const data = await clientApiFetch('/api/auth/me')

            user.value = data.user
            menus.value = data.menus
            permissions.value = data.permissions || []
        } catch (error) {
            console.error('❌ [fetchUserInfo] 获取用户信息失败:', error)
            throw error
        }
    }

    /**
     * 登录
     */
    async function login(credentials: { account: string; password: string }) {
        try {
            // 使用 apiFetch 通过服务端代理登录（后端设置 HttpOnly cookie）
            const response = await apiFetch<TokenInfo>('/api/auth/login', {
                method: 'POST',
                body: credentials
            })

            // 手动设置登录状态（因为 HttpOnly cookie 无法被 JS 读取）
            const isLoggedIn = useState('isLoggedIn')
            isLoggedIn.value = true

            // 登录成功后立即获取用户信息
            await fetchUserInfo()

            return response
        } catch (error) {
            console.error('登录失败:', error)
            throw error
        }
    }

    /**
     * 登出
     */
    async function logout() {
        try {
            await clientApiFetch('/api/auth/logout', {method: 'GET'})
        } catch (error) {
            console.error('登出失败:', error)
        } finally {
            // 清除本地状态
            user.value = null
            menus.value = []
            permissions.value = []
            
            console.log('✅ [logout] 已重置用户状态')
        }
    }

    /**
     * 重置密码（示例）
     */
    async function resetPassword(email: string) {
        await $fetch('/api/auth/reset-password', {
            method: 'POST',
            body: {email}
        })
    }

    return {
        // State
        user,
        menus,
        permissions,

        // Getters
        isLoggedIn,
        hasPermission,

        // Actions
        fetchUserInfo,
        login,
        logout,
        resetPassword
    }
})
