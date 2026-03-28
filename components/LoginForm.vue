<template>
  <div class="login-page w-96 p-8 bg-white rounded-lg shadow-xl">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">BestMSC</h1>
      <p class="text-gray-500">管理后台</p>
    </div>

    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="0px"
        size="large"
    >
      <el-form-item prop="account">
        <el-input
            v-model="formData.account"
            placeholder="请输入账号"
            :prefix-icon="'User'"
            clearable
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="'Lock'"
            show-password
            @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <el-form-item>
        <div class="flex-between w-full">
          <el-checkbox>记住我</el-checkbox>
          <el-link type="primary" underline="never">忘记密码？</el-link>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="w-full"
            @click="handleSubmit"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 测试账号提示 -->
    <el-alert
        class="mt-6"
        title="测试账号"
        description="账号：admin / 密码：123456"
        type="info"
        :closable="false"
    />
  </div>
</template>
<script setup lang="ts">
// 登录表单组件 - 用于未登录时显示
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const formData = ref({
  account: 'admin',
  password: 'admin'
})

const rules = {
  account: [
    {required: true, message: '请输入账号', trigger: 'blur'},
    {min: 5, message: '账号长度至少 5 位', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 5, message: '密码长度至少 5 位', trigger: 'blur'}
  ]
}

/**
 * 提交登录表单
 */
async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    loading.value = true

    try {
      await userStore.login(formData.value)
      ElMessage.success('登录成功')
      
      // 登录成功后跳转到原页面或首页
      const redirectPath = import.meta.client 
        ? (sessionStorage.getItem('redirectAfterLogin') || '/') 
        : '/'
      
      // 清除已使用的重定向路径
      if (import.meta.client) {
        sessionStorage.removeItem('redirectAfterLogin')
      }
      
      // 使用 navigateTo 进行跳转（符合开发规范）
      await navigateTo(redirectPath)
    } catch (error) {
      ElMessage.error('登录失败，请检查账号和密码')
    } finally {
      loading.value = false
    }
  })
}
</script>


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