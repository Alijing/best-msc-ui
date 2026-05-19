---
alwaysApply: true
description: Nuxt UI 组件使用规范（自动导入、图标、暗色模式、表单验证、表格）
---

# Nuxt UI 使用规范

## 组件自动导入

直接使用 `<UButton>`, `<UInput>`, `<UModal>` 等，无需手动 import。

## 图标使用

- 项目已安装 `@iconify-json/heroicons` 和 `@iconify-json/lucide`
- 前缀：`i-heroicons-*`、`i-lucide-*`
- 示例：`<UIcon name="i-heroicons-home" />`
- 动态：`<UIcon :name="`i-heroicons-${iconName}`" />`

## 暗色模式

通过 `useColorMode()` 切换，无需额外配置。

## 表单验证

- 简单表单：手动校验 + `UInput` 的 `error` 属性
- 复杂表单：使用 `zod` 定义 schema，配合 `ref` 管理错误
- 提交时禁用按钮（`:loading` 状态）防重复提交

## 表格

- 简单列表：`UTable`
