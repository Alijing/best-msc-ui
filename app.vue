<script setup lang="ts">
/**
 * 应用入口组件
 *
 * Toast 全局配置：
 * - position: 显示位置（top-center 顶部居中）
 * - duration: 显示时长（毫秒）
 *
 * 启动层用内联样式绘制，不依赖打包后的 CSS。水合完成后淡出。
 */
const toaster = {
  position: "top-center" as const,
  duration: 3000,
  max: 3,
};

useHead({
  style: [
    {
      key: "app-boot-splash",
      tagPriority: "critical",
      innerHTML: `
        .app-boot-splash {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          transition: opacity 0.28s ease, visibility 0.28s ease;
        }
        .app-boot-splash.is-leaving {
          opacity: 0;
          visibility: hidden;
        }
        .app-boot-splash__title {
          margin: 8px 0 0;
          font-size: 20px;
          line-height: 1.4;
          font-weight: 650;
          letter-spacing: 0.04em;
          font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        }
        .app-boot-splash__hint {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
          opacity: 0.88;
          font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        }
        @media (prefers-reduced-motion: reduce) {
          .app-boot-splash { transition: none; }
        }
      `,
    },
  ],
});

const showBootSplash = ref(true);
const bootSplashLeaving = ref(false);
let splashTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  bootSplashLeaving.value = true;
  splashTimer = setTimeout(() => {
    showBootSplash.value = false;
  }, 280);
});

onBeforeUnmount(() => {
  if (splashTimer) clearTimeout(splashTimer);
});
</script>

<template>
  <div
    v-if="showBootSplash"
    class="app-boot-splash"
    :class="{ 'is-leaving': bootSplashLeaving }"
    role="status"
    aria-live="polite"
    aria-label="正在加载"
    style="position: fixed; inset: 0; z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff;"
  >
    <img src="/favicon.svg" alt="" width="48" height="48">
    <p class="app-boot-splash__title" style="margin: 8px 0 0; font-size: 20px; font-weight: 650; letter-spacing: 0.04em;">
      Best MSC
    </p>
    <p class="app-boot-splash__hint" style="margin: 0; font-size: 14px; opacity: 0.88;">
      正在加载
    </p>
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        stroke-width="3"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        fill="none"
        stroke="#fff"
        stroke-width="3"
        stroke-linecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </div>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
