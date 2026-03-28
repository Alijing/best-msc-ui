## 📝 情趣视频模块功能描述

```markdown
### 功能名称
情趣视频模块

### 所属模块
整体模块，涉及以下目录：
- `pages/video/taste/index.vue` - 情趣视频列表页面
- `modules/tasteVideo/components/TasteVideoList.vue` - 视频列表组件（包含查询、重置、新增、编辑、删除、预览、下载按钮）
- `modules/tasteVideo/components/TasteVideoFormDialog.vue` - 新增/编辑视频表单弹窗
- `modules/tasteVideo/components/TasteVideoPreviewDialog.vue` - 预览图片弹窗
- `stores/tasteVideo.store.ts` - 视频管理状态（列表、分页、查询参数、加载状态）
- `server/api/video/taste/index.get.ts` - 获取视频列表（支持分页、查询）
- `server/api/video/taste/index.post.ts` - 新增视频
- `server/api/video/taste/[id].get.ts` - 获取单个视频（编辑回显）
- `server/api/video/taste/[id].put.ts` - 编辑视频
- `server/api/video/taste/[id].delete.ts` - 删除视频
- `server/api/video/taste/preview/[id].get.ts` - 获取视频预览图片地址列表

### 类型
功能模块（包含页面、组件、store、API路由）

### 详细描述
实现情趣视频管理功能，菜单路径为 `/video/taste`。包含以下界面和操作：

**列表页**：
- 顶部查询区：包含以下字段（使用 `el-form` 布局）：
  - 车牌号（输入框，模糊匹配）
  - 演员（下拉框，支持远程搜索/前端过滤，数据源来自 `/video/performer/dict`，返回 `{ id, name }` 列表）
  - 评分（`el-rate` 评分组件，整数分值，可选范围1-5）
  - 状态（下拉框，选项：全部、未下载(0)、已下载(1)、已观看(2)）
  - 创建时间（日期范围选择器，`el-date-picker` 类型 `daterange`）
- 按钮：【查询】、【重置】
- 右上角：【新增视频】按钮
- 表格展示视频数据，列包括：
  - 车牌号
  - 名称
  - 演员
  - 发行时间（格式化 YYYY-MM-DD）
  - 评分（显示为星标）
  - 状态（使用 `el-tag`：未下载-灰色，已下载-蓝色，已观看-绿色）
  - 创建时间（格式化 YYYY-MM-DD HH:mm:ss）
  - 操作（预览、下载、编辑、删除）
- 表格支持分页（默认每页10条）

**查询/重置**：
- 查询：根据填写条件调用后端接口获取列表，输入框失去焦点时触发查询，下拉框值改变时触发查询
- 重置：清空所有查询条件（包括日期范围），并重新加载列表

**新增/编辑**：
- 点击【新增视频】打开弹窗，表单包含：
  - 车牌号（必填，文本输入框）
  - 名称（必填，文本输入框）
  - 演员（下拉框，数据源同查询区，支持远程搜索/前端过滤，必选）
  - 发行时间（日期选择器，必选，格式 `YYYY-MM-DD`）
  - 评分（`el-rate` 评分组件，必选）
  - 状态（单选按钮或下拉，选项：未下载、已下载、已观看，默认未下载）
  - BT链接或下载口令（文本域，必填）
- 点击【编辑】打开弹窗，表单回显已有数据
- 表单提交前进行前端验证（必填项，日期格式）
- 提交成功后关闭弹窗，刷新列表

**预览**：
- 点击预览按钮，调用后端接口 `/video/taste/preview/{id}` 获取该视频的预览图片地址列表
- 前端在 `el-dialog` 中使用 `el-image` 弹窗展示

**下载**：
- 点击下载按钮，将视频的 `magnetUri` 字段内容复制到剪贴板，并提示“磁力链接已复制”

**删除**：
- 点击删除按钮弹出二次确认框
- 删除成功后刷新列表

### 业务规则
- 演员下拉框数据从 `/video/performer/dict` 获取，应支持前端过滤（输入关键字匹配）。
- 评分字段为整数，范围1-5。
- 状态字段存储为数字 0,1,2，前端展示对应文本。
- 预览接口可能需要认证，前端需携带凭证（默认由 `$fetch` 自动携带）。

### 输入
- **查询参数**（GET /api/video/taste）：
  ```ts
  interface TasteVideoQuery {
    pageIndex: number
    pageSize: number
    number?: string          // 车牌号模糊匹配
    performer?: number|string       // 演员ID
    rating?: number          // 评分
    status?: 0 | 1 | 2
    gmtCreate?: string[]  // 创建时间，YYYY-MM-DD HH:mm:ss
  }
  ```
- **新增/编辑视频请求体**（POST /api/video/taste / PUT /api/video/taste/:id）：
  ```ts
  interface TasteVideoRequest {
    number: string
    name: string
    performer: number|string
    releaseDate: string       // YYYY-MM-DD
    rating: number
    status: 0 | 1 | 2
    magnetUri: string
  }
  ```
- **演员字典响应**（GET /video/performer/dict）：
  ```ts
  interface PerformerDictItem {
    id: number|string   // 演员ID
    name: string   // 演员名称
  }
  // 返回 PerformerDictItem[]
  ```

### 输出
- **视频列表响应**（GET /api/video/taste）：
  ```ts
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
  ```
- **单个视频响应**（GET /api/video/taste/:id）：
  ```ts
  interface TasteVideoDetail {
    id: number
    number: string
    name: string
    performer: string
    releaseDate: string
    rating: number
    status: 0 | 1 | 2
    magnetUri: string
  }
  ```
- **预览接口**（GET /api/video/taste/preview/:id）：
   - 返回图片URL列表。
- **增删改响应**：成功返回 `{ success: true }`，错误时抛出标准错误。

### 数据模型
```ts
// types/tasteVideo.d.ts
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

