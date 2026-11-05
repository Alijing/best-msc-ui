<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { DictItemRecord } from "~/stores/types/dict";

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    dictId: string | number;
    structure: number;
    item?: DictItemRecord | null;
    parentId?: string | number | null;
    parentOptions?: Array<{ label: string; value: string }>;
  }>(),
  {
    item: null,
    parentId: "0",
    parentOptions: () => [],
  },
);

const emit = defineEmits<{
  success: [];
}>();

const dictStore = useDictStore();
const toast = useToast();

const isEdit = computed(() => props.item?.id !== undefined && props.item?.id !== null && props.item?.id !== "");
const isTree = computed(() => props.structure === 1);
const title = computed(() => {
  if (isEdit.value) {
    return "编辑字典项";
  }
  if (isTree.value && String(props.parentId ?? "0") !== "0") {
    return "新增下级字典项";
  }
  return "新增字典项";
});

const schema = z.object({
  val: z
    .string()
    .trim()
    .min(1, "请输入字典项值")
    .regex(/^[a-zA-Z0-9_]+$/, "只能包含字母、数字和下划线"),
  name: z.string().trim().min(1, "请输入字典项名称"),
  parentId: z.string().min(1, "请选择上级"),
  desc: z.string(),
  sort: z.coerce.number({ invalid_type_error: "排序必须是数字" }),
  allowMdf: z.coerce.number().int().min(0).max(1),
  allowDel: z.coerce.number().int().min(0).max(1),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  val: "",
  name: "",
  parentId: "0",
  desc: "",
  sort: 0,
  allowMdf: 1,
  allowDel: 1,
});

const loading = ref(false);
const formRef = ref<{ submit: () => Promise<void> } | null>(null);

const fieldUi = {
  root: "!justify-start items-start",
  wrapper: "w-[112px] shrink-0 pt-2",
  container: "flex min-w-0 flex-1 flex-col items-stretch",
  error: "!mt-1 !ms-0 h-5 overflow-hidden whitespace-nowrap leading-5",
  help: "mt-1 text-muted",
};

const sortHint = computed(() =>
  isTree.value ? "数值越小越靠前。" : "数值越大越靠前。",
);

function resolveParentLabel(value: unknown) {
  const key = value === null || value === undefined || value === "" ? "0" : String(value);
  const matched = props.parentOptions.find(item => item.value === key);
  if (matched) {
    return matched.label;
  }
  return key === "0" ? "无（根节点）" : key;
}

watch(open, (visible) => {
  if (!visible) {
    return;
  }
  const current = props.item;
  if (current) {
    state.val = current.val ?? "";
    state.name = current.name ?? "";
    state.parentId = current.parentId === null || current.parentId === undefined ? "0" : String(current.parentId);
    state.desc = current.desc ?? "";
    const sort = Number(current.sort ?? 0);
    state.sort = Number.isFinite(sort) ? sort : 0;
    state.allowMdf = current.allowMdf === 0 ? 0 : 1;
    state.allowDel = current.allowDel === 0 ? 0 : 1;
    return;
  }
  state.val = "";
  state.name = "";
  state.parentId = props.parentId === null || props.parentId === undefined ? "0" : String(props.parentId);
  state.desc = "";
  state.sort = 0;
  state.allowMdf = 1;
  state.allowDel = 1;
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
      dictId: props.dictId,
      parentId: isTree.value ? event.data.parentId : "0",
      val: event.data.val,
      name: event.data.name,
      desc: event.data.desc.trim(),
      sort: event.data.sort,
      allowMdf: event.data.allowMdf,
      allowDel: event.data.allowDel,
      ...(isEdit.value && props.item ? { id: props.item.id } : {}),
    };
    if (isEdit.value) {
      await dictStore.updateItem(payload);
    } else {
      await dictStore.createItem(payload);
    }
    toast.add({
      title: isEdit.value ? "更新成功" : "新增成功",
      color: "success",
    });
    emit("success");
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
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          v-if="isTree"
          label="上级"
          name="parentId"
          help="选择“无（根节点）”时，该项挂在最外层。"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <USelectMenu
            :model-value="String(state.parentId || '0')"
            :items="parentOptions"
            value-key="value"
            label-key="label"
            placeholder="请选择上级"
            class="w-full"
            :search-input="{
              placeholder: '搜索上级...',
              icon: 'i-lucide-search',
            }"
            @update:model-value="(value: unknown) => { state.parentId = value == null || value === '' ? '0' : String(value) }"
          >
            <template #default="{ modelValue }">
              <span class="truncate">{{ resolveParentLabel(modelValue) }}</span>
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField
          label="字典项值"
          name="val"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.val"
            placeholder="字母、数字、下划线，同一字典内唯一"
            class="w-full"
          />
          <template #error="{ error: message }">
            {{ message }}
          </template>
        </UFormField>

        <UFormField
          label="字典项名称"
          name="name"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="请输入显示名称"
            class="w-full"
          />
          <template #error="{ error: message }">
            {{ message }}
          </template>
        </UFormField>

        <UFormField
          label="排序"
          name="sort"
          :help="sortHint"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.sort"
            type="number"
            step="1"
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
            placeholder="请输入描述"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="允许修改"
          name="allowMdf"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <USwitch
            :model-value="state.allowMdf === 1"
            @update:model-value="(value: boolean) => { state.allowMdf = value ? 1 : 0 }"
          />
        </UFormField>

        <UFormField
          label="允许删除"
          name="allowDel"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <USwitch
            :model-value="state.allowDel === 1"
            @update:model-value="(value: boolean) => { state.allowDel = value ? 1 : 0 }"
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
