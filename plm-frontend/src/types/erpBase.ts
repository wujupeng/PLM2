import type { PageQuery } from '@/types/common';

/** G3-N1 ERP 基础资料（后端 Base: /erp/base）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 物料业务档案分页查询条件。 */
export interface ErpMaterialQuery extends PageQuery {
  materialGroup?: string;
  materialStatus?: string;
}

/** 客户档案分页查询条件。 */
export interface ErpCustomerQuery extends PageQuery {
  customerType?: string;
  customerStatus?: string;
}

/** 客户联系人分页查询条件。 */
export interface ErpCustomerContactQuery extends PageQuery {
  customerCode?: string;
  contactStatus?: string;
}

/** 供应商业务档案分页查询条件。 */
export interface ErpSupplierQuery extends PageQuery {
  supplierType?: string;
  supplierStatus?: string;
}

/** 计量单位分页查询条件。 */
export interface ErpUomQuery extends PageQuery {
  uomType?: string;
  uomStatus?: string;
}

/** 单位换算分页查询条件。 */
export interface ErpUomConversionQuery extends PageQuery {
  materialCode?: string;
  conversionStatus?: string;
}

/** 项目档案分页查询条件。 */
export interface ErpProjectQuery extends PageQuery {
  projectType?: string;
  projectStatus?: string;
}

/* ---------------- 1. 物料业务档案 ---------------- */

