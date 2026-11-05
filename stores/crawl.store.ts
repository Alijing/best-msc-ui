/**
 * 网页数据采集 Store
 * 保存目录分析结果、启动参数草稿，以及当前会话中的任务。
 */
import { defineStore } from "pinia";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  CrawlTaskRequest,
  TaskDeleted,
  TaskStartResponse,
  TaskStatusResponse,
} from "~/stores/types/crawl";

const TASK_STORAGE_KEY = "crawl-webpage-task-id";
const NOVEL_STORAGE_KEY = "crawl-webpage-novel-id";

export interface CrawlTaskDraft {
  url: string;
  containerSelector: string;
  itemSelector: string;
  nextUrl: string;
  maxPages: number;
  delay: number;
  concurrency: number;
  withContent: boolean;
  followPagination: boolean;
  contentSelector: string;
  clean: boolean;
}

function createTaskDraft(): CrawlTaskDraft {
  return {
    url: "",
    containerSelector: "",
    itemSelector: "",
    nextUrl: "",
    maxPages: 1,
    delay: 0.5,
    concurrency: 1,
    withContent: true,
    followPagination: true,
    contentSelector: "",
    clean: true,
  };
}

function readErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const source = error as {
      data?: { msg?: string; message?: string };
      message?: string;
      statusMessage?: string;
    };
    return (
      source.data?.msg ||
      source.data?.message ||
      source.statusMessage ||
      source.message ||
      "请求失败"
    );
  }
  return "请求失败";
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export const useCrawlStore = defineStore("crawl", () => {
  const toast = useToast();

  const analyzeLoading = ref(false);
  const analyzeResult = ref<AnalyzeResponse | null>(null);
  const taskDraft = reactive<CrawlTaskDraft>(createTaskDraft());
  const starting = ref(false);
  const task = ref<TaskStatusResponse | null>(null);
  const statusLoading = ref(false);
  const removing = ref(false);
  const importing = ref(false);
  const selectedNovelId = ref("");
  const selectedNovelName = ref("");

  if (import.meta.client) {
    selectedNovelId.value = sessionStorage.getItem(NOVEL_STORAGE_KEY) ?? "";
  }

  function persistTaskId(taskId: string | null) {
    if (!import.meta.client) {
      return;
    }
    if (taskId) {
      sessionStorage.setItem(TASK_STORAGE_KEY, taskId);
      return;
    }
    sessionStorage.removeItem(TASK_STORAGE_KEY);
  }

  function readTaskId(): string | null {
    if (!import.meta.client) {
      return null;
    }
    return sessionStorage.getItem(TASK_STORAGE_KEY);
  }

  function setSelectedNovel(novelId: string, novelName = "") {
    selectedNovelId.value = novelId;
    if (novelName) {
      selectedNovelName.value = novelName;
    }
    if (!import.meta.client) {
      return;
    }
    if (novelId) {
      sessionStorage.setItem(NOVEL_STORAGE_KEY, novelId);
      return;
    }
    sessionStorage.removeItem(NOVEL_STORAGE_KEY);
    selectedNovelName.value = "";
  }

  function applyAnalyzeResult(result: AnalyzeResponse, fallbackUrl: string) {
    analyzeResult.value = {
      ...result,
      sampleChapters: result.sampleChapters ?? [],
    };
    taskDraft.url = result.url?.trim() || fallbackUrl;
    taskDraft.containerSelector = result.containerSelector ?? "";
    taskDraft.itemSelector = result.itemSelector ?? "";
    taskDraft.nextUrl = result.nextUrl ?? "";
  }

  function clearTask() {
    task.value = null;
    persistTaskId(null);
  }

  async function analyze(payload: AnalyzeRequest): Promise<boolean> {
    analyzeLoading.value = true;
    try {
      const response = await clientApiFetch<AnalyzeResponse>(
        "/api/crawl/webpage/analyze",
        {
          method: "POST",
          body: payload,
          timeout: 120000,
        },
      );
      const analyzed = response.data;
      if (response.code !== 200 || !analyzed) {
        toast.add({
          title: "分析失败",
          description: response.msg || "未返回网页结构",
          color: "error",
        });
        return false;
      }
      applyAnalyzeResult(analyzed, payload.url);
      return true;
    } catch (error) {
      toast.add({
        title: "分析失败",
        description: readErrorMessage(error),
        color: "error",
      });
      return false;
    } finally {
      analyzeLoading.value = false;
    }
  }

  async function startTask(): Promise<boolean> {
    starting.value = true;
    try {
      const body: CrawlTaskRequest = {
        url: taskDraft.url.trim(),
        containerSelector: taskDraft.containerSelector.trim(),
        itemSelector: taskDraft.itemSelector.trim(),
        nextUrl: emptyToNull(taskDraft.nextUrl),
        maxPages: taskDraft.maxPages,
        delay: taskDraft.delay,
        concurrency: taskDraft.concurrency,
        withContent: taskDraft.withContent,
        followPagination: taskDraft.followPagination,
        contentSelector: emptyToNull(taskDraft.contentSelector),
        clean: taskDraft.clean,
      };
      const response = await clientApiFetch<TaskStartResponse>(
        "/api/crawl/webpage/tasks/start",
        {
          method: "POST",
          body,
          timeout: 60000,
        },
      );
      const started = response.data;
      if (response.code !== 200 || !started?.taskId) {
        toast.add({
          title: "启动失败",
          description: response.msg || "未返回任务 ID",
          color: "error",
        });
        return false;
      }
      task.value = {
        taskId: started.taskId,
        status: started.status,
        stage: null,
        currentPage: null,
        currentChapter: null,
        totalChapters: null,
        chapterCount: null,
        pagesCrawled: null,
        error: null,
        resultAvailable: false,
      };
      persistTaskId(started.taskId);
      return true;
    } catch (error) {
      toast.add({
        title: "启动失败",
        description: readErrorMessage(error),
        color: "error",
      });
      return false;
    } finally {
      starting.value = false;
    }
  }

  async function refreshStatus(silent = false): Promise<boolean> {
    const taskId = task.value?.taskId || readTaskId();
    if (!taskId) {
      return false;
    }
    if (!silent) {
      statusLoading.value = true;
    }
    try {
      const response = await clientApiFetch<TaskStatusResponse>(
        `/api/crawl/webpage/tasks/status/${encodeURIComponent(taskId)}`,
      );
      const status = response.data;
      if (response.code !== 200 || !status) {
        if (!silent) {
          toast.add({
            title: "获取任务状态失败",
            description: response.msg || "请稍后重试",
            color: "error",
          });
        }
        return false;
      }
      task.value = status;
      persistTaskId(status.taskId || taskId);
      return true;
    } catch (error) {
      if (!silent) {
        toast.add({
          title: "获取任务状态失败",
          description: readErrorMessage(error),
          color: "error",
        });
      }
      return false;
    } finally {
      if (!silent) {
        statusLoading.value = false;
      }
    }
  }

  async function restoreTask() {
    const taskId = readTaskId();
    if (!taskId || task.value?.taskId === taskId) {
      if (task.value) {
        return;
      }
      if (!taskId) {
        return;
      }
    }
    await refreshStatus(false);
  }

  async function removeTask(): Promise<boolean> {
    const taskId = task.value?.taskId;
    if (!taskId) {
      return false;
    }
    removing.value = true;
    try {
      const response = await clientApiFetch<TaskDeleted>(
        `/api/crawl/webpage/tasks/${encodeURIComponent(taskId)}`,
        {
          method: "DELETE",
          body: {},
        },
      );
      if (response.code !== 200 || response.data?.ok === false) {
        toast.add({
          title: "取消失败",
          description: response.msg || "任务未能移除",
          color: "error",
        });
        return false;
      }
      clearTask();
      return true;
    } catch (error) {
      toast.add({
        title: "取消失败",
        description: readErrorMessage(error),
        color: "error",
      });
      return false;
    } finally {
      removing.value = false;
    }
  }

  async function importNovel(novelId: string): Promise<boolean> {
    const taskId = task.value?.taskId;
    if (!taskId) {
      toast.add({
        title: "无法导入",
        description: "当前没有采集任务",
        color: "error",
      });
      return false;
    }
    importing.value = true;
    try {
      const response = await clientApiFetch<null>(
        `/api/crawl/webpage/tasks/${encodeURIComponent(taskId)}/1/${encodeURIComponent(novelId)}`,
        {
          timeout: 300000,
        },
      );
      return response.code === 200;
    } catch (error) {
      toast.add({
        title: "导入失败",
        description: readErrorMessage(error),
        color: "error",
      });
      return false;
    } finally {
      importing.value = false;
    }
  }

  return {
    analyzeLoading,
    analyzeResult,
    selectedNovelId,
    selectedNovelName,
    taskDraft,
    starting,
    task,
    statusLoading,
    removing,
    importing,
    analyze,
    startTask,
    refreshStatus,
    restoreTask,
    removeTask,
    importNovel,
    setSelectedNovel,
    clearTask,
  };
});
