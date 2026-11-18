import type { PageQuery } from '@/types/common';

/** G1-N5 公共平台底座—多组织多工厂（后端 WBS T100）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 多组织多工厂通用分页查询条件（各资源按需使用对应筛选字段）。 */
export interface OrgQueryParams extends PageQuery {
  legalCode?: string;
  factoryCode?: string;
  legalStatus?: string;
  factoryType?: string;
  factoryStatus?: string;
  warehouseType?: string;
  warehouseStatus?: string;
  lineType?: string;
  lineStatus?: string;
  grantType?: string;
  grantStatus?: string;
  scopeType?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 法人主体 ---------------- */

export interface OrgLegalEntityItem {
  id: number;
  legalCode: string;
  legalName: string;
  unifiedSocialCode?: string;
  taxNo?: string;
  legalRep?: string;
  baseCurrency?: string;
  country?: string;
  region?: string;
  address?: string;
  contactPhone?: string;
  legalStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface OrgLegalEntitySaveParams {
  legalCode?: string;
  legalName: string;
  unifiedSocialCode?: string;
  taxNo?: string;
  legalRep?: string;
  baseCurrency?: string;
  country?: string;
  region?: string;
  address?: string;
  contactPhone?: string;
  legalStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface OrgLegalEntityStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 2. 工厂 ---------------- */

export interface OrgFactoryItem {
  id: number;
  factoryCode: string;
  factoryName: string;
  legalCode?: string;
  factoryType?: string;
  country?: string;
  region?: string;
  address?: string;
  timezone?: string;
  manager?: string;
  factoryStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface OrgFactorySaveParams {
  factoryCode?: string;
  factoryName: string;
  legalCode?: string;
  factoryType?: string;
  country?: string;
  region?: string;
  address?: string;
  timezone?: string;
  manager?: string;
  factoryStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface OrgFactoryStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 3. 仓库 ---------------- */

export interface OrgWarehouseItem {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  factoryCode?: string;
  warehouseType?: string;
  location?: string;
  capacity?: number | null;
  manager?: string;
  warehouseStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface OrgWarehouseSaveParams {
  warehouseCode?: string;
  warehouseName: string;
  factoryCode?: string;
  warehouseType?: string;
  location?: string;
  capacity?: number | null;
  manager?: string;
  warehouseStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface OrgWarehouseStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 4. 产线 ---------------- */

export interface OrgProductionLineItem {
  id: number;
  lineCode: string;
  lineName: string;
  factoryCode?: string;
  workshop?: string;
  lineType?: string;
  capacityPerHour?: number | null;
  manager?: string;
  lineStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface OrgProductionLineSaveParams {
  lineCode?: string;
  lineName: string;
  factoryCode?: string;
  workshop?: string;
  lineType?: string;
  capacityPerHour?: number | null;
  manager?: string;
  lineStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface OrgProductionLineStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 5. 跨组织授权 ---------------- */

export interface OrgGrantItem {
  id: number;
  grantNo: string;
  grantType?: string;
  grantorCode?: string;
  granteeOrgId?: number;
  granteeName?: string;
  scopeType?: string;
  scopeValue?: string;
  effectiveDate?: string;
  expireDate?: string;
  grantStatus: string;
  grantReason?: string;
  orgName?: string;
  remark?: string;
  createdAt?: string;
}

export interface OrgGrantSaveParams {
  grantNo?: string;
  grantType?: string;
  grantorCode?: string;
  granteeOrgId?: number;
  granteeName?: string;
  scopeType?: string;
  scopeValue?: string;
  effectiveDate?: string;
  expireDate?: string;
  grantStatus?: string;
  grantReason?: string;
  orgName?: string;
  remark?: string;
}

export interface OrgGrantStats {
  total?: number;
  active?: number;
  expired?: number;
  revoked?: number;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 法人主体状态：ACTIVE/DISABLED。 */
export const ORG_LEGAL_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const ORG_LEGAL_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 工厂类型：MANUFACTURE/ASSEMBLY/WAREHOUSE/OEM。 */
export const ORG_FACTORY_TYPE_OPTIONS = [
  { label: '制造工厂', value: 'MANUFACTURE' },
  { label: '装配工厂', value: 'ASSEMBLY' },
  { label: '仓储中心', value: 'WAREHOUSE' },
  { label: '外协工厂', value: 'OEM' },
] as const;

export const ORG_FACTORY_TYPE_LABEL: Record<string, string> = {
  MANUFACTURE: '制造工厂',
  ASSEMBLY: '装配工厂',
  WAREHOUSE: '仓储中心',
  OEM: '外协工厂',
};

/** 工厂状态：ACTIVE/DISABLED。 */
export const ORG_FACTORY_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const ORG_FACTORY_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 仓库类型：RAW/SEMI/FINISHED/SPARE/INTRANSIT。 */
export const ORG_WAREHOUSE_TYPE_OPTIONS = [
  { label: '原料仓', value: 'RAW' },
  { label: '半成品仓', value: 'SEMI' },
  { label: '成品仓', value: 'FINISHED' },
  { label: '备件仓', value: 'SPARE' },
  { label: '在途仓', value: 'INTRANSIT' },
] as const;

export const ORG_WAREHOUSE_TYPE_LABEL: Record<string, string> = {
  RAW: '原料仓',
  SEMI: '半成品仓',
  FINISHED: '成品仓',
  SPARE: '备件仓',
  INTRANSIT: '在途仓',
};

/** 仓库状态：ACTIVE/DISABLED。 */
export const ORG_WAREHOUSE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const ORG_WAREHOUSE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 产线类型：ASSEMBLY/MACHINING/PACKAGING/TESTING。 */
export const ORG_LINE_TYPE_OPTIONS = [
  { label: '装配线', value: 'ASSEMBLY' },
  { label: '机加线', value: 'MACHINING' },
  { label: '包装线', value: 'PACKAGING' },
  { label: '测试线', value: 'TESTING' },
] as const;

export const ORG_LINE_TYPE_LABEL: Record<string, string> = {
  ASSEMBLY: '装配线',
  MACHINING: '机加线',
  PACKAGING: '包装线',
  TESTING: '测试线',
};

/** 产线状态：ACTIVE/DISABLED。 */
export const ORG_LINE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const ORG_LINE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 授权类型：LEGAL/FACTORY/WAREHOUSE/LINE/ORG。 */
export const ORG_GRANT_TYPE_OPTIONS = [
  { label: '法人授权', value: 'LEGAL' },
  { label: '工厂授权', value: 'FACTORY' },
  { label: '仓库授权', value: 'WAREHOUSE' },
  { label: '产线授权', value: 'LINE' },
  { label: '组织授权', value: 'ORG' },
] as const;

export const ORG_GRANT_TYPE_LABEL: Record<string, string> = {
  LEGAL: '法人授权',
  FACTORY: '工厂授权',
  WAREHOUSE: '仓库授权',
  LINE: '产线授权',
  ORG: '组织授权',
};

/** 授权状态：ACTIVE/EXPIRED/REVOKED。 */
export const ORG_GRANT_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '已撤销', value: 'REVOKED' },
] as const;

export const ORG_GRANT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  EXPIRED: '已过期',
  REVOKED: '已撤销',
};

/** 授权范围类型：ALL/FACTORY/WAREHOUSE/LINE。 */
export const ORG_SCOPE_TYPE_OPTIONS = [
  { label: '全部', value: 'ALL' },
  { label: '按工厂', value: 'FACTORY' },
  { label: '按仓库', value: 'WAREHOUSE' },
  { label: '按产线', value: 'LINE' },
] as const;

export const ORG_SCOPE_TYPE_LABEL: Record<string, string> = {
  ALL: '全部',
  FACTORY: '按工厂',
  WAREHOUSE: '按仓库',
  LINE: '按产线',
};
