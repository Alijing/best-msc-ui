/**
 * 小说字典项。path 为目录页地址。
 */
export interface NovelDictItem {
  id: string | number;
  name: string | null;
  path: string | null;
}

/**
 * 小说信息，对应后端 novel_info。
 * 雪花 ID 以字符串返回，避免精度丢失。
 */
export interface Novel {
  id: string | number;
  name: string | null;
  path: string | null;
  creatorId?: string | number | null;
  createTime?: string | number | Array<number> | null;
  revisionTime?: string | number | Array<number> | null;
}

export interface NovelQuery {
  pageIndex: number;
  pageSize: number;
  name?: string;
}

export interface NovelRequest {
  id?: string | number;
  name: string;
  path: string;
}
