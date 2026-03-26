import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

/**
 * 删除菜单接口
 * DELETE /api/menu/:id
 */
export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    
    console.log('删除菜单:', id)
    
    // TODO: 实际项目中应该检查是否有子菜单，有则禁止删除
    
    return {
      success: true,
      message: '删除菜单成功'
    }
  }
})
