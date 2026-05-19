---
alwaysApply: true
description: 路由守卫、权限函数、性能优化、SSR 注意事项
---

# 路由、权限、性能与 SSR

## 路由与权限

- 全局守卫：`middleware/auth.global.ts` 自动应用到所有路由
- 权限判断：从 `useUserStore().permissions` 获取，封装 `can(permission)` 函数
- 路由跳转：使用 `navigateTo` 或 `useRouter()`

## 性能优化

- 大列表使用分页（`UPagination`）或虚拟滚动
- 图片使用 `<NuxtImg>` 组件（懒加载、优化）
- 避免模板中复杂计算，优先 `computed`
- 路由懒加载由 Nuxt 自动处理

## SSR 注意事项

- Nuxt UI 已原生支持 SSR
- 访问 `window`/`document` 需在 `onMounted` 或 `import.meta.client` 中
- 生产环境关闭 `devtools`，移除调试代码
