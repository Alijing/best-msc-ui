<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { DictRecord } from "~/stores/types/dict";

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    dict?: DictRecord | null;
  }>(),
  {
    dict: null,
  },
);

const dictStore = useDictStore();
const toast = useToast();

const isEdit = computed(() => props.dict?.id !== undefined && props.dict?.id !== null && props.dict?.id !== "");
const title = computed(() => (isEdit.value ? "编辑字典" : "新增字典"));

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "请输入字典编码")
    .regex(/^[a-zA-Z0-9_]+$/, "编码只能包含字母、数字和下划线"),
  type: z.coerce.number().int().min(0).max(1),
  structure: z.coerce.number().int().min(0).max(1),
  desc: z.string(),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  code: "",
  type: 1,
  structure: 0,
  desc: "",
});

const loading = ref(false);
const formRef = ref<{ submit: () => Promise<void> } | null>(null);

const typeItems = [
  { label: "业务类", value: 1 },
  { label: "系统类", value: 0 },
];

const structureItems = [
  { label: "列表", value: 0 },
  { label: "树形", value: 1 },
];

const fieldUi = {
  root: "!justify-start items-start",
  wrapper: "w-[96px] shrink-0 pt-2",
  container: "flex min-w-0 flex-1 flex-col items-stretch",
  error: "!mt-1 !ms-0 h-5 overflow-hidden whitespace-nowrap leading-5",
  help: "mt-1 text-muted",
};

watch(open, (visible) => {
  if (!visible) {
    return;
  }
  const current = props.dict;
  if (current) {
    state.code = current.code;
    state.type = current.type === 0 ? 0 : 1;
    state.structure = current.structure === 1 ? 1 : 0;
    state.desc = current.desc ?? "";
    return;
  }
  state.code = "";
  state.type = 1;
  state.structure = 0;
  state.desc = "";
});

async function handleSubmit() {
  await formRef.value?.submit();
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value) {
    return;
  }
  loading.value = true;
  try {
    const payload = {
      code: event.data.code,
      type: event.data.type,
      structure: event.data.structure,
      desc: event.data.desc.trim(),
      ...(isEdit.value && props.dict ? { id: props.dict.id } : {}),
    };
    if (isEdit.value) {
      await dictStore.updateDict(payload);
    } else {
      await dictStore.createDict(payload);
    }
    toast.add({
      title: isEdit.value ? "更新成功" : "新增成功",
      color: "success",
    });
    open.value = false;
  } catch (error: unknown) {
    toast.add({
      title: "保存失败",
      description: readApiError(error),
      color: "error",
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
      content: 'w-full max-w-xl',
      footer: 'justify-end',
    }"
  >
    <template #body>
      <UForm
        id="dict-form"
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="字典编码"
          name="code"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.code"
            placeholder="字母、数字、下划线"
            :disabled="isEdit"
            class="w-full"
          />
          <template #error="{ error: message }">
            {{ message }}
          </template>
        </UFormField>

        <UFormField
          label="字典类型"
          name="type"
          help="系统类字典不能删除。"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <USelect
            v-model="state.type"
            :items="typeItems"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="数据结构"
          name="structure"
          help="列表按分页表格展示字典项；树形按上下级展开。存在下级时不能改回列表。"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <USelect
            v-model="state.structure"
            :items="structureItems"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="描述"
          name="desc"
          orientation="horizontal"
          :ui="fieldUi"
        >
          <UTextarea
            v-model="state.desc"
            placeholder="请输入字典描述"
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="ghost"
        @click="open = false"
      >
        取消
      </UButton>
      <UButton
        color="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        确定
      </UButton>
    </template>
  </UModal>
</template>
