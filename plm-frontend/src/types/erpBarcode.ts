import type { PageQuery } from '@/types/common';

/** G3-N7a ERP 条码管理（T030/T099，后端 Base: /erp/barcode）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 条码生成分页查询条件。keyword 匹配 barcodeNo/bizNo/materialCode/materialName。 */
export interface ErpBarcodeQuery extends PageQuery {
  barcodeType?: string;
  printStatus?: string;
  bizNo?: string;
}

/** 标签模板分页查询条件。keyword 匹配 templateCode/templateName。 */
export interface ErpBarcodeTemplateQuery extends PageQuery {
  templateType?: string;
  templateStatus?: string;
}

/** 条码补打记录分页查询条件。keyword 匹配 reprintNo/barcodeNo/operatorName。 */
export interface ErpBarcodeReprintQuery extends PageQuery {
  approvalStatus?: string;
  barcodeNo?: string;
}

/** 扫码规则分页查询条件。keyword 匹配 ruleCode/ruleName。 */
export interface ErpBarcodeRuleQuery extends PageQuery {
  barcodeType?: string;
  scanBizType?: string;
  ruleStatus?: string;
}

/** 扫描校验分页查询条件。keyword 匹配 scanNo/barcodeNo/materialCode/scanner。 */
export interface ErpBarcodeScanQuery extends PageQuery {
  scanType?: string;
  scanResult?: string;
  barcodeNo?: string;
}

/* ---------------- 1. 条码生成 ---------------- */

