<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="700px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <!-- 上级菜单 -->
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTreeOptions"
          placeholder="选择上级菜单（根节点请选择顶级菜单）"
          check-strictly
          :default-expand-all="true"
          :render-after-expand="false"
          @change="handleParentChange"
        />
      </el-form-item>

      <!-- 多语言设置区域 -->
      <el-form-item label="多语言设置">
        <div class="i18n-section">
          <div class="i18n-header">
            <span>语言</span>
            <span>菜单名称</span>
            <span>描述</span>
          </div>
          
          <div
            v-for="(lang, index) in formData.i18n"
            :key="index"
            class="i18n-row"
          >
            <el-select
              v-model="lang.locale"
              placeholder="选择语言"
              style="width: 120px"
              :disabled="isEdit"
            >
              <el-option label="中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
            
            <el-input
              v-model="lang.name"
              placeholder="菜单名称"
              style="flex: 1; margin: 0 8px"
            />
            
            <el-input
              v-model="lang.description"
              placeholder="描述（可选）"
              style="flex: 1; margin: 0 8px"
            />

            <el-button type="danger" link @click="removeI18nRow(index)">
              <el-icon><Delete /></el-icon>
            </el-button>

          </div>
        </div>
      </el-form-item>

      <!-- 图标 -->
      <el-form-item label="图标" prop="icon">
        <IconPicker v-model="formData.icon" />
      </el-form-item>

      <!-- 菜单地址 -->
      <el-form-item label="菜单地址" prop="path">
        <el-input
          v-model="formData.path"
          placeholder="/system/user"
        />
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :step="10"
          controls-position="right"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
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
import type { FormInstance, FormRules } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import type { MenuNode, I18nEntry } from '~/stores/types/menu'
import IconPicker from "~/modules/menu/components/IconPicker.vue";

interface Props {
  visible: boolean
  menuData?: MenuNode
  menuTree?: MenuNode[]
  parentId?: number | null  // 新增：默认上级菜单 ID
}

const props = withDefaults(defineProps<Props>(), {
  menuData: undefined,
  menuTree: undefined,
  parentId: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const menuStore = useMenuStore()

// 表单引用
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const formData = ref({
  parentId: null as number | null,
  i18n: [] as I18nEntry[],
  icon: '',
  path: '',
  sort: 0,
  status: 1 as 0 | 1
})

// 是否编辑模式
const isEdit = computed(() => !!props.menuData?.id)

// 递归转换菜单树节点
function convertTreeNode(node: MenuNode): any {
  return {
    id: node.id,
    value: node.id,  // 添加 value 字段用于 el-tree-select
    label: getI18nName(node),
    children: node.children && node.children.length > 0 
      ? node.children.map(child => convertTreeNode(child))
      : []
  }
}

// 处理上级菜单变化
function handleParentChange(value: any) {
  console.log('选择的上级菜单值:', value)
  console.log('表单中的 parentId:', formData.value.parentId)
  
  // 获取选中的节点信息
  if (value !== null) {
    console.log('选中了具体菜单')
  } else {
    console.log('选择了顶级菜单（null）')
  }
}

// 菜单树选项（用于上级菜单选择）
const menuTreeOptions = computed(() => {
  if (!props.menuTree) return []
  
  // 添加顶级菜单选项
  const rootOption = {
    id: null,
    label: '顶级菜单',
    children: props.menuTree.map(node => convertTreeNode(node))
  }
  
  return [rootOption]
})

// 获取多语言名称（优先中文）
function getI18nName(node: MenuNode): string {
  const zhCN = node.i18n.find(i => i.locale === 'zh-CN')
  if (zhCN) return zhCN.name
  
  const enUS = node.i18n.find(i => i.locale === 'en-US')
  if (enUS) return enUS.name
  
  return node.i18n[0]?.name || '未命名'
}

// 表单验证规则
const rules: FormRules = {
  parentId: [
    { required: true, message: '请选择上级菜单', trigger: 'change' }
  ],
  icon: [
    { required: false, message: '请选择图标', trigger: 'change' }
  ],
  path: [
    { 
      pattern: /^\/[a-z0-9/-]*$/, 
      message: '路径必须以/开头，只能包含小写字母、数字和斜杠', 
      trigger: 'blur' 
    }
  ]
}

// 初始化表单数据
watch(() => props.menuData, (newVal) => {
  if (newVal) {
    formData.value = {
      parentId: newVal.parentId,
      i18n: JSON.parse(JSON.stringify(newVal.i18n)), // 深拷贝
      icon: newVal.icon || '',
      path: newVal.path || '',
      sort: newVal.sort || 0,
      status: newVal.status ?? 1
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听 parentId 变化（用于新增下级菜单）
watch(() => props.parentId, (newVal) => {
  if (!props.menuData && newVal !== null) {
    // 只在非编辑模式且设置了 parentId 时才更新
    formData.value.parentId = newVal
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  formData.value = {
    parentId: null,
    i18n: [
      { locale: 'zh-CN', name: '', description: '' },
      { locale: 'en-US', name: '', description: '' }
    ],
    icon: '',
    path: '',
    sort: 0,
    status: 1
  }
  formRef.value?.clearValidate()
}

// 移除多语言行
function removeI18nRow(index: number) {
  if (formData.value.i18n.length <= 1) {
    ElMessage.warning('至少保留一种语言')
    return
  }
  formData.value.i18n.splice(index, 1)
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
  console.log('提交表单 : ', formData.value)
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 验证至少有一种语言的名称不为空
    const hasValidName = formData.value.i18n.some(lang => lang.name.trim())
    if (!hasValidName) {
      ElMessage.warning('至少为一种语言填写菜单名称')
      return
    }
    
    submitLoading.value = true
    
    try {
      const submitData = {
        ...formData.value,
        i18n: formData.value.i18n.filter(lang => lang.name.trim()) // 过滤掉空名称
      }
      
      let success = false
      if (isEdit.value && props.menuData) {
        success = await menuStore.updateMenu(props.menuData.id, submitData)
      } else {
        success = await menuStore.createMenu(submitData)
      }
      
      if (success) {
        emit('success')
      }
    } finally {
      submitLoading.value = false
    }
  })
}
</script>

<style scoped>
.i18n-section {
  width: 100%;
}

.i18n-header {
  display: grid;
  grid-template-columns: 120px 1fr 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: bold;
  color: #606266;
}

.i18n-row {
  display: grid;
  grid-template-columns: 120px 1fr 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
