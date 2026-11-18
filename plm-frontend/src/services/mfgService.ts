import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  MfgProductionBatchItem,
  MfgBatchQuery,
  MfgBatchSaveParams,
  MfgOperationRecordItem,
  MfgOperationQuery,
  MfgOperationSaveParams,
  MfgTestResultItem,
  MfgTestQuery,
  MfgTestSaveParams,
  MfgTraceBindingItem,
  MfgTraceBindingQuery,
  MfgTraceBindingSaveParams,
  MfgPackageRuleItem,
  MfgPackageRuleQuery,
  MfgPackageRuleSaveParams,
  MfgPackageItemModel,
  MfgPackageItem,
  MfgPackageQuery,
  MfgPackageSaveParams,
  MfgPackageDetailResponse,
  MfgPackageSealParams,
  MfgPackByBatchParams,
  MfgShipmentItem,
  MfgShipmentLineItem,
  MfgShipmentQuery,
  MfgShipmentSaveParams,
  MfgShipmentDetailResponse,
  MfgShipScanLogItem,
  MfgShipScanLogQuery,
  MfgShipScanParams,
  MfgShipScanResponse,
  MfgShipReleaseParams,
  MfgTraceResponse,
  MfgForwardTraceResponse,
  MfgRecallOrderItem,
  MfgRecallImpactItem,
  MfgRecallQuery,
  MfgRecallSaveParams,
  MfgRecallDetailResponse,
  MfgRecallCloseParams,
} from '@/types/mfg';

