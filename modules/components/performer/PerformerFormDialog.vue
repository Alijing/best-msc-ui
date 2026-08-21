<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";

const store = usePerformerStore();

// ✅ 使用 defineModel 实现双向绑定
const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    performerId?: string | number | null;
  }>(),
  {
    performerId: null,
  },
);

const emit = defineEmits<{
  (e: "success"): void;
  (e: "update:open", value: boolean): void;
}>();

const title = computed(() => (props.performerId ? "编辑演员" : "新增演员"));

// ✅ 定义 Zod schema
const schema = z.object({
  name: z.string().min(1, "请输入演员姓名"),
  enUsName: z.string().optional(),
  birthday: z.string().optional(),
  debutDate: z.string().optional(),
  height: z.number().positive().int().optional().or(z.literal("")),
  bust: z.number().positive().int().optional().or(z.literal("")),
  waist: z.number().positive().int().optional().or(z.literal("")),
  hips: z.number().positive().int().optional().or(z.literal("")),
  cup: z
    .string()
    .regex(/^[ABCDEFG]$/, "罩杯只能输入A-G")
    .optional()
    .or(z.literal("")),
  hobby: z.string().optional(),
  remark: z.string().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: "",
  enUsName: "",
  birthday: "",
  debutDate: "",
  height: 158 as any,
  bust: 80 as any,
  waist: 55 as any,
  hips: 85 as any,
  cup: "",
  hobby: "",
  remark: "",
});

// 日期选择器引用
const selectedDate = shallowRef<CalendarDate | null>(null);
const selectedDebutDate = shallowRef<CalendarDate | null>(null);

// 日期格式化
const df = new DateFormatter("zh-CN", {
  dateStyle: "medium",
});

const loading = ref(false);

// ✅ 监听 open 和 performerId 变化，初始化表单
watch(
  [open, () => props.performerId],
  async ([newOpen, newPerformerId]) => {
    if (newOpen) {
      // 重置表单
      state.name = "";
      state.enUsName = "";
      state.birthday = "";
      state.debutDate = "";
      state.height = 158 as any;
      state.bust = 80 as any;
      state.waist = 55 as any;
      state.hips = 85 as any;
      state.cup = "";
      state.hobby = "";
      state.remark = "";
      selectedDate.value = null;
      selectedDebutDate.value = null;
      store.clearNameError();

      // 如果是编辑模式，获取详细数据
      if (newPerformerId) {
        const performer = await store.fetchPerformerById(newPerformerId);
        if (performer) {
          state.name = performer.name;
          state.enUsName = performer.enUsName || "";
          state.birthday = performer.birthday || "";
          state.debutDate = performer.debutDate || "";
          state.height = performer.height || ("" as any);
          state.bust = performer.bust || ("" as any);
          state.waist = performer.waist || ("" as any);
          state.hips = performer.hips || ("" as any);
          state.cup = performer.cup || "";
          state.hobby = performer.hobby || "";
          state.remark = performer.remark || "";

          // 初始化日期选择器
          if (performer.birthday) {
            const [year, month, day] = performer.birthday
              .split("-")
              .map(Number);
            selectedDate.value = new CalendarDate(year!, month!, day!);
          } else {
            selectedDate.value = null;
          }
          if (performer.debutDate) {
            const [year, month, day] = performer.debutDate
              .split("-")
              .map(Number);
            selectedDebutDate.value = new CalendarDate(year!, month!, day!);
          } else {
            selectedDebutDate.value = null;
          }
        }
      }
    }
  },
  { immediate: true },
);

// ✅ 处理日期选择
function handleDateSelect(date: CalendarDate | null) {
  selectedDate.value = date;
  if (date) {
    state.birthday = date.toString();
  } else {
    state.birthday = "";
  }
}

// ✅ 处理出道日期选择
function handleDebutDateSelect(date: CalendarDate | null) {
  selectedDebutDate.value = date;
  if (date) {
    state.debutDate = date.toString();
  } else {
    state.debutDate = "";
  }
}

// ✅ 姓名失焦验证
function handleNameBlur() {
  if (!state.name || props.performerId) {
    store.clearNameError();
    return;
  }
  store.validateName(state.name, props.performerId);
}

// ✅ 手动提交表单
const formRef = ref();

async function handleSubmit() {
  // 手动触发表单验证
  if (formRef.value) {
    await formRef.value.submit();
  }
}

