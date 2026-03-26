<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="账号" prop="account">
        <el-input
          v-model="formData.account"
          placeholder="请输入账号（必填）"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          :placeholder="isEdit ? '留空表示不修改密码' : '请输入密码（必填）'"
          show-password
        />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入姓名（必填）"
        />
      </el-form-item>

      <el-form-item label="角色" prop="role" class="full-width-select">
        <el-select
          v-model="formData.role"
          placeholder="请选择角色"
          :loading="rolesLoading"
          style="width: 100%"
        >
          <el-option
            v-for="role in roles"
            :key="role.id"
            :label="role.name"
            :value="role.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="联系电话" prop="phone">
        <el-input
            v-model="formData.phone"
            placeholder="请输入联系电话（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 用户表单弹窗组件
import type { FormInstance, FormRules } from 'element-plus'
import type { RoleCode } from '~/stores/user-manage.store'

interface Props {
  visible: boolean
  userData?: any
}

const props = withDefaults(defineProps<Props>(), {
  userData: undefined
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const userManageStore = useUserManageStore()
const { roles } = storeToRefs(userManageStore)

// 表单引用
const formRef = ref<FormInstance>()
const loading = ref(false)
const rolesLoading = ref(false)

// 表单数据
const formData = ref({
  account: '',
  password: '',
  name: '',
  phone: '',
  role: 'user' as RoleCode
})

// 是否编辑模式
const isEdit = computed(() => !!props.userData?.id)

// 表单验证规则
const rules: FormRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { 
      required: !isEdit.value, 
      message: '请输入密码', 
      trigger: 'blur' 
    },
    { 
      min: 6, 
      message: '密码长度至少 6 位', 
      trigger: 'blur' 
    }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 50, message: '姓名长度不能超过 50 个字符', trigger: 'blur' }
  ],
  phone: [
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号', 
      trigger: 'blur' 
    }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 加载角色列表
async function loadRoles() {
  rolesLoading.value = true
  try {
    await userManageStore.fetchRoles()
  } finally {
    rolesLoading.value = false
  }
}

// 初始化表单数据
watch(() => props.userData, (newVal) => {
  if (newVal) {
    formData.value = {
      account: newVal.account || '',
      password: '', // 编辑时密码留空
      name: newVal.name || '',
      phone: newVal.phone || '',
      role: newVal.role || 'user'
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  formData.value = {
    account: '',
    password: '',
    name: '',
    phone: '',
    role: 'user'
  }
  formRef.value?.clearValidate()
}

// 组件挂载时加载角色列表
onMounted(() => {
  loadRoles()
})

// 关闭弹窗
function handleClose() {
  emit('update:visible', false)
  resetForm()
}

// 取消
function handleCancel() {
  handleClose()
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    
    try {
      // 编辑时，如果密码为空则不提交密码字段
      const submitData = { ...formData.value }
      if (isEdit.value && !submitData.password) {
        delete submitData.password
      }
      
      let success = false
      if (isEdit.value) {
        success = await userManageStore.updateUser(props.userData.id, submitData)
      } else {
        success = await userManageStore.createUser(submitData)
      }
      
      if (success) {
        emit('success')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 让下拉框占满容器宽度 */
.full-width-select :deep(.el-form-item__content) {
  width: auto !important;
}
</style>