interface TasteVideoQuery {
  page: number
  pageSize: number
  number?: string
  performer?: string
  rating?: number
  status?: 0 | 1 | 2
  gmtCreateStart?: string
  gmtCreateEnd?: string
}

interface TasteVideoRequest {
  number: string
  name: string
  performer: string
  releaseDate: string
  rating: number
  status: 0 | 1 | 2
  magnetUri: string
}
```

### 依赖
- **Pinia store**: 新建 `stores/tasteVideo.store.ts`，管理状态：
   - state: `list` (TasteVideo[]), `total` (number), `loading` (boolean), `query` (TasteVideoQuery)
   - actions: `fetchList`, `createVideo`, `updateVideo`, `deleteVideo`, `setQuery`, `resetQuery`
   - 可能需要额外 action 获取演员字典（可缓存）
- **Element Plus 组件**:
   - `ElTable`, `ElPagination`, `ElForm`, `ElInput`, `ElSelect`, `ElOption`, `ElRate`, `ElDatePicker`, `ElButton`, `ElDialog`, `ElMessage`, `ElMessageBox`, `ElTag`, `ElImage`, `ElUpload`（预览可用 `el-image`）等
- **组合式函数**: 可使用 `useTasteVideoStore`，以及 `useClipboard`（复制剪贴板，可借助 `navigator.clipboard` 或 `useClipboard` 组合式函数）
- **API 调用**:
   - `$fetch` 用于获取列表、增删改
   - 预览图片：需要将响应转为 blob 并创建对象URL
- **演员字典获取**: 在组件挂载时调用 `/video/performer/dict` 并缓存到 store 或组件内 ref

### 样式要求
- 查询区域使用 `el-row`/`el-col` 布局，响应式
- 表格操作列按钮使用图标或文字+图标，建议使用 Element Plus 图标
- 弹窗宽度 600px，表单使用 `el-form`，label-width="120px"
- 评分组件使用 `el-rate`，显示分数
- 状态标签使用 `el-tag`，颜色符合状态区分
- 预览弹窗宽度自适应，显示图片

### 其他约束
- **演员下拉框**：需支持远程搜索（当输入关键字时，调用后端过滤？但题目仅要求通过后台接口获取下拉框数据源，支持过滤。我们可一次性获取全部演员列表，前端使用 `filterable` 属性进行本地过滤。如果数据量大，可改为远程搜索，但为简化，先实现本地过滤。
- **预览实现**：后端返回图片地址列表，并在 dialog 中显示。示例：
  ```ts
  const previewImageUrl = ref('')
  const previewVisible = ref(false)
  async function handlePreview(id: number) {
    const res = await $fetch(`/api/video/taste/preview/${id}`, { responseType: 'blob' })
    previewImageUrl.value = URL.createObjectURL(res)
    previewVisible.value = true
  }
  ```
  在弹窗中使用 `<img :src="previewImageUrl" />`，关闭时释放 URL。
- **下载复制**：使用 `navigator.clipboard.writeText(magnetUri)`，成功提示。
- **删除确认**：使用 `ElMessageBox.confirm`。
- **服务端验证**：使用 `defineApiEventHandler` 的 `validation` 进行 Zod 校验。
- **自动导入**：确保所有组件、store、composables 均可自动导入。
```

---

## 🚀 使用说明

1. 将上述功能描述粘贴到通义灵码对话中（确保已发送开发规范文档或通过项目规则文件建立上下文）。
2. AI 将生成以下文件的完整代码：
   - `pages/video/taste/index.vue`
   - `modules/tasteVideo/components/TasteVideoList.vue`
   - `modules/tasteVideo/components/TasteVideoFormDialog.vue`
   - `modules/tasteVideo/components/TasteVideoPreviewDialog.vue`（可选，用于预览图片）
   - `stores/tasteVideo.store.ts`
   - `server/api/video/taste/index.get.ts`
   - `server/api/video/taste/index.post.ts`
   - `server/api/video/taste/[id].get.ts`
   - `server/api/video/taste/[id].put.ts`
   - `server/api/video/taste/[id].delete.ts`
   - `server/api/video/taste/preview/[id].get.ts`
   - `server/api/video/performer/dict.get.ts`（演员字典接口，如果后端未提供则一并生成）
3. 将生成的文件复制到项目中对应路径。
4. 根据实际后端调整数据库操作和演员字典数据源。