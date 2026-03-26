import type { MenuItem } from '~/stores/user.store'

/**
 * 菜单组合式函数
 * 提供权限过滤后的菜单和面包屑导航
 */
export function useMenu() {
  const userStore = useUserStore()
  const route = useRoute()

  /**
   * 获取已过滤权限的菜单
   * 根据用户权限过滤不可见的菜单项
   */
  const menus = computed(() => {
    const allMenus = userStore.menus || []
    
    // 如果没有设置权限，返回所有菜单
    if (!userStore.permissions?.value?.length) {
      return allMenus
    }

    // 递归过滤菜单
    const filterMenus = (menus: MenuItem[]): MenuItem[] => {
      return menus
        .filter(menu => {
          // 如果没有设置权限要求，或用户有该权限，或是管理员，显示该菜单
          if (!menu.permission) return true
          // 确保 hasPermission 存在且可调用
          if (typeof userStore.hasPermission !== 'function') return true
          return userStore.hasPermission(menu.permission)
        })
        .map(menu => ({
          ...menu,
          children: menu.children ? filterMenus(menu.children) : undefined
        }))
        .filter(menu => !menu.children || menu.children.length > 0)
    }

    return filterMenus(allMenus)
  })

  /**
   * 生成面包屑导航
   * 基于当前路由路径生成层级面包屑
   */
  const breadcrumbs = computed(() => {
    const paths = route.path.split('/').filter(Boolean)
    const crumbs: Array<{ path: string; title: string }> = []

    let currentPath = ''
    
    // 添加首页
    crumbs.push({ path: '/', title: '首页' })

    // 遍历路径生成面包屑
    for (const segment of paths) {
      currentPath += `/${segment}`
      
      // 在菜单中查找匹配的项
      const findMenuTitle = (menus: MenuItem[]): string | undefined => {
        for (const menu of menus) {
          if (menu.path === currentPath) {
            return menu.title
          }
          if (menu.children) {
            const found = findMenuTitle(menu.children)
            if (found) return found
          }
        }
        return undefined
      }

      const title = findMenuTitle(userStore.menus || []) || segment
      crumbs.push({ path: currentPath, title })
    }

    return crumbs
  })

  return {
    menus,
    breadcrumbs
  }
}
