/**
 * 通知中心
 * 后端暂无通知接口，列表保存在本地，最多 20 条。
 */
import { defineStore } from "pinia";
import type { AppNotification } from "~/stores/types/notification";

const STORAGE_KEY = "best-msc-notifications";
const MAX_COUNT = 20;

function createSeed(): AppNotification[] {
  const now = Date.now();
  return [
    {
      id: "welcome",
      title: "系统通知",
      content: "欢迎使用管理系统",
      type: "info",
      isRead: false,
      createTime: new Date(now - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "update",
      title: "更新提示",
      content: "系统已更新到最新版本",
      type: "success",
      isRead: false,
      createTime: new Date(now - 60 * 60 * 1000).toISOString(),
    },
    {
      id: "maintenance",
      title: "维护提醒",
      content: "请定期检查账号与菜单权限",
      type: "warning",
      isRead: false,
      createTime: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function readStorage(): AppNotification[] {
  if (!import.meta.client) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COUNT) : createSeed();
  } catch {
    return createSeed();
  }
}

export const useNotificationStore = defineStore("notification", () => {
  const list = ref<AppNotification[]>([]);
  const loaded = ref(false);

  const unreadCount = computed(
    () => list.value.filter((item) => !item.isRead).length,
  );
  const unread = computed(() => list.value.filter((item) => !item.isRead));
  const read = computed(() => list.value.filter((item) => item.isRead));

  function persist() {
    if (!import.meta.client) {
      return;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(list.value.slice(0, MAX_COUNT)),
    );
  }

  function ensureLoaded() {
    if (loaded.value) {
      return;
    }
    list.value = readStorage();
    loaded.value = true;
  }

  function markAsRead(id: string) {
    ensureLoaded();
    list.value = list.value.map((item) =>
      item.id === id ? { ...item, isRead: true } : item,
    );
    persist();
  }

  function markAllAsRead() {
    ensureLoaded();
    list.value = list.value.map((item) => ({ ...item, isRead: true }));
    persist();
  }

  function clearAll() {
    ensureLoaded();
    list.value = [];
    persist();
  }

  return {
    list,
    unreadCount,
    unread,
    read,
    ensureLoaded,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
});
