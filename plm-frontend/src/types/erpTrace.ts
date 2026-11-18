import type { PageQuery } from '@/types/common';

/** G3-N7a ERP 业务单据追踪（T029，后端 Base: /erp/trace）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 单据追溯分页查询条件。keyword 匹配 traceNo/docNo/docTitle/sourceDocNo。 */
export interface ErpDocTrackQuery extends PageQuery {
  docType?: string;
  bizStatus?: string;
  approvalStatus?: string;
}

/** 业务事件分页查询条件。keyword 匹配 traceNo/eventName/operatorName。 */
export interface ErpDocTrackEventQuery extends PageQuery {
  traceNo?: string;
  eventType?: string;
  eventStatus?: string;
}

/* ---------------- 1. 单据追溯 ---------------- */

export interface ErpDocTrack {
  id?: number;
  traceNo?: string;
  docType: string;
  docNo: string;
  docTitle?: string;
  sourceDocType?: string;
  sourceDocNo?: string;
  targetDocType?: string;
  targetDocNo?: string;
  trackLevel?: number | null;
  bizStatus?: string;
  approvalStatus?: string;
  approvalInstanceNo?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpDocTrackSaveRequest = Omit<
  ErpDocTrack,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 业务事件 ---------------- */

export interface ErpDocTrackEvent {
  id?: number;
  traceNo?: string;
  lineNo?: number | null;
  eventType?: string;
  eventName?: string;
  eventTime?: string;
  operatorName?: string;
  eventStatus?: string;
  eventDetail?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpDocTrackEventSaveRequest = Omit<
  ErpDocTrackEvent,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 单据类型：SALES_ORDER/PURCHASE_ORDER/PRODUCTION_ORDER/OUTSOURCE_ORDER/DELIVERY/INVENTORY/FINANCE/OTHER。 */
export const ERP_DOC_TRACK_TYPE_OPTIONS = [
  { label: '销售订单', value: 'SALES_ORDER' },
  { label: '采购订单', value: 'PURCHASE_ORDER' },
  { label: '生产订单', value: 'PRODUCTION_ORDER' },
  { label: '委外订单', value: 'OUTSOURCE_ORDER' },
  { label: '发货单', value: 'DELIVERY' },
  { label: '库存单据', value: 'INVENTORY' },
  { label: '财务单据', value: 'FINANCE' },
  { label: '其他', value: 'OTHER' },
] as const;
export const ERP_DOC_TRACK_TYPE_LABEL: Record<string, string> = {
  SALES_ORDER: '销售订单',
  PURCHASE_ORDER: '采购订单',
  PRODUCTION_ORDER: '生产订单',
  OUTSOURCE_ORDER: '委外订单',
  DELIVERY: '发货单',
  INVENTORY: '库存单据',
  FINANCE: '财务单据',
  OTHER: '其他',
};

/** 业务状态：OPEN/PROCESSING/COMPLETED/CLOSED/CANCELLED。 */
export const ERP_DOC_TRACK_BIZ_STATUS_OPTIONS = [
  { label: '未开始', value: 'OPEN' },
  { label: '进行中', value: 'PROCESSING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已关闭', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const ERP_DOC_TRACK_BIZ_STATUS_LABEL: Record<string, string> = {
  OPEN: '未开始',
  PROCESSING: '进行中',
  COMPLETED: '已完成',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

/** 审批状态：NONE/PENDING/APPROVED/REJECTED。 */
export const ERP_DOC_APPROVAL_STATUS_OPTIONS = [
  { label: '无需审批', value: 'NONE' },
  { label: '审批中', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
] as const;
export const ERP_DOC_APPROVAL_STATUS_LABEL: Record<string, string> = {
  NONE: '无需审批',
  PENDING: '审批中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
};

/** 事件类型：CREATE/SUBMIT/APPROVE/REJECT/STATUS_CHANGE/PRINT/SCAN/CLOSE/OTHER。 */
export const ERP_DOC_EVENT_TYPE_OPTIONS = [
  { label: '创建', value: 'CREATE' },
  { label: '提交', value: 'SUBMIT' },
  { label: '审批通过', value: 'APPROVE' },
  { label: '审批驳回', value: 'REJECT' },
  { label: '状态变更', value: 'STATUS_CHANGE' },
  { label: '打印', value: 'PRINT' },
  { label: '扫码', value: 'SCAN' },
  { label: '关闭', value: 'CLOSE' },
  { label: '其他', value: 'OTHER' },
] as const;
export const ERP_DOC_EVENT_TYPE_LABEL: Record<string, string> = {
  CREATE: '创建',
  SUBMIT: '提交',
  APPROVE: '审批通过',
  REJECT: '审批驳回',
  STATUS_CHANGE: '状态变更',
  PRINT: '打印',
  SCAN: '扫码',
  CLOSE: '关闭',
  OTHER: '其他',
};

/** 事件状态：DONE/PENDING/FAILED。 */
export const ERP_DOC_EVENT_STATUS_OPTIONS = [
  { label: '已完成', value: 'DONE' },
  { label: '处理中', value: 'PENDING' },
  { label: '失败', value: 'FAILED' },
] as const;
export const ERP_DOC_EVENT_STATUS_LABEL: Record<string, string> = {
  DONE: '已完成',
  PENDING: '处理中',
  FAILED: '失败',
};
