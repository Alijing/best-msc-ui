---
status: implemented
priority: P0
module: novel
---

## 小说管理

> **模块状态**: 已实现。路由 `pages/book/novel`。BFF 转发后端 `NovelController`（`/novel`）。采集页下拉仍使用 `GET /api/novel/dict`。

### 列表查询

按小说名称模糊查询，分页展示名称、目录页地址、章节数、创建时间和修改时间。章节数在列表返回后按当前页逐本请求 `GET /novel/chapter/size/{novelId}`。

查询参数：

- pageIndex: number，默认 1
- pageSize: number，默认 10，可选 10/20/50/100
- name?: string，模糊匹配

后端：`GET /novel/list`。响应 `data` 为 `{ list, total, pageNum, pageSize, pages }`。

### 新增与编辑

弹窗维护小说名称和目录页地址。目录页必须是 `http` 或 `https` URL，采集时会把它当作目录页地址。

- 新增：`POST /novel/info`，成功后回到第 1 页
- 编辑：先 `GET /novel/info/{novelId}` 回显，再 `PUT /novel/info`
- 雪花 ID 按字符串传递

### 删除

单条和当前页批量删除都走 `DELETE /novel/info?ids=`。后端同时删除章节和正文。当前页被删空且不是第一页时，回到上一页。

### 下载

`GET /api/book/novel/:id/download` 代理 `GET /novel/download/{novelId}`，按附件下载 TXT。章节按 ID 升序拼接，没有正文的章节只保留标题。

侧栏入口来自登录后的菜单。需要能打开本页时，菜单路径配置为 `/book/novel`。
