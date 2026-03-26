import { z } from 'zod'
import { defineApiEventHandler } from '../../utils/defineApiEventHandler'

// 模拟菜单数据库
const mockMenus: any[] = [
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
        parentId: null,
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
            parentId: null,
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
 * 获取单个菜单详情接口
 * GET /api/menu/:id
 */
export default defineApiEventHandler({
  handler: async (event) => {
    const id = event.context.params?.id
    
    console.log('获取菜单详情:', id)
    
    // 模拟查询菜单
    const menu = mockMenus.find(m => m.id === parseInt(id || '0'))
    
    if (!menu) {
      throw createError({
        statusCode: 404,
        message: '菜单不存在'
      })
    }
    
    return menu
  }
})
