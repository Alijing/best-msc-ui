import {defineApiEventHandler} from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from "~/utils/api";
import type {ApiResponse} from "~/types/api";
import type {MenuNode} from "~/stores/types/menu";


export default defineApiEventHandler({

    // 处理 GET 请求
    handler: async (event) => {
        return await serverApiFetch<ApiResponse<MenuNode[]>>(event, '/sys/menu/info/tree', {
            method: 'GET'
        }, true)
    }
})