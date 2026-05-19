import type { MenuItem } from '~/stores/types/user'

/**
 * 菜单组合式函数
 * 提供权限过滤和面包屑生成功能
 */
export function useMenu() {
  const userStore = useUserStore()
  const route = useRoute()

  /**
   * 根据权限过滤菜单
   */
  function filterMenusByPermission(menus: MenuItem[]): MenuItem[] {
    const permissions = userStore.permissions
    
    // 如果没有权限限制，返回所有菜单
    if (!permissions || permissions.length === 0) {
      return menus
    }

    // 递归过滤菜单树
    function filter(menuItems: MenuItem[]): MenuItem[] {
      return menuItems
        .filter(item => {
          // 如果没有设置权限，默认允许访问
          if (!item.permission) {
            return true
          }
          // 检查是否包含所需权限
          return permissions.includes(item.permission)
        })
        .map(item => ({
          ...item,
          children: item.children ? filter(item.children) : undefined
        }))
        .filter(item => !item.children || item.children.length > 0)
    }

    return filter(menus)
  }

  /**
   * 获取已过滤的菜单列表
   */
  const menus = computed(() => filterMenusByPermission(userStore.menus))

  /**
   * 生成面包屑
   */
  function generateBreadcrumbs(): Array<{ name: string; path: string }> {
    const breadcrumbs: Array<{ name: string; path: string }> = []
    
    // 添加首页
    breadcrumbs.push({ name: '首页', path: '/' })
    
    // 查找当前路由对应的菜单项
    const findPath = (menuItems: MenuItem[], currentPath: string): boolean => {
      for (const item of menuItems) {
        if (item.path === currentPath) {
          breadcrumbs.push({ name: item.name, path: item.path })
          return true
        }
        
        if (item.children) {
          if (findPath(item.children, currentPath)) {
            breadcrumbs.unshift({ name: item.name, path: item.path })
            return true
          }
        }
      }
      
      return false
    }
    
    findPath(userStore.menus, route.path)
    
    return breadcrumbs
  }

  const breadcrumbs = computed(() => generateBreadcrumbs())

  return {
    menus,
    breadcrumbs
  }
}
