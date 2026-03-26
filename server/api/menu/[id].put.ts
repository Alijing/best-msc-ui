import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 模拟菜单数据库
const mockMenus: any[] = []

// I18n 条目验证 Schema（可选）
const I18nEntrySchema = z.object({
  locale: z.string().min(1, '语言代码不能为空'),
  name: z.string().min(1, '菜单名称不能为空').max(50, '菜单名称最多 50 个字符'),
  description: z.string().max(200, '描述最多 200 个字符').optional()
})

// 编辑菜单验证 Schema（所有字段可选）
const UpdateMenuSchema = z.object({
  parentId: z.number().nullable().optional(),
  i18n: z.array(I18nEntrySchema).min(1, '至少需要一种语言的菜单信息').optional(),
  icon: z.string().max(50).optional(),
  path: z.string().max(200).optional(),
  sort: z.number().int().positive().optional(),
  status: z.enum(['0', '1']).transform(val => val === '1' ? 1 : 0).optional()
})

/**
 * 编辑菜单接口
 * PUT /api/menu/:id
 */
export default defineApiEventHandler({
  validation: UpdateMenuSchema,
  
  handler: async (event, payload) => {
    const id = event.context.params?.id
    const validatedData = await UpdateMenuSchema.parseAsync(payload)
    
    console.log('编辑菜单:', id, validatedData)
    
    // TODO: 实际项目中应该更新数据库
    
    return {
      success: true,
      message: '编辑菜单成功'
    }
  }
})
