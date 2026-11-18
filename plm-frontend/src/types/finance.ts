import type { PageQuery } from '@/types/common';

/** G1-N5 公共平台底座—多币种多税率（后端 WBS T101）类型与枚举定义。 */

/* ---------------- 通用分页查询 ---------------- */

/** 多币种多税率通用分页查询条件（各资源按需使用对应筛选字段）。 */
export interface FinanceQueryParams extends PageQuery {
  currencyStatus?: string;
  fromCurrency?: string;
  toCurrency?: string;
  rateType?: string;
  rateStatus?: string;
  taxType?: string;
  taxStatus?: string;
  priceMode?: string;
  roundingTarget?: string;
  roundingMode?: string;
  bizModule?: string;
  ruleStatus?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------- 1. 币种 ---------------- */

export interface FinanceCurrencyItem {
  id: number;
  currencyCode: string;
  currencyName: string;
  currencySymbol?: string;
  currencyPrecision?: number | null;
  baseFlag?: number | null;
  country?: string;
  currencyStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface FinanceCurrencySaveParams {
  currencyCode: string;
  currencyName: string;
  currencySymbol?: string;
  currencyPrecision?: number | null;
  baseFlag?: number | null;
  country?: string;
  currencyStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface FinanceCurrencyStats {
  total?: number;
  active?: number;
  disabled?: number;
  baseCount?: number;
}

/* ---------------- 2. 汇率 ---------------- */

export interface FinanceExchangeRateItem {
  id: number;
  rateNo?: string;
  fromCurrency: string;
  toCurrency: string;
  rateType?: string;
  rateValue?: number | null;
  effectiveDate?: string;
  expireDate?: string;
  rateSource?: string;
  rateStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface FinanceExchangeRateSaveParams {
  rateNo?: string;
  fromCurrency: string;
  toCurrency: string;
  rateType?: string;
  rateValue?: number | null;
  effectiveDate?: string;
  expireDate?: string;
  rateSource?: string;
  rateStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface FinanceExchangeRateStats {
  total?: number;
  active?: number;
  expired?: number;
  disabled?: number;
}

/* ---------------- 3. 税率 ---------------- */

export interface FinanceTaxRateItem {
  id: number;
  taxNo?: string;
  taxCode?: string;
  taxName: string;
  taxType?: string;
  taxRate?: number | null;
  country?: string;
  effectiveDate?: string;
  expireDate?: string;
  taxStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface FinanceTaxRateSaveParams {
  taxNo?: string;
  taxCode?: string;
  taxName: string;
  taxType?: string;
  taxRate?: number | null;
  country?: string;
  effectiveDate?: string;
  expireDate?: string;
  taxStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface FinanceTaxRateStats {
  total?: number;
  active?: number;
  expired?: number;
  disabled?: number;
}

/* ---------------- 4. 价格规则（含税/未税） ---------------- */

export interface FinancePriceRuleItem {
  id: number;
  ruleNo?: string;
  ruleCode?: string;
  ruleName: string;
  bizModule?: string;
  priceMode?: string;
  taxCode?: string;
  roundingMode?: string;
  precisionDigits?: number | null;
  ruleStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface FinancePriceRuleSaveParams {
  ruleNo?: string;
  ruleCode?: string;
  ruleName: string;
  bizModule?: string;
  priceMode?: string;
  taxCode?: string;
  roundingMode?: string;
  precisionDigits?: number | null;
  ruleStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface FinancePriceRuleStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 5. 舍入规则 ---------------- */

export interface FinanceRoundingRuleItem {
  id: number;
  ruleNo?: string;
  ruleCode?: string;
  ruleName: string;
  roundingTarget?: string;
  roundingMode?: string;
  roundingUnit?: number | null;
  precisionDigits?: number | null;
  ruleStatus: string;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
}

export interface FinanceRoundingRuleSaveParams {
  ruleNo?: string;
  ruleCode?: string;
  ruleName: string;
  roundingTarget?: string;
  roundingMode?: string;
  roundingUnit?: number | null;
  precisionDigits?: number | null;
  ruleStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export interface FinanceRoundingRuleStats {
  total?: number;
  active?: number;
  disabled?: number;
}

/* ---------------- 枚举选项与文案 ---------------- */

/** 币种状态：ACTIVE/DISABLED。 */
export const FIN_CURRENCY_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const FIN_CURRENCY_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};

/** 汇率类型：SPOT/BUY/SELL/AVG。 */
export const FIN_RATE_TYPE_OPTIONS = [
  { label: '即期汇率', value: 'SPOT' },
  { label: '买入价', value: 'BUY' },
  { label: '卖出价', value: 'SELL' },
  { label: '中间价', value: 'AVG' },
] as const;

export const FIN_RATE_TYPE_LABEL: Record<string, string> = {
  SPOT: '即期汇率',
  BUY: '买入价',
  SELL: '卖出价',
  AVG: '中间价',
};

/** 汇率状态：ACTIVE/EXPIRED/DISABLED。 */
export const FIN_RATE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const FIN_RATE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  EXPIRED: '已过期',
  DISABLED: '停用',
};

/** 税率类型：VAT/CIT/OTHER。 */
export const FIN_TAX_TYPE_OPTIONS = [
  { label: '增值税', value: 'VAT' },
  { label: '企业所得税', value: 'CIT' },
  { label: '其他', value: 'OTHER' },
] as const;

export const FIN_TAX_TYPE_LABEL: Record<string, string> = {
  VAT: '增值税',
  CIT: '企业所得税',
  OTHER: '其他',
};

/** 税率状态：ACTIVE/EXPIRED/DISABLED。 */
export const FIN_TAX_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const FIN_TAX_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  EXPIRED: '已过期',
  DISABLED: '停用',
};

/** 价格口径：TAX_INCLUSIVE/TAX_EXCLUSIVE。 */
export const FIN_PRICE_MODE_OPTIONS = [
  { label: '含税价', value: 'TAX_INCLUSIVE' },
  { label: '未税价', value: 'TAX_EXCLUSIVE' },
] as const;

export const FIN_PRICE_MODE_LABEL: Record<string, string> = {
  TAX_INCLUSIVE: '含税价',
  TAX_EXCLUSIVE: '未税价',
};

/** 舍入方式：HALF_UP/HALF_EVEN/UP/DOWN。 */
export const FIN_ROUNDING_MODE_OPTIONS = [
  { label: '四舍五入', value: 'HALF_UP' },
  { label: '银行家舍入', value: 'HALF_EVEN' },
  { label: '向上进位', value: 'UP' },
  { label: '向下截断', value: 'DOWN' },
] as const;

export const FIN_ROUNDING_MODE_LABEL: Record<string, string> = {
  HALF_UP: '四舍五入',
  HALF_EVEN: '银行家舍入',
  UP: '向上进位',
  DOWN: '向下截断',
};

/** 舍入对象：PRICE/AMOUNT/TAX/QTY。 */
export const FIN_ROUNDING_TARGET_OPTIONS = [
  { label: '单价', value: 'PRICE' },
  { label: '金额', value: 'AMOUNT' },
  { label: '税额', value: 'TAX' },
  { label: '数量', value: 'QTY' },
] as const;

export const FIN_ROUNDING_TARGET_LABEL: Record<string, string> = {
  PRICE: '单价',
  AMOUNT: '金额',
  TAX: '税额',
  QTY: '数量',
};

/** 财务规则状态：ACTIVE/DISABLED。 */
export const FIN_RULE_STATUS_OPTIONS = [
  { label: '生效', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
] as const;

export const FIN_RULE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '生效',
  DISABLED: '停用',
};
