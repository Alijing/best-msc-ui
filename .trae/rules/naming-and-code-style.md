---
alwaysApply: true
description: 命名规范、Vue SFC 结构、script setup 顺序、自动导入规则
---

# 命名与代码风格

## 命名规范

- 组件名：`PascalCase`（如 `LoginForm.vue`）
- 组合式函数：`useXxx`（如 `useMenu.ts`）
- Pinia store：`useXxxStore`（如 `useUserStore`）
- 目录名：`kebab-case`（如 `user-profile/`）

## Vue SFC 结构顺序

```vue
<script setup lang="ts">
// 1. 类型导入（自动导入优先）
// 2. defineProps/defineEmits
// 3. 组合式函数（useStore, useRoute）
// 4. 响应式数据（ref, reactive）
// 5. 计算属性
// 6. 方法/事件处理
// 7. 生命周期钩子
</script>
<template>
  <!-- 优先使用 Nuxt UI 组件 + Tailwind -->
</template>
<style scoped>
/* 尽量少用 */
</style>
```

## 自动导入规则

- `components/` 根目录及 `modules/components/[module]/` 下的组件自动导入
- `composables/`、`stores/`、`utils/` 下的文件自动导入，**禁止手动 import**
- 配置变更需重启开发服务器
