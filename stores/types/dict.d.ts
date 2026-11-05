/**
 * 系统字典。雪花 ID 按字符串传递，避免精度丢失。
 * structure：0 列表，1 树形。type：0 系统类，1 业务类。
 */
export interface DictRecord {
  id: string | number;
  code: string;
  type: number;
  structure: number;
  desc?: string | null;
  createTime?: string | number | Array<number> | null;
  revisionTime?: string | number | Array<number> | null;
}

export interface DictQuery {
  pageIndex: number;
  pageSize: number;
  code?: string;
  desc?: string;
  type?: number;
}

export interface DictRequest {
  id?: string | number;
  code: string;
  type: number;
  structure: number;
  desc?: string;
}

/**
 * 打开字典项页时用的字典概要。来自 GET /dict/data/{code}。
 */
export interface DictMeta {
  id: string | number;
  code: string;
  type: number;
  structure?: number | null;
  desc?: string | null;
}

/**
 * 字典项。children 只在树形查询时出现。
 * allowMdf / allowDel：0 不允许，1 允许。parentId 为 0 表示根节点。
 */
export interface DictItemRecord {
  id: string | number;
  dictId: string | number;
  parentId?: string | number | null;
  val: string;
  name: string;
  desc?: string | null;
  sort?: number | string | null;
  allowMdf: number;
  allowDel: number;
  children?: DictItemRecord[] | null;
}

export interface DictItemQuery {
  pageIndex: number;
  pageSize: number;
  dictId: string;
  val?: string;
  name?: string;
  desc?: string;
}

export interface DictItemRequest {
  id?: string | number;
  dictId: string | number;
  parentId?: string | number;
  val: string;
  name: string;
  desc?: string;
  sort?: number;
  allowMdf: number;
  allowDel: number;
}
