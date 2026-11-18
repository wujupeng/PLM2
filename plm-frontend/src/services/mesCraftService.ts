import { request } from '@/services/request';
import type { PageResult } from '@/types/common';
import type {
  MesProcessVersion,
  MesProcessVersionQuery,
  MesProcessVersionSaveRequest,
  MesSop,
  MesSopQuery,
  MesSopSaveRequest,
  MesRecipe,
  MesRecipeQuery,
  MesRecipeSaveRequest,
  MesFai,
  MesFaiQuery,
  MesFaiSaveRequest,
  MesChangeover,
  MesChangeoverQuery,
  MesChangeoverSaveRequest,
} from '@/types/mesCraft';

/** G6-N2 MES 工艺与作业（T038，后端 Base: /mes/craft）服务定义。 */

const BASE = '/mes/craft';

/* ---------------- 1. 工艺版本 ---------------- */

export const mesProcessVersionService = {
  page: (params: MesProcessVersionQuery): Promise<PageResult<MesProcessVersion>> =>
    request<PageResult<MesProcessVersion>>({ method: 'GET', url: `${BASE}/versions`, params }),

  detail: (id: number): Promise<MesProcessVersion> =>
    request<MesProcessVersion>({ method: 'GET', url: `${BASE}/versions/${id}` }),

  create: (data: MesProcessVersionSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/versions`, data }),

  update: (id: number, data: MesProcessVersionSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/versions/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/versions/${id}` }),
};

/* ---------------- 2. SOP作业指导书 ---------------- */

export const mesSopService = {
  page: (params: MesSopQuery): Promise<PageResult<MesSop>> =>
    request<PageResult<MesSop>>({ method: 'GET', url: `${BASE}/sops`, params }),

  detail: (id: number): Promise<MesSop> =>
    request<MesSop>({ method: 'GET', url: `${BASE}/sops/${id}` }),

  create: (data: MesSopSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/sops`, data }),

  update: (id: number, data: MesSopSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/sops/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/sops/${id}` }),
};

/* ---------------- 3. 参数配方 ---------------- */

export const mesRecipeService = {
  page: (params: MesRecipeQuery): Promise<PageResult<MesRecipe>> =>
    request<PageResult<MesRecipe>>({ method: 'GET', url: `${BASE}/recipes`, params }),

  detail: (id: number): Promise<MesRecipe> =>
    request<MesRecipe>({ method: 'GET', url: `${BASE}/recipes/${id}` }),

  create: (data: MesRecipeSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/recipes`, data }),

  update: (id: number, data: MesRecipeSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/recipes/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/recipes/${id}` }),
};

/* ---------------- 4. 首件确认 ---------------- */

export const mesFaiService = {
  page: (params: MesFaiQuery): Promise<PageResult<MesFai>> =>
    request<PageResult<MesFai>>({ method: 'GET', url: `${BASE}/fais`, params }),

  detail: (id: number): Promise<MesFai> =>
    request<MesFai>({ method: 'GET', url: `${BASE}/fais/${id}` }),

  create: (data: MesFaiSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/fais`, data }),

  update: (id: number, data: MesFaiSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/fais/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/fais/${id}` }),
};

/* ---------------- 5. 换线换型 ---------------- */

export const mesChangeoverService = {
  page: (params: MesChangeoverQuery): Promise<PageResult<MesChangeover>> =>
    request<PageResult<MesChangeover>>({ method: 'GET', url: `${BASE}/changeovers`, params }),

  detail: (id: number): Promise<MesChangeover> =>
    request<MesChangeover>({ method: 'GET', url: `${BASE}/changeovers/${id}` }),

  create: (data: MesChangeoverSaveRequest): Promise<number> =>
    request<number>({ method: 'POST', url: `${BASE}/changeovers`, data }),

  update: (id: number, data: MesChangeoverSaveRequest): Promise<number> =>
    request<number>({ method: 'PUT', url: `${BASE}/changeovers/${id}`, data }),

  remove: (id: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `${BASE}/changeovers/${id}` }),
};
