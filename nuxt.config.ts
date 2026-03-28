// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 应用配置
  app: {
    head: {
      title: 'BestMSC - 后台管理系统',
      meta: [
        { name: 'description', content: 'BestMSC 后台管理系统' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  ssr: false,  // 禁用 SSR，Element Plus 需要 window 对象
  // 开发模式配置
  devtools: { enabled: false },

  // 模块配置
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt'
  ],

  // Element Plus 配置
  elementPlus: {
    defaultLocale: 'zh-cn',
    importStyle: 'css'
  },

  // CSS 配置
  css: [
    '~/assets/css/main.css'
  ],

  // PostCSS 配置（Tailwind CSS）
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: false  // 开发时禁用类型检查以提高速度
  },

  // 自动导入配置
  imports: {
    dirs: [
      'stores',
      'composables/**',
      'utils'
    ]
  },

  // 路由配置
  router: {
    options: {
      strict: true
    }
  },

  // Nitro 服务端配置
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },

  // Vite 配置
  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : []
    },
    // 预优化依赖配置（提升开发和构建速度）
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        'element-plus/dist/locale/zh-cn.mjs'
      ]
    },
    // 构建性能优化
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssTarget: 'chrome87'
    }
  },

  // Cookie 和安全配置
  cookies: {
    prefix: '',
    sameSite: 'strict' // 防止 CSRF
  },

  // 兼容性配置
  compatibilityDate: '2024-11-01',
  
  // 运行时环境变量
  runtimeConfig: {
    public: {
      backendUrl: process.env.NUXT_BACKEND_URL || 'http://localhost:3001'
    }
  }
})
