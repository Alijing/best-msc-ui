import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import type { PerformerDictItem } from '~/stores/types/tasteVideo'

export default defineApiEventHandler({
  handler: async () => {
    // TODO: 从真实数据库获取演员数据
    // 这里是示例数据，实际应该从数据库查询
    const performers: PerformerDictItem[] = [
      { id: 1, name: '演员 A' },
      { id: 2, name: '演员 B' },
      { id: 3, name: '演员 C' },
      { id: 4, name: '演员 D' },
      { id: 5, name: '演员 E' }
    ]
    
    return {
      code: 20000,
      data: performers,
      message: 'success',
      success: true
    }
  }
})
