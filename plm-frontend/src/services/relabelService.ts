import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  CodeMappingItem,
  CodeMappingQuery,
  CodeMappingDetail,
  CodeVoidParams,
  CodeGenerateParams,
  CodeGenerateResult,
  CodeParseParams,
  CodeParseResult,
  RelabelScanParams,
  RelabelBatchParams,
  RelabelScanResult,
  ScanLogItem,
  ScanLogQuery,
} from '@/types/label';

/** 扫码换标工作台与编码映射 */
export const relabelService = {
  /* ---------------- 编码生成与映射 ---------------- */

  generate: (data: CodeGenerateParams): Promise<CodeGenerateResult> =>
    request<CodeGenerateResult>({ method: 'POST', url: '/code/mappings/generate', data }),

  mappingPage: (params: CodeMappingQuery): Promise<PageResult<CodeMappingItem>> =>
    request<PageResult<CodeMappingItem>>({ method: 'GET', url: '/code/mappings', params }),

  mappingDetail: (mappingId: number): Promise<CodeMappingDetail> =>
    request<CodeMappingDetail>({ method: 'GET', url: `/code/mappings/${mappingId}` }),

  mappingBySource: (sourceCode: string): Promise<CodeMappingItem> =>
    request<CodeMappingItem>({ method: 'GET', url: `/code/mappings/by-source/${encodeURIComponent(sourceCode)}` }),

  mappingByTarget: (targetCode: string): Promise<CodeMappingItem> =>
    request<CodeMappingItem>({ method: 'GET', url: `/code/mappings/by-target/${encodeURIComponent(targetCode)}` }),

  mappingVoid: (mappingId: number, data: CodeVoidParams): Promise<void> =>
    request<void>({ method: 'POST', url: `/code/mappings/${mappingId}/void`, data }),

  /* ---------------- 扫描换标 ---------------- */

  scan: (data: RelabelScanParams): Promise<RelabelScanResult> =>
    request<RelabelScanResult>({ method: 'POST', url: '/relabel/scan', data }),

  scanBatch: (data: RelabelBatchParams): Promise<RelabelScanResult[]> =>
    request<RelabelScanResult[]>({ method: 'POST', url: '/relabel/scan/batch', data }),

  parse: (data: CodeParseParams): Promise<CodeParseResult> =>
    request<CodeParseResult>({ method: 'POST', url: '/relabel/parse', data }),

  logPage: (params: ScanLogQuery): Promise<PageResult<ScanLogItem>> =>
    request<PageResult<ScanLogItem>>({ method: 'GET', url: '/relabel/logs', params }),

  logDetail: (scanLogId: number): Promise<ScanLogItem> =>
    request<ScanLogItem>({ method: 'GET', url: `/relabel/logs/${scanLogId}` }),
};
