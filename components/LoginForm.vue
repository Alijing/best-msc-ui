<script setup lang="ts">
import { useUserStore } from '~/stores/user.store'

const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

// ==================== 表单数据 ====================
const formData = ref({
  account: 'admin',
  password: 'admin'
})

// ==================== 表单验证规则 ====================
const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 5, message: '账号长度至少 5 位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, message: '密码长度至少 5 位', trigger: 'blur' }
  ]
}

// ==================== 重定向路径计算 ====================
// 优先级：query 参数 > useState > 默认值
const route = useRoute()
const redirectPath = computed(() => {
  const queryRedirect = route.query.redirect as string
  const savedRedirect = useState('redirectPath', () => '/').value
  
  // 验证重定向路径是否合法（防止开放重定向漏洞）
  const isValidRedirect = (path: string) => {
    return path && path.startsWith('/') && !path.startsWith('//')
  }
  
  return isValidRedirect(queryRedirect) ? queryRedirect : 
         isValidRedirect(savedRedirect) ? savedRedirect : 
         '/'
})

/**
 * 提交登录表单
 * 
 * 流程：
 * 1. 表单验证
 * 2. 调用登录接口
 * 3. 清除保存的重定向路径
 * 4. 跳转到目标页面
 */
async function handleSubmit(event?: Event) {
  // 阻止表单默认提交行为（防止页面刷新和 URL 参数拼接）
  if (event) {
    event.preventDefault()
  }
  
  if (!formRef.value) return

  try {
    // ==================== 表单验证 ====================
    await formRef.value.validate()
    
    console.log('✅ [login] 表单验证通过，开始登录...')
    loading.value = true

    try {
      // ==================== 调用登录接口 ====================
      await userStore.login(formData.value)
      
      // ==================== 清除保存的重定向路径 ====================
      useState('redirectPath').value = null
      
      // ==================== 跳转到目标页面 ====================
      console.log(`🚀 [login] 登录成功，准备跳转到：${redirectPath.value}`)
      await navigateTo(redirectPath.value)
    } catch (error: any) {
      console.error('❌ [login] 登录失败:', error)
      // 显示错误提示
      const toast = useToast()
      toast.add({
        title: '登录失败',
        description: error.message || '请检查账号和密码',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
    } finally {
      loading.value = false
    }
  } catch (validationError) {
    // 表单验证失败
    console.warn('⚠️ [login] 表单验证未通过:', validationError)
  }
}
</script>

<template>
  <div class="login-page w-96 p-8 bg-white rounded-lg shadow-xl">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">BestMSC</h1>
      <p class="text-gray-500">管理后台</p>
    </div>

    <UForm ref="formRef" :rules="rules" :state="formData" @submit.prevent="handleSubmit">
      <UFormField label="账号" name="account" class="mb-4"
                  :ui="{ label: 'text-gray-800 font-semibold' }">
        <UInput
          v-model="formData.account"
          placeholder="请输入账号"
          icon="i-heroicons-user"
          size="lg"
          clearable
          :ui="{ root: 'w-full', base: 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary-600 focus:ring-primary-600' }"
        />
      </UFormField>

      <UFormField label="密码" name="password" class="mb-4"
                  :ui="{ label: 'text-gray-800 font-semibold' }">
        <UInput
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          icon="i-heroicons-lock-closed"
          size="lg"
          @keyup.enter="handleSubmit"
          :ui="{ root: 'w-full', base: 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary-600 focus:ring-primary-600' }"
        />
      </UFormField>

      <UFormField class="mb-6">
        <div class="flex-between w-full flex items-center justify-between">
          <UCheckbox
            label="记住我"
            :ui="{ wrapper: 'flex items-center', label: 'text-gray-800' }"
          />
          <UButton color="secondary" variant="link" :padded="false">
            忘记密码？
          </UButton>
        </div>
      </UFormField>

      <UFormField>
        <UButton
          type="button"
          color="primary"
          size="lg"
          :loading="loading"
          :disabled="loading"
          block
          @click="handleSubmit"
        >
          {{ loading ? '登录中...' : '登录' }}
        </UButton>
      </UFormField>
    </UForm>

    <!-- 测试账号提示 -->
    <UAlert
      class="mt-6 bg-gray-100"
      title="测试账号"
      description="账号：admin / 密码：admin"
      color="darkgray"
      variant="subtle"
      :closable="false"
      :ui="{ title: 'text-gray-900 font-semibold', description: 'text-gray-700' }"
    />
  </div>
</template>

<style scoped>
.login-page {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
