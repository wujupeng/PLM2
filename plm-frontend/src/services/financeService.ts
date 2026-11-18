import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  FinanceCurrencyItem,
  FinanceCurrencySaveParams,
  FinanceCurrencyStats,
  FinanceExchangeRateItem,
  FinanceExchangeRateSaveParams,
  FinanceExchangeRateStats,
  FinancePriceRuleItem,
  FinancePriceRuleSaveParams,
  FinancePriceRuleStats,
  FinanceQueryParams,
  FinanceRoundingRuleItem,
  FinanceRoundingRuleSaveParams,
  FinanceRoundingRuleStats,
  FinanceTaxRateItem,
  FinanceTaxRateSaveParams,
  FinanceTaxRateStats,
} from '@/types/finance';

/** G1-N5 公共平台底座—多币种多税率（后端 WBS T101）服务定义。 */

const BASE = '/platform/finance';

/* ---------------- 1. 币种 ---------------- */

export const financeCurrencyService = {
  page: (params: FinanceQueryParams): Promise<PageResult<FinanceCurrencyItem>> =>
    request<PageResult<FinanceCurrencyItem>>({ method: 'GET', url: `${BASE}/currencies`, params }),

  stats: (): Promise<FinanceCurrencyStats> =>
    request<FinanceCurrencyStats>({ method: 'GET', url: `${BASE}/currencies/stats` }),

  detail: (id: number): Promise<FinanceCurrencyItem> =>
    request<FinanceCurrencyItem>({ method: 'GET', url: `${BASE}/currencies/${id}` }),

  create: (data: FinanceCurrencySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/currencies`, data }),

  update: (id: number, data: FinanceCurrencySaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/currencies/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/currencies/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/currencies/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/currencies/${id}/disable` }),
};

/* ---------------- 2. 汇率 ---------------- */

export const financeExchangeRateService = {
  page: (params: FinanceQueryParams): Promise<PageResult<FinanceExchangeRateItem>> =>
    request<PageResult<FinanceExchangeRateItem>>({ method: 'GET', url: `${BASE}/exchange-rates`, params }),

  stats: (): Promise<FinanceExchangeRateStats> =>
    request<FinanceExchangeRateStats>({ method: 'GET', url: `${BASE}/exchange-rates/stats` }),

  detail: (id: number): Promise<FinanceExchangeRateItem> =>
    request<FinanceExchangeRateItem>({ method: 'GET', url: `${BASE}/exchange-rates/${id}` }),

  create: (data: FinanceExchangeRateSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/exchange-rates`, data }),

  update: (id: number, data: FinanceExchangeRateSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/exchange-rates/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/exchange-rates/${id}` }),

  enable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/exchange-rates/${id}/enable` }),

  disable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/exchange-rates/${id}/disable` }),

  expire: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/exchange-rates/${id}/expire` }),
};

/* ---------------- 3. 税率 ---------------- */

export const financeTaxRateService = {
  page: (params: FinanceQueryParams): Promise<PageResult<FinanceTaxRateItem>> =>
    request<PageResult<FinanceTaxRateItem>>({ method: 'GET', url: `${BASE}/tax-rates`, params }),

  stats: (): Promise<FinanceTaxRateStats> =>
    request<FinanceTaxRateStats>({ method: 'GET', url: `${BASE}/tax-rates/stats` }),

  detail: (id: number): Promise<FinanceTaxRateItem> =>
    request<FinanceTaxRateItem>({ method: 'GET', url: `${BASE}/tax-rates/${id}` }),

  create: (data: FinanceTaxRateSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/tax-rates`, data }),

  update: (id: number, data: FinanceTaxRateSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/tax-rates/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/tax-rates/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/tax-rates/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/tax-rates/${id}/disable` }),

  expire: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/tax-rates/${id}/expire` }),
};

/* ---------------- 4. 价格规则（含税/未税） ---------------- */

export const financePriceRuleService = {
  page: (params: FinanceQueryParams): Promise<PageResult<FinancePriceRuleItem>> =>
    request<PageResult<FinancePriceRuleItem>>({ method: 'GET', url: `${BASE}/price-rules`, params }),

  stats: (): Promise<FinancePriceRuleStats> =>
    request<FinancePriceRuleStats>({ method: 'GET', url: `${BASE}/price-rules/stats` }),

  detail: (id: number): Promise<FinancePriceRuleItem> =>
    request<FinancePriceRuleItem>({ method: 'GET', url: `${BASE}/price-rules/${id}` }),

  create: (data: FinancePriceRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/price-rules`, data }),

  update: (id: number, data: FinancePriceRuleSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/price-rules/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/price-rules/${id}` }),

  enable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/price-rules/${id}/enable` }),

  disable: (id: number): Promise<void> => request<void>({ method: 'POST', url: `${BASE}/price-rules/${id}/disable` }),
};

/* ---------------- 5. 舍入规则 ---------------- */

export const financeRoundingRuleService = {
  page: (params: FinanceQueryParams): Promise<PageResult<FinanceRoundingRuleItem>> =>
    request<PageResult<FinanceRoundingRuleItem>>({ method: 'GET', url: `${BASE}/rounding-rules`, params }),

  stats: (): Promise<FinanceRoundingRuleStats> =>
    request<FinanceRoundingRuleStats>({ method: 'GET', url: `${BASE}/rounding-rules/stats` }),

  detail: (id: number): Promise<FinanceRoundingRuleItem> =>
    request<FinanceRoundingRuleItem>({ method: 'GET', url: `${BASE}/rounding-rules/${id}` }),

  create: (data: FinanceRoundingRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/rounding-rules`, data }),

  update: (id: number, data: FinanceRoundingRuleSaveParams): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/rounding-rules/${id}`, data }),

  remove: (id: number): Promise<void> => request<void>({ method: 'DELETE', url: `${BASE}/rounding-rules/${id}` }),

  enable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/rounding-rules/${id}/enable` }),

  disable: (id: number): Promise<void> =>
    request<void>({ method: 'POST', url: `${BASE}/rounding-rules/${id}/disable` }),
};
