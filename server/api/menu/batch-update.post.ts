import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 批量更新项验证 Schema
const BatchUpdateItemSchema = z.object({
  id: z.number().int().positive(),
  parentId: z.number().nullable(),
  sort: z.number().int().nonnegative()
})

// 请求体验证 Schema
const BatchUpdateSchema = z.array(BatchUpdateItemSchema).min(1, '至少需要更新一项')

/**
 * 批量更新菜单接口（用于拖拽排序）
 * POST /api/menu/batch-update
 */
export default defineApiEventHandler({
  validation: BatchUpdateSchema,
  
  handler: async (event, payload) => {
    const validatedData = await BatchUpdateSchema.parseAsync(payload)
    
    console.log('批量更新菜单:', validatedData)
    
    // TODO: 实际项目中应该：
    // 1. 验证层级限制（不超过 3 级）
    // 2. 在事务中批量更新数据库
    // 3. 确保数据一致性
    
    return {
      success: true,
      message: '批量更新成功'
    }
  }
})
