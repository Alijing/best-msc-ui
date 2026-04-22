<script setup lang="ts">
import * as z from 'zod'
import type {FormSubmitEvent} from '@nuxt/ui'
import {CalendarDate, DateFormatter, getLocalTimeZone} from '@internationalized/date'

const store = useTasteVideoStore()

// ✅ 使用 defineModel 实现双向绑定
const open = defineModel<boolean>('open', {default: false})

const props = withDefaults(defineProps<{
  videoId?: string | number | null
  performerDict: Array<{ id: string | number; name: string }>
}>(), {
  videoId: null
})

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'update:open', value: boolean): void
}>()

// ✅ 计算属性优化
const performerOptions = computed(() =>
    props.performerDict.map(item => ({label: item.name, value: String(item.id)}))
)

const title = computed(() => props.videoId ? '编辑兴趣视频' : '新增兴趣视频')

// ✅ 定义 Zod schema
const schema = z.object({
  number: z.string().min(1, '请输入车牌号'),
  name: z.string().min(1, '请输入视频名称'),
  performer: z.union([z.string(), z.number()]).nullable().optional().refine(val => val != null && val !== '', '请选择演员'),
  releaseDate: z.string().min(1, '请选择发行时间'),
  rating: z.number().min(0).max(5),
  status: z.number(),
  magnetUri: z.string().min(1, '请输入磁力链接')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  number: '',
  name: '',
  performer: null as string | number | null,
  releaseDate: '',
  rating: 5,
  status: 0,
  magnetUri: ''
})

// 日期选择器引用
const selectedDate = shallowRef<CalendarDate | null>(null)

// 日期格式化
const df = new DateFormatter('zh-CN', {
  dateStyle: 'medium'
})

const loading = ref(false)

// ✅ 监听 open 变化，初始化表单
watch(open, async (newVal) => {
  if (newVal) {
    // 重置表单
    state.number = ''
    state.name = ''
    state.performer = null
    state.releaseDate = ''
    state.rating = 5
    state.status = 0
    state.magnetUri = ''
    selectedDate.value = null
    store.clearNumberError()

    // 如果是编辑模式，获取详细数据
    if (props.videoId) {
      const video = await store.fetchVideoById(props.videoId)
      if (video) {
        state.number = video.number
        state.name = video.name
        state.performer = video.performer != null ? String(video.performer) : null
        state.releaseDate = video.releaseDate
        state.rating = video.rating
        state.status = video.status
        state.magnetUri = video.magnetUri

        // 初始化日期选择器
        if (video.releaseDate) {
          const [year, month, day] = video.releaseDate.split('-').map(Number)
          selectedDate.value = new CalendarDate(year, month, day)
        }
      }
    }
  }
}, {immediate: true})

// ✅ 处理日期选择
function handleDateSelect(date: CalendarDate | null) {
  selectedDate.value = date
  if (date) {
    state.releaseDate = date.toString()
  } else {
    state.releaseDate = ''
  }
}

// ✅ 车牌号失焦验证
function handleNumberBlur() {
  if (!state.number || props.videoId) {
    store.clearNumberError()
    return
  }
  store.validateNumberOnBlur(state.number, props.videoId)
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

  // 检查车牌号是否有异步验证错误
  if (store.numberError) {
    toast.add({
      title: '验证失败',
      description: '请修正车牌号错误',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
    return
  }

  if (loading.value) return

  loading.value = true
  try {
    event.data.id = props.videoId
    const response = props.videoId
        ? await store.updateVideo(event.data)
        : await store.createVideo(event.data)

    if (!response || !response.data) {
      toast.add({
        title: '操作失败',
        description: '请重试',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
      return
    }

    toast.add({
      title: '成功',
      description: props.videoId ? '更新成功' : '创建成功',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })

    // 先 emit 事件，让父组件刷新列表
    emit('success')

    // 使用 nextTick 确保 DOM 更新后再关闭
    await nextTick()

    // 通过 emit 关闭 dialog
    emit('update:open', false)

  } catch (error) {
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
      content: 'w-full max-w-2xl',
      footer: 'justify-end' 
    }"
  >
    <template #body>
      <!-- ✅ 使用 UForm 组件，自动处理验证 -->
      <UForm
        id="v-form"
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="车牌号"
          name="number"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
          required
          :error="store.numberError || undefined"
        >
          <UInput
            v-model="state.number"
            placeholder="请输入车牌号"
            :disabled="!!props.videoId"
            :loading="store.numberValidating"
            class="w-[300px]"
            @blur="handleNumberBlur"
          >
            <template
              v-if="state.number && !props.videoId"
              #trailing
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="清空"
                @click="state.number = ''; store.clearNumberError()"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="视频名称"
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
            placeholder="请输入视频名称"
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
          label="演员"
          name="performer"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
          required
        >
          <USelectMenu
            v-model="state.performer"
            :items="performerOptions"
            placeholder="请选择演员"
            clear
            trailing-icon="i-lucide-arrow-down"
            :search-input="{
              placeholder: 'Filter...',
              icon: 'i-lucide-search'
            }"
            value-key="value"
            label-key="label"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="发行时间"
          name="releaseDate"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
          required
        >
          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-[300px] justify-start"
            >
              {{ selectedDate ? df.format(selectedDate.toDate(getLocalTimeZone())) : '请选择日期' }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="selectedDate"
                :max-value="new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())"
                locale="zh-CN"
                class="p-2"
                @update:model-value="handleDateSelect"
              />
            </template>
          </UPopover>
        </UFormField>

        <UFormField
          label="评分"
          name="rating"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
        >
          <div class="flex gap-1">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="text-2xl focus:outline-none"
              @click="state.rating = star"
            >
              <UIcon
                :name="star <= state.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star-outline'"
                :class="star <= state.rating ? 'text-yellow-500' : 'text-gray-300'"
              />
            </button>
          </div>
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
        >
          <USelect
            v-model="state.status"
            placeholder="请选择状态"
            :items="[
              { label: '未下载', value: 0 },
              { label: '已下载', value: 1 },
              { label: '已观看', value: 2 }
            ]"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="磁力链接"
          name="magnetUri"
          orientation="horizontal"
          :ui="{
            root: '!justify-start', 
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2'
          }"
          required
        >
          <UTextarea
            v-model="state.magnetUri"
            placeholder="请输入磁力链接"
            :rows="3"
            class="w-[300px]"
          >
            <template
              v-if="state.magnetUri"
              #trailing
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-circle-x"
                aria-label="清空"
                @click="state.magnetUri = ''"
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
