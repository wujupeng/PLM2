import { request } from './request';
import type { PageResult } from '@/types/common';
import type {
  UserItem,
  UserQuery,
  UserSaveParams,
  Organization,
  OrganizationSaveParams,
  RoleItem,
  RoleOption,
  RoleQuery,
  RoleSaveParams,
  PermissionNode,
  DictionaryItem,
  DictionaryQuery,
  DictionarySaveParams,
  ConfigItem,
  ConfigQuery,
  ConfigSaveParams,
  AuditLogItem,
  AuditLogQuery,
} from '@/types/system';

/** 用户管理 */
export const userService = {
  page: (params: UserQuery): Promise<PageResult<UserItem>> =>
    request<PageResult<UserItem>>({ method: 'GET', url: '/system/users', params }),

  detail: (userId: number): Promise<UserItem> =>
    request<UserItem>({ method: 'GET', url: `/system/users/${userId}` }),

  create: (data: UserSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/system/users', data }),

  update: (userId: number, data: UserSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/users/${userId}`, data }),

  remove: (userId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/system/users/${userId}` }),

  changeStatus: (userId: number, status: number): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/users/${userId}/status`, data: { status } }),

  resetPassword: (userId: number, password: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/users/${userId}/password`, data: { password } }),
};

/** 组织管理 */
export const organizationService = {
  tree: (): Promise<Organization[]> =>
    request<Organization[]>({ method: 'GET', url: '/system/organizations/tree' }),

  create: (data: OrganizationSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/system/organizations', data }),

  update: (orgId: number, data: OrganizationSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/organizations/${orgId}`, data }),

  remove: (orgId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/system/organizations/${orgId}` }),
};

/** 角色管理 */
export const roleService = {
  page: (params: RoleQuery): Promise<PageResult<RoleItem>> =>
    request<PageResult<RoleItem>>({ method: 'GET', url: '/system/roles', params }),

  options: (): Promise<RoleOption[]> =>
    request<RoleOption[]>({ method: 'GET', url: '/system/roles/options' }),

  create: (data: RoleSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/system/roles', data }),

  update: (roleId: number, data: RoleSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/roles/${roleId}`, data }),

  remove: (roleId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/system/roles/${roleId}` }),

  getPermissions: (roleId: number): Promise<number[]> =>
    request<number[]>({ method: 'GET', url: `/system/roles/${roleId}/permissions` }),

  assignPermissions: (roleId: number, permissionIds: number[]): Promise<void> =>
    request<void>({
      method: 'PUT',
      url: `/system/roles/${roleId}/permissions`,
      data: { permissionIds },
    }),
};

/** 权限 */
export const permissionService = {
  tree: (): Promise<PermissionNode[]> =>
    request<PermissionNode[]>({ method: 'GET', url: '/system/permissions/tree' }),

  list: (): Promise<PermissionNode[]> =>
    request<PermissionNode[]>({ method: 'GET', url: '/system/permissions' }),
};

/** 数据字典 */
export const dictionaryService = {
  page: (params: DictionaryQuery): Promise<PageResult<DictionaryItem>> =>
    request<PageResult<DictionaryItem>>({ method: 'GET', url: '/system/dictionaries', params }),

  byType: (dictType: string): Promise<DictionaryItem[]> =>
    request<DictionaryItem[]>({ method: 'GET', url: '/system/dictionaries/by-type', params: { dictType } }),

  create: (data: DictionarySaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/system/dictionaries', data }),

  update: (dictId: number, data: DictionarySaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/dictionaries/${dictId}`, data }),

  remove: (dictId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/system/dictionaries/${dictId}` }),
};

/** 配置项管理 */
export const configService = {
  page: (params: ConfigQuery): Promise<PageResult<ConfigItem>> =>
    request<PageResult<ConfigItem>>({ method: 'GET', url: '/system/configs', params }),

  byCategory: (category: string): Promise<ConfigItem[]> =>
    request<ConfigItem[]>({ method: 'GET', url: '/system/configs/by-category', params: { category } }),

  create: (data: ConfigSaveParams): Promise<number> =>
    request<number>({ method: 'POST', url: '/system/configs', data }),

  update: (configId: number, data: ConfigSaveParams): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/configs/${configId}`, data }),

  updateValue: (configId: number, configValue: string): Promise<void> =>
    request<void>({ method: 'PUT', url: `/system/configs/${configId}/value`, data: { configValue } }),

  remove: (configId: number): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/system/configs/${configId}` }),
};

/** 审计日志 */
export const auditLogService = {
  page: (params: AuditLogQuery): Promise<PageResult<AuditLogItem>> =>
    request<PageResult<AuditLogItem>>({ method: 'GET', url: '/system/audit-logs', params }),
};
