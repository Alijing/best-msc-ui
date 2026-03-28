import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id ? Number(event.context.params.id) : 0
    
    // TODO: 从真实数据库删除
    console.log('删除视频:', id)
    
    return {
      code: 20000,
      data: { success: true },
      message: '删除成功',
      success: true
    }
  }
})
