<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
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
        :state="formData"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="菜单名称"
          name="i18ns"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
          required
        >
          <div class="flex flex-col gap-2">
            <UFormField
              v-for="(lang, index) in supportedLanguages"
              :key="lang.id"
              :name="`i18ns.${index}.name`"
              orientation="horizontal"
              :ui="{
                container: 'flex items-center',
                error: 'absolute left-[275px] !mt-0 whitespace-nowrap',
              }"
            >
              <template #label>
                <span class="text-xs text-gray-500 w-[40px] shrink-0">{{
                  lang.label
                }}</span>
              </template>
              <UInput
                v-model="formData.i18ns[index]!.name"
                :placeholder="`${lang.label}名称`"
                class="w-[268px]"
              />
            </UFormField>
          </div>
        </UFormField>

        <UFormField
          label="菜单路径"
          name="path"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
          required
        >
          <UInput
            v-model="formData.path"
            placeholder="请输入菜单路径"
            :disabled="isEdit"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="权限Key"
          name="permKey"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
          required
        >
          <UInput
            v-model="formData.permKey"
            placeholder="请输入权限Key"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="图标"
          name="icon"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <IconPicker v-model="formData.icon" placeholder="请选择图标" />
        </UFormField>

        <UFormField
          label="排序"
          name="sort"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <UInput
            v-model.number="formData.sort"
            type="number"
            placeholder="请输入排序值"
            class="w-[300px]"
          />
        </UFormField>

        <UFormField
          label="状态"
          name="status"
          orientation="horizontal"
          :ui="{
            root: '!justify-start',
            wrapper: 'w-[80px] shrink-0',
            container: 'flex items-center',
            error: '!mt-0 ms-2',
          }"
        >
          <USwitch
            :model-value="formData.status === 0"
            @update:model-value="(val) => (formData.status = val ? 0 : 1)"
          >
            <template #label>
              {{ formData.status === 0 ? "禁用" : "启用" }}
            </template>
          </USwitch>
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton color="gray" variant="ghost" @click="close"> 取消 </UButton>
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

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { UpdateMenu } from "~/stores/types/menu";

const supportedLanguages = [
  { id: 0 as const, label: "中文", locale: "zh" },
  { id: 1 as const, label: "英文", locale: "en" },
];

function createMenuSchema() {
  return z.object({
    path: z.string().min(1, "请输入菜单路径"),
    icon: z.string().optional(),
    permKey: z.string().min(1, "请输入权限标识"),
    sort: z.number().int().min(0).optional(),
    status: z.number().int().min(0).max(1),
    i18ns: z.tuple(
      supportedLanguages.map((lang) =>
        z.object({
          id: z.literal(lang.id),
          name: z.string().min(1, `${lang.label}名称不能为空`),
        }),
      ) as unknown as [z.ZodTypeAny, ...z.ZodTypeAny[]],
    ),
  });
}

type Schema = z.output<ReturnType<typeof createMenuSchema>>;

function createEmptyI18ns() {
  return supportedLanguages.map((lang) => ({
    id: lang.id,
    name: "",
  }));
}

const props = withDefaults(
  defineProps<{
    menuId?: number | string | null;
    mode?: "add" | "edit";
  }>(),
  {
    menuId: null,
    mode: "add",
  },
);

const emit = defineEmits<{
  (e: "success"): void;
  (e: "update:open", value: boolean): void;
}>();

const open = defineModel<boolean>("open", { default: false });

const isEdit = computed(() => props.mode === "edit");
const menuStore = useMenuStore();

const schema = createMenuSchema();

const formData = reactive<Schema>({
  path: "",
  icon: "",
  permKey: "",
  sort: 0,
  status: 1,
  i18ns: createEmptyI18ns() as Schema["i18ns"],
});

const loading = ref(false);
const formRef = ref();
const currentParentId = ref<number | string>(0);

watch(
  open,
  async (newVal) => {
    if (newVal) {
      if (isEdit.value && props.menuId) {
        const node = await menuStore.fetchMenuById(props.menuId);
        if (node) {
          currentParentId.value = node.parentId ?? 0;
          formData.path = node.path;
          formData.icon = node.icon || "";
          formData.permKey = node.permKey || "";
          formData.sort = node.sort ?? 0;
          formData.status = node.status ?? 1;
          formData.i18ns = createEmptyI18ns().map((emptyI18n) => {
            const nodeI18n = node.i18ns?.find((i) => i.id === emptyI18n.id);
            return {
              ...emptyI18n,
              name: nodeI18n?.name || "",
            };
          }) as Schema["i18ns"];
        }
      } else {
        formData.path = "";
        formData.icon = "";
        formData.permKey = "";
        formData.sort = 0;
        formData.status = 1;
        formData.i18ns = createEmptyI18ns() as Schema["i18ns"];
      }
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  if (formRef.value) {
    await formRef.value.submit();
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const toast = useToast();

  if (loading.value) return;

  loading.value = true;
  try {
    const payload: UpdateMenu = {
      ...event.data,
      id: isEdit.value ? props.menuId : undefined,
      parentId: isEdit.value ? currentParentId.value : (props.menuId ?? 0),
      icon: event.data.icon || "",
    };

    const response = isEdit.value
      ? await menuStore.updateMenu(payload)
      : await menuStore.createMenu(payload);

    toast.add({
      title: "成功",
      description: isEdit.value ? "更新成功" : "创建成功",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    emit("success");

    await nextTick();
    emit("update:open", false);
  } catch (error: any) {
    console.error("操作失败:", error);
  } finally {
    loading.value = false;
  }
}
</script>
