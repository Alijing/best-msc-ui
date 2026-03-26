import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

/**
 * 删除角色接口
 * DELETE /api/role/delete/:id
 */
export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    
    console.log('删除角色:', id)
    
    // 这里应该执行删除逻辑，并检查是否有关联用户等
    
    return {
      success: true,
      message: '删除角色成功'
    }
  }
})
