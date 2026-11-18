import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  WmsFinishedGoods,
  WmsFinishedGoodsQuery,
  WmsFinishedGoodsSaveRequest,
  WmsOutboundWave,
  WmsOutboundWaveQuery,
  WmsOutboundWaveSaveRequest,
  WmsShipmentOrder,
  WmsShipmentOrderQuery,
  WmsShipmentOrderSaveRequest,
} from '@/types/wmsOutbound';

/** G5-N6 WMS 成品与发运（T050，后端 Base: /wms/outbound）服务定义。 */

const BASE = '/wms/outbound';

/* ---------------- 1. 成品入库 ---------------- */

export const wmsFinishedGoodsService = {
  page: (params: WmsFinishedGoodsQuery): Promise<PageResult<WmsFinishedGoods>> =>
    request<PageResult<WmsFinishedGoods>>({ method: 'GET', url: `${BASE}/finished-goods`, params }),

  detail: (id: number): Promise<WmsFinishedGoods> =>
    request<WmsFinishedGoods>({ method: 'GET', url: `${BASE}/finished-goods/${id}` }),

  create: (data: WmsFinishedGoodsSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/finished-goods`, data }),

  update: (id: number, data: WmsFinishedGoodsSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/finished-goods/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/finished-goods/${id}` }),
};

/* ---------------- 2. 出库波次 ---------------- */

export const wmsOutboundWaveService = {
  page: (params: WmsOutboundWaveQuery): Promise<PageResult<WmsOutboundWave>> =>
    request<PageResult<WmsOutboundWave>>({ method: 'GET', url: `${BASE}/waves`, params }),

  detail: (id: number): Promise<WmsOutboundWave> =>
    request<WmsOutboundWave>({ method: 'GET', url: `${BASE}/waves/${id}` }),

  create: (data: WmsOutboundWaveSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/waves`, data }),

  update: (id: number, data: WmsOutboundWaveSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/waves/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/waves/${id}` }),
};

/* ---------------- 3. 发运单 ---------------- */

export const wmsShipmentOrderService = {
  page: (params: WmsShipmentOrderQuery): Promise<PageResult<WmsShipmentOrder>> =>
    request<PageResult<WmsShipmentOrder>>({ method: 'GET', url: `${BASE}/shipments`, params }),

  detail: (id: number): Promise<WmsShipmentOrder> =>
    request<WmsShipmentOrder>({ method: 'GET', url: `${BASE}/shipments/${id}` }),

  create: (data: WmsShipmentOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/shipments`, data }),

  update: (id: number, data: WmsShipmentOrderSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/shipments/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/shipments/${id}` }),
};
