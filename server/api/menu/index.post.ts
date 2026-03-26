import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 模拟菜单数据库（用于唯一性检查）
const mockMenus: any[] = []

// I18n 条目验证 Schema
const I18nEntrySchema = z.object({
  locale: z.string().min(1, '语言代码不能为空'),
  name: z.string().min(1, '菜单名称不能为空').max(50, '菜单名称最多 50 个字符'),
  description: z.string().max(200, '描述最多 200 个字符').optional()
})

// 新增菜单验证 Schema
const CreateMenuSchema = z.object({
  parentId: z.number().nullable(),
  i18n: z.array(I18nEntrySchema).min(1, '至少需要一种语言的菜单信息'),
  icon: z.string().max(50).optional(),
  path: z.string().max(200).optional(),
  sort: z.number().int().positive().optional(),
  status: z.enum(['0', '1']).transform(val => val === '1' ? 1 : 0)
})

/**
 * 新增菜单接口
 * POST /api/menu
 */
export default defineApiEventHandler({
  validation: CreateMenuSchema,
  
  handler: async (event, payload) => {
    const validatedData = await CreateMenuSchema.parseAsync(payload)
    
    console.log('新增菜单:', validatedData)
    
    // TODO: 实际项目中应该保存到数据库
    
    return {
      success: true,
      message: '新增菜单成功'
    }
  }
})
