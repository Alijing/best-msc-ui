---
status: planned
priority: P0
module: user
---

## 二、用户管理模块 🟡

> **模块状态**: 待实现（规划中，以下需求以演员字典模块为模板编写，后续实现时参考）

### 2.1 用户列表查询

```markdown
### 功能名称

用户列表查询

### 所属模块

pages/system/user/index.vue, stores/user-manage.store.ts, server/api/system/user/index.get.ts

### 类型

页面 + Store + API 路由

### 详细描述

展示用户列表，支持分页和模糊查询。查询条件包括账号、姓名、电话、角色。表格展示用户基本信息和角色标签。

### 输入

查询参数：

- pageIndex: number (默认 1)
- pageSize: number (默认 10)
- account?: string (模糊匹配)
- name?: string (模糊匹配)
- phone?: string (模糊匹配)
- role?: string (精确匹配，下拉选择，值需通过字典接口获取)

### 输出

interface UserListResponse {
total: number
data: User[]
}

interface User {
id: number | string
account: string
name: string
phone?: string
role: string
createTime: Date
}

### 数据模型

interface UserQuery {
pageIndex: number
pageSize: number
account?: string
name?: string
phone?: string
role?: string
}

### 依赖

- useUserManageStore (fetchList 方法)
- UTable, UPagination
- clientApiFetch

### 后端接口

GET /sys/spider/list # 用户列表
GET /sys/role/dict # 角色下拉框数据源

### 样式要求

- 查询区域：Nuxt UI 表单组件
- 表格：固定表头，斑马纹
- 响应式布局
- 暗色模式支持

### 其他约束

- 输入框失去焦点时触发查询
- 分页大小可切换（10/20/50/100）
- 支持前端重置查询条件
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 2.2 新增用户

```markdown
### 功能名称

新增用户

### 所属模块

modules/system/user/components/UserFormDialog.vue, stores/user-manage.store.ts, server/api/system/user/create.post.ts

### 类型

组件 + Store + API 路由

### 详细描述

弹窗表单形式新增用户，包含账号、姓名、密码、电话、角色选择。表单验证通过后提交到后端，成功则刷新列表。

### 输入

interface CreateUserRequest {
account: string (必填，唯一)
name: string (必填)
password: string (必填，最少 6 位)
phone?: string (选填)
role: 'admin' | 'user' | 'guest' (必填)
}

### 输出

- 成功：关闭弹窗，刷新列表，显示成功提示
- 失败：显示错误消息，保持弹窗打开

### 数据模型

同输入

### 依赖

- usePerformerStore (createPerformer 方法)
- UForm, UInput, USelect
- UModal (弹窗容器)
- useToast (反馈提示)

### 样式要求

- 弹窗宽度 600px
- 表单 label 左对齐
- 表单项垂直排列
- 底部按钮右对齐

### 其他约束

- 前端表单验证（必填、格式、长度）
- 账号唯一性校验（后端验证）
- 密码字段加密传输
- 角色选项从后端动态加载
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 2.3 编辑用户

```markdown
### 功能名称

编辑用户

### 所属模块

modules/system/user/components/UserFormDialog.vue, stores/user-manage.store.ts, server/api/system/user/update/:id.put.ts

### 类型

组件 + Store + API 路由

### 详细描述

弹窗表单形式编辑用户，回显用户现有信息。可选择性修改密码（不填则不修改）。提交后刷新列表。

### 输入

interface UpdateUserRequest {
account?: string
name?: string
password?: string (选填，不填表示不修改)
phone?: string
role?: 'admin' | 'user' | 'guest'
}

### 输出

- 成功：关闭弹窗，刷新列表，显示成功提示
- 失败：显示错误消息，保持弹窗打开

### 数据模型

同输入

### 依赖

- usePerformerStore (updatePerformer, fetchPerformerById 方法)
- UForm, UInput, USelect
- UModal

### 样式要求

同新增用户

### 其他约束

- 编辑模式密码为选填
- 账号不可编辑（只读）
- 数据回显准确
- 取消编辑不保存任何更改
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 2.4 删除用户

```markdown
### 功能名称

删除用户

### 所属模块

pages/system/user/index.vue, stores/user-manage.store.ts, server/api/system/user/delete/:id.delete.ts

### 类型

页面 + Store + API 路由

### 详细描述

点击删除按钮后弹出二次确认框，确认后调用后端删除接口，成功则刷新列表。

### 输入

- userId: number

### 输出

- 成功：刷新列表，显示成功提示
- 失败：显示错误消息

### 数据模型

无

### 依赖

- usePerformerStore (deletePerformer 方法)
- ConfirmDialog (确认对话框组件)
- useToast (结果反馈)

### 样式要求

操作列按钮：红色危险按钮

### 其他约束

- 必须二次确认
- 删除当前用户时提示"不能删除自己"
- 删除失败时显示具体原因
```

**优先级**: P0 🟡  
**状态**: 待实现（规划中，以演员字典模块为模板）

---
