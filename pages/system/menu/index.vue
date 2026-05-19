<template>
  <div class="menu-management">
    <UPageHeader title="菜单管理">
      <template #actions>
        <UButton icon="i-heroicons-plus" @click="handleAdd"> 新增 </UButton>
      </template>
    </UPageHeader>

    <UMain>
      <div class="menu-container">
        <MenuTree
          ref="menuTreeRef"
          @add="handleAdd"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </UMain>

    <!-- TODO: 暂时注释，先实现菜单树展示 -->
    <!-- <MenuFormDialog
      v-model="showFormDialog"
      :node="selectedNode"
      @submit="handleFormSubmit"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import type { MenuNode } from "~/stores/types/menu";

const toast = useToast();
const menuStore = useMenuStore();
const overlay = useOverlay();

// 菜单树引用
const menuTreeRef = ref();

// 显示表单对话框
const showFormDialog = ref(false);

// 当前选中的菜单节点
const selectedNode = ref<MenuNode | null>(null);

// 处理新增菜单
function handleAdd(node?: MenuNode) {
  selectedNode.value = node || null;
  showFormDialog.value = true;
}

// 处理编辑菜单
function handleEdit(node: MenuNode) {
  selectedNode.value = node;
  showFormDialog.value = true;
}

// 处理删除菜单
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
    if (success && menuTreeRef.value) {
      await menuTreeRef.value.loadMenuTree();
    }
  }
}

// 处理表单提交
async function handleFormSubmit() {
  // 刷新菜单树
  if (menuTreeRef.value) {
    await menuTreeRef.value.loadMenuTree();
  }

  // 显示成功提示
  toast.add({
    title: "成功",
    description: "菜单操作成功",
    color: "success",
  });
}
</script>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
