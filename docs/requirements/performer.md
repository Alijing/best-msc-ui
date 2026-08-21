---
status: implemented
priority: P0
module: performer
---

## 四、演员管理模块

> **模块状态**: 已实现

### 4.1 演员列表查询

```markdown
### 功能名称

演员列表查询

### 所属模块

pages/video/performer/index.vue, stores/performer.store.ts, server/api/video/performer/index.get.ts

### 类型

页面 + Store + API 路由

### 详细描述

展示演员列表，支持分页和模糊查询。查询条件为演员姓名。表格展示演员基本信息，包括姓名、英文名、出生日期、三围数据、罩杯等。

### 输入

查询参数：

- pageIndex: number (默认 1)
- pageSize: number (默认 10)
- name?: string (模糊匹配)

### 输出

interface PerformerListResponse {
total: number
data: Performer[]
}

interface Performer {
id: number | string
name: string
enUsName?: string
birthday?: string
debutDate?: string
height?: number
bust?: number
waist?: number
hips?: number
cup?: string
hobby?: string
remark?: string
}

### 数据模型

interface PerformerQuery {
pageIndex: number
pageSize: number
name?: string
}

### 依赖

- usePerformerStore (fetchList 方法)
- UTable, UPagination
- clientApiFetch

### 后端接口

GET /video/performer/info # 演员列表

### 样式要求

- 查询区域：Nuxt UI 表单组件
- 表格：固定表头，斑马纹
- 备注字段：超出显示省略号，hover 显示完整内容
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

### 4.2 新增演员

```markdown
### 功能名称

新增演员

### 所属模块

modules/components/performer/PerformerFormDialog.vue, stores/performer.store.ts, server/api/video/performer/index.post.ts

### 类型

组件 + Store + API 路由

### 详细描述

弹窗表单形式新增演员，包含姓名、英文名、出生日期、身高、三围、罩杯、爱好、备注等字段。表单验证通过后提交到后端，成功则刷新列表。

### 输入

interface PerformerRequest {
name: string (必填)
enUsName?: string
birthday?: string
debutDate?: string
height?: number
bust?: number
waist?: number
hips?: number
cup?: string
hobby?: string
remark?: string
}

### 输出

- 成功：关闭弹窗，刷新列表，显示成功提示
- 失败：显示错误消息，保持弹窗打开

### 数据模型

同输入

### 依赖

- usePerformerStore (createPerformer, validateName 方法)
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
- 姓名唯一性校验（失焦时验证）
- 数字字段需为正整数
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 4.3 编辑演员

```markdown
### 功能名称

编辑演员

### 所属模块

modules/components/performer/PerformerFormDialog.vue, stores/performer.store.ts, server/api/video/performer/index.put.ts

### 类型

组件 + Store + API 路由

### 详细描述

弹窗表单形式编辑演员，回显演员现有信息。提交后刷新列表。

### 输入

interface PerformerRequest {
id: number | string (必填)
name: string (必填)
enUsName?: string
birthday?: string
debutDate?: string
height?: number
bust?: number
waist?: number
hips?: number
cup?: string
hobby?: string
remark?: string
}

### 输出

- 成功：关闭弹窗，刷新列表，显示成功提示
- 失败：显示错误消息，保持弹窗打开

### 数据模型

同输入

### 依赖

- usePerformerStore (updatePerformer, fetchPerformerById, validateName 方法)
- UForm, UInput, USelect
- UModal

### 样式要求

同新增演员

### 其他约束

- 编辑模式排除当前演员进行姓名唯一性校验
- 数据回显准确
- 取消编辑不保存任何更改
```

**优先级**: P0 ✅  
**状态**: 已实现

---

### 4.4 删除演员

```markdown
### 功能名称

删除演员

### 所属模块

pages/video/performer/index.vue, stores/performer.store.ts, server/api/video/performer/index.delete.ts

### 类型

页面 + Store + API 路由

### 详细描述

点击删除按钮后弹出二次确认框，确认后调用后端删除接口，成功则刷新列表。

### 输入

- ids: number[] (演员 ID 数组)

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
- 删除失败时显示具体原因
- 删除后若当前页无数据，自动返回上一页
```

**优先级**: P0 ✅  
**状态**: 已实现
