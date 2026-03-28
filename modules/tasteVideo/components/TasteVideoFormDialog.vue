<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { TasteVideo, TasteVideoRequest, PerformerDictItem } from '~/stores/types/tasteVideo'

const props = withDefaults(defineProps<{
  modelValue: boolean
  video?: TasteVideo | null
}>(), {
  modelValue: false,
  video: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const tasteVideoStore = useTasteVideoStore()

// 表单数据
const formData = ref<TasteVideoRequest>({
  number: '',
  name: '',
  performer: '' as number | string,
  releaseDate: '',
  rating: 5,
  status: 0,
  magnetUri: ''
})

// 表单验证规则
const formRules = {
  number: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  performer: [{ required: true, message: '请选择演员', trigger: 'change' }],
  releaseDate: [{ required: true, message: '请选择发行时间', trigger: 'change' }],
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  magnetUri: [
    { required: true, message: '请输入 BT 链接或下载口令', trigger: 'blur' },
    { pattern: /^(magnet:|thunder:)/i, message: '请输入有效的磁力链接', trigger: 'blur' }
  ]
}

// 状态选项
const statusOptions = [
  { value: 0, label: '未下载' },
  { value: 1, label: '已下载' },
  { value: 2, label: '已观看' }
]

// 演员字典
const performers = ref<PerformerDictItem[]>([])

// 表单引用
const formRef = ref()

// 是否编辑模式
const isEdit = computed(() => !!props.video)

// 弹窗标题
const dialogTitle = computed(() => isEdit.value ? '编辑视频' : '新增视频')

// 监听弹窗打开/关闭
watch(() => props.modelValue, async (val) => {
  if (val) {
    // 打开弹窗时加载演员字典
    performers.value = await tasteVideoStore.fetchPerformerDict()
    
    if (props.video) {
      // 编辑模式，回显数据
      formData.value = {
        number: props.video.number,
        name: props.video.name,
        performer: props.video.performerId || props.video.performer,
        releaseDate: props.video.releaseDate,
        rating: props.video.rating,
        status: props.video.status,
        magnetUri: props.video.magnetUri
      }
    } else {
      // 新增模式，重置表单
      resetForm()
    }
  }
})

// 重置表单
function resetForm() {
  formData.value = {
    number: '',
    name: '',
    performer: '' as number | string,
    releaseDate: '',
    rating: 5,
    status: 0,
    magnetUri: ''
  }
  formRef.value?.clearValidate()
}

// 提交表单
async function handleSubmit() {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    if (isEdit.value && props.video) {
      // 编辑
      await tasteVideoStore.updateVideo(props.video.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await tasteVideoStore.createVideo(formData.value)
      ElMessage.success('创建成功')
    }
    
    emit('update:modelValue', false)
    emit('success')
  } catch (error: any) {
    console.error('表单提交失败:', error)
    // 错误已在 store 中处理
  }
}

// 关闭弹窗
function handleClose() {
  resetForm()
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="车牌号" prop="number">
        <el-input
          v-model="formData.number"
          placeholder="请输入车牌号"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入视频名称"
          maxlength="100"
        />
      </el-form-item>

      <el-form-item label="演员" prop="performer">
        <el-select
          v-model="formData.performer"
          placeholder="请选择演员"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in performers"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="发行时间" prop="releaseDate">
        <el-date-picker
          v-model="formData.releaseDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="评分" prop="rating">
        <el-rate
          v-model="formData.rating"
          show-score
          :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="0">未下载</el-radio>
          <el-radio :value="1">已下载</el-radio>
          <el-radio :value="2">已观看</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="BT 链接/口令" prop="magnetUri">
        <el-input
          v-model="formData.magnetUri"
          type="textarea"
          :rows="4"
          placeholder="请输入磁力链接或下载口令"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.el-rate) {
  font-size: 18px;
}
</style>
