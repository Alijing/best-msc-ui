# Best MSC UI 项目需求规格说明书

> **文档版本**: 1.0.0  
> **最后更新**: 2026-03-28  
> **项目名称**: Best MSC UI - 现代化管理后台系统  
> **技术栈**: Nuxt 3 + Vue 3 + TypeScript + Pinia + Element Plus

---

## 📋 文档说明

本文档基于《开发规范文档.md》第七章节"功能描述格式"编写，用于明确项目的功能需求、技术规范和验收标准。

### 需求优先级定义

- **P0** - 核心功能，必须实现
- **P1** - 重要功能，应该实现
- **P2** - 增强功能，可以实现

---

## 一、认证模块

### 1.1 用户登录功能

```markdown
### 功能名称
用户登录

### 所属模块
pages/login.vue, stores/user.store.ts, server/api/auth/*

### 类型
页面 + Store + API 路由

### 详细描述
提供用户登录功能，支持邮箱/账号和密码登录。登录成功后获取用户信息、菜单和权限，跳转到仪表盘首页。失败时显示错误提示。

### 输入
- account: string (必填) - 账号或邮箱
- password: string (必填) - 密码（加密传输）

### 输出
- 成功：跳转至首页，保存 token 和用户信息
- 失败：显示错误消息，停留在登录页

### 数据模型
interface LoginRequest {
  account: string
  password: string
}

interface LoginResponse {
  token: string
  expireTime: number
  user: {
    id: number
    email: string
    name: string
    roles: string[]
  }
}

### 依赖
- useUserStore (login, fetchUserInfo 方法)
- useRouter / navigateTo
- useCookie (存储 auth_token)
- localStorage (持久化登录状态)

### 样式要求
- 居中布局
- 表单宽度 400px
- 使用 Element Plus 表单组件
- 响应式设计

### 其他约束
- Token 存储在 HttpOnly Cookie 中
- 密码前端不加密，后端 HTTPS 传输
- 登录状态持久化（token 过期时间检查）
- 已登录用户访问登录页自动跳转首页
- 未登录访问保护页面保存目标路径
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 1.2 用户注销功能

```markdown
### 功能名称
用户注销

### 所属模块
components/UserDropdown.vue, stores/user.store.ts, server/api/auth/logout.get.ts

### 类型
组件 + Store + API 路由

### 详细描述
用户点击退出登录按钮后，调用后端注销接口，清除本地用户状态和 token，跳转到登录页。

### 输入
无（用户触发事件）

### 输出
- 成功：清除所有用户相关状态，跳转登录页
- 失败：清除本地状态，跳转登录页

### 数据模型
无

### 依赖
- useUserStore (logout 方法)
- ElMessage (成功提示)
- navigateTo (路由跳转)

### 样式要求
下拉菜单项，使用 Element Plus 图标

### 其他约束
- 无论后端是否成功，前端都必须清除状态
- 清除范围：user store、cookie、localStorage
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 1.3 获取当前用户信息

```markdown
### 功能名称
获取当前用户信息

### 所属模块
stores/user.store.ts, server/api/auth/me.get.ts

### 类型
Store + API 路由

### 详细描述
从后端获取当前登录用户的详细信息，包括基本信息、菜单树和权限列表。用于登录后初始化和页面刷新恢复状态。

### 输入
无（从 Cookie 自动提取 token）

### 输出
- user: 用户信息对象
- menus: 菜单树数组
- permissions: 权限字符串数组

### 数据模型
interface UserInfo {
  id: number
  email: string
  name: string
  avatar?: string
  roles: string[]
  menus: MenuNode[]
  permissions: string[]
}

### 依赖
- useUserStore
- clientApiFetch / serverApiFetch
- useState (SSR 状态同步)

### 样式要求
无（纯数据逻辑）

### 其他约束
- 支持 SSR 和客户端两种场景
- SSR 场景使用 serverApiFetch 从 event 提取 cookie
- 客户端场景使用 clientApiFetch 自动携带 cookie
- 401 自动跳转登录页
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 1.4 全局认证守卫

```markdown
### 功能名称
全局认证守卫

