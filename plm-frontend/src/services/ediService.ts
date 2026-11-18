import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  EdiPartnerItem,
  EdiPartnerQuery,
  EdiPartnerSaveParams,
  EdiTransactionSetItem,
  EdiTransactionSetQuery,
  EdiTransactionSetSaveParams,
  EdiMessageMapItem,
  EdiMessageMapQuery,
  EdiMessageMapSaveParams,
  EdiSupplierMaterialItem,
  EdiSupplierMaterialQuery,
  EdiSupplierMaterialSaveParams,
  EdiRawMessageItem,
  EdiRawMessageQuery,
  EdiMessageReceiveParams,
  EdiCustomerDemandItem,
  EdiCustomerDemandQuery,
  EdiDemandChangeLogItem,
  EdiDemandDispatchItem,
  EdiDemandDispatchParams,
  EdiDispatchQuery,
  EdiSupplierAckItem,
  EdiAckQuery,
  EdiAckParams,
  EdiAsnItem,
  EdiAsnDetail,
  EdiAsnQuery,
  EdiAsnSaveParams,
  EdiTransactionLogItem,
  EdiTransactionLogQuery,
} from '@/types/edi';

/** EDI 客户需求与供应商协同（N6） */
export const ediService = {
  /* ---------------- 伙伴与通道 ---------------- */

  partnerPage: (params: EdiPartnerQuery): Promise<PageResult<EdiPartnerItem>> =>
    request<PageResult<EdiPartnerItem>>({ method: 'GET', url: '/edi/partners', params }),

  partnerOptions: (partnerType?: string): Promise<EdiPartnerItem[]> =>
    request<EdiPartnerItem[]>({ method: 'GET', url: '/edi/partners/options', params: { partnerType } }),

  partnerDetail: (partnerId: number): Promise<EdiPartnerItem> =>
    request<EdiPartnerItem>({ method: 'GET', url: `/edi/partners/${partnerId}` }),

  partnerCreate: (data: EdiPartnerSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/edi/partners', data }),

  partnerUpdate: (partnerId: number, data: EdiPartnerSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/edi/partners/${partnerId}`, data }),

  partnerRemove: (partnerId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/edi/partners/${partnerId}` }),

  /* ---------------- 交易集配置 ---------------- */

  transSetPage: (params: EdiTransactionSetQuery): Promise<PageResult<EdiTransactionSetItem>> =>
    request<PageResult<EdiTransactionSetItem>>({ method: 'GET', url: '/edi/transaction-sets', params }),

  transSetDetail: (transSetId: number): Promise<EdiTransactionSetItem> =>
    request<EdiTransactionSetItem>({ method: 'GET', url: `/edi/transaction-sets/${transSetId}` }),

  transSetCreate: (data: EdiTransactionSetSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/edi/transaction-sets', data }),

  transSetUpdate: (transSetId: number, data: EdiTransactionSetSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/edi/transaction-sets/${transSetId}`, data }),

  transSetRemove: (transSetId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/edi/transaction-sets/${transSetId}` }),

  /* ---------------- 报文映射 ---------------- */

  messageMapPage: (params: EdiMessageMapQuery): Promise<PageResult<EdiMessageMapItem>> =>
    request<PageResult<EdiMessageMapItem>>({ method: 'GET', url: '/edi/message-maps', params }),

  messageMapByTrans: (partnerCode: string | undefined, transCode: string, direction = 'INBOUND'): Promise<EdiMessageMapItem[]> =>
    request<EdiMessageMapItem[]>({ method: 'GET', url: '/edi/message-maps/by-trans', params: { partnerCode, transCode, direction } }),

  messageMapDetail: (mapId: number): Promise<EdiMessageMapItem> =>
    request<EdiMessageMapItem>({ method: 'GET', url: `/edi/message-maps/${mapId}` }),

  messageMapCreate: (data: EdiMessageMapSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/edi/message-maps', data }),

  messageMapUpdate: (mapId: number, data: EdiMessageMapSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/edi/message-maps/${mapId}`, data }),

  messageMapRemove: (mapId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/edi/message-maps/${mapId}` }),

  /* ---------------- 供应商供货关系 ---------------- */

  supplierMaterialPage: (params: EdiSupplierMaterialQuery): Promise<PageResult<EdiSupplierMaterialItem>> =>
    request<PageResult<EdiSupplierMaterialItem>>({ method: 'GET', url: '/edi/supplier-materials', params }),

  supplierMaterialByMaterial: (materialCode: string): Promise<EdiSupplierMaterialItem[]> =>
    request<EdiSupplierMaterialItem[]>({ method: 'GET', url: '/edi/supplier-materials/by-material', params: { materialCode } }),

  supplierMaterialDetail: (supplierMaterialId: number): Promise<EdiSupplierMaterialItem> =>
    request<EdiSupplierMaterialItem>({ method: 'GET', url: `/edi/supplier-materials/${supplierMaterialId}` }),

  supplierMaterialCreate: (data: EdiSupplierMaterialSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/edi/supplier-materials', data }),

  supplierMaterialUpdate: (supplierMaterialId: number, data: EdiSupplierMaterialSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/edi/supplier-materials/${supplierMaterialId}`, data }),

  supplierMaterialRemove: (supplierMaterialId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/edi/supplier-materials/${supplierMaterialId}` }),

  /* ---------------- 原始报文与监控台 ---------------- */

  rawMessagePage: (params: EdiRawMessageQuery): Promise<PageResult<EdiRawMessageItem>> =>
    request<PageResult<EdiRawMessageItem>>({ method: 'GET', url: '/edi/raw-messages', params }),

  rawMessageDetail: (messageNo: string): Promise<EdiRawMessageItem> =>
    request<EdiRawMessageItem>({ method: 'GET', url: `/edi/raw-messages/${encodeURIComponent(messageNo)}` }),

  rawMessageReceive: (data: EdiMessageReceiveParams): Promise<EdiRawMessageItem> =>
    request<EdiRawMessageItem>({ method: 'POST', url: '/edi/raw-messages/receive', data }),

  rawMessageParse: (messageNo: string): Promise<EdiRawMessageItem> =>
    request<EdiRawMessageItem>({ method: 'POST', url: `/edi/raw-messages/${encodeURIComponent(messageNo)}/parse` }),

  rawMessageRetry: (messageNo: string): Promise<EdiRawMessageItem> =>
    request<EdiRawMessageItem>({ method: 'POST', url: `/edi/raw-messages/${encodeURIComponent(messageNo)}/retry` }),

  rawMessageReplay: (messageNo: string): Promise<EdiRawMessageItem> =>
    request<EdiRawMessageItem>({ method: 'POST', url: `/edi/raw-messages/${encodeURIComponent(messageNo)}/replay` }),

  /* ---------------- 客户需求 ---------------- */

  demandPage: (params: EdiCustomerDemandQuery): Promise<PageResult<EdiCustomerDemandItem>> =>
    request<PageResult<EdiCustomerDemandItem>>({ method: 'GET', url: '/edi/demands', params }),

  demandDetail: (demandNo: string): Promise<EdiCustomerDemandItem> =>
    request<EdiCustomerDemandItem>({ method: 'GET', url: `/edi/demands/${encodeURIComponent(demandNo)}` }),

  demandChanges: (demandNo: string): Promise<EdiDemandChangeLogItem[]> =>
    request<EdiDemandChangeLogItem[]>({ method: 'GET', url: `/edi/demands/${encodeURIComponent(demandNo)}/changes` }),

  demandDispatch: (demandNo: string, data: EdiDemandDispatchParams): Promise<EdiDemandDispatchItem[]> =>
    request<EdiDemandDispatchItem[]>({ method: 'POST', url: `/edi/demands/${encodeURIComponent(demandNo)}/dispatch`, data }),

  /* ---------------- 供应商分发 ---------------- */

  dispatchPage: (params: EdiDispatchQuery): Promise<PageResult<EdiDemandDispatchItem>> =>
    request<PageResult<EdiDemandDispatchItem>>({ method: 'GET', url: '/edi/dispatches', params }),

  dispatchDetail: (dispatchNo: string): Promise<EdiDemandDispatchItem> =>
    request<EdiDemandDispatchItem>({ method: 'GET', url: `/edi/dispatches/${encodeURIComponent(dispatchNo)}` }),

  dispatchByDemand: (demandNo: string): Promise<EdiDemandDispatchItem[]> =>
    request<EdiDemandDispatchItem[]>({ method: 'GET', url: `/edi/dispatches/by-demand/${encodeURIComponent(demandNo)}` }),

  dispatchSend: (dispatchNo: string): Promise<void> =>
    request<void>({ method: 'POST', url: `/edi/dispatches/${encodeURIComponent(dispatchNo)}/send` }),

  /* ---------------- 供应商回执 ---------------- */

  ackPage: (params: EdiAckQuery): Promise<PageResult<EdiSupplierAckItem>> =>
    request<PageResult<EdiSupplierAckItem>>({ method: 'GET', url: '/edi/supplier-acks', params }),

  ackDetail: (ackNo: string): Promise<EdiSupplierAckItem> =>
    request<EdiSupplierAckItem>({ method: 'GET', url: `/edi/supplier-acks/${encodeURIComponent(ackNo)}` }),

  ackByDispatch: (dispatchNo: string): Promise<EdiSupplierAckItem[]> =>
    request<EdiSupplierAckItem[]>({ method: 'GET', url: `/edi/supplier-acks/by-dispatch/${encodeURIComponent(dispatchNo)}` }),

  ackCreate: (data: EdiAckParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/edi/supplier-acks', data }),

  /* ---------------- ASN 交付 ---------------- */

  asnPage: (params: EdiAsnQuery): Promise<PageResult<EdiAsnItem>> =>
    request<PageResult<EdiAsnItem>>({ method: 'GET', url: '/edi/asns', params }),

  asnDetail: (asnNo: string): Promise<EdiAsnDetail> =>
    request<EdiAsnDetail>({ method: 'GET', url: `/edi/asns/${encodeURIComponent(asnNo)}` }),

  asnByDemand: (demandNo: string): Promise<EdiAsnItem[]> =>
    request<EdiAsnItem[]>({ method: 'GET', url: `/edi/asns/by-demand/${encodeURIComponent(demandNo)}` }),

  asnCreate: (data: EdiAsnSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/edi/asns', data }),

  asnUpdate: (asnNo: string, data: EdiAsnSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/edi/asns/${encodeURIComponent(asnNo)}`, data }),

  asnSend: (asnNo: string): Promise<void> =>
    request<void>({ method: 'POST', url: `/edi/asns/${encodeURIComponent(asnNo)}/send` }),

  asnCancel: (asnNo: string): Promise<void> =>
    request<void>({ method: 'POST', url: `/edi/asns/${encodeURIComponent(asnNo)}/cancel` }),

  /* ---------------- 交易日志 ---------------- */

  logPage: (params: EdiTransactionLogQuery): Promise<PageResult<EdiTransactionLogItem>> =>
    request<PageResult<EdiTransactionLogItem>>({ method: 'GET', url: '/edi/logs', params }),

  logByMessage: (messageNo: string): Promise<EdiTransactionLogItem[]> =>
    request<EdiTransactionLogItem[]>({ method: 'GET', url: `/edi/logs/by-message/${encodeURIComponent(messageNo)}` }),
};
