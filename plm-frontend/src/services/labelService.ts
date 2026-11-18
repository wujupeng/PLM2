import instance, { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  LabelTemplateItem,
  LabelTemplateQuery,
  LabelTemplateSaveParams,
  LabelRenderParams,
  LabelRenderResult,
  LabelPrintTaskItem,
  LabelPrintQuery,
  LabelPrintParams,
  LabelReprintParams,
  LabelPrintLogItem,
  LabelPrintLogQuery,
} from '@/types/label';

/** 标签模板、条码与打印补打 */
export const labelService = {
  /* ---------------- 标签模板 ---------------- */

  templatePage: (params: LabelTemplateQuery): Promise<PageResult<LabelTemplateItem>> =>
    request<PageResult<LabelTemplateItem>>({ method: 'GET', url: '/label/templates', params }),

  templateOptions: (labelType?: string): Promise<LabelTemplateItem[]> =>
    request<LabelTemplateItem[]>({ method: 'GET', url: '/label/templates/options', params: { labelType } }),

  templateDetail: (templateId: number): Promise<LabelTemplateItem> =>
    request<LabelTemplateItem>({ method: 'GET', url: `/label/templates/${templateId}` }),

  templateCreate: (data: LabelTemplateSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/label/templates', data }),

  templateUpdate: (templateId: number, data: LabelTemplateSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/label/templates/${templateId}`, data }),

  templateRemove: (templateId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/label/templates/${templateId}` }),

  templateRelease: (templateId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/label/templates/${templateId}/release` }),

  templateDisable: (templateId: number): Promise<void> =>
    request<void>({ method: 'POST', url: `/label/templates/${templateId}/disable` }),

  /** 标签渲染（回显布局元素与 Data Matrix） */
  render: (data: LabelRenderParams): Promise<LabelRenderResult> =>
    request<LabelRenderResult>({ method: 'POST', url: '/label/templates/render', data }),

  /* ---------------- 条码 ---------------- */

  /** 条码 Base64 PNG（返回 data:image/png;base64,... ） */
  barcodeBase64: (content: string, barcodeType = 'DATA_MATRIX', sizePx?: number): Promise<string> =>
    request<string>({ method: 'GET', url: '/label/barcode/base64', params: { content, barcodeType, sizePx } }),

  barcodeSvg: (content: string, barcodeType = 'DATA_MATRIX', moduleSize?: number): Promise<string> =>
    request<string>({ method: 'GET', url: '/label/barcode/svg', params: { content, barcodeType, moduleSize } }),

  barcodeMatrix: (content: string, barcodeType = 'DATA_MATRIX'): Promise<string[]> =>
    request<string[]>({ method: 'GET', url: '/label/barcode/matrix', params: { content, barcodeType } }),

  /** 条码 PNG 下载地址（直接用于 img/a 标签或 window.open） */
  barcodePngUrl: (content: string, barcodeType = 'DATA_MATRIX', sizePx = 240): string =>
    `/api/label/barcode/png?content=${encodeURIComponent(content)}&barcodeType=${barcodeType}&sizePx=${sizePx}`,

  /** 条码 PNG 二进制（用于本地下载） */
  barcodePng: (content: string, barcodeType = 'DATA_MATRIX', sizePx?: number): Promise<Blob> =>
    instance
      .request({
        method: 'GET',
        url: '/label/barcode/png',
        params: { content, barcodeType, sizePx },
        responseType: 'blob',
      })
      .then((resp) => resp.data as Blob),

  /* ---------------- 打印与补打 ---------------- */

  printPage: (params: LabelPrintQuery): Promise<PageResult<LabelPrintTaskItem>> =>
    request<PageResult<LabelPrintTaskItem>>({ method: 'GET', url: '/label/prints', params }),

  printDetail: (taskId: number): Promise<LabelPrintTaskItem> =>
    request<LabelPrintTaskItem>({ method: 'GET', url: `/label/prints/${taskId}` }),

  printLogsByTask: (taskId: number): Promise<LabelPrintLogItem[]> =>
    request<LabelPrintLogItem[]>({ method: 'GET', url: `/label/prints/${taskId}/logs` }),

  printLogPage: (params: LabelPrintLogQuery): Promise<PageResult<LabelPrintLogItem>> =>
    request<PageResult<LabelPrintLogItem>>({ method: 'GET', url: '/label/prints/logs', params }),

  printCreate: (data: LabelPrintParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/label/prints', data }),

  printBatch: (data: LabelPrintParams[]): Promise<number[]> =>
    request<number[]>({ method: 'POST', url: '/label/prints/batch', data }),

  reprint: (taskId: number, data: LabelReprintParams): Promise<number> =>
    request<number>({ method: 'POST', url: `/label/prints/${taskId}/reprint`, data }),

  voidTask: (taskId: number, reason?: string): Promise<void> =>
    request<void>({ method: 'POST', url: `/label/prints/${taskId}/void`, params: { reason } }),
};