### 所属模块
middleware/auth.global.ts, plugins/auth.client.ts

### 类型
中间件 + 插件

### 详细描述
拦截所有路由请求，检查用户登录状态。未登录用户访问保护页面时重定向到登录页，并保存目标路径。已登录用户访问登录页自动跳转首页。

### 输入
- to: 目标路由
- from: 来源路由

### 输出
- 重定向或放行

### 数据模型
无

### 依赖
- useCookie (检查 auth_token)
- localStorage (检查登录标记和过期时间)
- sessionStorage (保存 redirectAfterLogin)
- navigateTo (重定向)

### 样式要求
无（逻辑层）

### 其他约束
- 公开接口白名单（如 /api/auth/login）
- Token 过期检查（比较 localStorage 中的时间戳）
- 仅客户端执行中间件逻辑
- 不影响服务端渲染
```

**优先级**: P0 ✅  
**状态**: 已实现

---

## 二、用户管理模块

### 2.1 用户列表查询

```markdown
### 功能名称
用户列表查询

### 所属模块
pages/user/index.vue, stores/user-manage.store.ts, server/api/user/all.get.ts

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
- role?: string (精确匹配)

### 输出
interface UserListResponse {
  total: number
  data: User[]
}

interface User {
  id: number
  account: string
  name: string
  phone?: string
  role: 'admin' | 'user' | 'guest'
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
- useUserManageStore (fetchUsers 方法)
- ElTable, ElPagination
- clientApiFetch

### 样式要求
- 查询区域：el-form 行内布局
- 表格：固定表头，斑马纹
- 角色标签：不同颜色区分（admin-红色，user-蓝色，guest-灰色）
- 响应式布局

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
modules/user/components/UserFormDialog.vue, stores/user-manage.store.ts, server/api/user/create.post.ts

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
- useUserManageStore (createUser 方法)
- ElForm, ElInput, ElSelect, ElOption
- ElDialog (弹窗容器)
- ElMessage (反馈提示)

### 样式要求
- 弹窗宽度 600px
- 表单 label-width="100px"
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
modules/user/components/UserFormDialog.vue, stores/user-manage.store.ts, server/api/user/update/:id.put.ts

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
- useUserManageStore (updateUser, getUserById 方法)
- ElForm, ElInput, ElSelect
- ElDialog

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
pages/user/index.vue, stores/user-manage.store.ts, server/api/user/delete/:id.delete.ts

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
- useUserManageStore (deleteUser 方法)
- ElMessageBox.confirm (确认对话框)
- ElMessage (结果反馈)

### 样式要求
操作列按钮：红色危险按钮

### 其他约束
- 必须二次确认
- 删除当前用户时提示"不能删除自己"
- 删除失败时显示具体原因
```

**优先级**: P0 ✅  
**状态**: 已实现

---

## 三、角色管理模块

### 3.1 角色列表查询

```markdown
### 功能名称
角色列表查询

### 所属模块
pages/role/index.vue, stores/role.store.ts, server/api/role/all.get.ts

### 类型
页面 + Store + API 路由

### 详细描述
展示角色列表，支持分页和查询。查询条件包括角色名称、编码、状态。表格展示角色基本信息和状态标签。

### 输入
查询参数：
- pageIndex: number (默认 1)
- pageSize: number (默认 10)
- name?: string (模糊匹配)
- code?: string (模糊匹配)
- status?: 0 | 1 (精确匹配)

### 输出
interface RoleListResponse {
  total: number
  data: Role[]
}

interface Role {
  id: number
  name: string
  code: string
  status: 0 | 1
  remark?: string
  createTime: Date
}

### 数据模型
interface RoleQuery {
  pageIndex: number
  pageSize: number
  name?: string
  code?: string
  status?: 0 | 1
}

### 依赖
- useRoleStore (fetchRoles 方法)
- ElTable, ElPagination, ElTag
- clientApiFetch

### 样式要求
- 查询区域：el-form 行内布局
- 状态标签：启用 -绿色，禁用 -红色
- 表格固定表头

### 其他约束
- 输入框失去焦点时触发查询
- 支持下拉选择状态
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 3.2 新增角色

```markdown
### 功能名称
新增角色

### 所属模块
modules/role/components/RoleFormDialog.vue, stores/role.store.ts, server/api/role/create.post.ts

### 类型
组件 + Store + API 路由

### 详细描述
弹窗表单形式新增角色，包含名称、编码、状态、备注。编码需要唯一性校验。

### 输入
interface CreateRoleRequest {
  name: string (必填)
  code: string (必填，唯一)
  status: 0 | 1 (默认 1)
  remark?: string
}

### 输出
- 成功：关闭弹窗，刷新列表，显示成功提示
- 失败：显示错误消息

### 数据模型
同输入

### 依赖
- useRoleStore (createRole 方法)
- ElForm, ElInput, ElRadio, ElInput (textarea)
- ElDialog

### 样式要求
- 弹窗宽度 600px
- 表单 label-width="100px"
- 状态使用单选按钮

### 其他约束
- 编码唯一性校验（前端失焦时调用 check-code 接口）
- 编码格式限制（字母、数字、下划线）
- 状态默认启用
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 3.3 编辑角色

```markdown
### 功能名称
编辑角色

### 所属模块
modules/role/components/RoleFormDialog.vue, stores/role.store.ts, server/api/role/update/:id.put.ts

### 类型
组件 + Store + API 路由

### 详细描述
弹窗表单形式编辑角色，回显现有信息。编码唯一性校验时排除当前角色。

### 输入
interface UpdateRoleRequest {
  name?: string
  code?: string
  status?: 0 | 1
  remark?: string
}

### 输出
- 成功：关闭弹窗，刷新列表
- 失败：显示错误消息

### 数据模型
同输入

### 依赖
- useRoleStore (updateRole, getRoleById 方法)
- ElForm, ElInput
- ElDialog

### 样式要求
同新增角色

### 其他约束
- 编码唯一性校验时排除当前 ID
- 数据回显准确
- 编码不可编辑（只读）或校验时排除自身
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 3.4 删除角色

```markdown
### 功能名称
删除角色

### 所属模块
pages/role/index.vue, stores/role.store.ts, server/api/role/delete/:id.delete.ts

### 类型
页面 + Store + API 路由

### 详细描述
点击删除按钮后弹出二次确认框，确认后调用后端删除接口。

### 输入
- roleId: number

### 输出
- 成功：刷新列表，显示成功提示
- 失败：显示错误消息

### 数据模型
无

### 依赖
- useRoleStore (deleteRole 方法)
- ElMessageBox.confirm
- ElMessage

### 样式要求
操作列按钮：红色危险按钮

### 其他约束
- 必须二次确认
- 已被用户使用的角色禁止删除（后端验证）
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 3.5 角色编码唯一性校验

```markdown
### 功能名称
角色编码唯一性校验

### 所属模块
modules/role/components/RoleFormDialog.vue, server/api/role/check-code.get.ts

### 类型
组件 + API 路由

### 详细描述
在角色编码输入框失去焦点时，调用后端接口检查编码是否已存在。新增时检查全部，编辑时排除当前角色。

### 输入
- code: string
- excludeId?: number (编辑时传入)

### 输出
interface CheckCodeResponse {
  available: boolean
  message?: string
}

### 数据模型
无

### 依赖
- apiFetch
- ElForm (表单验证规则)

### 样式要求
- 校验通过：绿色对勾
- 校验失败：红色警告图标和文字

### 其他约束
- 防抖处理（500ms）
- 编码为空时不校验
- 编辑模式自动传入 excludeId
```

**优先级**: P1 ✅  
**状态**: 已实现

---

## 四、菜单管理模块

### 4.1 菜单树形展示

```markdown
### 功能名称
菜单树形展示

### 所属模块
pages/menu/index.vue, modules/menu/components/MenuTree.vue, stores/menu.store.ts, server/api/menu/tree.get.ts

### 类型
页面 + 组件 + Store + API 路由

### 详细描述
以树形结构展示菜单，支持多级嵌套。每个节点显示菜单名称、图标，支持展开/折叠。

### 输入
无（自动加载全部菜单）

### 输出
interface MenuNode {
  id: number
  parentId: number | null
  path: string
  name: string
  icon?: string
  i18n: Array<{
    locale: 'zh-CN' | 'en-US'
    name: string
  }>
  children?: MenuNode[]
  permission?: string
}

### 数据模型
同上

### 依赖
- useMenuStore (fetchMenuTree 方法)
- ElTree (树形组件)
- $fetch / clientApiFetch

### 样式要求
- 树形控件默认展开第一级
- 节点高度 40px
- 悬停显示操作按钮（新增、编辑、删除）
- 图标与文字对齐

### 其他约束
- 支持懒加载（可选）
- 默认选中第一个节点
- 支持搜索过滤（可选）
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 4.2 新增顶级菜单

```markdown
### 功能名称
新增顶级菜单

### 所属模块
modules/menu/components/MenuFormDialog.vue, stores/menu.store.ts, server/api/menu.post.ts

### 类型
组件 + Store + API 路由

### 详细描述
点击新增按钮打开表单弹窗，填写菜单信息后提交。支持多语言配置和图标选择。

### 输入
interface CreateMenuRequest {
  parentId: null
  path: string (必填)
  i18n: Array<{
    locale: 'zh-CN' | 'en-US'
    name: string
  }> (必填，至少一项)
  icon?: string
  permission?: string
}

### 输出
- 成功：关闭弹窗，刷新菜单树
- 失败：显示错误消息

### 数据模型
同输入

### 依赖
- useMenuStore (createMenu 方法)
- ElForm, ElInput, IconPicker
- ElDialog

### 样式要求
- 弹窗宽度 700px
- 多语言使用 Tabs 切换
- 图标选择器网格布局

### 其他约束
- 路径唯一性校验
- 至少填写一个语言版本
- 支持预览效果
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 4.3 新增子菜单

```markdown
### 功能名称
新增子菜单

### 所属模块
modules/menu/components/MenuFormDialog.vue, stores/menu.store.ts, server/api/menu.post.ts

### 类型
组件 + Store + API 路由

### 详细描述
在树节点上点击"新增下级"按钮，打开表单弹窗，parentId 自动填充为父节点 ID。

### 输入
同新增顶级菜单，但 parentId 不为 null

### 输出
同新增顶级菜单

### 数据模型
同新增顶级菜单

### 依赖
同新增顶级菜单

### 样式要求
同新增顶级菜单

### 其他约束
- parentId 自动设置且不可修改
- 提示当前添加的是哪个节点的子菜单
- 其他同新增顶级菜单
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 4.4 编辑菜单

```markdown
### 功能名称
编辑菜单

### 所属模块
modules/menu/components/MenuFormDialog.vue, stores/menu.store.ts, server/api/menu/:id.put.ts

### 类型
组件 + Store + API 路由

### 详细描述
点击编辑按钮打开弹窗，回显菜单现有信息。支持修改多语言配置和图标。

### 输入
interface UpdateMenuRequest {
  path?: string
  i18n?: Array<{
    locale: string
    name: string
  }>
  icon?: string
  permission?: string
}

### 输出
- 成功：关闭弹窗，刷新菜单树
- 失败：显示错误消息

### 数据模型
同输入

### 依赖
- useMenuStore (updateMenu, getMenuById 方法)
- ElForm, ElInput
- ElDialog

### 样式要求
同新增菜单

### 其他约束
- 数据回显准确
- 路径不可编辑（只读）
- 多语言配置完整回显
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 4.5 删除菜单

```markdown
### 功能名称
删除菜单

### 所属模块
pages/menu/index.vue, stores/menu.store.ts, server/api/menu/:id.delete.ts

### 类型
页面 + Store + API 路由

### 详细描述
点击删除按钮后弹出二次确认框，确认后调用后端删除接口。有子菜单的节点禁止删除。

### 输入
- menuId: number

### 输出
- 成功：刷新菜单树
- 失败：显示错误消息

### 数据模型
无

### 依赖
- useMenuStore (deleteMenu 方法)
- ElMessageBox.confirm
- ElMessage

### 样式要求
操作按钮：红色危险按钮

### 其他约束
- 必须二次确认
- 有子节点的菜单禁止删除（前端判断或后端返回）
- 删除失败显示具体原因
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 4.6 批量更新菜单（拖拽排序）

```markdown
### 功能名称
批量更新菜单

### 所属模块
modules/menu/components/MenuTree.vue, stores/menu.store.ts, server/api/menu/batch-update.post.ts

### 类型
组件 + Store + API 路由

### 详细描述
支持通过拖拽调整菜单顺序，拖拽结束后自动保存新的排序。

### 输入
interface BatchUpdateItem {
  id: number
  order: number
}

### 输出
- 成功：更新本地菜单树
- 失败：恢复原顺序，显示错误消息

### 数据模型
同上

### 依赖
- useMenuStore (batchUpdateMenu 方法)
- ElTree (drag-drop 功能)

### 样式要求
- 拖拽时有视觉反馈
- 拖拽过程中显示占位符

### 其他约束
- 只能同级拖拽
- 拖拽结束立即保存
- 保存失败回滚
```

**优先级**: P1 ✅  
**状态**: 已实现

---

### 4.7 图标选择器

```markdown
### 功能名称
图标选择器

### 所属模块
modules/menu/components/IconPicker.vue

### 类型
组件

### 详细描述
提供 Element Plus 图标库的选择器，支持搜索、预览、选择。

### 输入
- modelValue: string (选中的图标名)

### 输出
- update:modelValue (图标名)

### 数据模型
无

### 依赖
- @element-plus/icons-vue (全部图标)
- ElInput (只读，带前缀图标)
- ElPopover 或 ElDialog (选择面板)

### 样式要求
- 图标网格展示（每行 8 个）
- 支持搜索过滤
- 选中高亮显示
- 悬停预览

### 其他约束
- 图标按需加载
- 搜索实时过滤
- 点击图标自动关闭面板
```

**优先级**: P1 ✅  
**状态**: 已实现

---

## 五、情趣视频管理模块

### 5.1 视频列表查询

```markdown
### 功能名称
视频列表查询

### 所属模块
pages/video/taste/index.vue, modules/tasteVideo/components/TasteVideoList.vue, stores/tasteVideo.store.ts, server/api/video/taste.index.get.ts

### 类型
页面 + 组件 + Store + API 路由

### 详细描述
展示视频列表，支持分页和多条件组合查询。查询条件包括车牌号、演员、评分、状态、创建时间范围。

### 输入
查询参数：
- pageIndex: number (默认 1)
- pageSize: number (默认 10)
- number?: string (车牌号，模糊匹配)
- performer?: number|string (演员 ID 或名称)
- rating?: number (评分 1-5)
- status?: 0 | 1 | 2 (未下载/已下载/已观看)
- gmtCreate?: string[] (创建时间范围)

### 输出
interface TasteVideoListResponse {
  total: number
  list: TasteVideo[]
}

interface TasteVideo {
  id: number
  number: string
  name: string
  performer: string
  releaseDate: string
  rating: number
  status: 0 | 1 | 2
  magnetUri: string
  gmtCreate: string
}

### 数据模型
interface TasteVideoQuery {
  pageIndex: number
  pageSize: number
  number?: string
  performer?: number|string
  rating?: number
  status?: 0 | 1 | 2
  gmtCreate?: string[]
}

### 依赖
- useTasteVideoStore (fetchList 方法)
- ElTable, ElPagination
- ElForm, ElInput, ElSelect, ElRate, ElDatePicker
- clientApiFetch

### 样式要求
- 查询区域：响应式布局
- 表格：固定表头，斑马纹
- 状态标签：未下载 -灰色，已下载 -蓝色，已观看 -绿色
- 评分显示为星标

### 其他约束
- 输入框失焦时触发查询
- 下拉框值改变时触发查询
- 日期范围选择器支持快捷选项
- 演员下拉框支持前端过滤
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 5.2 新增视频

```markdown
### 功能名称
新增视频

### 所属模块
modules/tasteVideo/components/TasteVideoFormDialog.vue, stores/tasteVideo.store.ts, server/api/video/taste.index.post.ts

### 类型
组件 + Store + API 路由

### 详细描述
弹窗表单形式新增视频，包含车牌号、名称、演员、发行时间、评分、状态、磁力链接等字段。

### 输入
interface TasteVideoRequest {
  number: string (必填)
  name: string (必填)
  performer: number|string (必填)
  releaseDate: string (必填，YYYY-MM-DD)
  rating: number (必填，1-5)
  status: 0 | 1 | 2 (必填，默认 0)
  magnetUri: string (必填)
}

### 输出
- 成功：关闭弹窗，刷新列表
- 失败：显示错误消息

### 数据模型
同输入

### 依赖
- useTasteVideoStore (createVideo 方法)
- ElForm, ElInput, ElSelect, ElRate, ElDatePicker
- ElDialog
- 演员字典接口 (/video/performer/dict)

### 样式要求
- 弹窗宽度 700px
- 表单 label-width="120px"
- 评分使用 el-rate 组件
- 磁力链接使用文本域

### 其他约束
- 前端表单验证（必填项、日期格式、评分范围）
- 演员下拉框支持搜索过滤
- 状态默认"未下载"
- 发行时间禁用今天之后的日期
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 5.3 编辑视频

```markdown
### 功能名称
编辑视频

### 所属模块
modules/tasteVideo/components/TasteVideoFormDialog.vue, stores/tasteVideo.store.ts, server/api/video/taste/:id.put.ts

### 类型
组件 + Store + API 路由

### 详细描述
弹窗表单形式编辑视频，回显现有信息。支持修改所有字段。

### 输入
同新增视频

### 输出
- 成功：关闭弹窗，刷新列表
- 失败：显示错误消息

### 数据模型
同新增视频

### 依赖
- useTasteVideoStore (updateVideo, getVideo 方法)
- ElForm, ElInput
- ElDialog

### 样式要求
同新增视频

### 其他约束
- 数据回显准确
- 车牌号不可编辑（只读）
- 其他同新增视频
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 5.4 删除视频

```markdown
### 功能名称
删除视频

### 所属模块
modules/tasteVideo/components/TasteVideoList.vue, stores/tasteVideo.store.ts, server/api/video/taste/:id.delete.ts

### 类型
组件 + Store + API 路由

### 详细描述
点击删除按钮后弹出二次确认框，确认后调用后端删除接口。

### 输入
- videoId: number

### 输出
- 成功：刷新列表，显示成功提示
- 失败：显示错误消息

### 数据模型
无

### 依赖
- useTasteVideoStore (deleteVideo 方法)
- ElMessageBox.confirm
- ElMessage

### 样式要求
操作列按钮：红色危险按钮

### 其他约束
- 必须二次确认
- 删除失败显示原因
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 5.5 视频预览

```markdown
### 功能名称
视频预览

### 所属模块
modules/tasteVideo/components/TasteVideoList.vue, TasteVideoPreviewDialog.vue, server/api/video/taste/preview/:id.get.ts

### 类型
组件 + API 路由

### 详细描述
点击预览按钮，调用后端接口获取该视频的预览图片地址列表，在弹窗中展示。

### 输入
- videoId: number

### 输出
图片 URL 数组：string[]

### 数据模型
无

### 依赖
- clientApiFetch
- ElDialog, ElImage
- URL.createObjectURL (如果是 blob)

### 样式要求
- 弹窗宽度自适应
- 图片网格展示
- 支持放大查看
- 支持左右切换

### 其他约束
- 接口可能需要认证
- 图片加载失败时显示占位图
- 关闭弹窗时释放 URL 对象
```

**优先级**: P1 ✅  
**状态**: 已实现

---

### 5.6 下载视频（复制磁力链接）

```markdown
### 功能名称
下载视频

### 所属模块
modules/tasteVideo/components/TasteVideoList.vue

### 类型
组件

### 详细描述
点击下载按钮，将视频的磁力链接复制到剪贴板，并提示成功。

### 输入
- magnetUri: string

### 输出
- 成功：提示"磁力链接已复制"
- 失败：提示"复制失败，请手动复制"

### 数据模型
无

### 依赖
- navigator.clipboard.writeText
- ElMessage

### 样式要求
操作列按钮：蓝色按钮，下载图标

### 其他约束
- 仅在客户端可用
- 失败时提供降级方案（弹窗显示链接供手动复制）
```

**优先级**: P1 ✅  
**状态**: 已实现

---

### 5.7 演员字典获取

```markdown
### 功能名称
演员字典获取

### 所属模块
stores/tasteVideo.store.ts, server/api/video/performer/dict.get.ts

### 类型
Store + API 路由

### 详细描述
获取演员字典列表，用于新增/编辑视频时的演员选择和查询区域的演员筛选。

### 输入
无

### 输出
interface PerformerDictItem {
  id: number|string
  name: string
}[]

### 数据模型
同上

### 依赖
- clientApiFetch
- useState (缓存字典数据)

### 样式要求
无（数据逻辑）

### 其他约束
- 首次加载后缓存
- 多个组件共享同一份数据
- 支持前端搜索过滤
```

**优先级**: P1 ✅  
**状态**: 已实现

---

## 六、UI 组件模块

### 6.1 顶部栏组件

```markdown
### 功能名称
顶部栏组件

### 所属模块
components/TopBar.vue

### 类型
全局组件

### 详细描述
页面顶部导航栏，包含侧边栏折叠按钮、面包屑导航、通知中心、全屏切换、用户下拉菜单。

### 输入
- collapsed: boolean (侧边栏折叠状态)
- breadcrumbs: Array<{ title: string, to?: string }>

### 输出
- update:collapsed (折叠状态变化事件)

### 数据模型
无

### 依赖
- useAppStore (侧边栏、全屏状态)
- UserDropdown, NotificationDropdown
- ElBreadcrumb, ElIcon

### 样式要求
- 固定顶部
- 高度 60px
- Flex 布局
- 阴影效果

### 其他约束
- 响应式布局
- 面包屑自动生成
- 通知数量徽标
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 6.2 用户下拉菜单

```markdown
### 功能名称
用户下拉菜单

### 所属模块
components/UserDropdown.vue

### 类型
全局组件

### 详细描述
显示当前用户信息和头像，提供个人中心、退出登录等选项的下拉菜单。

### 输入
- user: { name: string, avatar?: string }

### 输出
- logout (退出登录事件)

### 数据模型
无

### 依赖
- useUserStore
- ElDropdown, ElAvatar
- useRouter

### 样式要求
- 头像圆形
- 下拉菜单项带图标
- 分隔线

### 其他约束
- 点击退出登录触发 confirm 确认
- 头像支持上传（预留接口）
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 6.3 通知中心

```markdown
### 功能名称
通知中心

### 所属模块
components/NotificationDropdown.vue

### 类型
全局组件

### 详细描述
显示系统通知列表，支持标记已读、查看全部等功能。

### 输入
无（从后端或本地获取通知）

### 输出
- markAsRead (标记已读事件)
- viewAll (查看全部事件)

### 数据模型
interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'success'
  isRead: boolean
  createTime: Date
}

### 依赖
- ElDropdown, ElBadge, ElTabs
- apiFetch (获取通知列表)

### 样式要求
- 下拉面板宽度 400px
- 通知项分组展示
- 未读标记红点
- 滚动加载

### 其他约束
- 通知数量限制（最多 20 条）
- 标记已读后实时更新
- 支持清空全部通知
```

**优先级**: P1 ✅  
**状态**: 已实现

---

### 6.4 登录表单组件

```markdown
### 功能名称
登录表单组件

### 所属模块
components/LoginForm.vue

### 类型
全局组件

### 详细描述
提供账号密码输入框，处理登录逻辑，包括表单验证、加载状态、错误提示。

### 输入
无（内部表单）

### 输出
- success (登录成功事件)

### 数据模型
interface LoginForm {
  account: string
  password: string
}

### 依赖
- useUserStore (login 方法)
- ElForm, ElInput, ElButton
- ElAlert (错误提示)

### 样式要求
- 表单垂直排列
- 按钮全宽
- 错误提示红色背景
- 加载时按钮禁用

### 其他约束
- 前端验证（非空、邮箱格式）
- 密码长度至少 6 位
- 登录过程按钮禁用并显示 loading
- 支持回车键提交
```

**优先级**: P0 ✅  
**状态**: 已实现

---

## 七、非功能性需求

### 7.1 性能要求

```markdown
### 功能名称
性能优化

### 类型
非功能性需求

### 详细描述
确保系统在各种场景下的响应速度和用户体验。

### 指标要求
- 首屏加载时间 < 2s
- 接口响应时间 < 500ms
- 列表分页加载 < 1s
- 表单提交反馈 < 200ms

### 实现策略
- Vite 预优化依赖
- 组件懒加载
- 接口请求缓存（@tanstack/vue-query）
- 图片懒加载
- 虚拟滚动（大数据量列表）
- 防抖节流（搜索、按钮）

### 其他约束
- 生产环境移除 console 日志
- Gzip 压缩
- CDN 加速（可选）
```

**优先级**: P1

---

### 7.2 安全要求

```markdown
### 功能名称
安全机制

### 类型
非功能性需求

### 详细描述
保障系统和数据安全的各项措施。

### 安全要求
1. **认证安全**
   - Token 存储在 HttpOnly Cookie 中
   - Token 过期自动清除
   - 401 自动跳转登录

2. **XSS 防护**
   - 所有输入内容转义显示
   - 不使用 v-html（除非白名单）
   - CSP 策略（可选）

3. **CSRF 防护**
   - SameSite Cookie 策略
   - Token 验证

4. **数据安全**
   - 敏感信息加密传输（HTTPS）
   - 密码不落地（前端不存储明文）
   - 权限校验（前后端双重验证）

### 其他约束
- 生产环境必须使用 HTTPS
- 错误信息不暴露敏感数据
- 日志记录脱敏
```

**优先级**: P0

---

### 7.3 兼容性要求

```markdown
### 功能名称
兼容性要求

### 类型
非功能性需求

### 详细描述
系统在不同浏览器和设备上的兼容性支持。

### 浏览器支持
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90
- 移动端 Safari / Chrome（响应式）

### 屏幕适配
- 桌面：1920x1080, 1366x768, 2560x1440
- 平板：768x1024
- 手机：375x667（响应式布局）

### Node.js 版本
- >= 22.x (推荐 v22.22.2)

### pnpm 版本
- >= 9.x (推荐 v9.11.0)

### 其他约束
- 渐进增强
- 优雅降级
- 关键功能降级可用
```

**优先级**: P1

---

## 八、待扩展功能

### 8.1 RBAC 权限管理（规划中）

```markdown
### 功能名称
RBAC 权限管理

### 类型
新功能模块

### 详细描述
实现完整的基于角色的访问控制，包括角色权限分配、按钮级权限控制、动态菜单权限等。

### 输入
- roleId: number
- permissions: string[]

### 输出
- 权限分配结果

### 数据模型
interface Permission {
  id: number
  code: string
  name: string
  type: 'menu' | 'button' | 'api'
}

### 依赖
- 后端权限接口
- 前端权限指令（v-permission）

### 样式要求
权限树形选择器、复选框组

### 其他约束
- 支持批量分配
- 权限继承
- 实时生效
```

**优先级**: P2  
**状态**: 规划中

---

## 九、验收标准

### 通用验收标准

1. **功能完整性**
   - 所有 P0 功能必须实现并通过测试
   - P1 功能应该实现
   - P2 功能可以实现

2. **代码质量**
   - ESLint 检查通过
   - TypeScript 类型检查通过
   - 无 console.error 和未处理的异常

3. **性能指标**
   - 首屏加载 < 2s
   - Lighthouse 分数 > 90

4. **兼容性**
   - 主流浏览器测试通过
   - 响应式布局正常

5. **安全性**
   - 无高危安全漏洞
   - 认证授权机制完善

---

## 十、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| 1.0.0 | 2026-03-28 | 初始版本，包含所有已实现功能的需求规格说明 | AI Assistant |

---

**文档结束**
