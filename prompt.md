## 📝 演员管理模块功能描述（Nuxt UI 技术栈）

### 功能名称

演员管理模块

### 所属模块

整体模块，涉及以下目录：

- `pages/video/performer/index.vue` - 演员列表页面
- `modules/performer/components/PerformerList.vue` - 演员列表组件（包含查询、重置、新增、编辑、删除）
- `modules/performer/components/PerformerFormDialog.vue` - 新增/编辑演员表单弹窗
- `stores/performer.store.ts` - 演员管理状态（列表、分页、查询参数、加载状态）
- `server/api/video/performer/index.get.ts` - 获取演员列表（支持分页、查询）
- `server/api/video/performer/index.post.ts` - 新增演员
- `server/api/video/performer/index.put.ts` - 编辑演员
- `server/api/video/performer/index.delete.ts` - 删除演员
- `server/api/video/performer/[id].get.ts` - 获取单个演员（编辑回显）
- `server/api/video/performer/check-name.get.ts` -演员信息唯一性校验

### 类型

功能模块（包含页面、组件、store、API路由）

### 详细描述

实现演员管理功能，菜单路径为 `/video/performer`。包含以下界面和操作：

**列表页**：

- 顶部查询区：演员姓名（输入框，支持模糊匹配）
- 按钮：【查询】、【重置】
- 右上角：【新增演员】按钮
- 表格展示演员数据，列包括：
    - ID
    - 演员姓名
    - 英文名
    - 出生日期（格式 YYYY-MM-DD）
    - 身高（cm）
    - 胸围（cm）
    - 腰围（cm）
    - 臀围（cm）
    - 罩杯
    - 爱好
    - 备注
    - 操作（编辑、删除）
- 表格支持分页（默认每页10条）

**查询/重置**：

- 查询：根据演员姓名模糊匹配调用后端接口获取列表
- 重置：清空演员姓名输入框，重新加载列表

**新增/编辑**：

- 点击【新增演员】打开弹窗，表单包含所有字段（除ID外）：
    - 演员姓名（必填）
    - 英文名（可选）
    - 出生日期（日期选择器，可选）
    - 身高（数字输入框，单位cm，可选，需为正整数）
    - 胸围（数字输入框，单位cm，可选，需为正整数）
    - 腰围（数字输入框，单位cm，可选，需为正整数）
    - 臀围（数字输入框，单位cm，可选，需为正整数）
    - 罩杯（输入框，可选，例如 C、D 等）
    - 爱好（文本域，可选）
    - 备注（文本域，可选）
- 点击【编辑】打开弹窗，表单回显已有数据
- 表单提交前进行前端验证（必填项，数字字段为正整数）
- 提交成功后关闭弹窗，刷新列表

**删除**：

- 点击删除按钮弹出二次确认框
- 删除成功后刷新列表

### 业务规则

- 演员姓名为必填项，不允许重复（后端校验，前端也可做唯一性提示）。
- 身高、胸围、腰围、臀围需为正整数，前端使用 `UInputNumber` 控制。
- 出生日期使用日期选择器，格式 `YYYY-MM-DD`。

### 输入

- **查询参数**（GET /api/video/performer）：
  ```ts
  interface PerformerQuery {
    page: number
    pageSize: number
    name?: string        // 演员姓名模糊匹配
  }
  ```
- **新增/编辑演员请求体**（POST /api/video/performer / PUT /api/video/performer/:id）：
  ```ts
  interface PerformerRequest {
    name: string
    enUsName?: string
    birthday?: string    // YYYY-MM-DD
    height?: number
    bust?: number
    waistSize?: number
    hipCircumference?: number
    cupSize?: string
    hobby?: string
    remark?: string
  }
  ```

### 输出

- **演员列表/单个演员响应**（GET /api/video/performer / GET /api/video/performer/:id）：
  ```ts
  interface Performer {
    id: number
    name: string
    enUsName?: string
    birthday?: string
    height?: number
    bust?: number
    waistSize?: number
    hipCircumference?: number
    cupSize?: string
    hobby?: string
    remark?: string
  }
  ```

- **增删改响应**：成功返回 `{ success: true }`，错误时抛出标准错误。

### 数据模型

```ts
// types/performer.d.ts
interface Performer {
    id: number
    name: string
    enUsName?: string
    birthday?: string
    height?: number
    bust?: number
    waistSize?: number
    hipCircumference?: number
    cupSize?: string
    hobby?: string
    remark?: string
}

interface PerformerQuery {
    page: number
    pageSize: number
    name?: string
}

```

### 依赖

- **Pinia store**: 新建 `stores/performer.store.ts`，管理状态：
    - state: `list` (Performer[]), `total` (number), `loading` (boolean), `query` (PerformerQuery)
    - actions: `fetchList`, `createPerformer`, `updatePerformer`, `deletePerformer`, `setQuery`, `resetQuery`
- **Nuxt UI 组件**:
    - `UTable`, `UPagination`, `UForm`, `UInput`, `UInputNumber`, `UDatePicker`, `UButton`, `UModal`, `UCard`, `UTextarea`, `USelect`
      等
    - 图标使用 `<Icon name="..." />` 或 `<UIcon name="..." />`
- **组合式函数**: 可使用 `usePerformerStore`
- **API 统一处理器**: `defineApiEventHandler` 用于服务端接口，需遵循 Zod 验证
- **工具函数**: `clientApiFetch` 或 `apiFetch` 用于客户端请求（位于 `utils/api.ts`）

### 样式要求

- 查询区域使用 `flex` + `gap` 布局，演员姓名输入框宽度 240px
- 表格操作列按钮使用 `UButton` 变体 `ghost`，尺寸 `xs`，搭配图标
- 弹窗使用 `UModal` 配合 `UCard`，宽度 `lg`，表单使用 `UForm`，label 宽度 `w-24`
- 数字字段使用 `UInputNumber`，控制精度为整数
- 暗色模式自适应（Nuxt UI 默认支持）

### 其他约束

- **姓名唯一性**：后端在新增/编辑时需检查姓名是否已存在（排除自身），若存在返回 422 错误。
- **删除确认**：参考taste模块的删除逻辑。
- **服务端验证**：使用 `defineApiEventHandler` 的 `validation` 进行 Zod 校验，校验失败返回 422。
- **自动导入**：确保所有组件、store、composables 均可自动导入（Nuxt 自动导入 `components/`、`stores/`、`composables/`）。

