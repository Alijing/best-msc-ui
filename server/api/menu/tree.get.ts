import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 模拟菜单数据库
const mockMenus = [
  {
    id: 1,
    parentId: null,
    i18n: [
      { locale: 'zh-CN', name: '系统管理', description: '系统配置相关' },
      { locale: 'en-US', name: 'System Management', description: 'System configuration' }
    ],
    icon: 'Setting',
    path: '/system',
    sort: 1,
    status: 0 as const,
    createTime: new Date(),
    children: [
      {
        id: 2,
        parentId: 1,
        i18n: [
          { locale: 'zh-CN', name: '用户管理', description: '用户信息管理' },
          { locale: 'en-US', name: 'User Management', description: 'User information' }
        ],
        icon: 'User',
        path: '/user',
        sort: 1,
        status: 0 as const,
        createTime: new Date(),
        children: []
      },
      {
        id: 3,
        parentId: 1,
        i18n: [
          { locale: 'zh-CN', name: '角色管理', description: '角色权限管理' },
          { locale: 'en-US', name: 'Role Management', description: 'Role permissions' }
        ],
        icon: 'Avatar',
        path: '/role',
        sort: 2,
        status: 0 as const,
        createTime: new Date(),
        children: []
      }
    ]
  },
  {
    id: 4,
    parentId: null,
    i18n: [
      { locale: 'zh-CN', name: '数据分析', description: '数据统计与分析' },
      { locale: 'en-US', name: 'Analytics', description: 'Data statistics' }
    ],
    icon: 'DataAnalysis',
    path: '/analytics',
    sort: 2,
    status: 0 as const,
    createTime: new Date(),
    children: []
  },
  {
    id: 5,
    parentId: null,
    i18n: [
      { locale: 'zh-CN', name: '一级菜单', description: '一级菜单' },
      { locale: 'en-US', name: '一级菜单', description: '一级菜单' }
    ],
    icon: 'DataAnalysis',
    path: '/analytics',
    sort: 2,
    status: 0 as const,
    createTime: new Date(),
    children: [
      {
        id: 51,
        parentId: 5,
        i18n: [
          { locale: 'zh-CN', name: '二级菜单', description: '二级菜单' },
          { locale: 'en-US', name: '二级菜单', description: '二级菜单' }
        ],
        icon: 'DataAnalysis',
        path: '/analytics',
        sort: 2,
        status: 0 as const,
        createTime: new Date(),
        children: [
          {
            id: 511,
            parentId: 51,
            i18n: [
              { locale: 'zh-CN', name: '三级菜单', description: '三级菜单' },
              { locale: 'en-US', name: '三级菜单', description: '三级菜单' }
            ],
            icon: 'DataAnalysis',
            path: '/analytics',
            sort: 2,
            status: 0 as const,
            createTime: new Date(),
            children: []
          }
        ]
      }
    ]
  }
]

/**
 * 获取菜单树接口
 * GET /api/menu/tree
 */
export default defineApiEventHandler({
  handler: async () => {
    console.log('获取菜单树')
    
    // 返回完整的菜单树
    return mockMenus
  }
})
