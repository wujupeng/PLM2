import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  ProductItem,
  ProductQuery,
  ProductSaveParams,
  MaterialCategoryItem,
  MaterialCategorySaveParams,
  SupplierItem,
  SupplierQuery,
  SupplierSaveParams,
  MaterialItem,
  MaterialQuery,
  MaterialSaveParams,
  MaterialSubstituteItem,
  MaterialSubstituteParams,
  ChangeLogItem,
  QualityIssueItem,
  QualityIssueQuery,
  QualityScanResult,
  MaterialImportRequest,
  MaterialImportResult,
} from '@/types/masterData';

/** 产品型号 */
export const productService = {
  page: (params: ProductQuery): Promise<PageResult<ProductItem>> =>
    request<PageResult<ProductItem>>({ method: 'GET', url: '/product-data/products', params }),

  options: (): Promise<ProductItem[]> =>
    request<ProductItem[]>({ method: 'GET', url: '/product-data/products/options' }),

  detail: (id: number): Promise<ProductItem> =>
    request<ProductItem>({ method: 'GET', url: `/product-data/products/${id}` }),

  create: (data: ProductSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/product-data/products', data }),

  update: (id: number, data: ProductSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/product-data/products/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/product-data/products/${id}` }),
};

/** 物料分类 */
export const materialCategoryService = {
  list: (): Promise<MaterialCategoryItem[]> =>
    request<MaterialCategoryItem[]>({ method: 'GET', url: '/product-data/material-categories' }),

  create: (data: MaterialCategorySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/product-data/material-categories', data }),

  update: (id: number, data: MaterialCategorySaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/product-data/material-categories/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/product-data/material-categories/${id}` }),
};

/** 供应商 */
export const supplierService = {
  page: (params: SupplierQuery): Promise<PageResult<SupplierItem>> =>
    request<PageResult<SupplierItem>>({ method: 'GET', url: '/product-data/suppliers', params }),

  options: (): Promise<SupplierItem[]> =>
    request<SupplierItem[]>({ method: 'GET', url: '/product-data/suppliers/options' }),

  create: (data: SupplierSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/product-data/suppliers', data }),

  update: (id: number, data: SupplierSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/product-data/suppliers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/product-data/suppliers/${id}` }),
};

/** 物料主档 */
export const materialService = {
  page: (params: MaterialQuery): Promise<PageResult<MaterialItem>> =>
    request<PageResult<MaterialItem>>({ method: 'GET', url: '/product-data/materials', params }),

  options: (): Promise<MaterialItem[]> =>
    request<MaterialItem[]>({ method: 'GET', url: '/product-data/materials/options' }),

  detail: (id: number): Promise<MaterialItem> =>
    request<MaterialItem>({ method: 'GET', url: `/product-data/materials/${id}` }),

  create: (data: MaterialSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/product-data/materials', data }),

  update: (id: number, data: MaterialSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/product-data/materials/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/product-data/materials/${id}` }),

  changeLifecycle: (id: number, status: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/product-data/materials/${id}/lifecycle`, data: { status } }),

  changeLogs: (id: number): Promise<ChangeLogItem[]> =>
    request<ChangeLogItem[]>({ method: 'GET', url: `/product-data/materials/${id}/change-logs` }),

  substitutes: (id: number): Promise<MaterialSubstituteItem[]> =>
    request<MaterialSubstituteItem[]>({ method: 'GET', url: `/product-data/materials/${id}/substitutes` }),

  addSubstitute: (id: number, data: MaterialSubstituteParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/product-data/materials/${id}/substitutes`, data }),

  removeSubstitute: (substituteId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/product-data/materials/substitutes/${substituteId}` }),

  importMaterials: (data: MaterialImportRequest): Promise<MaterialImportResult> =>
    request<MaterialImportResult>({ method: 'POST', url: '/product-data/materials/import', data }),
};

/** 数据质量 */
export const qualityService = {
  page: (params: QualityIssueQuery): Promise<PageResult<QualityIssueItem>> =>
    request<PageResult<QualityIssueItem>>({ method: 'GET', url: '/product-data/quality-issues', params }),

  scan: (): Promise<QualityScanResult> =>
    request<QualityScanResult>({ method: 'POST', url: '/product-data/quality-issues/scan' }),

  updateStatus: (id: number, status: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/product-data/quality-issues/${id}/status`, data: { status } }),
};