export interface ErpMaterial {
  id?: number;
  materialNo?: string;
  materialCode: string;
  materialName: string;
  spec?: string;
  materialGroup?: string;
  baseUom?: string;
  purchaseUom?: string;
  saleUom?: string;
  valuationMethod?: string;
  defaultWarehouseCode?: string;
  defaultTaxCode?: string;
  safetyStock?: number | null;
  stdCost?: number | null;
  materialStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpMaterialSaveRequest = Omit<
  ErpMaterial,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 客户档案 ---------------- */

export interface ErpCustomer {
  id?: number;
  customerNo?: string;
  customerCode: string;
  customerName: string;
  shortName?: string;
  customerType?: string;
  customerGroup?: string;
  salesRegion?: string;
  creditLimit?: number | null;
  creditDays?: number | null;
  settleMethod?: string;
  taxCode?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  customerStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpCustomerSaveRequest = Omit<
  ErpCustomer,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 客户联系人 ---------------- */

export interface ErpCustomerContact {
  id?: number;
  contactNo?: string;
  customerCode: string;
  contactName: string;
  positionName?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean | null;
  contactStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpCustomerContactSaveRequest = Omit<
  ErpCustomerContact,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 供应商业务档案 ---------------- */

export interface ErpSupplier {
  id?: number;
  supplierNo?: string;
  supplierCode: string;
  supplierName: string;
  shortName?: string;
  supplierType?: string;
  purchaseGroup?: string;
  buyerName?: string;
  settleMethod?: string;
  paymentTerm?: string;
  taxCode?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  supplierStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpSupplierSaveRequest = Omit<
  ErpSupplier,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 计量单位 ---------------- */

export interface ErpUom {
  id?: number;
  uomNo?: string;
  uomCode: string;
  uomName: string;
  uomType?: string;
  precisionDigits?: number | null;
  uomStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpUomSaveRequest = Omit<ErpUom, 'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'>;

/* ---------------- 6. 单位换算 ---------------- */

export interface ErpUomConversion {
  id?: number;
  conversionNo?: string;
  materialCode?: string;
  fromUom: string;
  toUom: string;
  conversionRate?: number | null;
  conversionStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpUomConversionSaveRequest = Omit<
  ErpUomConversion,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 7. 项目档案 ---------------- */

export interface ErpProject {
  id?: number;
  projectNo?: string;
  projectCode?: string;
  projectName: string;
  projectType?: string;
  projectManager?: string;
  customerCode?: string;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number | null;
  projectStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ErpProjectSaveRequest = Omit<
  ErpProject,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与文案 ---------------- */

/** 物料状态：ACTIVE/DISABLED/HOLD。 */
export const ERP_MATERIAL_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
  { label: '冻结', value: 'HOLD' },
] as const;

export const ERP_MATERIAL_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
  HOLD: '冻结',
};

/** 计价方式：FIFO/MOVING_AVG/STANDARD。 */
export const ERP_VALUATION_METHOD_OPTIONS = [
  { label: '先进先出', value: 'FIFO' },
  { label: '移动平均', value: 'MOVING_AVG' },
  { label: '标准成本', value: 'STANDARD' },
] as const;

export const ERP_VALUATION_METHOD_LABEL: Record<string, string> = {
  FIFO: '先进先出',
  MOVING_AVG: '移动平均',
  STANDARD: '标准成本',
};

/** 客户类型：DIRECT/AGENT/INTERNAL/EXPORT。 */
export const ERP_CUSTOMER_TYPE_OPTIONS = [
  { label: '直销客户', value: 'DIRECT' },
  { label: '代理商', value: 'AGENT' },
  { label: '内部客户', value: 'INTERNAL' },
  { label: '出口客户', value: 'EXPORT' },
] as const;

export const ERP_CUSTOMER_TYPE_LABEL: Record<string, string> = {
  DIRECT: '直销客户',
  AGENT: '代理商',
  INTERNAL: '内部客户',
  EXPORT: '出口客户',
};

/** 客户状态：ACTIVE/DISABLED/CREDIT_HOLD。 */
export const ERP_CUSTOMER_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
  { label: '信用冻结', value: 'CREDIT_HOLD' },
] as const;

export const ERP_CUSTOMER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
  CREDIT_HOLD: '信用冻结',
};

/** 供应商类型：RAW/PART/OUTSOURCE/SERVICE。 */
export const ERP_SUPPLIER_TYPE_OPTIONS = [
  { label: '原材料', value: 'RAW' },
  { label: '零部件', value: 'PART' },
  { label: '委外加工', value: 'OUTSOURCE' },
  { label: '服务类', value: 'SERVICE' },
] as const;

export const ERP_SUPPLIER_TYPE_LABEL: Record<string, string> = {
  RAW: '原材料',
  PART: '零部件',
  OUTSOURCE: '委外加工',
  SERVICE: '服务类',
};

/** 供应商状态：ACTIVE/DISABLED/BLACKLIST。 */
export const ERP_SUPPLIER_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
  { label: '黑名单', value: 'BLACKLIST' },
] as const;

export const ERP_SUPPLIER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
  BLACKLIST: '黑名单',
};

/** 结算方式：CASH/TRANSFER/ACCEPTANCE/CREDIT。 */
export const ERP_SETTLE_METHOD_OPTIONS = [
  { label: '现金', value: 'CASH' },
  { label: '电汇', value: 'TRANSFER' },
  { label: '承兑', value: 'ACCEPTANCE' },
  { label: '赊销', value: 'CREDIT' },
] as const;

export const ERP_SETTLE_METHOD_LABEL: Record<string, string> = {
  CASH: '现金',
  TRANSFER: '电汇',
  ACCEPTANCE: '承兑',
  CREDIT: '赊销',
};

/** 付款条件：PREPAY/COD/NET30/NET60/NET90。 */
export const ERP_PAYMENT_TERM_OPTIONS = [
  { label: '预付', value: 'PREPAY' },
  { label: '货到付款', value: 'COD' },
  { label: '月结30天', value: 'NET30' },
  { label: '月结60天', value: 'NET60' },
  { label: '月结90天', value: 'NET90' },
] as const;

export const ERP_PAYMENT_TERM_LABEL: Record<string, string> = {
  PREPAY: '预付',
  COD: '货到付款',
  NET30: '月结30天',
  NET60: '月结60天',
  NET90: '月结90天',
};

/** 计量单位类型：BASE/PURCHASE/SALE/INVENTORY。 */
export const ERP_UOM_TYPE_OPTIONS = [
  { label: '基本单位', value: 'BASE' },
  { label: '采购单位', value: 'PURCHASE' },
  { label: '销售单位', value: 'SALE' },
  { label: '库存单位', value: 'INVENTORY' },
] as const;

export const ERP_UOM_TYPE_LABEL: Record<string, string> = {
  BASE: '基本单位',
  PURCHASE: '采购单位',
  SALE: '销售单位',
  INVENTORY: '库存单位',
};

/** 通用启用状态（计量单位状态 / 换算状态 / 联系人状态）：ACTIVE/DISABLED。 */
export const ERP_ACTIVE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const ERP_ACTIVE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 项目类型：INTERNAL/CUSTOMER/RESEARCH/BID。 */
export const ERP_PROJECT_TYPE_OPTIONS = [
  { label: '内部项目', value: 'INTERNAL' },
  { label: '客户项目', value: 'CUSTOMER' },
  { label: '研发项目', value: 'RESEARCH' },
  { label: '招标项目', value: 'BID' },
] as const;

export const ERP_PROJECT_TYPE_LABEL: Record<string, string> = {
  INTERNAL: '内部项目',
  CUSTOMER: '客户项目',
  RESEARCH: '研发项目',
  BID: '招标项目',
};

/** 项目状态：PLANNING/ACTIVE/SUSPENDED/CLOSED。 */
export const ERP_PROJECT_STATUS_OPTIONS = [
  { label: '筹划', value: 'PLANNING' },
  { label: '进行中', value: 'ACTIVE' },
  { label: '暂停', value: 'SUSPENDED' },
  { label: '已关闭', value: 'CLOSED' },
] as const;

export const ERP_PROJECT_STATUS_LABEL: Record<string, string> = {
  PLANNING: '筹划',
  ACTIVE: '进行中',
  SUSPENDED: '暂停',
  CLOSED: '已关闭',
};
