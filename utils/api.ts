/**
 * 统一的 API 请求响应处理
 */

import {parseCookies} from 'h3'

interface ApiResponse<T = any> {
    code: number
    data: T
    message: string
    success: boolean
}

/**
 * API 请求拦截器 - 在客户端发起请求前检查登录状态
 * 防止未登录时发送不必要的请求
 */
export function interceptApiRequest(url: string, options?: any): void {
    // 只在客户端进行拦截检查
    if (typeof window === 'undefined') {
        return
    }

    // 使用 useState 检查登录状态（而不是直接读 cookie）
    const isLoggedIn = useState('isLoggedIn').value

    // 公开接口列表（不需要认证）
    const publicPaths = ['/api/auth/login']
    const isPublicPath = publicPaths.some(path => url.includes(path))

    // 未登录且不是公开接口时，抛出错误阻止请求
    if (!isLoggedIn && !isPublicPath) {
        console.warn(`⚠️ 拦截未登录用户的 API 请求：${url}`)
        throw new Error('用户未登录，已拦截请求')
    }
}

/**
 * 处理 API 响应，当 code !== 20000 时抛出错误
 */
export async function handleApiResponse<T>(response: ApiResponse<T>): Promise<T> {
    if (response.code !== 20000) {
        const errorMessage = response.message || '请求失败'

        // 401 特殊处理：跳转到登录页
        if (response.code === 401) {
            if (typeof window !== 'undefined') {
                // 使用 Nuxt 的 navigateTo 进行路由跳转（避免硬刷新）
                await navigateTo('/login')
            }
        }

        throw createError({
            status: response.code,
            message: errorMessage
        })
    }
    return response.data
}

/**
 * Nuxt 客户端（浏览器）调用 Nuxt 服务端 API 请求函数
 * 通过服务端代理自动携带 HttpOnly cookie 中的 token
 */
export async function clientApiFetch<T>(url: string, options?: any): Promise<T> {
    // 客户端调用时进行拦截检查
    if (typeof window !== 'undefined') {
        interceptApiRequest(url, options)
    }

    try {
        // 客户端调用服务端 API 时，Nuxt 会自动携带 cookie
        const response = await $fetch<ApiResponse<T>>(url, {
            ...options,
            credentials: 'include', // 自动携带 cookie
            timeout: 5000, // 5 秒超时（快速失败）
            retry: 0 // 不自动重试（由用户手动刷新）
        })

        return handleApiResponse(response)
    } catch (error: any) {
        console.error(`API 请求失败 [${options?.method || 'GET'}] ${url}:`, error)
        throw error
    }
}

/**
 * 通用 API 请求函数（可用于服务端或客户端）
 */
export async function apiFetch<T>(url: string, options?: any): Promise<T> {
    // 客户端调用时进行拦截检查
    if (typeof window !== 'undefined') {
        interceptApiRequest(url, options)
    }

    try {
        const response = await $fetch<ApiResponse<T>>(url, {
            ...options,
            timeout: 5000, // 5 秒超时（快速失败）
            retry: 0 // 不自动重试
        })
        return handleApiResponse(response)  // 只处理响应，不带 token
    } catch (error: any) {
        console.error(`API 请求失败 [${options?.method || 'GET'}] ${url}:`, error)
        throw error
    }
}

/**
 * Nuxt 服务端（Node.js）调用外部真实后端 API 请求函数（带 event 参数）
 * @param event - H3 event 对象
 * @param url - 后端 API 路径
 * @param options - 请求选项
 * @param withAuth - 是否携带认证 token（默认 true）
 */
export async function serverApiFetch<T>(event: any, url: string, options?: any, withAuth: boolean = true): Promise<any> {
    const config = useRuntimeConfig(event)
    const BACKEND_URL = config.public.backendUrl

    const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`

    // 只有在 withAuth=true 时才获取 token
    let token: string | null = null

    if (withAuth) {
        // 优先从客户端请求的 cookie 中获取 token，其次从 Authorization header
        // 尝试从 cookie 获取
        const cookies = parseCookies(event)
        if (cookies.auth_token) {
            token = cookies.auth_token
        } else {
            // 如果 cookie 中没有，尝试从 Authorization header 获取
            const authorization = event.headers.get('Authorization') || event.headers.get('authorization')
            if (authorization) {
                token = authorization.replace('Bearer ', '')
            }
        }
    }

    try {
        const headers = {
            ...(options?.headers || {}),
            ...(token ? {'Authorization': `${token}`} : {})
        }
        // 直接返回完整响应，让调用方自己处理（不抛异常）
        return await $fetch<ApiResponse<T>>(fullUrl, {
            ...options,
            headers
        })
    } catch (error: any) {
        console.error('❌ [serverApiFetch] 请求失败:', error)
        if (error.data) {
            return error.data
        }
        return {
            code: error.statusCode || 500,
            message: error.data?.message || error.message || '请求失败，请稍后重试',
            success: false
        }
    }
}
