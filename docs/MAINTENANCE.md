# 文档维护指南

面向维护者与 PR 自检。文档整理已于 2026-05-27 完成；历史全文（含 `docs/archive/`、`文档整理方案.md`）可从 Git 提交 `cebb570` 恢复。

---

## 文档结构（活跃）

```
README.md、CHANGELOG.md          # 根目录入口与产品变更
docs/architecture.md             # 模块与目录地图
docs/conventions.md              # 规范索引 → .cursor/rules/
docs/auth.md                     # 鉴权要点
docs/environment.md              # 环境排错
docs/requirements/*.md             # 按模块需求
docs/MAINTENANCE.md              # 本文件
.cursor/rules/*.mdc              # AI 编码规范（真源）
.github/pull_request_template.md
```

---

## 单一事实来源（SSOT）

| 内容 | 真源 | 文档中应 |
|------|------|----------|
| 依赖版本 | `package.json`、`pnpm-lock.yaml` | 写「见 package.json」 |
| Node / pnpm | `package.json` → `engines`、`packageManager` | 与 README / environment 一致 |
| AI 编码规范 | `.cursor/rules/*.mdc` | `docs/conventions.md` 只做索引 |
| 模块与目录 | 代码 + `docs/architecture.md` | 增删页面/Store/API 时同步 |
| 产品需求 | `docs/requirements/*.md` | 改功能时更新模块与 `status` |

---

## 每次 PR

使用 [.github/pull_request_template.md](../.github/pull_request_template.md) 中的文档勾选清单。

---

## 季度检查（建议每季度末）

- [ ] `docs/architecture.md` 中页面、Store、API 概览是否与代码一致
- [ ] `docs/requirements/*.md` 的 `status` 是否与实现一致
- [ ] `CHANGELOG.md` 的 `[Unreleased]` 是否已归档到版本号段落
- [ ] README 与 docs 内链接是否有效

| 日期 | 检查人 | 备注 |
|------|--------|------|
| 2026-05-27 | — | 建立维护机制；删除 docs/archive 与文档整理方案 |

---

## 从 Git 恢复已删历史文档

```powershell
# 查看删除前的 archive 文件
git show cebb570:docs/archive/AUTH_SCHEME.full.md

# 恢复单个文件
git checkout cebb570 -- docs/archive/AUTH_SCHEME.full.md
```

---

## 相关链接

- [项目架构](./architecture.md)
- [开发规范索引](./conventions.md)
