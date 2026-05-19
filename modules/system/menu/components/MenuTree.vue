<template>
  <div class="menu-tree">
    <UTree
      :nodes="menuTree"
      :expanded="expandedNodes"
      @update:expanded="handleExpand"
      @drag-end="handleDragEnd"
    >
      <template #default="{ node, isLeaf, isExpanded }">
        <div class="menu-node">
          <div class="menu-node-content">
            <UIcon v-if="node.icon" :name="node.icon" class="menu-icon" />
            <span class="menu-name">{{ node.name }}</span>
          </div>
          <div class="menu-node-actions">
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-plus"
              @click.stop="handleAdd(node)"
            />
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-pencil"
              @click.stop="handleEdit(node)"
            />
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-trash"
              @click.stop="handleDelete(node)"
            />
          </div>
        </div>
      </template>
    </UTree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MenuNode } from '~/stores/types/menu'
import { useMenuStore } from '~/stores/menu.store'

const menuStore = useMenuStore()

// 获取菜单树数据 - 使用 store 的 getter
const menuTree = computed(() => menuStore.getMenuTree)

// 获取展开的节点
const expandedNodes = ref<number[]>([])

// 加载菜单树
async function loadMenuTree() {
  console.log('[MenuTree] 开始加载菜单树...')
  try {
    await menuStore.fetchMenuTree()
    console.log('[MenuTree] 菜单树加载成功:', menuTree.value)
    // 默认展开第一级节点
    expandedNodes.value = menuTree.value.map(node => node.id)
  } catch (error) {
    console.error('[MenuTree] 加载菜单树失败:', error)
  }
}

// 处理展开/折叠
function handleExpand(ids: number[]) {
  expandedNodes.value = ids
}

// 定义 emits
const emit = defineEmits<{
  add: [node: MenuNode]
  edit: [node: MenuNode]
  delete: [node: MenuNode]
}>()

// 处理新增菜单
function handleAdd(node: MenuNode) {
  emit('add', node)
}

// 处理编辑菜单
function handleEdit(node: MenuNode) {
  emit('edit', node)
}

// 处理删除菜单
function handleDelete(node: MenuNode) {
  emit('delete', node)
}

// 处理拖拽排序
async function handleDragEnd({ node, target, type }: { node: MenuNode, target: number, type: 'before' | 'after' | 'inside' }) {
  try {
    // 调用 store 的排序方法
    await menuStore.sortMenu([{ id: node.id, sort: target }])
    // 重新加载菜单树
    await loadMenuTree()
  } catch (error) {
    console.error('Failed to sort menu:', error)
  }
}

// 暴露方法给父组件
defineExpose({
  loadMenuTree
})

// 初始化加载菜单树
onMounted(async () => {
  console.log('[MenuTree] 组件已挂载，准备加载菜单树')
  await loadMenuTree()
})
</script>

<style scoped>
.menu-tree {
  height: 100%;
}

.menu-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  height: 40px;
}

.menu-node-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.menu-icon {
  margin-right: 8px;
}

.menu-name {
  font-size: 14px;
}

.menu-node-actions {
  display: none;
  flex-shrink: 0;
  margin-left: 8px;
}

.menu-node:hover .menu-node-actions {
  display: flex;
}
</style>