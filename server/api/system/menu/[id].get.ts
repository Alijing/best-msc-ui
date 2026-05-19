/**
 * 获取单个菜单详情
 */
import {defineApiEventHandler} from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'
import type {ApiResponse} from '~/types/api'
import type {UpdateMenu} from "~/stores/types/menu";

export default defineApiEventHandler({
    handler: async (event) => {
        const id = event.context.params?.id
        return await serverApiFetch<ApiResponse<UpdateMenu>>(event, `/sys/menu/info/${id}`, {
            method: 'GET'
        })
    }
})
