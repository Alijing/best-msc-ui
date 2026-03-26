<template>
  <div class="menu-list-page">
    <el-card class="search-card">
      <!-- 菜单树形列表 -->
      <MenuTree
        :menu-tree="menuStore.menuTree"
        @add="handleCreate"
        @add-child="handleAddChild"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <MenuFormDialog
      v-model:visible="dialogVisible"
      :menu-data="currentMenuData"
      :menu-tree="menuStore.menuTree"
      :parent-id="defaultParentId"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuNode } from '~/stores/types/menu'
import MenuTree from "~/modules/menu/components/MenuTree.vue";
import MenuFormDialog from "~/modules/menu/components/MenuFormDialog.vue";

const menuStore = useMenuStore()

// 设置页面标题
useHead({
  title: '菜单管理 - BestMSC'
})

// 当前选中的菜单数据
const currentMenuData = ref<MenuNode>()

// 默认上级菜单 ID（用于新增下级菜单）
const defaultParentId = ref<number | null>(null)

// 弹窗显示状态
const dialogVisible = ref(false)

// 获取多语言名称（优先中文）
function getI18nName(node: MenuNode): string {
  const zhCN = node.i18n.find(i => i.locale === 'zh-CN')
  if (zhCN) return zhCN.name
  
  const enUS = node.i18n.find(i => i.locale === 'en-US')
  if (enUS) return enUS.name
  
  return node.i18n[0]?.name || '未命名'
}

// 新增（顶级菜单）
function handleCreate() {
  currentMenuData.value = undefined
  dialogVisible.value = true
}

// 新增下级菜单
function handleAddChild(parentData: MenuNode) {
  console.log('新增下级菜单，父节点:', parentData)
  currentMenuData.value = undefined
  // 设置默认 parentId 为父节点 ID
  defaultParentId.value = parentData.id
  dialogVisible.value = true
  ElMessage.info(`正在为"${getI18nName(parentData)}"添加子菜单`)
}

// 编辑
async function handleEdit(row: MenuNode) {
  // 获取完整的菜单详情
  const menuDetail = await menuStore.getMenuById(row.id)
  if (menuDetail) {
    currentMenuData.value = { ...menuDetail }
    dialogVisible.value = true
  }
}

// 删除
async function handleDelete(row: MenuNode) {
  try {
    await ElMessageBox.confirm('确认删除该菜单吗？删除后不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await menuStore.deleteMenu(row.id)
  } catch (error) {
    // 用户取消删除
  }
}

// 弹窗成功回调
function handleDialogSuccess() {
  dialogVisible.value = false
  menuStore.fetchMenuTree()
}

// 初始化加载 - 使用 useAsyncData 替代 onMounted
const { refresh: refreshMenuTree } = await useAsyncData('menuTree', async () => {
  if (!menuStore.menuTree || menuStore.menuTree.length === 0) {
    await menuStore.fetchMenuTree()
  }
  return menuStore.menuTree
}, {
  server: true, // SSR 模式
  lazy: false,
  getCachedData: (key) => {
    const cached = menuStore.menuTree
    if (cached && cached.length > 0) {
      return cached
    }
    return undefined
  }
})
</script>

<style scoped>
.menu-list-page {
  min-height: calc(100vh - 84px);
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}
</style>
