<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const store = useCrawlStore();

const schema = z.object({
  url: z.string().trim().min(1, "请输入目标网页 URL").url("请输入有效的 URL"),
  containerSelector: z.string().trim().min(1, "请填写容器选择器"),
  itemSelector: z.string().trim().min(1, "请填写项目选择器"),
  nextUrl: z.string(),
  maxPages: z.coerce.number().int().min(1, "最大页数至少为 1"),
  delay: z.coerce.number().min(0, "请求间隔不能为负数"),
  concurrency: z.coerce.number().int().min(1, "并发数至少为 1"),
  withContent: z.boolean(),
  followPagination: z.boolean(),
  contentSelector: z.string(),
  clean: z.boolean(),
});

type Schema = z.output<typeof schema>;

const taskRunning = computed(() => {
  const status = store.task?.status;
  return status === "pending" || status === "running";
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  store.taskDraft.url = event.data.url;
  store.taskDraft.containerSelector = event.data.containerSelector;
  store.taskDraft.itemSelector = event.data.itemSelector;
  store.taskDraft.nextUrl = event.data.nextUrl;
  store.taskDraft.maxPages = event.data.maxPages;
  store.taskDraft.delay = event.data.delay;
  store.taskDraft.concurrency = event.data.concurrency;
  store.taskDraft.withContent = event.data.withContent;
  store.taskDraft.followPagination = event.data.followPagination;
  store.taskDraft.contentSelector = event.data.contentSelector;
  store.taskDraft.clean = event.data.clean;
  await store.startTask();
}
</script>

<template>
  <UCard>
    <template #header>
      <div>
        <h2 class="text-lg font-semibold">采集参数</h2>
        <p class="mt-1 text-sm text-gray-500">
          选择器来自分析结果，可以按页面实际情况修改后再启动。
        </p>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="store.taskDraft"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField label="目标网页 URL" name="url" required>
        <UInput v-model="store.taskDraft.url" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UFormField label="容器选择器" name="containerSelector" required>
          <UInput v-model="store.taskDraft.containerSelector" class="w-full" />
        </UFormField>
        <UFormField label="项目选择器" name="itemSelector" required>
          <UInput v-model="store.taskDraft.itemSelector" class="w-full" />
        </UFormField>
      </div>

      <UFormField label="下一页 URL" name="nextUrl">
        <UInput
          v-model="store.taskDraft.nextUrl"
          class="w-full"
          placeholder="留空表示不指定下一页"
        />
      </UFormField>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <UFormField label="最大页数" name="maxPages" required>
          <UInput
            v-model.number="store.taskDraft.maxPages"
            type="number"
            min="1"
            step="1"
            class="w-full"
          />
        </UFormField>
        <UFormField label="请求间隔（秒）" name="delay" required>
          <UInput
            v-model.number="store.taskDraft.delay"
            type="number"
            min="0"
            step="0.1"
            class="w-full"
          />
        </UFormField>
        <UFormField label="并发数" name="concurrency" required>
          <UInput
            v-model.number="store.taskDraft.concurrency"
            type="number"
            min="1"
            step="1"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField label="正文选择器" name="contentSelector">
        <UInput
          v-model="store.taskDraft.contentSelector"
          class="w-full"
          placeholder="抓正文时使用，可留空"
        />
      </UFormField>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <UFormField label="抓取正文" name="withContent">
          <USwitch v-model="store.taskDraft.withContent" />
        </UFormField>
        <UFormField label="跟随分页" name="followPagination">
          <USwitch v-model="store.taskDraft.followPagination" />
        </UFormField>
        <UFormField label="清理内容" name="clean">
          <USwitch v-model="store.taskDraft.clean" />
        </UFormField>
      </div>

      <UButton
        type="submit"
        icon="i-heroicons-play"
        :loading="store.starting"
        :disabled="taskRunning"
      >
        启动采集
      </UButton>
    </UForm>
  </UCard>
</template>
