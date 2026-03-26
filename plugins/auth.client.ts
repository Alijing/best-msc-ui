export default defineNuxtPlugin(() => {
    const isLoggedIn = useState('isLoggedIn')
    const token = useCookie('auth_token')

    // 客户端启动时，如果存在 token，设置登录状态为 true
    if (token.value) {
        isLoggedIn.value = true
    }

    // 可选：监听 token 变化，自动更新状态
    watch(token, (newToken) => {
        isLoggedIn.value = !!newToken
    })
})