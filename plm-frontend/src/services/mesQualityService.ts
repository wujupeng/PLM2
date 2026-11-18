import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesInspectionSpec,
  MesInspectionSpecQuery,
  MesInspectionSpecSaveRequest,
  MesIncomingInspection,
  MesIncomingInspectionQuery,
  MesIncomingInspectionSaveRequest,
  MesFirstInspection,
  MesFirstInspectionQuery,
  MesFirstInspectionSaveRequest,
  MesPatrolInspection,
  MesPatrolInspectionQuery,
  MesPatrolInspectionSaveRequest,
  MesLastInspection,
  MesLastInspectionQuery,
  MesLastInspectionSaveRequest,
  MesFinalInspection,
  MesFinalInspectionQuery,
  MesFinalInspectionSaveRequest,
  MesInspectionJudge,
  MesInspectionJudgeQuery,
  MesInspectionJudgeSaveRequest,
  MesQuarantine,
  MesQuarantineQuery,
  MesQuarantineSaveRequest,
} from '@/types/mesQuality';

/** G6-N5 MES 质量检验（T041，后端 Base: /mes/quality）服务定义。 */

const BASE = '/mes/quality';

/* ---------------- 1. 检验规范 ---------------- */

export const mesInspectionSpecService = {
  page: (params: MesInspectionSpecQuery): Promise<PageResult<MesInspectionSpec>> =>
    request<PageResult<MesInspectionSpec>>({ method: 'GET', url: `${BASE}/specs`, params }),

  detail: (id: number): Promise<MesInspectionSpec> =>
    request<MesInspectionSpec>({ method: 'GET', url: `${BASE}/specs/${id}` }),

  create: (data: MesInspectionSpecSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/specs`, data }),

  update: (id: number, data: MesInspectionSpecSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/specs/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/specs/${id}` }),
};

/* ---------------- 2. 来料检验 ---------------- */

export const mesIncomingInspectionService = {
  page: (params: MesIncomingInspectionQuery): Promise<PageResult<MesIncomingInspection>> =>
    request<PageResult<MesIncomingInspection>>({ method: 'GET', url: `${BASE}/incomings`, params }),

  detail: (id: number): Promise<MesIncomingInspection> =>
    request<MesIncomingInspection>({ method: 'GET', url: `${BASE}/incomings/${id}` }),

  create: (data: MesIncomingInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/incomings`, data }),

  update: (id: number, data: MesIncomingInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/incomings/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/incomings/${id}` }),
};

/* ---------------- 3. 首件检验 ---------------- */

export const mesFirstInspectionService = {
  page: (params: MesFirstInspectionQuery): Promise<PageResult<MesFirstInspection>> =>
    request<PageResult<MesFirstInspection>>({ method: 'GET', url: `${BASE}/firsts`, params }),

  detail: (id: number): Promise<MesFirstInspection> =>
    request<MesFirstInspection>({ method: 'GET', url: `${BASE}/firsts/${id}` }),

  create: (data: MesFirstInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/firsts`, data }),

  update: (id: number, data: MesFirstInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/firsts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/firsts/${id}` }),
};

/* ---------------- 4. 巡检记录 ---------------- */

export const mesPatrolInspectionService = {
  page: (params: MesPatrolInspectionQuery): Promise<PageResult<MesPatrolInspection>> =>
    request<PageResult<MesPatrolInspection>>({ method: 'GET', url: `${BASE}/patrols`, params }),

  detail: (id: number): Promise<MesPatrolInspection> =>
    request<MesPatrolInspection>({ method: 'GET', url: `${BASE}/patrols/${id}` }),

  create: (data: MesPatrolInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/patrols`, data }),

  update: (id: number, data: MesPatrolInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/patrols/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/patrols/${id}` }),
};

/* ---------------- 5. 末件检验 ---------------- */

export const mesLastInspectionService = {
  page: (params: MesLastInspectionQuery): Promise<PageResult<MesLastInspection>> =>
    request<PageResult<MesLastInspection>>({ method: 'GET', url: `${BASE}/lasts`, params }),

  detail: (id: number): Promise<MesLastInspection> =>
    request<MesLastInspection>({ method: 'GET', url: `${BASE}/lasts/${id}` }),

  create: (data: MesLastInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/lasts`, data }),

  update: (id: number, data: MesLastInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/lasts/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/lasts/${id}` }),
};

/* ---------------- 6. 终检记录 ---------------- */

export const mesFinalInspectionService = {
  page: (params: MesFinalInspectionQuery): Promise<PageResult<MesFinalInspection>> =>
    request<PageResult<MesFinalInspection>>({ method: 'GET', url: `${BASE}/finals`, params }),

  detail: (id: number): Promise<MesFinalInspection> =>
    request<MesFinalInspection>({ method: 'GET', url: `${BASE}/finals/${id}` }),

  create: (data: MesFinalInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/finals`, data }),

  update: (id: number, data: MesFinalInspectionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/finals/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/finals/${id}` }),
};

/* ---------------- 7. 检验判定 ---------------- */

export const mesInspectionJudgeService = {
  page: (params: MesInspectionJudgeQuery): Promise<PageResult<MesInspectionJudge>> =>
    request<PageResult<MesInspectionJudge>>({ method: 'GET', url: `${BASE}/judges`, params }),

  detail: (id: number): Promise<MesInspectionJudge> =>
    request<MesInspectionJudge>({ method: 'GET', url: `${BASE}/judges/${id}` }),

  create: (data: MesInspectionJudgeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/judges`, data }),

  update: (id: number, data: MesInspectionJudgeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/judges/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/judges/${id}` }),
};

/* ---------------- 8. 隔离记录 ---------------- */

export const mesQuarantineService = {
  page: (params: MesQuarantineQuery): Promise<PageResult<MesQuarantine>> =>
    request<PageResult<MesQuarantine>>({ method: 'GET', url: `${BASE}/quarantines`, params }),

  detail: (id: number): Promise<MesQuarantine> =>
    request<MesQuarantine>({ method: 'GET', url: `${BASE}/quarantines/${id}` }),

  create: (data: MesQuarantineSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/quarantines`, data }),

  update: (id: number, data: MesQuarantineSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/quarantines/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/quarantines/${id}` }),
};
