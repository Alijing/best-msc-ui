<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { TableColumn } from "@nuxt/ui";
import type { ChapterItem } from "~/stores/types/crawl";
import type { NovelDictItem } from "~/stores/types/novel";

const store = useCrawlStore();
const toast = useToast();

const schema = z.object({
  novelId: z.string().trim().min(1, "请选择小说"),
  usePlaywright: z.boolean(),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  novelId: "",
  usePlaywright: false,
});

const novels = ref<NovelDictItem[]>([]);
const novelLoading = ref(false);

const chapters = computed(() => store.analyzeResult?.sampleChapters ?? []);

const novelOptions = computed(() =>
  novels.value
    .filter((item) => item.id != null && item.path?.trim())
    .map((item) => {
      const path = item.path!.trim();
      const name = item.name?.trim();
      return {
        label: name || path,
        value: String(item.id),
        description: name ? path : undefined,
      };
    }),
);

function syncSelectedNovel(novelId: string) {
  const novel = novels.value.find((item) => String(item.id) === novelId);
  store.setSelectedNovel(novelId, novel?.name?.trim() || "");
}

watch(
  () => state.novelId,
  (novelId) => {
    syncSelectedNovel(novelId);
  },
);

const columns: TableColumn<ChapterItem>[] = [
  { accessorKey: "order", header: "序号" },
  {
    accessorKey: "title",
    header: "标题",
    cell: ({ row }) => row.original.title || "—",
  },
  {
    accessorKey: "url",
    header: "链接",
    cell: ({ row }) => {
      const url = row.original.url;
      if (!url) {
        return "—";
      }
      return h(
        "a",
        {
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-primary break-all underline",
        },
        url,
      );
    },
  },
];

function formatConfidence(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(1)}%`;
}

function readErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const source = error as {
      data?: { msg?: string; message?: string };
      message?: string;
    };
    return source.data?.msg || source.data?.message || source.message || "请求失败";
  }
  return "请求失败";
}

async function fetchNovels() {
  novelLoading.value = true;
  try {
    const response = await clientApiFetch<NovelDictItem[]>("/api/novel/dict");
    if (response.code !== 200) {
      toast.add({
        title: "获取小说列表失败",
        description: response.msg || "请稍后重试",
        color: "error",
      });
      novels.value = [];
      return;
    }
    novels.value = response.data ?? [];
    if (store.selectedNovelId) {
      state.novelId = store.selectedNovelId;
      syncSelectedNovel(store.selectedNovelId);
    }
  } catch (error) {
    novels.value = [];
    toast.add({
      title: "获取小说列表失败",
      description: readErrorMessage(error),
      color: "error",
    });
  } finally {
    novelLoading.value = false;
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const novel = novels.value.find((item) => String(item.id) === event.data.novelId);
  const url = novel?.path?.trim() ?? "";
  if (!z.string().url().safeParse(url).success) {
    toast.add({
      title: "所选小说地址不是有效的 URL",
      color: "error",
    });
    return;
  }
  store.setSelectedNovel(event.data.novelId, novel?.name?.trim() || "");
  await store.analyze({
    url,
    usePlaywright: event.data.usePlaywright,
  });
}

onMounted(() => {
  void fetchNovels();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">目录分析</h2>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="小说" name="novelId" required>
          <USelectMenu
            v-model="state.novelId"
            :items="novelOptions"
            value-key="value"
            label-key="label"
            placeholder="请选择小说"
            class="w-full"
            :loading="novelLoading"
            :disabled="store.analyzeLoading || novelLoading"
            :search-input="{
              placeholder: '搜索小说...',
              icon: 'i-lucide-search',
            }"
          />
        </UFormField>

        <UFormField label="使用 Playwright" name="usePlaywright">
          <USwitch v-model="state.usePlaywright" :disabled="store.analyzeLoading" />
        </UFormField>

        <UButton
          type="submit"
          :loading="store.analyzeLoading"
          icon="i-heroicons-magnifying-glass"
        >
          分析结构
        </UButton>
      </UForm>
    </UCard>

    <UCard v-if="store.analyzeResult">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold">结构结果</h2>
          <UBadge color="primary" variant="subtle">
            置信度 {{ formatConfidence(store.analyzeResult.confidence) }}
          </UBadge>
        </div>
      </template>

      <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-gray-500">页面 URL</dt>
          <dd class="mt-1 break-all">{{ store.analyzeResult.url || "—" }}</dd>
        </div>
        <div>
          <dt class="text-gray-500">下一页文案</dt>
          <dd class="mt-1">{{ store.analyzeResult.nextText || "—" }}</dd>
        </div>
        <div>
          <dt class="text-gray-500">容器选择器</dt>
          <dd class="mt-1 font-mono break-all">
            {{ store.analyzeResult.containerSelector || "—" }}
          </dd>
        </div>
        <div>
          <dt class="text-gray-500">项目选择器</dt>
          <dd class="mt-1 font-mono break-all">
            {{ store.analyzeResult.itemSelector || "—" }}
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-gray-500">下一页 URL</dt>
          <dd class="mt-1 break-all">{{ store.analyzeResult.nextUrl || "—" }}</dd>
        </div>
      </dl>

      <div class="mt-5">
        <h3 class="mb-2 font-medium">样本章节</h3>
        <p v-if="chapters.length === 0" class="text-sm text-gray-500">
          未识别到章节
        </p>
        <UTable v-else :columns="columns" :data="chapters" />
      </div>
    </UCard>
  </div>
</template>
