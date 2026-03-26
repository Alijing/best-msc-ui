import { defineStore } from 'pinia'
import type { MenuNode, CreateMenuRequest, UpdateMenuRequest, BatchUpdateItem } from '../types/menu'

export const useMenuStore = defineStore('menu', () => {
  // State
  const menuTree = ref<MenuNode[]>([])
  const loading = ref(false)

  // Actions
  /**
   * 获取菜单树
   */
  async function fetchMenuTree() {
    loading.value = true
    try {
      const data = await $fetch<MenuNode[]>('/api/menu/tree')
      menuTree.value = data
      return data
    } catch (error) {
      console.error('获取菜单树失败:', error)
      ElMessage.error('获取菜单树失败')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增菜单
   */
  async function createMenu(menuData: CreateMenuRequest) {
    loading.value = true
    try {
      await $fetch('/api/menu', {
        method: 'POST',
        body: menuData
      })
      
      ElMessage.success('新增菜单成功')
      await fetchMenuTree()
      return true
    } catch (error) {
      console.error('新增菜单失败:', error)
      ElMessage.error('新增菜单失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 编辑菜单
   */
  async function updateMenu(id: number, menuData: UpdateMenuRequest) {
    loading.value = true
    try {
      await $fetch(`/api/menu/${id}`, {
        method: 'PUT',
        body: menuData
      })
      
      ElMessage.success('编辑菜单成功')
      await fetchMenuTree()
      return true
    } catch (error) {
      console.error('编辑菜单失败:', error)
      ElMessage.error('编辑菜单失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除菜单
   */
  async function deleteMenu(id: number) {
    loading.value = true
    try {
      await $fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      })
      
      ElMessage.success('删除菜单成功')
      await fetchMenuTree()
      return true
    } catch (error) {
      console.error('删除菜单失败:', error)
      ElMessage.error('删除菜单失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量更新菜单（用于拖拽排序）
   */
  async function batchUpdateMenu(items: BatchUpdateItem[]) {
    loading.value = true
    try {
      await $fetch('/api/menu/batch-update', {
        method: 'POST',
        body: items
      })
      
      ElMessage.success('保存排序成功')
      await fetchMenuTree()
      return true
    } catch (error) {
      console.error('批量更新失败:', error)
      ElMessage.error('批量更新失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单个菜单详情
   */
  async function getMenuById(id: number): Promise<MenuNode | null> {
    try {
      const data = await $fetch<MenuNode>(`/api/menu/${id}`)
      return data
    } catch (error) {
      console.error('获取菜单详情失败:', error)
      ElMessage.error('获取菜单详情失败')
      return null
    }
  }

  return {
    // State
    menuTree,
    loading,
    
    // Actions
    fetchMenuTree,
    createMenu,
    updateMenu,
    deleteMenu,
    batchUpdateMenu,
    getMenuById
  }
})
