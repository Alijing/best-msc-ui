/**
 * 获取单个角色信息
 */
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

export default defineApiEventHandler({
    handler: async (event) => {
        const id = event.context.params?.id

        try {
            return await serverApiFetch<ApiResponse<Role>>(event, `/sys/role/info/${id}`, {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                status: error.statusCode || 500,
                message: error.data?.message || error.message || '获取角色信息失败，请稍后重试'
            })
        }
    }
})
