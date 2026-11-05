<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number;
    columns?: number;
  }>(),
  {
    rows: 8,
    columns: 6,
  },
);
</script>

<template>
  <div
    class="space-y-3 py-2"
    role="status"
    aria-label="列表加载中"
  >
    <div class="flex gap-3">
      <USkeleton
        v-for="column in columns"
        :key="`head-${column}`"
        class="h-4 flex-1"
      />
    </div>
    <div
      v-for="row in rows"
      :key="row"
      class="flex gap-3"
    >
      <USkeleton
        v-for="column in columns"
        :key="`${row}-${column}`"
        class="h-9 flex-1"
      />
    </div>
  </div>
</template>
