# 需求规格

> 由根目录 `REQUIREMENTS.md` 按模块拆分。每文件 frontmatter 中 `status` 表示与代码对齐情况（2026-05-27 标注）。

## 优先级

- **P0** — 必须实现  
- **P1** — 应该实现  
- **P2** — 可实现  

## 模块索引

| 模块 | 文件 | status | 说明 |
|------|------|--------|------|
| 认证 | [auth.md](./auth.md) | `implemented` | 登录、登出、守卫、Cookie |
| 用户管理 | [user.md](./user.md) | `planned` | 独立用户 CRUD，尚未作为独立页面落地 |
| 角色管理 | [role.md](./role.md) | `implemented` | `pages/system/role` |
| 菜单管理 | [menu.md](./menu.md) | `implemented` | `pages/system/menu` |
| 兴趣视频 | [taste.md](./taste.md) | `implemented` | `pages/video/taste` |
| 共用 | [shared.md](./shared.md) | — | UI 组件、非功能需求、验收与变更历史 |

演员字典需求见 [架构文档 - 演员字典](../architecture.md#演员字典-)。

## 维护

- 改功能时同步更新对应模块 `status` 与章节  
- 编码规范见 [conventions.md](../conventions.md)
