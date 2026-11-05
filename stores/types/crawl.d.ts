/**
 * 网页数据采集相关类型，字段与后端 crawl dto 对齐。
 */

export type CrawlTaskStatus = "pending" | "running" | "completed" | "failed";

export type CrawlTaskStage = "pending" | "catalog" | "content" | "done";

export interface AnalyzeRequest {
  url: string;
  usePlaywright?: boolean;
}

export interface ChapterItem {
  order: number | null;
  title: string | null;
  url: string | null;
  content?: string | null;
  contentPages?: number | null;
  contentError?: string | null;
}

export interface AnalyzeResponse {
  url: string | null;
  containerSelector: string | null;
  itemSelector: string | null;
  nextUrl: string | null;
  nextText: string | null;
  confidence: number | null;
  sampleChapters: ChapterItem[] | null;
}

export interface CrawlTaskRequest {
  url: string;
  containerSelector: string;
  itemSelector: string;
  nextUrl?: string | null;
  maxPages?: number | null;
  delay?: number | null;
  concurrency?: number | null;
  withContent?: boolean | null;
  followPagination?: boolean | null;
  contentSelector?: string | null;
  clean?: boolean | null;
}

export interface TaskStartResponse {
  taskId: string;
  status: CrawlTaskStatus | string;
}

export interface TaskDeleted {
  ok: boolean;
}

export interface TaskStatusResponse {
  taskId: string;
  status: CrawlTaskStatus | string | null;
  stage: CrawlTaskStage | string | null;
  currentPage: number | null;
  currentChapter: number | null;
  totalChapters: number | null;
  chapterCount: number | null;
  pagesCrawled: number | null;
  error: string | null;
  resultAvailable: boolean | null;
}
