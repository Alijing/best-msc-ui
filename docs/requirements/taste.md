---
status: implemented
priority: P0
module: taste
---
## 五、兴趣视频管理模块

### 5.1 视频列表查询

```markdown
### 功能名称

视频列表查询

### 所属模块

pages/video/taste/index.vue, modules/tasteVideo/components/TasteVideoList.vue, stores/tasteVideo.store.ts, server/api/video/index.get.ts

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
performer: string[] | number[]
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
- UTable, UPagination
- UForm, UInput, USelect, UDatePicker
- 自定义评分组件（UIcon + Heroicons 星星图标）
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

modules/tasteVideo/components/TasteVideoFormDialog.vue, stores/tasteVideo.store.ts, server/api/video/index.post.ts

### 类型

组件 + Store + API 路由

### 详细描述

弹窗表单形式新增视频，包含车牌号、名称、演员、发行时间、评分、状态、磁力链接等字段。

### 输入

interface TasteVideoRequest {
number: string (必填)
name: string (必填)
performer: (number|string)[] (必填，支持多选)
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
- UForm, UInput, USelect, UDatePicker
- 自定义评分组件（UIcon + Heroicons 星星图标）
- UModal
- 演员字典接口 (/video/performer/dict)

### 样式要求

- 弹窗宽度 700px
- 表单 label 左对齐
- 评分使用自定义组件（UIcon + Heroicons 星星图标）
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
- UForm, UInput
- UModal

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
- ConfirmDialog
- useToast

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
- UModal, UImage
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
- useToast

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
