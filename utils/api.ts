/**
 * 统一的 API 请求响应处理
 */

import {parseCookies} from 'h3'
import type { ApiResponse } from '~/types/api'

/**
 * API 请求拦截器 - 在客户端发起请求前检查登录状态
 * 
 * 职责：防止未登录用户发送不必要的请求
 * 
 * 注意：
 * - 只在客户端执行（服务端通过中间件控制）
 * - 只检查 useState，不检查 HttpOnly Cookie（客户端读不到）
 */
export function interceptApiRequest(url: string, _options?: any): void {
    // ==================== 只在客户端进行拦截检查 ====================
    if (typeof window === 'undefined') {
        return
    }

    // 如果 url 为空，直接放行
    if (!url) {
        return
    }

    // ==================== 公开接口列表（不需要认证） ====================
    const publicPaths = ['/api/auth/login', '/api/auth/register']
    const isPublicPath = publicPaths.some(path => url.includes(path))

    // 如果是公开接口，直接放行
    if (isPublicPath) {
        return
    }

    // ==================== 检查登录状态 ====================
    // ✅ 只检查 useState，不检查 HttpOnly Cookie（客户端读不到）
    const isLoggedInState = useState('isLoggedIn', () => false).value
    
    // 如果 state 为已登录，则放行
    if (isLoggedInState) {
        return
    }

    // ==================== 未登录且不是公开接口，抛出错误阻止请求 ====================
    console.warn(`⚠️ 拦截未登录用户的 API 请求：${url}`)
    throw new Error('用户未登录，已拦截请求')
}

/**
 * 处理 API 响应，当 code !== 20000 时抛出错误
 * 
 * 特殊处理：
 * - 401 错误：Token 过期或无效，自动跳转到登录页
 * - 其他错误：直接抛出异常
 */
export async function handleApiResponse<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    if (response.code !== 20000) {
        const errorMessage = response.message || '请求失败'

        // ==================== 401 特殊处理：跳转到登录页 ====================
        if (response.code === 401) {
            if (typeof window !== 'undefined') {
                console.log('🔒 [handleApiResponse] 检测到 401 错误，准备跳转登录页')
                
                // ✅ 清除登录状态
                useState('isLoggedIn', () => false).value = false
                
                // ✅ 保存当前路径用于回跳
                const route = useRoute()
                useState('redirectPath', () => '/').value = route.fullPath
                
                // ✅ 带 redirect 参数跳转
                await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
            }
        }

        // 抛出错误，让调用方知道请求失败
        throw createError({
            status: response.code,
            message: errorMessage
        })
    }
    console.log(`✅ [clientApiFetch] 请求成功:`, response)
    return response
}

/**
 * Nuxt 客户端（浏览器）调用 Nuxt 服务端 API 请求函数
 * 通过服务端代理自动携带 HttpOnly cookie 中的 token
 */
export async function clientApiFetch<T>(url: string, options?: any): Promise<ApiResponse<T>> {
    // 客户端调用时进行拦截检查
    if (typeof window !== 'undefined') {
        interceptApiRequest(url, options)
    }

    try {
        // 客户端调用服务端 API 时，Nuxt 会自动携带 cookie
        const response = await $fetch<ApiResponse<T>>(url, {
            ...options,
            credentials: 'include', // 自动携带 cookie
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            },
            timeout: 15000, // 15 秒超时
            retry: 0 // 不自动重试（由用户手动刷新）
        })

        return handleApiResponse(response)
    } catch (error: any) {
        if(error.status === 404){
            const toast = useToast()
            toast.add({
                title: '请求的资源不存在',
                description: `${url}，请检查配置是否正确`,
                color: 'error',
                icon: 'i-heroicons-exclamation-circle'
            })
            return Promise.resolve(error)
        }
        console.error(`API 请求失败 [${options?.method || 'GET'}] ${url}:`, error)
        throw error
    }
}

/**
 * 通用 API 请求函数（可用于服务端或客户端）
 */
export async function apiFetch<T>(url: string, options?: any): Promise<ApiResponse<T>> {
    // 客户端调用时进行拦截检查
    if (typeof window !== 'undefined') {
        interceptApiRequest(url, options)
    }

    try {
        const response = await $fetch<ApiResponse<T>>(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            },
            timeout: 15000, // 15 秒超时
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
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
            // 直接传递 token（不带 Bearer 前缀）
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
