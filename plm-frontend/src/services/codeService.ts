import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  CodeRuleItem,
  CodeRuleQuery,
  CodeRuleSaveParams,
  CodeRuleDetail,
  CodeRuleSegmentItem,
  CodeRulePreviewParams,
  CodeRulePreviewResult,
  CodeDictionaryItem,
  CodeDictionaryQuery,
  CodeDictionarySaveParams,
} from '@/types/label';

/** 编码规则与统一码表 */
export const codeService = {
  /* ---------------- 编码规则 ---------------- */

  rulePage: (params: CodeRuleQuery): Promise<PageResult<CodeRuleItem>> =>
    request<PageResult<CodeRuleItem>>({ method: 'GET', url: '/code/rules', params }),

  ruleOptions: (codeType?: string): Promise<CodeRuleItem[]> =>
    request<CodeRuleItem[]>({ method: 'GET', url: '/code/rules/options', params: { codeType } }),

  ruleDetail: (ruleId: number): Promise<CodeRuleDetail> =>
    request<CodeRuleDetail>({ method: 'GET', url: `/code/rules/${ruleId}` }),

  ruleCreate: (data: CodeRuleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/code/rules', data }),

  ruleUpdate: (ruleId: number, data: CodeRuleSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/code/rules/${ruleId}`, data }),

  ruleRemove: (ruleId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/code/rules/${ruleId}` }),

  ruleSaveSegments: (ruleId: number, data: CodeRuleSegmentItem[]): Promise<void> =>
    request<void>({ method: 'PUT', url: `/code/rules/${ruleId}/segments`, data }),

  ruleEnable: (ruleId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/code/rules/${ruleId}/enable` }),

  ruleDisable: (ruleId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/code/rules/${ruleId}/disable` }),

  rulePreview: (data: CodeRulePreviewParams): Promise<CodeRulePreviewResult> =>
    request<CodeRulePreviewResult>({ method: 'POST', url: '/code/rules/preview', data }),

  /* ---------------- 统一码表 ---------------- */

  dictPage: (params: CodeDictionaryQuery): Promise<PageResult<CodeDictionaryItem>> =>
    request<PageResult<CodeDictionaryItem>>({ method: 'GET', url: '/code/dictionaries', params }),

  dictTypes: (): Promise<string[]> =>
    request<string[]>({ method: 'GET', url: '/code/dictionaries/types' }),

  dictOptions: (dictType: string): Promise<CodeDictionaryItem[]> =>
    request<CodeDictionaryItem[]>({ method: 'GET', url: '/code/dictionaries/options', params: { dictType } }),

  dictDetail: (dictId: number): Promise<CodeDictionaryItem> =>
    request<CodeDictionaryItem>({ method: 'GET', url: `/code/dictionaries/${dictId}` }),

  dictCreate: (data: CodeDictionarySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/code/dictionaries', data }),

  dictUpdate: (dictId: number, data: CodeDictionarySaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/code/dictionaries/${dictId}`, data }),

  dictRemove: (dictId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/code/dictionaries/${dictId}` }),
};
