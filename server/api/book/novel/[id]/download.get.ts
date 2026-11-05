/**
 * 下载小说正文，代理后端的二进制响应。
 * 后端 GET /novel/download/{novelId}
 */
import { createError, getRouterParam, isError, parseCookies, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const novelId = getRouterParam(event, 'id')
  if (!novelId || !/^\d+$/.test(novelId)) {
    throw createError({ statusCode: 422, message: '小说 ID 无效' })
  }

  const config = useRuntimeConfig(event)
  const cookies = parseCookies(event)
  const token = cookies.auth_token
  const url = `${config.public.backendUrl}/novel/download/${novelId}`

  try {
    const response = await $fetch.raw(url, {
      method: 'GET',
      responseType: 'arrayBuffer',
      headers: token ? { Authorization: token } : {}
    })

    const bytes = Buffer.from(response._data as ArrayBuffer)
    if (!bytes.length) {
      throw createError({ statusCode: 404, message: '没有可下载的内容' })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const disposition = response.headers.get('content-disposition')
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Length', bytes.length)
    setHeader(event, 'Cache-Control', 'no-store')
    setHeader(
      event,
      'Content-Disposition',
      disposition || `attachment; filename="novel-${novelId}.txt"`
    )
    return bytes
  } catch (error: unknown) {
    if (isError(error)) {
      throw error
    }

    const detail = error as {
      statusCode?: number
      status?: number
      data?: { msg?: string, message?: string } | string
      message?: string
    }
    const dataMessage = typeof detail.data === 'string'
      ? detail.data
      : detail.data?.msg || detail.data?.message
    throw createError({
      statusCode: detail.statusCode || detail.status || 500,
      message: dataMessage || detail.message || '下载失败'
    })
  }
})
