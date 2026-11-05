---
status: implemented
priority: P0
module: dict
---

## 字典管理

> **模块状态**: 已实现。路由 `pages/system/dict`。BFF 转发后端 `DictController`（`/dict`）。侧栏要能打开本页时，菜单路径配置为 `/system/dict`。

### 字典列表

分页展示字典编码、类型、数据结构、描述和创建时间。可按编码、描述模糊查询，按类型精确筛选。

- 类型：`0` 系统类，`1` 业务类。系统类不能删除
- 数据结构：`0` 列表，`1` 树形。决定字典项页的展示方式
- 查询：`GET /api/system/dict`，转发 `POST /dict/page?current&size`
- 新增：`POST /api/system/dict` → `POST /dict/info`。编码只允许字母、数字、下划线
- 编辑：`PUT /api/system/dict` → `PUT /dict/info/{id}`。编码不可改。存在非根字典项时，不能把树形改回列表
- 删除：`DELETE /api/system/dict`，body `{ ids }`，转发 `DELETE /dict/batch`。字典项一并删除

雪花 ID 按字符串传递。

### 字典项

从列表进入 `/system/dict/{code}`。页面先请求 `GET /dict/data/{code}` 读取数据结构：

- **列表**（`structure = 0`）：分页表格。查询 `POST /dict/item/page`，可按值、名称、描述筛选。上级固定为 `0`
- **树形**（`structure = 1`）：树表。数据来自 `GET /dict/item/tree`。可新增下级，删除时连同下级一起删除。上级不能选自己或自己的下级

字典项维护：

- 新增 `POST /dict/item`，更新 `PUT /dict/item/{id}`，删除 `DELETE /dict/item/batch`
- 值在同一字典内唯一，只允许字母、数字、下划线
- `allowMdf = 0` 不能修改，`allowDel = 0` 不能删除
- 列表按排序值从大到小；树按排序值从小到大
