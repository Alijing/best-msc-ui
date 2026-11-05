/**
 * 修改用户
 * 后端 PUT /sys/spider/info
 * 不传密码，编辑不会改密码
 */
import { z } from 'zod'
import { defineApiEventHandler } from '~/server/utils/defineApiEventHandler'
import { serverApiFetch } from '~/utils/api'

const bodySchema = z.object({
  id: z.union([z.string(), z.number()]),
  account: z.string().min(1, '账号不能为空'),
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().optional(),
  roleId: z.array(z.union([z.string(), z.number()])).min(1, '请选择角色'),
  departmentId: z.array(z.union([z.string(), z.number()])).optional()
})

export default defineApiEventHandler({
  validation: bodySchema,
  handler: async (event, payload) => {
    return await serverApiFetch(event, '/sys/spider/info', {
      method: 'PUT',
      body: {
        id: payload.id,
        account: payload.account,
        name: payload.name,
        phone: payload.phone ?? null,
        roleId: payload.roleId,
        departmentId: payload.departmentId ?? []
      }
    }, true)
  }
})
