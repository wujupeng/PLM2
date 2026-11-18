import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  WmsStorageLocationItem,
  WmsLocationQuery,
  WmsLocationSaveParams,
  WmsMaterialBatchItem,
  WmsBatchQuery,
  WmsBatchSaveParams,
  WmsFifoRuleItem,
  WmsFifoRuleQuery,
  WmsFifoRuleSaveParams,
  WmsMaterialBindingItem,
  WmsBindingQuery,
  WmsBindingSaveParams,
  WmsKanbanItem,
  WmsKanbanQuery,
  WmsKanbanSaveParams,
  WmsKanbanPullParams,
  WmsDeliveryTaskItem,
  WmsDeliveryQuery,
  WmsDeliveryCreateParams,
  WmsDeliveryExecuteParams,
  WmsPickRecordItem,
  WmsPickQuery,
  WmsPickVerifyParams,
  WmsLineSideStockItem,
  WmsLineStockQuery,
  WmsLineStockSaveParams,
  WmsLineStockTxnParams,
  WmsInventoryTxnItem,
  WmsInventoryTxnQuery,
  WmsShortageWarningItem,
  WmsWarningQuery,
  WmsShortageCalcParams,
  WmsShortageCaseItem,
  WmsShortageActionItem,
  WmsShortageCaseQuery,
  WmsShortageCaseCreateParams,
  WmsShortageCaseUpdateParams,
  WmsShortageCaseCloseParams,
  WmsShortageCaseActionParams,
  WmsContingencyPlanItem,
  WmsPlanQuery,
  WmsPlanSaveParams,
  WmsPlanApproveParams,
} from '@/types/wms';

