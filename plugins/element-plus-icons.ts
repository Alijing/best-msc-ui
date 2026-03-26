import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import type { App, Component } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 全局注册所有 Element Plus 图标组件
  nuxtApp.hook('app:created', () => {
    const app = nuxtApp.vueApp
    
    // 遍历所有图标并注册
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component as Component)
    }
  })
})
