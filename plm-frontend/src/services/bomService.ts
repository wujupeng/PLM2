import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  BomItem,
  BomQuery,
  BomSaveParams,
  BomLineSaveParams,
  BomDetail,
  BomExpandNode,
  BomWhereUsedItem,
  BomCompareResponse,
  BomIssueItem,
  BomValidationResult,
  BomImportRequest,
  BomImportResult,
  BomImportBatchItem,
  BomBatchQuery,
  BomImportErrorItem,
  BomPublishLogItem,
} from '@/types/bom';

/** BOM 管理 */
export const bomService = {
  page: (params: BomQuery): Promise<PageResult<BomItem>> =>
    request<PageResult<BomItem>>({ method: 'GET', url: '/bom/boms', params }),

  detail: (id: number): Promise<BomDetail> =>
    request<BomDetail>({ method: 'GET', url: `/bom/boms/${id}` }),

  create: (data: BomSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/bom/boms', data }),

  update: (id: number, data: BomSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/bom/boms/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/bom/boms/${id}` }),

  addLine: (id: number, data: BomLineSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/bom/boms/${id}/lines`, data }),

  updateLine: (lineId: number, data: BomLineSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/bom/boms/lines/${lineId}`, data }),

  removeLine: (lineId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/bom/boms/lines/${lineId}` }),

  expand: (id: number, levels = 10): Promise<BomExpandNode[]> =>
    request<BomExpandNode[]>({ method: 'GET', url: `/bom/boms/${id}/expand`, params: { levels } }),

  whereUsed: (materialCode: string): Promise<BomWhereUsedItem[]> =>
    request<BomWhereUsedItem[]>({ method: 'GET', url: '/bom/boms/where-used', params: { materialCode } }),

  issues: (id: number): Promise<BomIssueItem[]> =>
    request<BomIssueItem[]>({ method: 'GET', url: `/bom/boms/${id}/issues` }),

  publishLogs: (id: number): Promise<BomPublishLogItem[]> =>
    request<BomPublishLogItem[]>({ method: 'GET', url: `/bom/boms/${id}/publish-logs` }),

  compare: (headerIdA: number, headerIdB: number): Promise<BomCompareResponse> =>
    request<BomCompareResponse>({
      method: 'GET',
      url: '/bom/boms/compare',
      params: { headerIdA, headerIdB },
    }),

  validate: (id: number): Promise<BomValidationResult> =>
    request<BomValidationResult>({ method: 'POST', url: `/bom/boms/${id}/validate` }),

  convertToMbom: (
    id: number,
    data: { targetVersionNo?: string; description?: string; remark?: string },
  ): Promise<number> =>
    request<number>({ method: 'POST', url: `/bom/boms/${id}/convert-to-mbom`, data }),

  publish: (id: number, targetSystems: string[]): Promise<BomPublishLogItem[]> =>
    request<BomPublishLogItem[]>({
      method: 'POST',
      url: `/bom/boms/${id}/publish`,
      data: { targetSystems },
    }),

  retryPublish: (logId: number): Promise<BomPublishLogItem> =>
    request<BomPublishLogItem>({ method: 'POST', url: `/bom/boms/publish-logs/${logId}/retry` }),
};

/** BOM 单阶导入 */
export const bomImportService = {
  submit: (data: BomImportRequest): Promise<BomImportResult> =>
    request<BomImportResult>({ method: 'POST', url: '/bom/imports', data }),

  batches: (params: BomBatchQuery): Promise<PageResult<BomImportBatchItem>> =>
    request<PageResult<BomImportBatchItem>>({ method: 'GET', url: '/bom/imports/batches', params }),

  batchDetail: (batchId: number): Promise<BomImportBatchItem> =>
    request<BomImportBatchItem>({ method: 'GET', url: `/bom/imports/batches/${batchId}` }),

  batchErrors: (batchId: number): Promise<BomImportErrorItem[]> =>
    request<BomImportErrorItem[]>({ method: 'GET', url: `/bom/imports/batches/${batchId}/errors` }),
};