/** 生产执行与发货追溯（N8） */
export const mfgService = {
  /* ---------- 生产批次（DEV-085） ---------- */
  batchPage: (params: MfgBatchQuery) =>
    request<PageResult<MfgProductionBatchItem>>({ method: 'GET', url: '/mfg/batches', params }),
  batchDetail: (batchNo: string) =>
    request<MfgProductionBatchItem>({ method: 'GET', url: `/mfg/batches/${batchNo}` }),
  batchCreate: (data: MfgBatchSaveParams) =>
    request<string>({ method: 'POST', url: '/mfg/batches', data }),
  batchUpdate: (batchNo: string, data: MfgBatchSaveParams) =>
    request<void>({ method: 'PUT', url: `/mfg/batches/${batchNo}`, data }),
  batchRemove: (batchNo: string) =>
    request<void>({ method: 'DELETE', url: `/mfg/batches/${batchNo}` }),

  /* ---------- 工序过站（DEV-086） ---------- */
  operationPage: (params: MfgOperationQuery) =>
    request<PageResult<MfgOperationRecordItem>>({ method: 'GET', url: '/mfg/operations', params }),
  operationDetail: (id: number) =>
    request<MfgOperationRecordItem>({ method: 'GET', url: `/mfg/operations/${id}` }),
  operationListByBatch: (batchNo: string) =>
    request<MfgOperationRecordItem[]>({ method: 'GET', url: `/mfg/operations/batch/${batchNo}` }),
  operationCreate: (data: MfgOperationSaveParams) =>
    request<number>({ method: 'POST', url: '/mfg/operations', data }),
  operationUpdate: (id: number, data: MfgOperationSaveParams) =>
    request<void>({ method: 'PUT', url: `/mfg/operations/${id}`, data }),
  operationRemove: (id: number) =>
    request<void>({ method: 'DELETE', url: `/mfg/operations/${id}` }),

  /* ---------- 测试数据（DEV-087） ---------- */
  testPage: (params: MfgTestQuery) =>
    request<PageResult<MfgTestResultItem>>({ method: 'GET', url: '/mfg/tests', params }),
  testDetail: (id: number) =>
    request<MfgTestResultItem>({ method: 'GET', url: `/mfg/tests/${id}` }),
  testListByBatch: (batchNo: string) =>
    request<MfgTestResultItem[]>({ method: 'GET', url: `/mfg/tests/batch/${batchNo}` }),
  testCreate: (data: MfgTestSaveParams) =>
    request<number>({ method: 'POST', url: '/mfg/tests', data }),
  testUpdate: (id: number, data: MfgTestSaveParams) =>
    request<void>({ method: 'PUT', url: `/mfg/tests/${id}`, data }),
  testRemove: (id: number) =>
    request<void>({ method: 'DELETE', url: `/mfg/tests/${id}` }),

  /* ---------- 追溯绑定（DEV-088） ---------- */
  bindingPage: (params: MfgTraceBindingQuery) =>
    request<PageResult<MfgTraceBindingItem>>({ method: 'GET', url: '/mfg/traces/bindings', params }),
  bindingDetail: (id: number) =>
    request<MfgTraceBindingItem>({ method: 'GET', url: `/mfg/traces/bindings/${id}` }),
  bindingCreate: (data: MfgTraceBindingSaveParams) =>
    request<number>({ method: 'POST', url: '/mfg/traces/bindings', data }),
  bindingUpdate: (id: number, data: MfgTraceBindingSaveParams) =>
    request<void>({ method: 'PUT', url: `/mfg/traces/bindings/${id}`, data }),
  bindingRemove: (id: number) =>
    request<void>({ method: 'DELETE', url: `/mfg/traces/bindings/${id}` }),

  /* ---------- 包装规则（DEV-089） ---------- */
  packageRulePage: (params: MfgPackageRuleQuery) =>
    request<PageResult<MfgPackageRuleItem>>({ method: 'GET', url: '/mfg/package-rules', params }),
  packageRuleListActive: (params?: { productCode?: string; packageLevel?: string }) =>
    request<MfgPackageRuleItem[]>({ method: 'GET', url: '/mfg/package-rules/active', params }),
  packageRuleDetail: (ruleNo: string) =>
    request<MfgPackageRuleItem>({ method: 'GET', url: `/mfg/package-rules/${ruleNo}` }),
  packageRuleCreate: (data: MfgPackageRuleSaveParams) =>
    request<string>({ method: 'POST', url: '/mfg/package-rules', data }),
  packageRuleUpdate: (ruleNo: string, data: MfgPackageRuleSaveParams) =>
    request<void>({ method: 'PUT', url: `/mfg/package-rules/${ruleNo}`, data }),
  packageRuleRemove: (ruleNo: string) =>
    request<void>({ method: 'DELETE', url: `/mfg/package-rules/${ruleNo}` }),

  /* ---------- 包装与箱码（DEV-089） ---------- */
  packagePage: (params: MfgPackageQuery) =>
    request<PageResult<MfgPackageItemModel>>({ method: 'GET', url: '/mfg/packages', params }),
  packageDetail: (packageNo: string) =>
    request<MfgPackageDetailResponse>({ method: 'GET', url: `/mfg/packages/${packageNo}` }),
  packageListItems: (packageNo: string) =>
    request<MfgPackageItem[]>({ method: 'GET', url: `/mfg/packages/${packageNo}/items` }),
  packageListByBatch: (batchNo: string) =>
    request<MfgPackageItemModel[]>({ method: 'GET', url: `/mfg/packages/batch/${batchNo}` }),
  packageCreate: (data: MfgPackageSaveParams) =>
    request<number>({ method: 'POST', url: '/mfg/packages', data }),
  packageUpdate: (packageNo: string, data: MfgPackageSaveParams) =>
    request<void>({ method: 'PUT', url: `/mfg/packages/${packageNo}`, data }),
  packagePackByBatch: (params: MfgPackByBatchParams) =>
    request<number>({ method: 'POST', url: '/mfg/packages/pack-by-batch', params }),
  packageSeal: (packageNo: string, data?: MfgPackageSealParams) =>
    request<void>({ method: 'POST', url: `/mfg/packages/${packageNo}/seal`, data }),
  packageRemove: (packageNo: string) =>
    request<void>({ method: 'DELETE', url: `/mfg/packages/${packageNo}` }),

  /* ---------- 出货与放行（DEV-090/091/092） ---------- */
  shipmentPage: (params: MfgShipmentQuery) =>
    request<PageResult<MfgShipmentItem>>({ method: 'GET', url: '/mfg/shipments', params }),
  shipmentDetail: (shipmentNo: string) =>
    request<MfgShipmentDetailResponse>({ method: 'GET', url: `/mfg/shipments/${shipmentNo}` }),
  shipmentListLines: (shipmentNo: string) =>
    request<MfgShipmentLineItem[]>({ method: 'GET', url: `/mfg/shipments/${shipmentNo}/lines` }),
  shipmentListByBatch: (batchNo: string) =>
    request<MfgShipmentItem[]>({ method: 'GET', url: `/mfg/shipments/batch/${batchNo}` }),
  shipScanLogPage: (params: MfgShipScanLogQuery) =>
    request<PageResult<MfgShipScanLogItem>>({ method: 'GET', url: '/mfg/shipments/scan-logs', params }),
  shipmentCreate: (data: MfgShipmentSaveParams) =>
    request<number>({ method: 'POST', url: '/mfg/shipments', data }),
  shipmentUpdate: (shipmentNo: string, data: MfgShipmentSaveParams) =>
    request<void>({ method: 'PUT', url: `/mfg/shipments/${shipmentNo}`, data }),
  shipmentRemove: (shipmentNo: string) =>
    request<void>({ method: 'DELETE', url: `/mfg/shipments/${shipmentNo}` }),
  shipmentScan: (shipmentNo: string, data: MfgShipScanParams) =>
    request<MfgShipScanResponse>({ method: 'POST', url: `/mfg/shipments/${shipmentNo}/scan`, data }),
  shipmentRelease: (shipmentNo: string, data?: MfgShipReleaseParams) =>
    request<MfgShipmentItem>({ method: 'POST', url: `/mfg/shipments/${shipmentNo}/release`, data }),
  shipmentCreateAsn: (shipmentNo: string) =>
    request<string>({ method: 'POST', url: `/mfg/shipments/${shipmentNo}/asn` }),
  shipmentSendAsn: (shipmentNo: string) =>
    request<MfgShipmentItem>({ method: 'POST', url: `/mfg/shipments/${shipmentNo}/asn/send` }),
  shipmentShip: (shipmentNo: string) =>
    request<MfgShipmentItem>({ method: 'POST', url: `/mfg/shipments/${shipmentNo}/ship` }),
  shipmentCancel: (shipmentNo: string) =>
    request<void>({ method: 'POST', url: `/mfg/shipments/${shipmentNo}/cancel` }),

  /* ---------- 追溯查询（DEV-093） ---------- */
  traceBackward: (params: { traceCode?: string; serialNo?: string; batchNo?: string }) =>
    request<MfgTraceResponse>({ method: 'GET', url: '/mfg/traces/backward', params }),
  traceForward: (params: { materialCode?: string; materialBatchNo?: string }) =>
    request<MfgForwardTraceResponse>({ method: 'GET', url: '/mfg/traces/forward', params }),

  /* ---------- 召回与隔离（DEV-094） ---------- */
  recallPage: (params: MfgRecallQuery) =>
    request<PageResult<MfgRecallOrderItem>>({ method: 'GET', url: '/mfg/recalls', params }),
  recallDetail: (recallNo: string) =>
    request<MfgRecallDetailResponse>({ method: 'GET', url: `/mfg/recalls/${recallNo}` }),
  recallListImpacts: (recallNo: string) =>
    request<MfgRecallImpactItem[]>({ method: 'GET', url: `/mfg/recalls/${recallNo}/impacts` }),
  recallCreate: (data: MfgRecallSaveParams) =>
    request<number>({ method: 'POST', url: '/mfg/recalls', data }),
  recallIsolate: (recallNo: string) =>
    request<MfgRecallOrderItem>({ method: 'POST', url: `/mfg/recalls/${recallNo}/isolate` }),
  recallClose: (recallNo: string, data: MfgRecallCloseParams) =>
    request<MfgRecallOrderItem>({ method: 'POST', url: `/mfg/recalls/${recallNo}/close`, data }),
  recallRemove: (recallNo: string) =>
    request<void>({ method: 'DELETE', url: `/mfg/recalls/${recallNo}` }),
};
