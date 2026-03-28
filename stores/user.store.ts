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
    async function fetchUserInfo(event?: any) {
        try {
            // 如果传入了 event（SSR 场景），使用 serverApiFetch 从 cookie 中提取 token
            if (event && typeof window === 'undefined') {
                // SSR 场景：直接从 event 提取 cookie 调用后端接口
                const response = await serverApiFetch(event, '/security/user/current', {
                    method: 'GET'
                })
                user.value = response.data
                menus.value = response.data.menus
                permissions.value = response.data.permissions || []
            } else {
                // 客户端场景：通过 Nuxt API 代理，自动携带 cookie
                const response = await clientApiFetch('/api/auth/me')
                user.value = response.data
                menus.value = response.data.menus
                permissions.value = response.data.permissions || []
            }
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

            // 登录成功后，在获取用户信息前先设置 isLoggedIn 为 true
            // 否则 fetchUserInfo 会被 API 拦截器拦截
            const isLoggedInState = useState('isLoggedIn')
            isLoggedInState.value = true
            
            // 同时在 localStorage 中保存登录标记（用于页面刷新时恢复）
            if (import.meta.client) {
              localStorage.setItem('isLoggedIn', 'true')
              // 保存 token 过期时间（绝对时间戳）
              if (response.data && response.data.expireTime) {
                // expireTime 是秒数，转换为毫秒并加上当前时间得到绝对时间戳
                const expireTimestamp = Date.now() + response.data.expireTime * 1000
                localStorage.setItem('tokenExpireTime', String(expireTimestamp))
              }
            }

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
            
            // 清除 localStorage 中的登录标记
            if (import.meta.client) {
              localStorage.removeItem('isLoggedIn')
              localStorage.removeItem('tokenExpireTime')
            }
            
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
