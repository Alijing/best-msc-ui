<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入角色名称（必填）"
        />
      </el-form-item>

      <el-form-item label="角色编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入角色编码（必填）"
          :disabled="isEdit"
          @blur="validateCodeUnique"
        />
        <div v-if="codeError" class="el-form-item__error">{{ codeError }}</div>
        <div v-else-if="codeValidating" class="el-form-item__error" style="color: #909399;">
          <el-icon class="is-loading"><Loading /></el-icon> 正在校验...
        </div>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="0">启用</el-radio>
          <el-radio :label="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 角色表单弹窗组件
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  visible: boolean
  roleData?: any
}

const props = withDefaults(defineProps<Props>(), {
  roleData: undefined
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const roleStore = useRoleStore()

// 表单引用
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const codeError = ref('')
const codeValidating = ref(false)

// 表单数据
const formData = ref({
  name: '',
  code: '',
  status: 0 as 0 | 1,
  remark: ''
})

// 是否编辑模式
const isEdit = computed(() => !!props.roleData?.id)

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '角色名称长度在 1-50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { 
      pattern: /^[a-z_]+$/, 
      message: '角色编码只能包含小写字母和下划线', 
      trigger: 'blur' 
    },
    { min: 1, max: 50, message: '角色编码长度在 1-50 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 校验角色编码唯一性
async function validateCodeUnique() {
  console.log('validateCodeUnique')
  // 没有编码或编码格式不正确时不校验
  if (!formData.code) return
  
  // 先检查格式
  const codePattern = /^[a-z_]+$/
  if (!codePattern.test(formData.code)) return
  
  codeValidating.value = true
  codeError.value = ''
  
  try {
    // 调用后端接口校验唯一性
    const response = await $fetch<{ exists: boolean }>('/api/role/check-code', {
      method: 'GET',
      query: {
        code: formData.code,
        excludeId: isEdit.value ? String(props.roleData?.id) : undefined
      }
    })
    
    if (response.exists) {
      codeError.value = '角色编码已存在'
      // 触发表单验证
      formRef.value?.clearValidate('code')
      formRef.value?.validateField('code')
    } else {
      // 如果之前有错误提示，清除它
      codeError.value = ''
    }
  } catch (error) {
    console.error('校验角色编码失败:', error)
  } finally {
    codeValidating.value = false
  }
}

// 初始化表单数据
watch(() => props.roleData, (newVal) => {
  console.log('roleData changed:', newVal)
  console.log('roleData.code:', newVal?.code)
  if (newVal) {
    formData.value = {
      name: newVal.name || '',
      code: newVal.code || '',
      status: newVal.status ?? 0,
      remark: newVal.remark || ''
    }
    console.log('formData after set:', formData.value)
  } else {
    resetForm()
  }
  codeError.value = ''
}, { immediate: true })

// 重置表单
function resetForm() {
  formData.value = {
    name: '',
    code: '',
    status: 0,
    remark: ''
  }
  formRef.value?.clearValidate()
  codeError.value = ''
}

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
  
  // 如果是新增模式且编码有错误，不允许提交
  if (!isEdit.value && codeError.value) {
    ElMessage.warning('角色编码已存在，请重新输入')
    return
  }
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    codeError.value = ''
    
    try {
      // 编辑时，如果角色编码未修改则不提交
      const submitData = { ...formData.value }
      
      let success = false
      if (isEdit.value) {
        success = await roleStore.updateRole(props.roleData.id, submitData)
      } else {
        success = await roleStore.createRole(submitData)
      }
      
      if (success) {
        emit('success')
      }
    } catch (error: any) {
      // 处理编码重复错误
      if (error.statusCode === 422 && error.message?.includes('角色编码已存在')) {
        codeError.value = '角色编码已存在'
      }
    } finally {
      submitLoading.value = false
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
</style>
