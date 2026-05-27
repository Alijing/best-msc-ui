---
status: implemented
priority: P0
module: menu
---

> **文档状态（2026-05-27）**：`pages/system/menu` 已实现。下文「待实现」为历史模板描述，以代码与 [architecture.md](../architecture.md) 为准。

## 四、菜单管理模块

> **模块状态（历史）**: 待实现（规划中，以下需求以演员字典模块为模板编写，后续实现时参考）

### 4.1 菜单树形展示

```markdown
### 功能名称

菜单树形展示

### 所属模块

pages/system/menu/index.vue, modules/system/menu/components/MenuTree.vue, stores/menu.store.ts, server/api/system/menu/tree.get.ts

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

- usePerformerStore (fetchList 方法)
- UTree 或 UTable 或自定义树形组件
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

modules/system/menu/components/MenuFormDialog.vue, stores/menu.store.ts, server/api/system/menu.post.ts

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

- usePerformerStore (createPerformer 方法)
- UForm, UInput, IconPicker
- UModal

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

modules/system/menu/components/MenuFormDialog.vue, stores/menu.store.ts, server/api/system/menu.post.ts

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

modules/system/menu/components/MenuFormDialog.vue, stores/menu.store.ts, server/api/system/menu/:id.put.ts

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

- usePerformerStore (updatePerformer, fetchPerformerById 方法)
- UForm, UInput
- UModal

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

pages/system/menu/index.vue, stores/menu.store.ts, server/api/system/menu/:id.delete.ts

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

- usePerformerStore (deletePerformer 方法)
- ConfirmDialog
- useToast

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

modules/system/menu/components/MenuTree.vue, stores/menu.store.ts, server/api/system/menu/batch-update.post.ts

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

- usePerformerStore (fetchList 方法)
- UTree (拖拽功能)

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

components/IconPicker.vue

### 类型

组件

### 详细描述

提供 Heroicons 或 Lucide 图标库的选择器，支持搜索、预览、选择。

### 输入

- modelValue: string (选中的图标名)

### 输出

- update:modelValue (图标名)

### 数据模型

无

### 依赖

- @iconify-json/heroicons, @iconify-json/lucide (图标集)
- UInput (只读，带前缀图标)
- UPopover 或 UModal (选择面板)

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
