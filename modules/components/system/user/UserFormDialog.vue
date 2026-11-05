<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ManagedUser } from "~/stores/types/user-manage";

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    user?: ManagedUser | null;
  }>(),
  {
    user: null,
  },
);

const emit = defineEmits<{
  success: [];
  "update:open": [value: boolean];
}>();

const userManageStore = useUserManageStore();
const roleStore = useRoleStore();
const toast = useToast();

const title = computed(() => (props.user?.id ? "编辑用户" : "新增用户"));
const isEdit = computed(() => !!props.user?.id);

const schema = z.object({
  account: z.string().min(1, "请输入账号"),
  name: z.string().min(1, "请输入姓名"),
  phone: z.string().optional(),
  roleId: z.array(z.string()).min(1, "请选择角色"),
  departmentId: z.array(z.string()).optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  account: "",
  name: "",
  phone: "",
  roleId: [],
  departmentId: [],
});

const loading = ref(false);
const formRef = ref();

const roleOptions = computed(() =>
  roleStore.roleDict.map((item) => ({
    label: item.name,
    value: String(item.id),
  })),
);

const departmentOptions = computed(() =>
  userManageStore.departments.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

const fieldUi = {
  root: "!justify-start",
  wrapper: "w-[80px] shrink-0",
  container: "flex items-center",
  error: "!mt-0 ms-2",
};

watch(
  open,
  async (visible) => {
    if (!visible) {
      return;
    }

    state.account = "";
    state.name = "";
    state.phone = "";
    state.roleId = [];
    state.departmentId = [];

    await Promise.all([
      roleStore.fetchDict().catch(() => undefined),
      userManageStore.fetchDepartments().catch(() => undefined),
    ]);

    if (!props.user) {
      return;
    }

    state.account = props.user.account ?? "";
    state.name = props.user.name ?? "";
    state.phone = props.user.phone ?? "";
    state.roleId = (props.user.roleId ?? []).map((id) => String(id));
    state.departmentId = (props.user.departmentId ?? []).map((id) => String(id));
  },
  { immediate: true },
);

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
  if (loading.value) {
    return;
  }

  loading.value = true;
  try {
    const payload = {
      account: event.data.account.trim(),
      name: event.data.name.trim(),
      phone: event.data.phone?.trim() || undefined,
      roleId: event.data.roleId,
      departmentId: event.data.departmentId ?? [],
      ...(isEdit.value ? { id: props.user!.id } : {}),
    };

    const response = isEdit.value
      ? await userManageStore.updateUser(payload)
      : await userManageStore.createUser(payload);

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
    await nextTick();
    emit("update:open", false);
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
      content: 'w-full max-w-[600px]',
      footer: 'justify-end',
    }"
  >
    <template #body>
      <UForm
        id="user-form"
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <p
          v-if="!isEdit"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          初始密码与登录账号相同，由服务端加密保存。
        </p>

        <UFormField
          label="账号"
          name="account"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.account"
            placeholder="请输入账号"
            :disabled="isEdit"
            class="w-[360px]"
          />
        </UFormField>

        <UFormField
          label="姓名"
          name="name"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="请输入姓名"
            class="w-[360px]"
          />
        </UFormField>

        <UFormField
          label="电话"
          name="phone"
          orientation="horizontal"
          :ui="fieldUi"
        >
          <UInput
            v-model="state.phone"
            placeholder="请输入电话"
            class="w-[360px]"
          />
        </UFormField>

        <UFormField
          label="角色"
          name="roleId"
          orientation="horizontal"
          :ui="fieldUi"
          required
        >
          <USelectMenu
            v-model="state.roleId"
            :items="roleOptions"
            placeholder="请选择角色"
            multiple
            value-key="value"
            label-key="label"
            class="w-[360px]"
          />
        </UFormField>

        <UFormField
          label="部门"
          name="departmentId"
          orientation="horizontal"
          :ui="fieldUi"
        >
          <USelectMenu
            v-model="state.departmentId"
            :items="departmentOptions"
            placeholder="请选择部门"
            multiple
            value-key="value"
            label-key="label"
            class="w-[360px]"
          />
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
