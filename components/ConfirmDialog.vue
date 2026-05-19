<script setup lang="ts">
const props = defineProps<{
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close', value?: boolean): void
}>()

// 可通过 emit 关闭当前模态框
</script>

<template>
  <UModal
    :title="title || '确认操作'"
    :description="message || '确定要执行此操作吗？此操作不可恢复。'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        color="success"
        variant="outline"
        @click="emit('close', false)"
      >
        {{ cancelText || '取消' }}
      </UButton>
      <UButton
        color="primary"
        :loading="loading"
        @click="emit('close', true)"
      >
        {{ confirmText || '确认' }}
      </UButton>
    </template>
  </UModal>
</template>