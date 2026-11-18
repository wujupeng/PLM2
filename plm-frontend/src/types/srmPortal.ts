import type { PageQuery } from '@/types/common';

/** G4-N5 SRM 供应商门户（T035，后端 Base: /srm/portal）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 供应商账号分页查询条件。keyword 匹配 accountNo/supplierCode/supplierName/loginName。 */
export interface SrmPortalAccountQuery extends PageQuery {
  portalRole?: string;
  accountStatus?: string;
  supplierCode?: string;
}

/** 门户消息分页查询条件。keyword 匹配 messageNo/supplierCode/supplierName/title/bizNo。 */
export interface SrmPortalMessageQuery extends PageQuery {
  messageType?: string;
  messageStatus?: string;
  supplierCode?: string;
  readFlag?: number | null;
}

/** 门户附件分页查询条件。keyword 匹配 attachmentNo/bizNo/fileName/supplierCode/supplierName。 */
export interface SrmPortalAttachmentQuery extends PageQuery {
  bizType?: string;
  attachmentStatus?: string;
  supplierCode?: string;
  bizNo?: string;
}

/* ---------------- 1. 供应商账号 ---------------- */

export interface SrmPortalAccount {
  id?: number;
  accountNo?: string;
  supplierCode?: string;
  supplierName?: string;
  loginName?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  portalRole?: string;
  collabScope?: string;
  validFrom?: string;
  validTo?: string;
  accountStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmPortalAccountSaveRequest = Omit<
  SrmPortalAccount,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 门户消息 ---------------- */

export interface SrmPortalMessage {
  id?: number;
  messageNo?: string;
  supplierCode?: string;
  supplierName?: string;
  messageType?: string;
  title?: string;
  content?: string;
  bizNo?: string;
  readFlag?: number | null;
  sender?: string;
  sendDate?: string;
  messageStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmPortalMessageSaveRequest = Omit<
  SrmPortalMessage,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 门户附件 ---------------- */

export interface SrmPortalAttachment {
  id?: number;
  attachmentNo?: string;
  bizType?: string;
  bizNo?: string;
  supplierCode?: string;
  supplierName?: string;
  fileName?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number | null;
  uploader?: string;
  uploadDate?: string;
  attachmentStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SrmPortalAttachmentSaveRequest = Omit<
  SrmPortalAttachment,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 门户账号状态：DRAFT/ACTIVE/LOCKED/EXPIRED/DISABLED。 */
export const SRM_PORTAL_ACCOUNT_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已启用', value: 'ACTIVE' },
  { label: '已锁定', value: 'LOCKED' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '已禁用', value: 'DISABLED' },
] as const;
export const SRM_PORTAL_ACCOUNT_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '已启用',
  LOCKED: '已锁定',
  EXPIRED: '已过期',
  DISABLED: '已禁用',
};

/** 门户角色：ADMIN/BUYER/QUALITY/VIEWER。 */
export const SRM_PORTAL_ROLE_OPTIONS = [
  { label: '管理员', value: 'ADMIN' },
  { label: '采购员', value: 'BUYER' },
  { label: '质量员', value: 'QUALITY' },
  { label: '只读', value: 'VIEWER' },
] as const;
export const SRM_PORTAL_ROLE_LABEL: Record<string, string> = {
  ADMIN: '管理员',
  BUYER: '采购员',
  QUALITY: '质量员',
  VIEWER: '只读',
};

/** 门户消息类型：ORDER/DELIVERY/ASN/QUALITY/ANNOUNCE。 */
export const SRM_PORTAL_MESSAGE_TYPE_OPTIONS = [
  { label: '订单协同', value: 'ORDER' },
  { label: '交期协同', value: 'DELIVERY' },
  { label: '送货协同', value: 'ASN' },
  { label: '质量协同', value: 'QUALITY' },
  { label: '系统公告', value: 'ANNOUNCE' },
] as const;
export const SRM_PORTAL_MESSAGE_TYPE_LABEL: Record<string, string> = {
  ORDER: '订单协同',
  DELIVERY: '交期协同',
  ASN: '送货协同',
  QUALITY: '质量协同',
  ANNOUNCE: '系统公告',
};

/** 门户消息状态：DRAFT/SENT/READ/CANCELLED。 */
export const SRM_PORTAL_MESSAGE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发送', value: 'SENT' },
  { label: '已读', value: 'READ' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_PORTAL_MESSAGE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SENT: '已发送',
  READ: '已读',
  CANCELLED: '已取消',
};

/** 门户附件状态：PENDING/UPLOADED/CONFIRMED/REJECTED/CANCELLED。 */
export const SRM_PORTAL_ATTACHMENT_STATUS_OPTIONS = [
  { label: '待上传', value: 'PENDING' },
  { label: '已上传', value: 'UPLOADED' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
] as const;
export const SRM_PORTAL_ATTACHMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待上传',
  UPLOADED: '已上传',
  CONFIRMED: '已确认',
  REJECTED: '已驳回',
  CANCELLED: '已取消',
};

/** 门户附件业务类型：ORDER/DELIVERY/QUALITY/MESSAGE。 */
export const SRM_PORTAL_BIZ_TYPE_OPTIONS = [
  { label: '订单协同', value: 'ORDER' },
  { label: '交期/送货', value: 'DELIVERY' },
  { label: '质量协同', value: 'QUALITY' },
  { label: '门户消息', value: 'MESSAGE' },
] as const;
export const SRM_PORTAL_BIZ_TYPE_LABEL: Record<string, string> = {
  ORDER: '订单协同',
  DELIVERY: '交期/送货',
  QUALITY: '质量协同',
  MESSAGE: '门户消息',
};
