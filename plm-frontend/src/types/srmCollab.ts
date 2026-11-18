import type { PageQuery } from '@/types/common';

/** G4-N3 SRM 采购协同（T033，后端 Base: /srm）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 订单确认分页查询条件。keyword 匹配 confirmNo/poNo/supplierCode/supplierName/materialCode。 */
export interface SrmPoConfirmationQuery extends PageQuery {
  confirmStatus?: string;
  supplierCode?: string;
  poNo?: string;
}

/** 交期承诺分页查询条件。keyword 匹配 commitmentNo/poNo/supplierCode/supplierName/materialCode。 */
export interface SrmDeliveryCommitmentQuery extends PageQuery {
  commitmentStatus?: string;
  supplierCode?: string;
  poNo?: string;
}

/** 变更确认分页查询条件。keyword 匹配 changeNo/poNo/supplierCode/supplierName/materialCode。 */
export interface SrmPoChangeQuery extends PageQuery {
  changeType?: string;
  changeStatus?: string;
  supplierCode?: string;
  poNo?: string;
}

/** 送货预约分页查询条件。keyword 匹配 appointmentNo/poNo/supplierCode/supplierName/vehicleNo。 */
export interface SrmDeliveryAppointmentQuery extends PageQuery {
  appointmentStatus?: string;
  supplierCode?: string;
  poNo?: string;
}

/** ASN 发货通知分页查询条件。keyword 匹配 asnNo/appointmentNo/poNo/supplierCode/supplierName/trackingNo。 */
export interface SrmAsnQuery extends PageQuery {
  asnStatus?: string;
  supplierCode?: string;
  poNo?: string;
}

/* ---------------- 1. 订单确认 ---------------- */

export interface SrmPoConfirmation {
  id?: number;
  confirmNo?: string;
  poNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  poQty?: number | null;
  unit?: string;
  unitPrice?: number | null;
  totalAmount?: number | null;
  currency?: string;
  poDate?: string;
  requireDate?: string;
  confirmBy?: string;
  confirmDate?: string;
  confirmStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmPoConfirmationSaveRequest = Omit<
  SrmPoConfirmation,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 交期承诺 ---------------- */

export interface SrmDeliveryCommitment {
  id?: number;
  commitmentNo?: string;
  confirmNo?: string;
  poNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  commitmentQty?: number | null;
  unit?: string;
  requireDate?: string;
  promiseDate?: string;
  delayDays?: number | null;
  delayReason?: string;
  commitBy?: string;
  commitDate?: string;
  commitmentStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmDeliveryCommitmentSaveRequest = Omit<
  SrmDeliveryCommitment,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 变更确认 ---------------- */

export interface SrmPoChange {
  id?: number;
  changeNo?: string;
  poNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  changeType?: string;
  beforeQty?: number | null;
  afterQty?: number | null;
  beforeDate?: string;
  afterDate?: string;
  beforePrice?: number | null;
  afterPrice?: number | null;
  changeReason?: string;
  applyBy?: string;
  applyDate?: string;
  confirmBy?: string;
  confirmDate?: string;
  changeStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmPoChangeSaveRequest = Omit<
  SrmPoChange,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 送货预约 ---------------- */

export interface SrmDeliveryAppointment {
  id?: number;
  appointmentNo?: string;
  poNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  appointQty?: number | null;
  unit?: string;
  deliveryDate?: string;
  timeSlot?: string;
  warehouseCode?: string;
  warehouseName?: string;
  vehicleNo?: string;
  driver?: string;
  driverPhone?: string;
  appointBy?: string;
  appointDate?: string;
  appointmentStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmDeliveryAppointmentSaveRequest = Omit<
  SrmDeliveryAppointment,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. ASN 发货通知 ---------------- */

export interface SrmAsn {
  id?: number;
  asnNo?: string;
  appointmentNo?: string;
  poNo?: string;
  supplierCode?: string;
  supplierName?: string;
  materialCode?: string;
  materialName?: string;
  spec?: string;
  shipQty?: number | null;
  unit?: string;
  shipDate?: string;
  arriveDate?: string;
  carrier?: string;
  trackingNo?: string;
  vehicleNo?: string;
  packageCount?: number | null;
  asnBy?: string;
  asnDate?: string;
  asnStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmAsnSaveRequest = Omit<
  SrmAsn,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 订单确认状态：PENDING/CONFIRMED/REJECTED/CANCELLED。 */
export const SRM_PO_CONFIRM_STATUS_OPTIONS = [
  { label: '待确认', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_PO_CONFIRM_STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  REJECTED: '已拒绝',
  CANCELLED: '已取消',
};

/** 交期承诺状态：PENDING/COMMITTED/DELAYED/CANCELLED。 */
export const SRM_COMMITMENT_STATUS_OPTIONS = [
  { label: '待承诺', value: 'PENDING' },
  { label: '已承诺', value: 'COMMITTED' },
  { label: '延期承诺', value: 'DELAYED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_COMMITMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待承诺',
  COMMITTED: '已承诺',
  DELAYED: '延期承诺',
  CANCELLED: '已取消',
};

/** 变更类型：QTY/DATE/PRICE/CANCEL。 */
export const SRM_PO_CHANGE_TYPE_OPTIONS = [
  { label: '数量变更', value: 'QTY' },
  { label: '交期变更', value: 'DATE' },
  { label: '价格变更', value: 'PRICE' },
  { label: '取消订单', value: 'CANCEL' },
] as const;
export const SRM_PO_CHANGE_TYPE_LABEL: Record<string, string> = {
  QTY: '数量变更',
  DATE: '交期变更',
  PRICE: '价格变更',
  CANCEL: '取消订单',
};

/** 变更确认状态：PENDING/CONFIRMED/REJECTED/CANCELLED。 */
export const SRM_PO_CHANGE_STATUS_OPTIONS = [
  { label: '待确认', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_PO_CHANGE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  REJECTED: '已拒绝',
  CANCELLED: '已取消',
};

/** 送货预约状态：PENDING/APPROVED/CONFIRMED/ARRIVED/CANCELLED。 */
export const SRM_APPOINTMENT_STATUS_OPTIONS = [
  { label: '待审核', value: 'PENDING' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已到货', value: 'ARRIVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已批准',
  CONFIRMED: '已确认',
  ARRIVED: '已到货',
  CANCELLED: '已取消',
};

/** ASN 发货状态：DRAFT/SHIPPED/IN_TRANSIT/ARRIVED/RECEIVED/CANCELLED。 */
export const SRM_ASN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '在途', value: 'IN_TRANSIT' },
  { label: '已到达', value: 'ARRIVED' },
  { label: '已收货', value: 'RECEIVED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_ASN_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SHIPPED: '已发货',
  IN_TRANSIT: '在途',
  ARRIVED: '已到达',
  RECEIVED: '已收货',
  CANCELLED: '已取消',
};
