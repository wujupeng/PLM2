import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesEquipment,
  MesEquipmentQuery,
  MesEquipmentSaveRequest,
  MesEquipmentStatus,
  MesEquipmentStatusQuery,
  MesEquipmentStatusSaveRequest,
  MesEquipmentCheck,
  MesEquipmentCheckQuery,
  MesEquipmentCheckSaveRequest,
  MesEquipmentMaintenance,
  MesEquipmentMaintenanceQuery,
  MesEquipmentMaintenanceSaveRequest,
  MesEquipmentFault,
  MesEquipmentFaultQuery,
  MesEquipmentFaultSaveRequest,
  MesToolLife,
  MesToolLifeQuery,
  MesToolLifeSaveRequest,
} from '@/types/mesEquipment';

/** G6-N4 MES 设备与工装（T040，后端 Base: /mes/equipment）服务定义。 */

const BASE = '/mes/equipment';

/* ---------------- 1. 设备台账 ---------------- */

export const mesEquipmentService = {
  page: (params: MesEquipmentQuery): Promise<PageResult<MesEquipment>> =>
    request<PageResult<MesEquipment>>({ method: 'GET', url: `${BASE}/ledgers`, params }),

  detail: (id: number): Promise<MesEquipment> =>
    request<MesEquipment>({ method: 'GET', url: `${BASE}/ledgers/${id}` }),

  create: (data: MesEquipmentSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/ledgers`, data }),

  update: (id: number, data: MesEquipmentSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/ledgers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/ledgers/${id}` }),
};

/* ---------------- 2. 设备状态 ---------------- */

export const mesEquipmentStatusService = {
  page: (params: MesEquipmentStatusQuery): Promise<PageResult<MesEquipmentStatus>> =>
    request<PageResult<MesEquipmentStatus>>({ method: 'GET', url: `${BASE}/statuses`, params }),

  detail: (id: number): Promise<MesEquipmentStatus> =>
    request<MesEquipmentStatus>({ method: 'GET', url: `${BASE}/statuses/${id}` }),

  create: (data: MesEquipmentStatusSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/statuses`, data }),

  update: (id: number, data: MesEquipmentStatusSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/statuses/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/statuses/${id}` }),
};

/* ---------------- 3. 设备点检 ---------------- */

export const mesEquipmentCheckService = {
  page: (params: MesEquipmentCheckQuery): Promise<PageResult<MesEquipmentCheck>> =>
    request<PageResult<MesEquipmentCheck>>({ method: 'GET', url: `${BASE}/checks`, params }),

  detail: (id: number): Promise<MesEquipmentCheck> =>
    request<MesEquipmentCheck>({ method: 'GET', url: `${BASE}/checks/${id}` }),

  create: (data: MesEquipmentCheckSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/checks`, data }),

  update: (id: number, data: MesEquipmentCheckSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/checks/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/checks/${id}` }),
};

/* ---------------- 4. 设备保养 ---------------- */

export const mesEquipmentMaintenanceService = {
  page: (params: MesEquipmentMaintenanceQuery): Promise<PageResult<MesEquipmentMaintenance>> =>
    request<PageResult<MesEquipmentMaintenance>>({ method: 'GET', url: `${BASE}/maintenances`, params }),

  detail: (id: number): Promise<MesEquipmentMaintenance> =>
    request<MesEquipmentMaintenance>({ method: 'GET', url: `${BASE}/maintenances/${id}` }),

  create: (data: MesEquipmentMaintenanceSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/maintenances`, data }),

  update: (id: number, data: MesEquipmentMaintenanceSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/maintenances/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/maintenances/${id}` }),
};

/* ---------------- 5. 设备故障 ---------------- */

export const mesEquipmentFaultService = {
  page: (params: MesEquipmentFaultQuery): Promise<PageResult<MesEquipmentFault>> =>
    request<PageResult<MesEquipmentFault>>({ method: 'GET', url: `${BASE}/faults`, params }),

  detail: (id: number): Promise<MesEquipmentFault> =>
    request<MesEquipmentFault>({ method: 'GET', url: `${BASE}/faults/${id}` }),

  create: (data: MesEquipmentFaultSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/faults`, data }),

  update: (id: number, data: MesEquipmentFaultSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/faults/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/faults/${id}` }),
};

/* ---------------- 6. 工装寿命 ---------------- */

export const mesToolLifeService = {
  page: (params: MesToolLifeQuery): Promise<PageResult<MesToolLife>> =>
    request<PageResult<MesToolLife>>({ method: 'GET', url: `${BASE}/tools`, params }),

  detail: (id: number): Promise<MesToolLife> =>
    request<MesToolLife>({ method: 'GET', url: `${BASE}/tools/${id}` }),

  create: (data: MesToolLifeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/tools`, data }),

  update: (id: number, data: MesToolLifeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/tools/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/tools/${id}` }),
};