/** 物料供应、Kanban、FIFO 与缺料管理（N7） */
export const wmsService = {
  /* ---------------- 库位货架与物料标识 ---------------- */

  locationPage: (params: WmsLocationQuery): Promise<PageResult<WmsStorageLocationItem>> =>
    request<PageResult<WmsStorageLocationItem>>({ method: 'GET', url: '/wms/locations', params }),

  locationOptions: (locationType?: string): Promise<WmsStorageLocationItem[]> =>
    request<WmsStorageLocationItem[]>({ method: 'GET', url: '/wms/locations/options', params: { locationType } }),

  locationDetail: (id: number): Promise<WmsStorageLocationItem> =>
    request<WmsStorageLocationItem>({ method: 'GET', url: `/wms/locations/${id}` }),

  locationCreate: (data: WmsLocationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/locations', data }),

  locationUpdate: (id: number, data: WmsLocationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/locations/${id}`, data }),

  locationRemove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/wms/locations/${id}` }),

  batchPage: (params: WmsBatchQuery): Promise<PageResult<WmsMaterialBatchItem>> =>
    request<PageResult<WmsMaterialBatchItem>>({ method: 'GET', url: '/wms/batches', params }),

  batchByMaterial: (materialCode: string): Promise<WmsMaterialBatchItem[]> =>
    request<WmsMaterialBatchItem[]>({ method: 'GET', url: '/wms/batches/by-material', params: { materialCode } }),

  batchFifo: (materialCode: string, locationCode?: string): Promise<WmsMaterialBatchItem[]> =>
    request<WmsMaterialBatchItem[]>({ method: 'GET', url: '/wms/batches/fifo', params: { materialCode, locationCode } }),

  batchDetail: (id: number): Promise<WmsMaterialBatchItem> =>
    request<WmsMaterialBatchItem>({ method: 'GET', url: `/wms/batches/${id}` }),

  batchCreate: (data: WmsBatchSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/batches', data }),

  batchUpdate: (id: number, data: WmsBatchSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/batches/${id}`, data }),

  batchRemove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/wms/batches/${id}` }),

  /* ---------------- FIFO 规则 ---------------- */

  fifoRulePage: (params: WmsFifoRuleQuery): Promise<PageResult<WmsFifoRuleItem>> =>
    request<PageResult<WmsFifoRuleItem>>({ method: 'GET', url: '/wms/fifo-rules', params }),

  fifoRuleActive: (): Promise<WmsFifoRuleItem[]> =>
    request<WmsFifoRuleItem[]>({ method: 'GET', url: '/wms/fifo-rules/active' }),

  fifoRuleDetail: (id: number): Promise<WmsFifoRuleItem> =>
    request<WmsFifoRuleItem>({ method: 'GET', url: `/wms/fifo-rules/${id}` }),

  fifoRuleCreate: (data: WmsFifoRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/fifo-rules', data }),

  fifoRuleUpdate: (id: number, data: WmsFifoRuleSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/fifo-rules/${id}`, data }),

  fifoRuleRemove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/wms/fifo-rules/${id}` }),

  /* ---------------- 防混料绑定 ---------------- */

  bindingPage: (params: WmsBindingQuery): Promise<PageResult<WmsMaterialBindingItem>> =>
    request<PageResult<WmsMaterialBindingItem>>({ method: 'GET', url: '/wms/bindings', params }),

  bindingEffective: (lineCode: string, materialCode: string, workStation?: string): Promise<WmsMaterialBindingItem> =>
    request<WmsMaterialBindingItem>({ method: 'GET', url: '/wms/bindings/effective', params: { lineCode, materialCode, workStation } }),

  bindingDetail: (id: number): Promise<WmsMaterialBindingItem> =>
    request<WmsMaterialBindingItem>({ method: 'GET', url: `/wms/bindings/${id}` }),

  bindingCreate: (data: WmsBindingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/bindings', data }),

  bindingUpdate: (id: number, data: WmsBindingSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/bindings/${id}`, data }),

  bindingRemove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/wms/bindings/${id}` }),

  /* ---------------- 电子看板 ---------------- */

  kanbanPage: (params: WmsKanbanQuery): Promise<PageResult<WmsKanbanItem>> =>
    request<PageResult<WmsKanbanItem>>({ method: 'GET', url: '/wms/kanbans', params }),

  kanbanDetail: (kanbanNo: string): Promise<WmsKanbanItem> =>
    request<WmsKanbanItem>({ method: 'GET', url: `/wms/kanbans/${encodeURIComponent(kanbanNo)}` }),

  kanbanCreate: (data: WmsKanbanSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/kanbans', data }),

  kanbanUpdate: (kanbanNo: string, data: WmsKanbanSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/kanbans/${encodeURIComponent(kanbanNo)}`, data }),

  kanbanRemove: (kanbanNo: string): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/wms/kanbans/${encodeURIComponent(kanbanNo)}` }),

  kanbanPull: (kanbanNo: string, data: WmsKanbanPullParams): Promise<WmsDeliveryTaskItem> =>
    request<WmsDeliveryTaskItem>({ method: 'POST', url: `/wms/kanbans/${encodeURIComponent(kanbanNo)}/pull`, data }),

  /* ---------------- 物料配送 ---------------- */

  deliveryPage: (params: WmsDeliveryQuery): Promise<PageResult<WmsDeliveryTaskItem>> =>
    request<PageResult<WmsDeliveryTaskItem>>({ method: 'GET', url: '/wms/deliveries', params }),

  deliveryDetail: (taskNo: string): Promise<WmsDeliveryTaskItem> =>
    request<WmsDeliveryTaskItem>({ method: 'GET', url: `/wms/deliveries/${encodeURIComponent(taskNo)}` }),

  deliveryCreate: (data: WmsDeliveryCreateParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/deliveries', data }),

  deliveryAccept: (taskNo: string, data: WmsDeliveryExecuteParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/deliveries/${encodeURIComponent(taskNo)}/accept`, data }),

  deliveryDeliver: (taskNo: string, data: WmsDeliveryExecuteParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/deliveries/${encodeURIComponent(taskNo)}/deliver`, data }),

  deliverySign: (taskNo: string, data: WmsDeliveryExecuteParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/deliveries/${encodeURIComponent(taskNo)}/sign`, data }),

  deliveryCancel: (taskNo: string, data: WmsDeliveryExecuteParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/deliveries/${encodeURIComponent(taskNo)}/cancel`, data }),

  /* ---------------- 扫码领料 ---------------- */

  pickPage: (params: WmsPickQuery): Promise<PageResult<WmsPickRecordItem>> =>
    request<PageResult<WmsPickRecordItem>>({ method: 'GET', url: '/wms/picks', params }),

  pickDetail: (pickNo: string): Promise<WmsPickRecordItem> =>
    request<WmsPickRecordItem>({ method: 'GET', url: `/wms/picks/${encodeURIComponent(pickNo)}` }),

  pickVerify: (data: WmsPickVerifyParams): Promise<WmsPickRecordItem> =>
    request<WmsPickRecordItem>({ method: 'POST', url: '/wms/picks/verify', data }),

  /* ---------------- 线边库存与流水 ---------------- */

  lineStockPage: (params: WmsLineStockQuery): Promise<PageResult<WmsLineSideStockItem>> =>
    request<PageResult<WmsLineSideStockItem>>({ method: 'GET', url: '/wms/line-stocks', params }),

  lineStockByLine: (lineCode: string): Promise<WmsLineSideStockItem[]> =>
    request<WmsLineSideStockItem[]>({ method: 'GET', url: '/wms/line-stocks/by-line', params: { lineCode } }),

  lineStockDetail: (id: number): Promise<WmsLineSideStockItem> =>
    request<WmsLineSideStockItem>({ method: 'GET', url: `/wms/line-stocks/${id}` }),

  lineStockCreate: (data: WmsLineStockSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/line-stocks', data }),

  lineStockUpdate: (id: number, data: WmsLineStockSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/line-stocks/${id}`, data }),

  lineStockRemove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/wms/line-stocks/${id}` }),

  lineStockIssue: (id: number, data: WmsLineStockTxnParams): Promise<WmsLineSideStockItem> =>
    request<WmsLineSideStockItem>({ method: 'POST', url: `/wms/line-stocks/${id}/issue`, data }),

  lineStockConsume: (id: number, data: WmsLineStockTxnParams): Promise<WmsLineSideStockItem> =>
    request<WmsLineSideStockItem>({ method: 'POST', url: `/wms/line-stocks/${id}/consume`, data }),

  lineStockReturn: (id: number, data: WmsLineStockTxnParams): Promise<WmsLineSideStockItem> =>
    request<WmsLineSideStockItem>({ method: 'POST', url: `/wms/line-stocks/${id}/return`, data }),

  lineStockScrap: (id: number, data: WmsLineStockTxnParams): Promise<WmsLineSideStockItem> =>
    request<WmsLineSideStockItem>({ method: 'POST', url: `/wms/line-stocks/${id}/scrap`, data }),

  lineStockAdjust: (id: number, data: WmsLineStockTxnParams): Promise<WmsLineSideStockItem> =>
    request<WmsLineSideStockItem>({ method: 'POST', url: `/wms/line-stocks/${id}/adjust`, data }),

  txnPage: (params: WmsInventoryTxnQuery): Promise<PageResult<WmsInventoryTxnItem>> =>
    request<PageResult<WmsInventoryTxnItem>>({ method: 'GET', url: '/wms/inventory-txns', params }),

  /* ---------------- 缺料预警 ---------------- */

  warningPage: (params: WmsWarningQuery): Promise<PageResult<WmsShortageWarningItem>> =>
    request<PageResult<WmsShortageWarningItem>>({ method: 'GET', url: '/wms/shortages/warnings', params }),

  warningDetail: (warningNo: string): Promise<WmsShortageWarningItem> =>
    request<WmsShortageWarningItem>({ method: 'GET', url: `/wms/shortages/warnings/${encodeURIComponent(warningNo)}` }),

  warningCalculate: (data: WmsShortageCalcParams): Promise<WmsShortageWarningItem> =>
    request<WmsShortageWarningItem>({ method: 'POST', url: '/wms/shortages/warnings/calculate', data }),

  /* ---------------- 欠料异常闭环 ---------------- */

  casePage: (params: WmsShortageCaseQuery): Promise<PageResult<WmsShortageCaseItem>> =>
    request<PageResult<WmsShortageCaseItem>>({ method: 'GET', url: '/wms/shortages/cases', params }),

  caseDetail: (caseNo: string): Promise<WmsShortageCaseItem> =>
    request<WmsShortageCaseItem>({ method: 'GET', url: `/wms/shortages/cases/${encodeURIComponent(caseNo)}` }),

  caseActions: (caseNo: string): Promise<WmsShortageActionItem[]> =>
    request<WmsShortageActionItem[]>({ method: 'GET', url: `/wms/shortages/cases/${encodeURIComponent(caseNo)}/actions` }),

  caseCreate: (data: WmsShortageCaseCreateParams): Promise<string> =>
    request<string>({ method: 'POST', url: '/wms/shortages/cases', data }),

  caseUpdate: (caseNo: string, data: WmsShortageCaseUpdateParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/shortages/cases/${encodeURIComponent(caseNo)}`, data }),

  caseAddAction: (caseNo: string, data: WmsShortageCaseActionParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/shortages/cases/${encodeURIComponent(caseNo)}/actions`, data }),

  caseClose: (caseNo: string, data: WmsShortageCaseCloseParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/shortages/cases/${encodeURIComponent(caseNo)}/close`, data }),

  /* ---------------- 应急预案 ---------------- */

  planPage: (params: WmsPlanQuery): Promise<PageResult<WmsContingencyPlanItem>> =>
    request<PageResult<WmsContingencyPlanItem>>({ method: 'GET', url: '/wms/plans', params }),

  planDetail: (planNo: string): Promise<WmsContingencyPlanItem> =>
    request<WmsContingencyPlanItem>({ method: 'GET', url: `/wms/plans/${encodeURIComponent(planNo)}` }),

  planCreate: (data: WmsPlanSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/wms/plans', data }),

  planUpdate: (planNo: string, data: WmsPlanSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/wms/plans/${encodeURIComponent(planNo)}`, data }),

  planRemove: (planNo: string): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/wms/plans/${encodeURIComponent(planNo)}` }),

  planApprove: (planNo: string, data: WmsPlanApproveParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/plans/${encodeURIComponent(planNo)}/approve`, data }),

  planExecute: (planNo: string): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/plans/${encodeURIComponent(planNo)}/execute` }),

  planCancel: (planNo: string): Promise<void> =>
    request<void>({ method: 'POST', url: `/wms/plans/${encodeURIComponent(planNo)}/cancel` }),
};
