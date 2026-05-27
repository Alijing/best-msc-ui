<template>
  <div class="menu-management">
    <UPageHeader title="菜单管理">
      <template #actions>
        <UButton icon="i-heroicons-plus" @click="handleAdd"> 新增 </UButton>
      </template>
    </UPageHeader>

    <UMain>
      <div class="menu-container">
        <MenuTree ref="menuTreeRef" @delete="handleDelete" />
      </div>
    </UMain>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import type { MenuNode } from "~/stores/types/menu";
import { useMenuStore } from "~/stores/menu.store";

const menuStore = useMenuStore();
const overlay = useOverlay();

interface MenuTreeExpose {
  loadMenuTree: () => Promise<void>;
  openAddDialog: (parentMenu?: MenuNode) => void;
}

const menuTreeRef = ref<MenuTreeExpose | null>(null);

function handleAdd() {
  menuTreeRef.value?.openAddDialog();
}

async function handleDelete(node: MenuNode) {
  const confirmDialog = overlay.create(ConfirmDialog, {
    destroyOnClose: true,
  });

  const confirmed = await confirmDialog.open({
    title: "删除菜单",
    message: `确定要删除菜单【${node.name}】吗？此操作不可恢复。`,
    confirmText: "删除",
  });

  if (confirmed) {
    const success = await menuStore.deleteMenu(node.id);
    if (success) {
      await menuTreeRef.value?.loadMenuTree();
    }
  }
}
</script>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
