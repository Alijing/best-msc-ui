---
status: implemented
priority: P0
module: role
---

> **文档状态（2026-05-27）**：`pages/system/role` 已实现。下文「待实现」为历史模板描述，以代码与 [architecture.md](../architecture.md) 为准。

## 三、角色管理模块

> **模块状态（历史）**: 待实现（规划中，以下需求以演员字典模块为模板编写，后续实现时参考）

### 3.1 角色列表查询

```markdown
### 功能名称

角色列表查询

### 所属模块

pages/system/role/index.vue, stores/role.store.ts, server/api/system/role/index.get.ts

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

- usePerformerStore (fetchList 方法)
- UTable, UPagination, UBadge
- clientApiFetch

### 样式要求

- 查询区域：Nuxt UI 表单组件
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

modules/system/role/components/RoleFormDialog.vue, stores/role.store.ts, server/api/system/role/create.post.ts

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

- usePerformerStore (createPerformer 方法)
- UForm, UInput, URadioGroup, UTextarea
- UModal

### 样式要求

- 弹窗宽度 600px
- 表单 label 左对齐
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

modules/system/role/components/RoleFormDialog.vue, stores/role.store.ts, server/api/system/role/update/:id.put.ts

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

- usePerformerStore (updatePerformer, fetchPerformerById 方法)
- UForm, UInput
- UModal

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

pages/system/role/index.vue, stores/role.store.ts, server/api/system/role/delete/:id.delete.ts

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

- usePerformerStore (deletePerformer 方法)
- ConfirmDialog
- useToast

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

modules/system/role/components/RoleFormDialog.vue, server/api/system/role/check-code.get.ts

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
- UForm (表单验证规则)

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
