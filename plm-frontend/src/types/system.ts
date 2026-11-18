import type { PageQuery } from './common';

/** 通用状态：1 启用 / 0 停用 */
export const STATUS_ENABLED = 1;
export const STATUS_DISABLED = 0;

/* ---------------- 用户管理 ---------------- */

/** 用户列表项 */
export interface UserItem {
  userId: number;
  username: string;
  displayName: string;
  email?: string;
  phone?: string;
  orgId?: number;
  orgName?: string;
  status: number;
  roleIds: number[];
  remark?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

/** 用户分页查询入参 */
export interface UserQuery extends PageQuery {
  orgId?: number;
  status?: number;
}

/** 用户新增/编辑入参（编辑时 password 留空表示不修改） */
export interface UserSaveParams {
  username: string;
  password?: string;
  displayName: string;
  email?: string;
  phone?: string;
  orgId?: number;
  status: number;
  roleIds: number[];
  remark?: string;
}

/* ---------------- 组织管理 ---------------- */

/** 组织树节点 */
export interface Organization {
  orgId: number;
  orgCode: string;
  orgName: string;
  parentId: number | null;
  orgType: string;
  sortNo: number;
  status: number;
  remark?: string;
  children?: Organization[];
}

/** 组织新增/编辑入参 */
export interface OrganizationSaveParams {
  orgCode: string;
  orgName: string;
  parentId?: number | null;
  orgType: string;
  sortNo: number;
  status: number;
  remark?: string;
}

/* ---------------- 角色管理 ---------------- */

/** 角色列表项 */
export interface RoleItem {
  roleId: number;
  roleCode: string;
  roleName: string;
  dataScope: string;
  status: number;
  remark?: string;
  createdAt?: string;
}

/** 角色下拉选项 */
export interface RoleOption {
  id: number;
  roleCode: string;
  roleName: string;
  dataScope: string;
  status: number;
  remark?: string;
}

/** 角色分页查询入参 */
export interface RoleQuery extends PageQuery {
  status?: number;
}

/** 角色新增/编辑入参 */
export interface RoleSaveParams {
  roleCode: string;
  roleName: string;
  dataScope: string;
  status: number;
  remark?: string;
}

/* ---------------- 权限 ---------------- */

/** 权限类型：菜单 / 按钮 / 接口 */
export type PermissionType = 'menu' | 'button' | 'api';

/** 权限节点（树或扁平结构） */
export interface PermissionNode {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  permissionType: PermissionType;
  parentId: number | null;
  path?: string;
  icon?: string;
  sortNo: number;
  status: number;
  children?: PermissionNode[];
}

/* ---------------- 数据字典 ---------------- */

/** 字典项 */
export interface DictionaryItem {
  id: number;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  sortNo: number;
  status: number;
  remark?: string;
}

/** 字典分页查询入参 */
export interface DictionaryQuery extends PageQuery {
  dictType?: string;
  status?: number;
}

/** 字典新增/编辑入参 */
export interface DictionarySaveParams {
  dictType: string;
  dictLabel: string;
  dictValue: string;
  sortNo: number;
  status: number;
  remark?: string;
}

/* ---------------- 配置项 ---------------- */

/** 配置项 */
export interface ConfigItem {
  id: number;
  category: string;
  configKey: string;
  configName: string;
  configValue: string;
  pendingConfirm: number;
  editable: number;
  remark?: string;
}

/** 配置项分页查询入参 */
export interface ConfigQuery extends PageQuery {
  category?: string;
  pendingConfirm?: number;
}

/** 配置项新增/编辑入参 */
export interface ConfigSaveParams {
  category: string;
  configKey: string;
  configName: string;
  configValue: string;
  pendingConfirm: number;
  editable: number;
  remark?: string;
}

/** 配置分类：编码 / 标签 / EDI / 物料规则 */
export const CONFIG_CATEGORIES: { value: string; label: string }[] = [
  { value: 'CODE', label: '编码规则' },
  { value: 'LABEL', label: '标签规则' },
  { value: 'EDI', label: 'EDI 规则' },
  { value: 'MATERIAL', label: '物料规则' },
];

/* ---------------- 审计日志 ---------------- */

/** 审计日志 */
export interface AuditLogItem {
  id: number;
  traceId: string;
  userId?: number;
  username: string;
  module: string;
  httpMethod: string;
  uri: string;
  ip: string;
  requestParams?: string;
  resultCode: number;
  success: boolean;
  costMs: number;
  errorMessage?: string;
  createdAt: string;
}

/** 审计日志分页查询入参 */
export interface AuditLogQuery extends PageQuery {
  module?: string;
  username?: string;
  success?: boolean;
}
