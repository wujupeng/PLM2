import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  FileArchiveItem,
  FileArchiveSaveParams,
  FileArchiveStats,
  FileAttachmentItem,
  FileAttachmentSaveParams,
  FileAttachmentStats,
  FilePreviewTaskItem,
  FilePreviewTaskSaveParams,
  FilePreviewTaskStats,
  FileQueryParams,
  FileScanRecordItem,
  FileScanRecordSaveParams,
  FileScanRecordStats,
  FileVersionItem,
  FileVersionSaveParams,
  FileVersionStats,
} from '@/types/file';

/** G1-N3 公共平台底座—统一文件服务（后端 WBS T011）服务定义。 */

const BASE = '/platform/file';

/* ---------------- 1. 统一附件 ---------------- */

export const fileAttachmentService = {
  page: (params: FileQueryParams): Promise<PageResult<FileAttachmentItem>> =>
    request<PageResult<FileAttachmentItem>>({ method: 'GET', url: `${BASE}/attachments`, params }),

  stats: (): Promise<FileAttachmentStats> =>
    request<FileAttachmentStats>({ method: 'GET', url: `${BASE}/attachments/stats` }),

  detail: (id: number): Promise<FileAttachmentItem> =>
    request<FileAttachmentItem>({ method: 'GET', url: `${BASE}/attachments/${id}` }),

  create: (data: FileAttachmentSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/attachments`, data }),

  update: (id: number, data: FileAttachmentSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/attachments/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/attachments/${id}` }),

  quarantine: (id: number): Promise<FileAttachmentItem> =>
    request<FileAttachmentItem>({ method: 'POST', url: `${BASE}/attachments/${id}/quarantine` }),

  release: (id: number): Promise<FileAttachmentItem> =>
    request<FileAttachmentItem>({ method: 'POST', url: `${BASE}/attachments/${id}/release` }),

  archive: (id: number): Promise<FileAttachmentItem> =>
    request<FileAttachmentItem>({ method: 'POST', url: `${BASE}/attachments/${id}/archive` }),
};

/* ---------------- 2. 文件版本 ---------------- */

export const fileVersionService = {
  page: (params: FileQueryParams): Promise<PageResult<FileVersionItem>> =>
    request<PageResult<FileVersionItem>>({ method: 'GET', url: `${BASE}/versions`, params }),

  stats: (): Promise<FileVersionStats> => request<FileVersionStats>({ method: 'GET', url: `${BASE}/versions/stats` }),

  detail: (id: number): Promise<FileVersionItem> =>
    request<FileVersionItem>({ method: 'GET', url: `${BASE}/versions/${id}` }),

  create: (data: FileVersionSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/versions`, data }),

  update: (id: number, data: FileVersionSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/versions/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/versions/${id}` }),

  setCurrent: (id: number): Promise<FileVersionItem> =>
    request<FileVersionItem>({ method: 'POST', url: `${BASE}/versions/${id}/current` }),
};

/* ---------------- 3. 预览转换任务 ---------------- */

export const filePreviewTaskService = {
  page: (params: FileQueryParams): Promise<PageResult<FilePreviewTaskItem>> =>
    request<PageResult<FilePreviewTaskItem>>({ method: 'GET', url: `${BASE}/preview-tasks`, params }),

  stats: (): Promise<FilePreviewTaskStats> =>
    request<FilePreviewTaskStats>({ method: 'GET', url: `${BASE}/preview-tasks/stats` }),

  detail: (id: number): Promise<FilePreviewTaskItem> =>
    request<FilePreviewTaskItem>({ method: 'GET', url: `${BASE}/preview-tasks/${id}` }),

  create: (data: FilePreviewTaskSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/preview-tasks`, data }),

  update: (id: number, data: FilePreviewTaskSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/preview-tasks/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/preview-tasks/${id}` }),

  start: (id: number): Promise<FilePreviewTaskItem> =>
    request<FilePreviewTaskItem>({ method: 'POST', url: `${BASE}/preview-tasks/${id}/start` }),

  complete: (id: number): Promise<FilePreviewTaskItem> =>
    request<FilePreviewTaskItem>({ method: 'POST', url: `${BASE}/preview-tasks/${id}/complete` }),

  fail: (id: number): Promise<FilePreviewTaskItem> =>
    request<FilePreviewTaskItem>({ method: 'POST', url: `${BASE}/preview-tasks/${id}/fail` }),
};

/* ---------------- 4. 病毒扫描记录 ---------------- */

export const fileScanRecordService = {
  page: (params: FileQueryParams): Promise<PageResult<FileScanRecordItem>> =>
    request<PageResult<FileScanRecordItem>>({ method: 'GET', url: `${BASE}/scan-records`, params }),

  stats: (): Promise<FileScanRecordStats> =>
    request<FileScanRecordStats>({ method: 'GET', url: `${BASE}/scan-records/stats` }),

  detail: (id: number): Promise<FileScanRecordItem> =>
    request<FileScanRecordItem>({ method: 'GET', url: `${BASE}/scan-records/${id}` }),

  create: (data: FileScanRecordSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/scan-records`, data }),

  update: (id: number, data: FileScanRecordSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/scan-records/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/scan-records/${id}` }),
};

/* ---------------- 5. 文件归档 ---------------- */

export const fileArchiveService = {
  page: (params: FileQueryParams): Promise<PageResult<FileArchiveItem>> =>
    request<PageResult<FileArchiveItem>>({ method: 'GET', url: `${BASE}/archives`, params }),

  stats: (): Promise<FileArchiveStats> => request<FileArchiveStats>({ method: 'GET', url: `${BASE}/archives/stats` }),

  detail: (id: number): Promise<FileArchiveItem> =>
    request<FileArchiveItem>({ method: 'GET', url: `${BASE}/archives/${id}` }),

  create: (data: FileArchiveSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/archives`, data }),

  update: (id: number, data: FileArchiveSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/archives/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/archives/${id}` }),

  archive: (id: number): Promise<FileArchiveItem> =>
    request<FileArchiveItem>({ method: 'POST', url: `${BASE}/archives/${id}/archive` }),

  restore: (id: number): Promise<FileArchiveItem> =>
    request<FileArchiveItem>({ method: 'POST', url: `${BASE}/archives/${id}/restore` }),

  expire: (id: number): Promise<FileArchiveItem> =>
    request<FileArchiveItem>({ method: 'POST', url: `${BASE}/archives/${id}/expire` }),
};
