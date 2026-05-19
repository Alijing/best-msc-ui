<template>
  <div class="w-full">
    <UInput
      :model-value="selectedIcon || ''"
      :placeholder="placeholder"
      :icon="selectedIcon || undefined"
      readonly
      @click="showPicker = true"
      class="w-[300px]"
    />

    <UModal
      v-model:open="showPicker"
      title="图标选择器"
      :persistent="true"
      :ui="{ content: 'w-full max-w-4xl' }"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <UInput
            v-model="searchQuery"
            placeholder="搜索图标..."
            icon="i-heroicons-magnifying-glass"
            class="w-full"
          />

          <div class="flex gap-2 overflow-x-auto">
            <UButton
              v-for="(icons, prefix) in filteredIcons"
              :key="prefix"
              :variant="tabVariants[prefix]"
              @click="activePrefix = prefix as 'i-heroicons' | 'i-lucide'"
            >
              {{ prefix }}
            </UButton>
          </div>

          <div
            class="grid gap-3 h-96 overflow-y-auto p-2 rounded-lg"
            style="grid-template-columns: repeat(auto-fill, minmax(40px, 1fr))"
          >
            <div
              v-for="(icon, index) in filteredIcons[activePrefix]"
              :key="index"
              class="flex justify-center items-center h-10 rounded cursor-pointer transition-all duration-200"
              :class="
                selectedIcon === `${activePrefix}-${icon}`
                  ? 'bg-primary-600'
                  : 'hover:bg-primary-800 text-gray-600'
              "
              @click="selectIcon(`${activePrefix}-${icon}`)"
              @mouseenter="previewIcon = `${activePrefix}-${icon}`"
            >
              <UIcon
                :name="`${activePrefix}-${icon}`"
                :class="
                  selectedIcon === `${activePrefix}-${icon}`
                    ? 'text-gray-100 w-5 h-5'
                    : 'bg-primary-100 text-gray-700 w-5 h-5'
                "
              />
            </div>
          </div>

          <div
            v-show="previewIcon"
            class="flex flex-col items-center gap-2 p-4 border-t border-gray-200"
          >
            <UIcon :name="previewIcon" class="text-3xl" />
            <div class="mt-2 font-medium">{{ previewIcon }}</div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const { allIcons: icons } = useIcons();

const props = defineProps<{
  modelValue?: string | null;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const showPicker = ref(false);

const searchQuery = ref("");

const activePrefix = ref<"i-heroicons" | "i-lucide">("i-heroicons");

const selectedIcon = ref<string | null>(null);

const previewIcon = ref<string | null>(null);

watch(showPicker, (newVal) => {
  if (newVal) {
    if (props.modelValue) {
      const parts = props.modelValue.split("-");
      if (parts.length >= 2) {
        const prefix = parts.slice(0, 2).join("-");
        activePrefix.value = prefix as "i-heroicons" | "i-lucide";
      }
      selectedIcon.value = props.modelValue;
    } else {
      selectedIcon.value = null;
    }
    searchQuery.value = "";
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    selectedIcon.value = newVal || null;
  },
);

const filteredIcons = computed(() => {
  if (!searchQuery.value) {
    return icons.value;
  }

  const query = searchQuery.value.toLowerCase();
  const result: Record<string, string[]> = {};

  Object.entries(icons.value).forEach(([prefix, iconList]) => {
    const filtered = iconList.filter((icon) =>
      icon.toLowerCase().includes(query),
    );
    if (filtered.length > 0) {
      result[prefix] = filtered;
    }
  });

  return result;
});

const tabVariants = computed(() => {
  const variants: Record<string, "ghost" | "solid"> = {};
  Object.keys(filteredIcons.value).forEach((prefix) => {
    variants[prefix] = activePrefix.value === prefix ? "solid" : "ghost";
  });
  return variants;
});

function selectIcon(iconFullName: string) {
  selectedIcon.value = iconFullName;
  emit("update:modelValue", iconFullName);
  showPicker.value = false;
}

function confirmSelection() {
  emit("update:modelValue", selectedIcon.value);
  showPicker.value = false;
}

function resetSelection() {
  selectedIcon.value = null;
  previewIcon.value = null;
  emit("update:modelValue", null);
  showPicker.value = false;
}
</script>
