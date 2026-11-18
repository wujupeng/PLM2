import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  ProcessOperationSaveParams,
  ProcessRouteDetail,
  ProcessRouteItem,
  ProcessRouteQuery,
  ProcessRouteSaveParams,
} from '@/types/process';
import type { OperationInspectionSpecResponse } from '@/types/inspection';

/** 工艺路线 */
export const processRouteService = {
  page: (params: ProcessRouteQuery): Promise<PageResult<ProcessRouteItem>> =>
    request<PageResult<ProcessRouteItem>>({ method: 'GET', url: '/process/routes', params }),

  detail: (routeId: number): Promise<ProcessRouteDetail> =>
    request<ProcessRouteDetail>({ method: 'GET', url: `/process/routes/${routeId}` }),

  byProduct: (productCode: string): Promise<ProcessRouteItem | null> =>
    request<ProcessRouteItem | null>({
      method: 'GET',
      url: `/process/routes/by-product/${productCode}`,
    }),

  create: (data: ProcessRouteSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/process/routes', data }),

  update: (routeId: number, data: ProcessRouteSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/process/routes/${routeId}`, data }),

  remove: (routeId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/process/routes/${routeId}` }),

  saveOperations: (routeId: number, operations: ProcessOperationSaveParams[]): Promise<void> =>
    request<void>({ method: 'PUT', url: `/process/routes/${routeId}/operations`, data: operations }),

  release: (routeId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/process/routes/${routeId}/release` }),

  operationInspectionSpec: (
    routeId: number,
    operationId: number,
  ): Promise<OperationInspectionSpecResponse> =>
    request<OperationInspectionSpecResponse>({
      method: 'GET',
      url: `/process/routes/${routeId}/operations/${operationId}/inspection-spec`,
    }),
};
