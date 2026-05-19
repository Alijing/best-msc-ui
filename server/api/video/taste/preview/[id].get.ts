/**
 * 获取视频预览图片
 */
import {defineApiEventHandler} from '#server/utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id

    if (!id) {
      return {
        code: 400,
        data: null,
        message: '缺少视频ID',
        success: false
      }
    }

    // 调用真实后端 API
    return await serverApiFetch<string[]>(event, `/video/taste/preview/${id}`)
  }
})
