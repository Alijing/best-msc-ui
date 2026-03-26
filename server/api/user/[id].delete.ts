import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

/**
 * 删除用户接口
 * DELETE /api/user/delete/:id
 */
export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    
    console.log('删除用户:', id)
    
    return {
      success: true,
      message: '删除用户成功'
    }
  }
})
