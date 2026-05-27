# 文档维护指南

面向维护者与定期审查，配合 [文档整理方案](../文档整理方案.md) 阶段 D 持续机制。

---

## 单一事实来源（SSOT）

| 内容 | 真源 | 文档中应 |
|------|------|----------|
| 依赖版本 | `package.json`、`pnpm-lock.yaml` | 写「见 package.json」，避免复制完整版本表 |
| Node / pnpm 要求 | `package.json` → `engines`、`packageManager` | README / environment 与之一致 |
| AI 编码规范 | `.cursor/rules/*.mdc` | `docs/conventions.md` 只做索引 |
| 模块与目录现状 | 代码 + `docs/architecture.md` | 增删页面/Store/API 时同步 |
| 产品需求 | `docs/requirements/*.md` | 改功能时更新对应模块与 `status` |

升级依赖后：运行 `pnpm install`，必要时更新 `docs/environment.md` 排错说明，**不必**逐个改 Cursor 规则里的补丁号（规则中已用主版本描述即可）。

---

## 每次 PR

使用 [.github/pull_request_template.md](../.github/pull_request_template.md) 中的文档勾选清单。

---

## 季度检查 `docs/archive/`（建议每季度末）

- [ ] `docs/archive/` 内文件是否仍有人引用？无引用且超过 1 年可考虑删除
- [ ] `docs/architecture.md` 中页面数、Store 列表、API 概览是否与代码一致
- [ ] `docs/requirements/*.md` 的 `status` 是否与实现一致
- [ ] `CHANGELOG.md` 的 `[Unreleased]` 是否已归档到版本号段落
- [ ] README 文档表链接是否有效

完成检查后可在本文件底部记录：

| 日期 | 检查人 | 备注 |
|------|--------|------|
| 2026-05-27 | — | 阶段 D 建立维护机制 |

---

## 相关链接

- [文档归档](./archive/README.md)（可选删除，见 [可选清理步骤](./可选清理步骤.md)）
- [文档整理方案](../文档整理方案.md)
- [可选清理步骤](./可选清理步骤.md) — 删除 archive / 整理方案的操作手册
