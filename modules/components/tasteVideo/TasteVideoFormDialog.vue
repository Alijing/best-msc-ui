<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import type { TasteVideoRequest } from "@/stores/types/tasteVideo";

const store = useTasteVideoStore();

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    videoId?: string | number | null;
    performerDict: Array<{ id: string | number; name: string }>;
  }>(),
  {
    videoId: undefined,
  },
);

const emit = defineEmits<{
  (e: "success"): void;
  (e: "update:open", value: boolean): void;
}>();

const performerOptions = computed(() =>
  props.performerDict.map((item) => ({
    label: item.name,
    value: String(item.id),
  })),
);

const title = computed(() => (props.videoId ? "编辑兴趣视频" : "新增兴趣视频"));

const schema = z.object({
  number: z.string().min(1, "请输入车牌号"),
  name: z.string().min(1, "请输入视频名称"),
  performer: z
    .array(z.union([z.string(), z.number()]))
    .nonempty("请至少选择一个演员"),
  releaseDate: z.string().min(1, "请选择发行时间"),
  rating: z.number().min(0).max(5),
  status: z.number(),
  magnetUri: z.string().min(1, "请输入磁力链接"),
});

type Schema = z.output<typeof schema>;

const state = reactive<TasteVideoRequest>({
  number: "",
  name: "",
  performer: [] as string[],
  releaseDate: "",
  rating: 5,
  status: 0,
  magnetUri: "",
});

const selectedDate = shallowRef<CalendarDate | null>(null);

const df = new DateFormatter("zh-CN", {
  dateStyle: "medium",
});

const loading = ref(false);

watch(
  open,
  async (newVal) => {
    if (newVal) {
      state.number = "";
      state.name = "";
      state.performer = [] as string[];
      state.releaseDate = "";
      state.rating = 5;
      state.status = 0;
      state.magnetUri = "";
      selectedDate.value = null;
      store.clearNumberError();

      if (props.videoId) {
        const video = await store.fetchVideoById(props.videoId);
        if (video) {
          state.number = video.number;
          state.name = video.name;
          state.performer = Array.isArray(video.performer)
            ? video.performer.map(String)
            : [String(video.performer)];
          state.releaseDate = video.releaseDate;
          state.rating = video.rating;
          state.status = video.status;
          state.magnetUri = video.magnetUri;

          if (video.releaseDate) {
            const [year, month, day] = video.releaseDate.split("-").map(Number);
            selectedDate.value = new CalendarDate(
              year ?? 0,
              month ?? 0,
              day ?? 0,
            );
          }
        }
      }
    }
  },
  { immediate: true },
);

function handleDateSelect(date: CalendarDate | null) {
  selectedDate.value = date;
  state.releaseDate = date ? date.toString() : "";
}

function handleNumberBlur() {
  if (!state.number || props.videoId) {
    store.clearNumberError();
    return;
  }
  store.validateNumberOnBlur(state.number, props.videoId);
}

const formRef = ref();

async function handleSubmit() {
  if (formRef.value) {
    await formRef.value.submit();
  }
}

async function onSubmit(event: FormSubmitEvent<TasteVideoRequest>) {
  const toast = useToast();

  if (store.numberError) {
    toast.add({
      title: "验证失败",
      description: "请修正车牌号错误",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
    return;
  }

  if (loading.value) return;

  loading.value = true;
  try {
    const submitData = {
      ...event.data,
      id: props.videoId,
    };
    const response = props.videoId
      ? await store.updateVideo(submitData)
      : await store.createVideo(submitData);

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
      description: props.videoId ? "更新成功" : "创建成功",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    emit("success");
    await nextTick();
    emit("update:open", false);
  } catch (error) {
    toast.add({
      title: "操作失败",
      description: (error as Error).message || "请重试",
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
      footer: 'justify-end gap-2',
    }"
  >
    <template #body>
      <UForm
        id="v-form"
        ref="formRef"
        :schema="schema"
        :state="state as any"
        class="space-y-5"
        @submit="onSubmit as any"
      >
        <div
          class="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 items-start"
        >
          <UFormField
            label="车牌号"
            name="number"
            orientation="vertical"
            required
            :error="store.numberError || undefined"
          >
            <UInput
              v-model="state.number"
              placeholder="请输入车牌号"
              :disabled="!!props.videoId"
              :loading="store.numberValidating"
              class="w-full"
              @blur="handleNumberBlur"
            >
              <template v-if="state.number && !props.videoId" #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-x"
                  aria-label="清空车牌号"
                  class="cursor-pointer transition-opacity duration-150 hover:opacity-70"
                  @click="
                    state.number = '';
                    store.clearNumberError();
                  "
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="视频名称"
            name="name"
            orientation="vertical"
            required
          >
            <UInput
              v-model="state.name"
              placeholder="请输入视频名称"
              class="w-full"
            >
              <template v-if="state.name" #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-x"
                  aria-label="清空名称"
                  class="cursor-pointer transition-opacity duration-150 hover:opacity-70"
                  @click="state.name = ''"
                />
              </template>
            </UInput>
          </UFormField>
        </div>

        <UFormField
          label="演员"
          name="performer"
          orientation="vertical"
          required
        >
          <USelectMenu
            v-model="state.performer as string[]"
            :items="performerOptions"
            placeholder="请选择演员"
            clear
            multiple
            trailing-icon="i-lucide-chevrons-up-down"
            :search-input="{
              placeholder: '搜索演员...',
              icon: 'i-lucide-search',
            }"
            value-key="value"
            label-key="label"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="发行时间"
          name="releaseDate"
          orientation="vertical"
          required
        >
          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-full justify-start text-left"
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

        <UFormField label="评分" name="rating" orientation="vertical">
          <div class="flex gap-1" role="radiogroup" aria-label="评分">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="w-10 h-10 rounded-lg transition-all duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              :class="
                star <= state.rating
                  ? 'text-yellow-500'
                  : 'text-gray-300 dark:text-gray-600'
              "
              :aria-label="`${star}星`"
              :aria-pressed="star <= state.rating"
              @click="state.rating = star"
            >
              <UIcon
                :name="
                  star <= state.rating
                    ? 'i-heroicons-star-20-solid'
                    : 'i-heroicons-star'
                "
                class="w-6 h-6"
              />
            </button>
          </div>
        </UFormField>

        <UFormField label="状态" name="status" orientation="vertical">
          <USelect
            v-model="state.status"
            placeholder="请选择状态"
            :items="[
              { label: '未下载', value: 0 },
              { label: '已下载', value: 1 },
              { label: '已观看', value: 2 },
            ]"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="磁力链接"
          name="magnetUri"
          orientation="vertical"
          required
        >
          <UTextarea
            v-model="state.magnetUri"
            placeholder="请输入磁力链接"
            :rows="2"
            class="w-full"
          >
            <template v-if="state.magnetUri" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="清空链接"
                class="cursor-pointer transition-opacity duration-150 hover:opacity-70"
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
        class="cursor-pointer transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
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
        {{ loading ? "提交中..." : "确定" }}
      </UButton>
    </template>
  </UModal>
</template>
