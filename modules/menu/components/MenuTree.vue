<template>
  <div class="menu-tree-container">
    <!-- 搜索区域 -->
    <div class="search-bar mb-4">
      <el-input
        v-model="searchText"
        placeholder="搜索菜单名称（支持多语言）"
        clearable
        style="width: 300px"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      
      <el-button type="primary" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
        新增菜单
      </el-button>
    </div>

    <!-- 表头 -->
    <div class="tree-header">
      <div class="header-row">
        <div class="header-cell">菜单名称</div>
        <div class="header-cell" style="text-align: center;">菜单地址</div>
        <div class="header-cell" style="text-align: center;">描述</div>
        <div class="header-cell" style="text-align: center;">状态</div>
        <div class="header-cell" style="text-align: center;">操作</div>
      </div>
    </div>

    <!-- 树形列表 -->
    <el-tree
      ref="treeRef"
      :data="menuTree"
      :props="treeProps"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      draggable
      :allow-drop="allowDrop"
      @node-drop="handleNodeDrop"
    >
      <template #default="{ node, data }">
        <div class="menu-tree-node">
          <span class="node-name">
            <el-icon v-if="data.icon" :size="18">
              <component :is="data.icon" />
            </el-icon>
            {{ getI18nName(data) }}
          </span>
          
          <span class="node-path" v-if="data.path">
            {{ data.path }}
          </span>
          <span v-else style="color: #909399; font-size: 12px;">-</span>

          <span class="node-desc" v-if="data">
             {{ getI18nDesc(data) }}
          </span>
          <span v-else style="color: #909399; font-size: 12px;">-</span>
          
          <el-tag :type="data.status === 1 ? 'success' : 'info'" size="small">
            {{ data.status === 1 ? '启用' : '禁用' }}
          </el-tag>
          
          <div class="node-actions" style="text-align: center;">
            <el-button type="success" link @click.stop="$emit('add-child', data)">
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button type="primary" link @click.stop="$emit('edit', data)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link @click.stop="$emit('delete', data)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import type { MenuNode, BatchUpdateItem } from '~/stores/types/menu'

interface Props {
  menuTree: MenuNode[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'add-child', data: MenuNode): void
  (e: 'edit', data: MenuNode): void
  (e: 'delete', data: MenuNode): void
}>()

const menuStore = useMenuStore()
const treeRef = ref<any>()
const searchText = ref('')

const treeProps = {
  children: 'children',
  label: 'name'
}

// 获取多语言名称（优先中文）
function getI18nName(node: MenuNode): string {
  const zhCN = node.i18n.find(i => i.locale === 'zh-CN')
  if (zhCN) return zhCN.name
  
  const enUS = node.i18n.find(i => i.locale === 'en-US')
  if (enUS) return enUS.name
  
  return node.i18n[0]?.name || '未命名'
}

// 获取多语言名称（优先中文）
function getI18nDesc(node: MenuNode): string {
  const zhCN = node.i18n.find(i => i.locale === 'zh-CN')
  if (zhCN) return zhCN.description

  const enUS = node.i18n.find(i => i.locale === 'en-US')
  if (enUS) return enUS.description

  return node.i18n[0]?.description || '--'
}

// 搜索处理
function handleSearch() {
  if (!treeRef.value) return
  
  // 使用 Element Plus 的 filter 方法
  treeRef.value.filter(searchText.value)
}

// 重置搜索
function handleReset() {
  searchText.value = ''
  handleSearch()
}

// 判断拖拽是否允许放置
function allowDrop(draggingNode: any, dropNode: any, type: string): boolean {
  // 不能拖到自身或后代节点上
  if (type === 'inner') {
    // 检查层级限制（最多 3 级）
    const dropLevel = getNodeLevel(dropNode)
    const draggingMaxDepth = getMaxDepth(draggingNode)
    
    // 放置后的最大层级不能超过 3
    if (dropLevel + draggingMaxDepth > 3) {
      return false
    }
    
    return true
  }
  
  // 同级别拖拽（before/after）总是允许的
  return true
}

// 获取节点层级（从根节点开始计算）
function getNodeLevel(node: any): number {
  let level = 1
  let parent = node.parent
  
  while (parent && parent.level !== undefined) {
    level++
    parent = parent.parent
  }
  
  return level
}

// 获取节点的最大深度（包括自身）
function getMaxDepth(node: any): number {
  if (!node.children || node.children.length === 0) {
    return 1
  }
  
  const maxChildDepth = Math.max(...node.children.map((child: any) => getMaxDepth(child)))
  return 1 + maxChildDepth
}

// 节点拖拽放置完成
async function handleNodeDrop(draggingNode: any, dropNode: any, dropType: string) {
  const batchUpdates: BatchUpdateItem[] = []
  
  // 收集需要更新的节点
  collectUpdates(draggingNode, dropNode, dropType, batchUpdates)
  
  if (batchUpdates.length > 0) {
    try {
      await menuStore.batchUpdateMenu(batchUpdates)
    } catch (error) {
      console.error('保存拖拽变更失败:', error)
      ElMessage.error('保存排序失败')
      // 刷新列表恢复原状
      await menuStore.fetchMenuTree()
    }
  }
}

// 收集需要更新的节点信息
function collectUpdates(
  draggingNode: any, 
  dropNode: any, 
  dropType: string, 
  updates: BatchUpdateItem[]
) {
  const draggingId = draggingNode.data.id
  let newParentId: number | null = null
  let newSort = 0
  
  if (dropType === 'inner') {
    // 作为子节点
    newParentId = dropNode.data.id
    newSort = (dropNode.data.children?.length || 0) * 10
  } else {
    // 同级前后
    newParentId = dropNode.data.parentId
    const siblings = dropNode.parent?.children || []
    const dropIndex = siblings.findIndex((s: any) => s.data.id === dropNode.data.id)
    
    if (dropType === 'before') {
      newSort = dropIndex > 0 ? siblings[dropIndex - 1].data.sort + 5 : 0
    } else {
      newSort = dropIndex < siblings.length - 1 ? siblings[dropIndex + 1].data.sort - 5 : siblings.length * 10
    }
  }
  
  updates.push({
    id: draggingId,
    parentId: newParentId,
    sort: newSort
  })
}


</script>

<style scoped>
.menu-tree-container {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

/* 表头样式 */
.tree-header {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.header-row {
  display: grid;
  grid-template-columns: 1fr 3fr 3fr 100px 150px;
  align-items: center;
  height: 40px;
  font-weight: bold;
  color: #606266;
  font-size: 14px;
}

.header-cell {
  padding: 0 10px;
  box-sizing: border-box;
}

/* 树节点样式 */
.menu-tree-node {
  height: 49px;
  display: grid;
  grid-template-columns: 1fr 400px 400px 100px 150px;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  border-bottom: #f0f0f1 1px solid;
}

.node-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  /* 处理树形缩进 */
  position: relative;
}

.node-path {
  color: #909399;
  font-size: 12px;
}

.node-actions {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* 拖拽时的样式 */
.el-tree.is-dragging .el-tree-node__content {
  cursor: move;
}

.el-tree.is-dragging .el-tree-node__content:hover {
  background-color: #f5f7fa;
}

/* 树节点内容对齐 */
:deep(.el-tree-node__content) {
  height: auto !important;
  padding: 0 8px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
</style>
