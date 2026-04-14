import { defineStore } from 'pinia'
import type { User, MenuItem } from '~/stores/types/user'

// token 信息定义
export interface TokenInfo {
  token: string
  expireTime: number
}

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
   * 
   * 流程：
   * 1. 调用 /api/auth/login 接口
   * 2. 服务端自动设置 HttpOnly Cookie
   * 3. 设置本地 useState 状态
   * 4. 获取用户信息
   */
  async function login(credentials: { account: string; password: string }) {
    try {
      console.log('[login] 登录中...')
      
      // 调用登录接口
      // 注意：这里使用 apiFetch，Nuxt 服务端会自动设置 HttpOnly Cookie
      const response = await apiFetch<TokenInfo>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      // ==================== 设置登录状态 ====================
      // ✅ 只设置 useState，不再使用 localStorage
      // 原因：localStorage 不安全（XSS），且与 HttpOnly Cookie 方案冲突
      const isLoggedIn = useState('isLoggedIn', () => false)
      isLoggedIn.value = true
      
      // ✅ 不再保存 tokenExpireTime（cookie 的 maxAge 已足够）
      // 页面刷新时由 plugins/init-auth.client.ts 自动恢复状态
      
      // ==================== 获取用户信息 ====================
      // 登录成功后立即获取用户信息（ menus、permissions 等）
      await fetchUserInfo()
      
      console.log('✅ [login] 登录成功，用户:', credentials.account)

      return response
    } catch (error) {
      console.error('❌ [login] 登录失败:', error)
      throw error
    }
  }

  /**
   * 登出
   * 
   * 流程：
   * 1. 调用 /api/auth/logout 接口
   * 2. 服务端清除 HttpOnly Cookie
   * 3. 清除本地用户状态
   */
  async function logout() {
    try {
      console.log('👋 [logout] 开始处理登出...')
      
      // 调用登出接口
      // 服务端会清除 HttpOnly Cookie
      await clientApiFetch('/api/auth/logout', { method: 'GET' })
      
      console.log('✅ [logout] 服务端 Cookie 已清除')
    } catch (error) {
      console.error('❌ [logout] 登出请求失败:', error)
    } finally {
      // ==================== 清除本地状态 ====================
      // 无论服务端是否成功，都清除本地状态（保证用户体验）
      user.value = null
      menus.value = []
      permissions.value = []
      
      // ✅ 清除 useState
      const isLoggedIn = useState('isLoggedIn', () => false)
      isLoggedIn.value = false
      
      // ❌ 移除 localStorage 清理逻辑（不再使用）
      // if (import.meta.client) {
      //   localStorage.removeItem('isLoggedIn')
      //   localStorage.removeItem('tokenExpireTime')
      // }
      
      console.log('✅ [logout] 本地状态已重置')
    }
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
    logout
  }
})
