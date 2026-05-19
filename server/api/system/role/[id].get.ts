/**
 * 获取单个角色信息
 */
import { defineApiEventHandler } from '#server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

export default defineApiEventHandler({
    handler: async (event) => {
        const id = event.context.params?.id

        return await serverApiFetch<ApiResponse<Role>>(event, `/sys/role/info/${id}`, {
            method: 'GET'
        })
    }
})
