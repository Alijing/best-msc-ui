import {defineApiEventHandler} from '~/server/utils/defineApiEventHandler'
import {z} from 'zod'
import {serverApiFetch} from "~/utils/api";
import type {ApiResponse} from "~/types/api";

const bodySchema = z.object({
    ids: z.array(z.union([z.string(), z.number()])).min(1, '至少选择一个菜单')
})

export default defineApiEventHandler({
    validation: bodySchema,
    // 处理 DELETE 请求
    handler: async (event, payload) => {
        return await serverApiFetch<ApiResponse<boolean>>(event, '/sys/menu/info', {
            method: 'DELETE',
            body: payload.ids
        })
    }
})