export interface ErpBarcode {
  id?: number;
  barcodeNo?: string;
  barcodeType?: string;
  bizNo?: string;
  materialCode: string;
  materialName?: string;
  batchNo?: string;
  qty?: number | null;
  unit?: string;
  ruleCode?: string;
  templateCode?: string;
  printStatus?: string;
  printCount?: number | null;
  printTime?: string;
  printer?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpBarcodeSaveRequest = Omit<
  ErpBarcode,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 标签模板 ---------------- */

export interface ErpBarcodeTemplate {
  id?: number;
  templateCode: string;
  templateName?: string;
  templateType?: string;
  labelWidth?: number | null;
  labelHeight?: number | null;
  contentConfig?: string;
  printPermission?: string;
  templateStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpBarcodeTemplateSaveRequest = Omit<
  ErpBarcodeTemplate,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 补打记录 ---------------- */

export interface ErpBarcodeReprint {
  id?: number;
  reprintNo?: string;
  barcodeNo?: string;
  reprintReason?: string;
  reprintCount?: number | null;
  reprintTime?: string;
  operatorName?: string;
  approvalStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpBarcodeReprintSaveRequest = Omit<
  ErpBarcodeReprint,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 扫码规则 ---------------- */

export interface ErpBarcodeRule {
  id?: number;
  ruleCode: string;
  ruleName?: string;
  barcodeType?: string;
  rulePattern?: string;
  scanBizType?: string;
  validateEnabled?: number | null;
  duplicateCheck?: number | null;
  ruleStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpBarcodeRuleSaveRequest = Omit<
  ErpBarcodeRule,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 扫描校验 ---------------- */

export interface ErpBarcodeScan {
  id?: number;
  scanNo?: string;
  barcodeNo?: string;
  scanType?: string;
  bizNo?: string;
  materialCode?: string;
  scanQty?: number | null;
  scanTime?: string;
  scanner?: string;
  scanResult?: string;
  failReason?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpBarcodeScanSaveRequest = Omit<
  ErpBarcodeScan,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 条码类型：PURCHASE_ORDER/PRODUCTION_ORDER/MATERIAL/LABEL。 */
export const ERP_BARCODE_TYPE_OPTIONS = [
  { label: '采购订单条码', value: 'PURCHASE_ORDER' },
  { label: '生产订单条码', value: 'PRODUCTION_ORDER' },
  { label: '物料标签', value: 'MATERIAL' },
  { label: '通用标签', value: 'LABEL' },
] as const;
export const ERP_BARCODE_TYPE_LABEL: Record<string, string> = {
  PURCHASE_ORDER: '采购订单条码',
  PRODUCTION_ORDER: '生产订单条码',
  MATERIAL: '物料标签',
  LABEL: '通用标签',
};

/** 标签模板类型：MATERIAL/PURCHASE_ORDER/PRODUCTION_ORDER/CARTON/LOCATION。 */
export const ERP_BARCODE_TEMPLATE_TYPE_OPTIONS = [
  { label: '物料标签', value: 'MATERIAL' },
  { label: '采购订单', value: 'PURCHASE_ORDER' },
  { label: '生产订单', value: 'PRODUCTION_ORDER' },
  { label: '装箱标签', value: 'CARTON' },
  { label: '库位标签', value: 'LOCATION' },
] as const;
export const ERP_BARCODE_TEMPLATE_TYPE_LABEL: Record<string, string> = {
  MATERIAL: '物料标签',
  PURCHASE_ORDER: '采购订单',
  PRODUCTION_ORDER: '生产订单',
  CARTON: '装箱标签',
  LOCATION: '库位标签',
};

/** 打印状态：UNPRINTED/PRINTED/REPRINTED/VOID。 */
export const ERP_BARCODE_PRINT_STATUS_OPTIONS = [
  { label: '未打印', value: 'UNPRINTED' },
  { label: '已打印', value: 'PRINTED' },
  { label: '已补打', value: 'REPRINTED' },
  { label: '已作废', value: 'VOID' },
] as const;
export const ERP_BARCODE_PRINT_STATUS_LABEL: Record<string, string> = {
  UNPRINTED: '未打印',
  PRINTED: '已打印',
  REPRINTED: '已补打',
  VOID: '已作废',
};

/** 补打审批状态：NONE/PENDING/APPROVED/REJECTED。 */
export const ERP_BARCODE_REPRINT_APPROVAL_STATUS_OPTIONS = [
  { label: '无需审批', value: 'NONE' },
  { label: '审批中', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
] as const;
export const ERP_BARCODE_REPRINT_APPROVAL_STATUS_LABEL: Record<string, string> = {
  NONE: '无需审批',
  PENDING: '审批中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
};

/** 扫码业务类型：RECEIPT/ISSUE/INVENTORY/RETURN。 */
export const ERP_BARCODE_SCAN_BIZ_TYPE_OPTIONS = [
  { label: '收料', value: 'RECEIPT' },
  { label: '发料', value: 'ISSUE' },
  { label: '盘点', value: 'INVENTORY' },
  { label: '退料', value: 'RETURN' },
] as const;
export const ERP_BARCODE_SCAN_BIZ_TYPE_LABEL: Record<string, string> = {
  RECEIPT: '收料',
  ISSUE: '发料',
  INVENTORY: '盘点',
  RETURN: '退料',
};

/** 扫描结果：PASS/FAIL/DUPLICATE/UNKNOWN。 */
export const ERP_BARCODE_SCAN_RESULT_OPTIONS = [
  { label: '通过', value: 'PASS' },
  { label: '校验失败', value: 'FAIL' },
  { label: '重复扫描', value: 'DUPLICATE' },
  { label: '未知条码', value: 'UNKNOWN' },
] as const;
export const ERP_BARCODE_SCAN_RESULT_LABEL: Record<string, string> = {
  PASS: '通过',
  FAIL: '校验失败',
  DUPLICATE: '重复扫描',
  UNKNOWN: '未知条码',
};

/** 通用启用状态：ACTIVE/INACTIVE。 */
export const ERP_COMMON_ACTIVE_STATUS_OPTIONS = [
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
] as const;
export const ERP_COMMON_ACTIVE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '启用',
  INACTIVE: '停用',
};

/** 是否开关：0/1。 */
export const ERP_YES_NO_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
] as const;
