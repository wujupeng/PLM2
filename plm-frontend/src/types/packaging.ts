import type { PageQuery } from './common';

/* ---------------- 包装标签技术要求 ---------------- */

/** 包装标签技术要求项 */
export interface PackagingItem {
  id: number;
  packagingCode: string;
  productCode?: string;
  productName?: string;
  customerCode?: string;
  versionNo?: string;
  packQty?: number;
  labelTemplateCode?: string;
  qrRuleKey?: string;
  packagingMaterial?: string;
  dimensionText?: string;
  specialRequirement?: string;
  status?: string;
  effectiveDate?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 包装标签分页查询入参 */
export interface PackagingQuery extends PageQuery {
  packagingCode?: string;
  productCode?: string;
  customerCode?: string;
  status?: string;
}

/** 包装标签新增/编辑入参 */
export interface PackagingSaveParams {
  packagingCode: string;
  productCode?: string;
  productName?: string;
  customerCode?: string;
  versionNo?: string;
  packQty?: number;
  labelTemplateCode?: string;
  qrRuleKey?: string;
  packagingMaterial?: string;
  dimensionText?: string;
  specialRequirement?: string;
  status?: string;
  effectiveDate?: string;
  remark?: string;
}
