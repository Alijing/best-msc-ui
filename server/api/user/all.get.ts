import {z} from 'zod'
import {defineApiEventHandler} from '../../utils/defineApiEventHandler'
import {serverApiFetch} from '~/utils/api'

// 模拟用户数据库
const mockUsers = [
    {id: 1, account: 'admin', name: '管理员', phone: '13800138000', role: 'admin', createTime: new Date()},
    {id: 2, account: 'user1', name: '张三', phone: '13900139001', role: 'user', createTime: new Date()},
    {id: 3, account: 'user2', name: '李四', phone: '13700137002', role: 'user', createTime: new Date()},
    {id: 4, account: 'user3', name: '王五', phone: '13600136003', role: 'guest', createTime: new Date()},
    {id: 5, account: 'user4', name: '赵六', phone: '13500135004', role: 'user', createTime: new Date()},
    {id: 6, account: 'user5', name: '孙七', phone: '13400134005', role: 'admin', createTime: new Date()},
    {id: 7, account: 'user6', name: '周八', phone: '13300133006', role: 'user', createTime: new Date()},
    {id: 8, account: 'user7', name: '吴九', phone: '13200132007', role: 'guest', createTime: new Date()},
    {id: 9, account: 'user8', name: '郑十', phone: '13100131008', role: 'user', createTime: new Date()},
    {id: 10, account: 'user9', name: '钱十一', phone: '13000130009', role: 'user', createTime: new Date()}
]

// 查询参数验证 Schema
const UserQuerySchema = z.object({
    pageIndex: z.string().transform(val => parseInt(val) || 1),
    pageSize: z.string().transform(val => parseInt(val) || 10),
    account: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'user', 'guest']).optional().or(z.literal(''))
})

/**
 * 获取用户列表接口（支持分页、模糊查询）
 * GET /api/user/all
 */
export default defineApiEventHandler({
    validation: UserQuerySchema,

    handler: async (event, payload) => {
        const {pageIndex, pageSize, account, name, phone, role} = payload
        try {
            // 构建查询参数
            const queryParams: Record<string, string> = {
                pageIndex: String(pageIndex),
                pageSize: String(pageSize)
            }
            if (account) queryParams.account = account
            if (name) queryParams.name = name
            if (phone) queryParams.phone = phone
            if (role) queryParams.role = role

            return await serverApiFetch(event, '/sys/spider/list', {
                method: 'GET',
                query: queryParams
            }, true)
        } catch (error: any) {
            console.error('❌ [user.all.get.ts] 获取用户列表失败:', error)
            throw createError({
                status: error.statusCode || 500,
                message: error.data?.message || error.message || '获取用户列表失败，请稍后重试'
            })
        }
    }
})
