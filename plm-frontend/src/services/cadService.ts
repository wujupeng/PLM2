import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  CadFileItem,
  CadFileQuery,
  CadFileSaveParams,
  CadFileDetail,
  CadExtractErrorItem,
  CadExtractParams,
  CadExtractResult,
  CadAttrMappingItem,
  CadAttrMappingQuery,
  CadAttrMappingSaveParams,
} from '@/types/cad';

/** CAD 文件 */
export const cadFileService = {
  page: (params: CadFileQuery): Promise<PageResult<CadFileItem>> =>
    request<PageResult<CadFileItem>>({ method: 'GET', url: '/cad/files', params }),

  detail: (cadFileId: number): Promise<CadFileDetail> =>
    request<CadFileDetail>({ method: 'GET', url: `/cad/files/${cadFileId}` }),

  create: (data: CadFileSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/cad/files', data }),

  update: (cadFileId: number, data: CadFileSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/cad/files/${cadFileId}`, data }),

  remove: (cadFileId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/cad/files/${cadFileId}` }),

  extract: (cadFileId: number, data: CadExtractParams): Promise<CadExtractResult> =>
    request<CadExtractResult>({ method: 'POST', url: `/cad/files/${cadFileId}/extract`, data }),

  errors: (cadFileId: number): Promise<CadExtractErrorItem[]> =>
    request<CadExtractErrorItem[]>({ method: 'GET', url: `/cad/files/${cadFileId}/errors` }),
};

/** CAD 属性映射 */
export const cadMappingService = {
  page: (params: CadAttrMappingQuery): Promise<PageResult<CadAttrMappingItem>> =>
    request<PageResult<CadAttrMappingItem>>({ method: 'GET', url: '/cad/attr-mappings', params }),

  create: (data: CadAttrMappingSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/cad/attr-mappings', data }),

  update: (mappingId: number, data: CadAttrMappingSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/cad/attr-mappings/${mappingId}`, data }),

  remove: (mappingId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/cad/attr-mappings/${mappingId}` }),
};
