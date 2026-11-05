<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    novelId?: string | number | null;
  }>(),
  {
    novelId: null,
  },
);

const emit = defineEmits<{
  success: [];
}>();

const novelStore = useNovelStore();
const toast = useToast();

const isEdit = computed(() => props.novelId !== null && props.novelId !== undefined && props.novelId !== "");
const title = computed(() => (isEdit.value ? "编辑小说" : "新增小说"));

const schema = z.object({
  name: z.string().trim().min(1, "请输入小说名称").max(200, "小说名称不能超过 200 个字符"),
  path: z
    .string()
    .trim()
    .min(1, "请输入目录页地址")
    .max(2000, "目录页地址过长")
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "请输入以 http 或 https 开头的目录页地址"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: "",
  path: "",
});

const loading = ref(false);
const detailLoading = ref(false);
const formRef = ref();

const fieldUi = {
  root: "!justify-start items-start",
  wrapper: "w-[96px] shrink-0 pt-2",
  container: "flex min-w-0 flex-1 flex-col items-stretch",
  error: "!mt-1 !ms-0 h-5 overflow-hidden whitespace-nowrap leading-5",
};

watch(open, async (visible) => {
  if (!visible) {
    return;
  }

  state.name = "";
  state.path = "";

  if (!isEdit.value || props.novelId === null || props.novelId === undefined) {
    return;
  }

  detailLoading.value = true;
  try {
    const novel = await novelStore.fetchNovelById(props.novelId);
    if (!open.value) {
      return;
    }
    if (!novel) {
      toast.add({
        title: "小说不存在",
        color: "error",
        icon: "i-heroicons-exclamation-circle",
      });
      open.value = false;
      return;
    }
    state.name = novel.name?.trim() ?? "";
    state.path = novel.path?.trim() ?? "";
  } catch (error: unknown) {
    toast.add({
      title: "加载小说失败",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
    open.value = false;
  } finally {
    detailLoading.value = false;
  }
});

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const detail = error as {
      message?: string;
      statusMessage?: string;
      data?: { msg?: string; message?: string };
    };
    return (
      detail.data?.msg ||
      detail.data?.message ||
      detail.statusMessage ||
      detail.message ||
      "请重试"
    );
  }
  return "请重试";
}

async function handleSubmit() {
  await formRef.value?.submit();
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value || detailLoading.value) {
    return;
  }

  loading.value = true;
  try {
    const payload = {
      name: event.data.name.trim(),
      path: event.data.path.trim(),
      ...(isEdit.value ? { id: props.novelId! } : {}),
    };
    const response = isEdit.value
      ? await novelStore.updateNovel(payload)
      : await novelStore.createNovel(payload);

    if (!response || response.code !== 200) {
      toast.add({
        title: "操作失败",
        description: response?.msg || "请重试",
        color: "error",
        icon: "i-heroicons-exclamation-circle",
      });
      return;
    }

    toast.add({
      title: "成功",
      description: isEdit.value ? "更新成功" : "创建成功",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
    emit("success");
    open.value = false;
  } catch (error: unknown) {
    toast.add({
      title: "操作失败",
      description: getErrorMessage(error),
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
      content: 'w-full max-w-[640px]',
      footer: 'justify-end',
    }"
  >
    <template #body>
      <div
        v-if="detailLoading"
        class="space-y-3 py-2"
      >
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
      </div>
      <UForm
        v-else
        id="novel-form"
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          目录页地址会用于网页采集。保存后采集页的小说下拉会在下次打开时更新。
        </p>

        <UFormField
          label="小说名称"
          name="name"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="请输入小说名称"
            class="w-full"
          />
          <template #error="{ error: message }">
            {{ message }}
          </template>
        </UFormField>

        <UFormField
          label="目录页地址"
          name="path"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.path"
            placeholder="https://example.com/book/1"
            class="w-full"
          />
          <template #error="{ error: message }">
            {{ message }}
          </template>
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton
        color="neutral"
        variant="ghost"
        @click="close"
      >
        取消
      </UButton>
      <UButton
        type="button"
        color="primary"
        :loading="loading"
        :disabled="detailLoading"
        @click="handleSubmit"
      >
        确定
      </UButton>
    </template>
  </UModal>
</template>
