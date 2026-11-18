import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  SpecTemplateItem,
  SpecTemplateQuery,
  SpecTemplateSaveParams,
  SpecTemplateDetail,
  SpecInstanceItem,
  SpecInstanceQuery,
  SpecInstanceSaveParams,
  SpecInstanceDetail,
  SpecInstanceValueItem,
  SpecInstanceValueSaveParams,
} from '@/types/spec';

/** 技术规格模板 */
export const specTemplateService = {
  page: (params: SpecTemplateQuery): Promise<PageResult<SpecTemplateItem>> =>
    request<PageResult<SpecTemplateItem>>({ method: 'GET', url: '/spec/templates', params }),

  options: (): Promise<SpecTemplateItem[]> =>
    request<SpecTemplateItem[]>({ method: 'GET', url: '/spec/templates/options' }),

  detail: (templateId: number): Promise<SpecTemplateDetail> =>
    request<SpecTemplateDetail>({ method: 'GET', url: `/spec/templates/${templateId}` }),

  create: (data: SpecTemplateSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/spec/templates', data }),

  update: (templateId: number, data: SpecTemplateSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/spec/templates/${templateId}`, data }),

  remove: (templateId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/spec/templates/${templateId}` }),

  release: (templateId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/spec/templates/${templateId}/release` }),
};

/** 技术规格实例 */
export const specInstanceService = {
  page: (params: SpecInstanceQuery): Promise<PageResult<SpecInstanceItem>> =>
    request<PageResult<SpecInstanceItem>>({ method: 'GET', url: '/spec/instances', params }),

  detail: (instanceId: number): Promise<SpecInstanceDetail> =>
    request<SpecInstanceDetail>({ method: 'GET', url: `/spec/instances/${instanceId}` }),

  values: (instanceId: number): Promise<SpecInstanceValueItem[]> =>
    request<SpecInstanceValueItem[]>({ method: 'GET', url: `/spec/instances/${instanceId}/values` }),

  byProduct: (productCode: string): Promise<SpecInstanceItem[]> =>
    request<SpecInstanceItem[]>({ method: 'GET', url: `/spec/instances/by-product/${productCode}` }),

  create: (data: SpecInstanceSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/spec/instances', data }),

  update: (instanceId: number, data: SpecInstanceSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/spec/instances/${instanceId}`, data }),

  saveValues: (instanceId: number, values: SpecInstanceValueSaveParams[]): Promise<void> =>
    request<void>({ method: 'PUT', url: `/spec/instances/${instanceId}/values`, data: values }),

  remove: (instanceId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/spec/instances/${instanceId}` }),

  release: (instanceId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/spec/instances/${instanceId}/release` }),
};
