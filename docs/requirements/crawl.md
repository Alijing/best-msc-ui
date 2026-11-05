---
status: implemented
priority: P1
module: crawl
---

## 网页数据采集

> **模块状态**: 已实现。路由 `pages/crawl/webpage`。BFF 转发后端 `/crawl/webpage/*`；小说下拉来自 `/novel/dict`。

### 页面结构

| 类型 | 路径 |
|------|------|
| 页面 | `pages/crawl/webpage/index.vue` |
| 工作台 | `modules/components/crawl/WebpageCrawlWorkbench.vue` |
| 分析 | `modules/components/crawl/AnalyzePanel.vue` |
| 参数 | `modules/components/crawl/CrawlTaskPanel.vue` |
| 进度 | `modules/components/crawl/TaskStatusCard.vue` |
| Store | `stores/crawl.store.ts` |
| 类型 | `stores/types/crawl.d.ts`、`stores/types/novel.d.ts` |

左侧选择小说并分析目录页，右侧在无任务时提示先分析；分析完成后填写采集参数。任务进行中每 2 秒轮询状态。任务 ID、所选小说 ID 记在 `sessionStorage`，刷新后可恢复未结束的任务。

### 分析目录页

选择小说后，用该小说的 `path` 作为目录页 URL，可选是否使用 Playwright。

- 前端：`POST /api/crawl/webpage/analyze`
- 后端：`POST /crawl/webpage/analyze`
- 超时：120 秒

请求：

- url: string，必填且为合法 URL
- usePlaywright?: boolean，默认 false

响应 `data`：`url`、`containerSelector`、`itemSelector`、`nextUrl`、`nextText`、`confidence`、`sampleChapters[]`。选择器会写入采集参数草稿，可再改。

小说字典：`GET /api/novel/dict` → `GET /novel/dict`。项为 `{ id, name, path }`，`path` 是目录页地址。

### 启动采集

- 前端：`POST /api/crawl/webpage/tasks/start`
- 后端：`POST /crawl/webpage/tasks/start`
- 超时：60 秒

请求：

- url、containerSelector、itemSelector：必填
- nextUrl、contentSelector：可空
- maxPages：整数，至少 1，界面默认 1
- delay：秒，不小于 0，界面默认 0.5
- concurrency：整数，至少 1，界面默认 1
- withContent、followPagination、clean：布尔，界面默认均为 true

响应 `data`：`{ taskId, status }`。

### 任务状态与取消

状态：`pending` | `running` | `completed` | `failed`。阶段：`pending` | `catalog` | `content` | `done`。

- 查询：`GET /api/crawl/webpage/tasks/status/:taskId` → `GET /crawl/webpage/tasks/status/{taskId}`
- 取消：`DELETE /api/crawl/webpage/tasks/:taskId` → `DELETE /crawl/webpage/tasks/{taskId}`，`data.ok === false` 视为失败

`pending`、`running` 时工作台每 2 秒静默刷新。失败后仍可改参数再启动。完成后可点「调整参数重新采集」。

### 导入小说

采集完成且 `resultAvailable === true`，并且已选小说（ID 为数字）后才能导入。确认框说明接口不返回章节列表，成功只表示请求已被接受。

- 前端：`GET /api/crawl/webpage/tasks/:taskId/1/:novelId`
- 后端：`GET /crawl/webpage/tasks/{taskId}/{type}/{targetId}`
- `type` 由页面固定传 `1`；`targetId` 必须是数字字符串
- 超时：300 秒