// ✅ 提交表单 - 由 UForm 自动验证后触发
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const toast = useToast();

  // 检查姓名是否有异步验证错误
  if (store.nameError) {
    toast.add({
      title: "验证失败",
      description: "请修正演员姓名错误",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
    return;
  }

  if (loading.value) return;

  loading.value = true;
  try {
    // 转换数字字段
    const payload: any = {
      ...event.data,
      id: props.performerId,
    };

    // 将空字符串转换为 undefined
    if (payload.height === "") delete payload.height;
    if (payload.bust === "") delete payload.bust;
    if (payload.waist === "") delete payload.waist;
    if (payload.hips === "") delete payload.hips;

    const response = props.performerId
      ? await store.updatePerformer(payload)
      : await store.createPerformer(payload);

    if (!response || !response.data) {
      toast.add({
        title: "操作失败",
        description: "请重试",
        color: "error",
        icon: "i-heroicons-exclamation-circle",
      });
      return;
    }

    toast.add({
      title: "成功",
      description: props.performerId ? "更新成功" : "创建成功",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    // 先 emit 事件，让父组件刷新列表
    emit("success");

    // 使用 nextTick 确保 DOM 更新后再关闭
    await nextTick();

    // 通过 emit 关闭 dialog
    emit("update:open", false);
  } catch (error) {
    toast.add({
      title: "操作失败",
      description: (error as any).message || "请重试",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    loading.value = false;
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
      footer: 'justify-end',
    }"
  >
    <template #body>
      <!-- ✅ 使用 UForm 组件，自动处理验证 -->
      <UForm
        id="performer-form"
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="演员姓名"
          name="name"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
          required
          :error="store.nameError || undefined"
        >
          <UInput
            v-model="state.name"
            placeholder="请输入演员姓名"
            :disabled="!!props.performerId"
            :loading="store.nameValidating"
            class="w-[300px]"
            @blur="handleNameBlur"
          >
            <template v-if="state.name && !props.performerId" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="清空"
                @click="
                  state.name = '';
                  store.clearNameError();
                "
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="英文名"
          name="enUsName"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UInput
            v-model="state.enUsName"
            placeholder="请输入英文名"
            class="w-[300px]"
          >
            <template v-if="state.enUsName" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="清空"
                @click="state.enUsName = ''"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="出生日期"
          name="birthday"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-[300px] justify-start"
            >
              {{
                selectedDate
                  ? df.format(selectedDate.toDate(getLocalTimeZone()))
                  : "请选择日期"
              }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="selectedDate"
                :max-value="
                  new CalendarDate(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    new Date().getDate(),
                  )
                "
                locale="zh-CN"
                class="p-2"
                @update:model-value="
                  (value) => handleDateSelect(value as CalendarDate | null)
                "
              />
            </template>
          </UPopover>
        </UFormField>

        <UFormField
          label="出道日期"
          name="debutDate"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-[300px] justify-start"
            >
              {{
                selectedDebutDate
                  ? df.format(selectedDebutDate.toDate(getLocalTimeZone()))
                  : "请选择日期"
              }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="selectedDebutDate"
                :max-value="
                  new CalendarDate(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    new Date().getDate(),
                  )
                "
                locale="zh-CN"
                class="p-2"
                @update:model-value="
                  (value) => handleDebutDateSelect(value as CalendarDate | null)
                "
              />
            </template>
          </UPopover>
        </UFormField>

        <UFormField
          label="身高(cm)"
          name="height"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UInputNumber
            v-model="state.height as number | undefined"
            placeholder="请输入身高"
            :min="1"
            :step="1"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="胸围(cm)"
          name="bust"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UInputNumber
            v-model="state.bust as number | undefined"
            placeholder="请输入胸围"
            :min="1"
            :step="1"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="腰围(cm)"
          name="waist"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UInputNumber
            v-model="state.waist as number | undefined"
            placeholder="请输入腰围"
            :min="1"
            :step="1"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="臀围(cm)"
          name="hips"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UInputNumber
            v-model="state.hips as number | undefined"
            placeholder="请输入臀围"
            :min="1"
            :step="1"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="罩杯"
          name="cup"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UInput
            v-model="state.cup"
            placeholder="请输入罩杯（如 C、D）"
            class="w-[300px]"
          >
            <template v-if="state.cup" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="清空"
                @click="state.cup = ''"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="爱好"
          name="hobby"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UTextarea
            v-model="state.hobby"
            placeholder="请输入爱好"
            :rows="3"
            class="w-[300px]"
          >
            <template v-if="state.hobby" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-circle-x"
                aria-label="清空"
                @click="state.hobby = ''"
              />
            </template>
          </UTextarea>
        </UFormField>

        <UFormField
          label="备注"
          name="remark"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UTextarea
            v-model="state.remark"
            placeholder="请输入备注"
            :rows="3"
            class="w-[300px]"
          >
            <template v-if="state.remark" #trailing>
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
        class="cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        @click="close"
      >
        取消
      </UButton>
      <UButton
        type="button"
        color="primary"
        :loading="loading"
        :disabled="loading"
        class="cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        @click="handleSubmit"
      >
        确定
      </UButton>
    </template>
  </UModal>
</template>
