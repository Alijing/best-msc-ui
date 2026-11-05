<script setup lang="ts">
const route = useRoute();

const code = computed(() => {
  const raw = route.params.code;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value ? decodeURIComponent(value) : "";
});

useHead({
  title: computed(() => (code.value ? `字典项 - ${code.value}` : "字典项")),
});
</script>

<template>
  <DictItemView :code="code" />
</template>
