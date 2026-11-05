/**
 * 部门简单列表，供用户表单和筛选使用
 * 后端 GET /sys/department/simple/list
 */
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

export default defineApiEventHandler({
  handler: async (event) => {
    return await serverApiFetch(event, '/sys/department/simple/list', {
      method: 'GET'
    }, true)
  }
})
