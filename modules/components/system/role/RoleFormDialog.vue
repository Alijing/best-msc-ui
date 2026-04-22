<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const store = useRoleStore()

// ✅ 使用 defineModel 实现双向绑定
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<{
  roleId?: string | number | null
}>(), {
  roleId: null
})

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'update:open', value: boolean): void
}>()

const title = computed(() => props.roleId ? '编辑角色' : '新增角色')

// ✅ 定义 Zod schema
const schema = z.object({
  name: z.string().min(1, '请输入角色名称'),
  code: z.string()
    .min(1, '请输入角色编码')
    .regex(/^[a-zA-Z0-9_]+$/, '编码只能包含字母、数字和下划线'),
  status: z.number().int().min(0).max(1).transform(val => Number(val)),
  remark: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '',
  code: '',
  status: 1 as any,
  remark: ''
})

const loading = ref(false)

// ✅ 监听 open 变化，初始化表单
watch(open, async (newVal) => {
  if (newVal) {
    // 重置表单
    state.name = ''
    state.code = ''
    state.status = 1
    state.remark = ''
    store.clearCodeError()

    // 如果是编辑模式，获取详细数据
    if (props.roleId) {
      const role = await store.fetchRoleById(props.roleId)
      if (role) {
        state.name = role.name
        state.code = role.code
        state.status = role.status
        state.remark = role.remark || ''
      }
    }
  }
}, { immediate: true })

// ✅ 编码失焦验证
function handleCodeBlur() {
  if (!state.code || props.roleId) {
    store.clearCodeError()
    return
  }
  store.validateCode(state.code, props.roleId)
}

// ✅ 手动提交表单
const formRef = ref()

async function handleSubmit() {
  // 手动触发表单验证
  if (formRef.value) {
    await formRef.value.submit()
  }
}

// ✅ 提交表单 - 由 UForm 自动验证后触发
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const toast = useToast()

  // 检查编码是否有异步验证错误
  if (store.codeError) {
    toast.add({
      title: '验证失败',
      description: '请修正角色编码错误',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
    return
  }

  if (loading.value) return

  loading.value = true
  try {
    const payload: any = {
      ...event.data,
      id: props.roleId
    }

    const response = props.roleId
      ? await store.updateRole(payload)
      : await store.createRole(payload)

    if (!response || !response.data) {
      toast.add({
        title: '操作失败',
        description: response?.message || '请重试',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
      return
    }

    toast.add({
      title: '成功',
      description: props.roleId ? '更新成功' : '创建成功',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })

    // 先 emit 事件，让父组件刷新列表
    emit('success')

    // 使用 nextTick 确保 DOM 更新后再关闭
    await nextTick()

    // 通过 emit 关闭 dialog
    emit('update:open', false)

  } catch (error: any) {
    toast.add({
      title: '操作失败',
      description: error.message || '请重试',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :dismissible="false"
    :ui="{
      content: 'w-full max-w-xl',
      footer: 'justify-end' 
    }"
  >
    <template #body>
      <!-- ✅ 使用 UForm 组件，自动处理验证 -->
      <UForm
        id="role-form"
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="角色名称"
          name="name"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="请输入角色名称"
            class="w-[300px]"
          >
            <template
              v-if="state.name"
              #trailing
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="清空"
                @click="state.name = ''"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="角色编码"
          name="code"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
          required
          :error="store.codeError || undefined"
        >
          <UInput
            v-model="state.code"
            placeholder="请输入角色编码（字母、数字、下划线）"
            :disabled="!!props.roleId"
            :loading="store.codeValidating"
            class="w-[300px]"
            @blur="handleCodeBlur"
          >
            <template
              v-if="state.code && !props.roleId"
              #trailing
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="清空"
                @click="state.code = ''; store.clearCodeError()"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="状态"
          name="status"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
          required
        >
          <USwitch
            :model-value="state.status === 0"
            @update:model-value="(val) => state.status = val ? 0 : 1"
          >
            <template #label>
              {{ state.status === 0 ? '启用' : '禁用' }}
            </template>
          </USwitch>
        </UFormField>

        <UFormField
          label="备注"
          name="remark"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
        >
          <UTextarea
            v-model="state.remark"
            placeholder="请输入备注信息"
            :rows="3"
            class="w-[300px]"
          >
            <template
              v-if="state.remark"
              #trailing
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-circle-x"
                aria-label="清空"
                @click="state.remark = ''"
              />
            </template>
          </UTextarea>
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton
        color="gray"
        variant="ghost"
        @click="close"
      >
        取消
      </UButton>
      <UButton
        type="button"
        color="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        确定
      </UButton>
    </template>
  </UModal>
</template>
