import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id ? Number(event.context.params.id) : 0
    
    // TODO: 从真实数据库获取预览图片地址列表
    // 这里是示例数据
    const imageUrls = [
      `https://picsum.photos/seed/${id}/400/600`,
      `https://picsum.photos/seed/${id + 1}/400/600`,
      `https://picsum.photos/seed/${id + 2}/400/600`
    ]

    return {
      code: 20000,
      data: imageUrls,
      message: 'success',
      success: true
    }
  }
})
