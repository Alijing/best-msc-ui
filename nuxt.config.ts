// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-03-30',
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

    // SSR 启用（Nuxt UI 原生支持）
    ssr: true,

    // 开发模式端口
    devServer: {
        port: 3000
    },

    // 模块
    modules: [
        '@nuxt/ui',
        '@nuxt/image',
        '@pinia/nuxt',
        '@nuxtjs/google-fonts'
    ],

    // Nuxt UI 配置（严格按照官方文档）
    ui: {
        // 基础配置
        prefix: 'U',                          // 组件前缀，默认为 'U'
        
        // 字体配置
        fonts: false,                         // 禁用 @nuxt/fonts 以避免 Google Fonts 超时
        
        // 暗色模式配置
        colorMode: true,                      // 启用 @nuxtjs/color-mode
        
        // 主题配置
        theme: {
            // 颜色配置
            colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error'],
            
            // 过渡动画配置
            transitions: true,                // 启用组件过渡效果
            
            // 默认变体配置
            defaultVariants: {
                color: 'primary',             // 默认颜色
                size: 'md'                    // 默认尺寸
            }
        },
        
        // 图标配置
        icons: ['heroicons', 'lucide'],       // 默认图标集
        
        // 全局配置
        global: true,                         // 全局注册 Nuxt UI 组件
        
        // Prose 组件配置
        prose: false,                         // 不强制导入 Prose 组件
        
        // Content 组件配置
        content: false,                       // 不强制导入 Content 组件
        
        // 实验性功能
        experimental: {
            componentDetection: false         // 暂时不启用组件检测（Tree-shaking）
        }
    },

    // Google Fonts 配置（本地下载，避免网络超时）
    googleFonts: {
        download: true,
        base64: false,
        outputDir: 'assets/fonts',
        families: {
            'Inter': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'Noto Sans SC': [100, 200, 300, 400, 500, 600, 700, 800, 900]
        }
    },

    // CSS 配置
    css: ['~/assets/css/main.css'],

    // Pinia 配置
    pinia: {
        storesDirs: ['./stores/**']
    },

    // Tailwind CSS 配置（Nuxt UI 已内置，无需额外配置）

    // TypeScript 配置
    typescript: {
        strict: true,
        typeCheck: false
    },

    // 自动导入配置
    imports: {
        dirs: [
            'composables',
            'stores',
            'utils',
            'types'
        ]
    },

    // 组件自动导入
    components: [
        {path: '~/modules/components', pathPrefix: false},
        {path: '~/components', pathPrefix: false}
    ],

    // 构建优化
    build: {
        transpile: ['@tanstack/vue-query']
    },

    // Vite 配置
    vite: {
        optimizeDeps: {
            include: [
                'vue',
                'pinia',
                '@nuxt/ui',
                '@vue/devtools-core',
                '@vue/devtools-kit'
            ]
        },
        esbuild: {
            drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
        }
    },

    // 运行时配置
    runtimeConfig: {
        public: {
            backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
        }
    },

    // 路由中间件
    router: {
        options: {
            strict: true
        }
    },

    // Layout 配置：公开页面使用 guest 布局，其余使用 default 布局
    routeRules: {
        '/login': { appLayout: 'guest' },
        '/register': { appLayout: 'guest' }
    },

    // Nitro 配置
    nitro: {
        esbuild: {
            options: {
                target: 'esnext'
            }
        }
    }

})