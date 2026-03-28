// 为 SSR 环境提供 window polyfill
export default defineNuxtPlugin(() => {
  // 只在服务端执行
  if (import.meta.server) {
    // @ts-ignore - 为 globalThis 添加 window 别名
    global.window = globalThis
  }
})
