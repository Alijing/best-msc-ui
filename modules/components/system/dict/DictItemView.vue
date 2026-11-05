<script setup lang="ts">
const props = defineProps<{
  code: string;
}>();

const dictStore = useDictStore();
const booted = ref(false);

const dict = computed(() => {
  const current = dictStore.current;
  if (!current || current.code !== props.code) {
    return null;
  }
  return current;
});

const isTree = computed(() => dict.value?.structure === 1);

const structureHint = computed(() =>
  isTree.value
    ? "树形字典。字典项按上下级展示，删除节点时会同时删除下级。"
    : "列表字典。字典项平铺分页，不能设置上级。",
);

watch(() => props.code, (code, previous) => {
  if (!booted.value || code === previous) {
    return;
  }
  void dictStore.fetchDict(code);
});

onMounted(() => {
  booted.value = true;
  void dictStore.fetchDict(props.code);
});
</script>

<template>
  <div class="flex flex-col">
    <div
      v-if="!booted || dictStore.currentLoading"
      class="space-y-4"
    >
      <USkeleton class="h-8 w-48" />
      <USkeleton class="h-4 w-80" />
      <TableSkeleton
        :rows="8"
        :columns="6"
      />
    </div>

    <template v-else-if="dict">
      <div class="mb-4">
        <UButton
          to="/system/dict"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-left-20-solid"
          class="mb-3"
        >
          返回字典
        </UButton>
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-bold">
            {{ dict.code }}
          </h1>
          <UBadge
            :color="dict.type === 0 ? 'neutral' : 'primary'"
            variant="soft"
          >
            {{ dict.type === 0 ? "系统类" : "业务类" }}
          </UBadge>
          <UBadge
            :color="isTree ? 'warning' : 'info'"
            variant="soft"
          >
            {{ isTree ? "树形" : "列表" }}
          </UBadge>
        </div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ dict.desc?.trim() || "暂无描述" }}
        </p>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ structureHint }}
        </p>
      </div>

      <DictItemTree
        v-if="isTree"
        :key="`tree-${dict.id}`"
        :dict="dict"
      />
      <DictItemList
        v-else
        :key="`list-${dict.id}`"
        :dict="dict"
      />
    </template>

    <UCard v-else>
      <UAlert
        color="error"
        icon="i-heroicons-exclamation-circle"
        title="无法打开字典"
        :description="dictStore.currentError || '字典不存在'"
      />
      <UButton
        to="/system/dict"
        class="mt-4"
        variant="outline"
      >
        返回字典列表
      </UButton>
    </UCard>
  </div>
</template>
