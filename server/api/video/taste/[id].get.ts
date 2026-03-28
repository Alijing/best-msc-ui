import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import type { TasteVideo } from '~/stores/types/tasteVideo'

export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id ? Number(event.context.params.id) : 0
    
    // TODO: 从真实数据库获取数据
    // 这里是示例数据
    const mockData: TasteVideo = {
      id,
      number: `车牌${String(id).padStart(3, '0')}`,
      name: `视频名称${id}`,
      performer: `演员${String.fromCharCode(64 + (id % 5))}`,
      performerId: (id % 5) + 1,
      releaseDate: '2024-01-15',
      rating: (id % 5) + 1,
      status: (id % 3) as 0 | 1 | 2,
      magnetUri: `magnet:?xt=urn:btih:${'ABC'.repeat(13)}${String(id).padStart(2, '0')}`,
      gmtCreate: '2024-01-01 12:00:00'
    }

    return {
      code: 20000,
      data: mockData,
      message: 'success',
      success: true
    }
  }
})
