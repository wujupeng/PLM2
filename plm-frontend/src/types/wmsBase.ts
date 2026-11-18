import type { PageQuery } from '@/types/common';

/** G5-N1 WMS 仓库基础（T045，后端 Base: /wms/base）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 仓库管理分页查询条件。keyword 匹配 warehouseCode/warehouseName/manager/address。 */
export interface WmsWarehouseQuery extends PageQuery {
  warehouseType?: string;
  warehouseStatus?: string;
}

/** 库区分页查询条件。keyword 匹配 zoneCode/zoneName/warehouseCode/warehouseName。 */
export interface WmsZoneQuery extends PageQuery {
  zoneType?: string;
  zoneStatus?: string;
  warehouseCode?: string;
}

/** 库位管理分页查询条件。keyword 匹配 binCode/binName/warehouseCode/zoneCode/barcode。 */
export interface WmsBinQuery extends PageQuery {
  binType?: string;
  binStatus?: string;
  warehouseCode?: string;
  zoneCode?: string;
}

/** 货架分页查询条件。keyword 匹配 rackCode/rackName/warehouseCode/zoneCode/barcode。 */
export interface WmsRackQuery extends PageQuery {
  rackStatus?: string;
  warehouseCode?: string;
  zoneCode?: string;
}

/** 容器管理分页查询条件。keyword 匹配 containerCode/containerName/barcode/currentBinCode。 */
export interface WmsContainerQuery extends PageQuery {
  containerType?: string;
  containerStatus?: string;
}

/** 作业策略分页查询条件。keyword 匹配 strategyCode/strategyName。 */
export interface WmsStrategyQuery extends PageQuery {
  strategyType?: string;
  strategyStatus?: string;
}

/* ---------------- 1. 仓库管理 ---------------- */

export interface WmsWarehouse {
  id?: number;
  warehouseCode?: string;
  warehouseName?: string;
  warehouseType?: string;
  address?: string;
  manager?: string;
  contactPhone?: string;
  area?: number | null;
  warehouseStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsWarehouseSaveRequest = Omit<
  WmsWarehouse,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 库区管理 ---------------- */

export interface WmsZone {
  id?: number;
  zoneCode?: string;
  zoneName?: string;
  warehouseCode?: string;
  warehouseName?: string;
  zoneType?: string;
  temperatureType?: string;
  zoneStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsZoneSaveRequest = Omit<
  WmsZone,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 库位管理 ---------------- */

export interface WmsBin {
  id?: number;
  binCode?: string;
  binName?: string;
  warehouseCode?: string;
  zoneCode?: string;
  binType?: string;
  maxCapacity?: number | null;
  usedCapacity?: number | null;
  capacityUnit?: string;
  barcode?: string;
  binStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsBinSaveRequest = Omit<
  WmsBin,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 货架管理 ---------------- */

export interface WmsRack {
  id?: number;
  rackCode?: string;
  rackName?: string;
  warehouseCode?: string;
  zoneCode?: string;
  rackType?: string;
  layerCount?: number | null;
  binCount?: number | null;
  maxLoad?: number | null;
  barcode?: string;
  rackStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsRackSaveRequest = Omit<
  WmsRack,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 容器管理 ---------------- */

export interface WmsContainer {
  id?: number;
  containerCode?: string;
  containerName?: string;
  containerType?: string;
  capacity?: number | null;
  capacityUnit?: string;
  currentBinCode?: string;
  barcode?: string;
  containerStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsContainerSaveRequest = Omit<
  WmsContainer,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 6. 作业策略 ---------------- */

export interface WmsStrategy {
  id?: number;
  strategyCode?: string;
  strategyName?: string;
  strategyType?: string;
  priority?: number | null;
  fifoFlag?: number | null;
  ruleContent?: string;
  strategyStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WmsStrategySaveRequest = Omit<
  WmsStrategy,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

/** 仓库类型：RAW/SEMI/FINISHED/VMI/OTHER。 */
export const WMS_WAREHOUSE_TYPE_OPTIONS = [
  { label: '原料仓', value: 'RAW' },
  { label: '半成品仓', value: 'SEMI' },
  { label: '成品仓', value: 'FINISHED' },
  { label: 'VMI 仓', value: 'VMI' },
  { label: '其他仓', value: 'OTHER' },
] as const;
export const WMS_WAREHOUSE_TYPE_LABEL: Record<string, string> = {
  RAW: '原料仓',
  SEMI: '半成品仓',
  FINISHED: '成品仓',
  VMI: 'VMI 仓',
  OTHER: '其他仓',
};

/** 仓库状态：DRAFT/ACTIVE/LOCKED/DISABLED。 */
export const WMS_WAREHOUSE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ACTIVE' },
  { label: '冻结', value: 'LOCKED' },
  { label: '停用', value: 'DISABLED' },
] as const;
export const WMS_WAREHOUSE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '启用',
  LOCKED: '冻结',
  DISABLED: '停用',
};

/** 库区类型：STORAGE/RECEIVING/SHIPPING/QUARANTINE/DEFECT/VMI。 */
export const WMS_ZONE_TYPE_OPTIONS = [
  { label: '存储区', value: 'STORAGE' },
  { label: '收货区', value: 'RECEIVING' },
  { label: '发货区', value: 'SHIPPING' },
  { label: '待检区', value: 'QUARANTINE' },
  { label: '不良品区', value: 'DEFECT' },
  { label: 'VMI 区', value: 'VMI' },
] as const;
export const WMS_ZONE_TYPE_LABEL: Record<string, string> = {
  STORAGE: '存储区',
  RECEIVING: '收货区',
  SHIPPING: '发货区',
  QUARANTINE: '待检区',
  DEFECT: '不良品区',
  VMI: 'VMI 区',
};

/** 温层类型：NORMAL/CONSTANT/COLD。 */
export const WMS_TEMPERATURE_TYPE_OPTIONS = [
  { label: '常温', value: 'NORMAL' },
  { label: '恒温', value: 'CONSTANT' },
  { label: '冷链', value: 'COLD' },
] as const;
export const WMS_TEMPERATURE_TYPE_LABEL: Record<string, string> = {
  NORMAL: '常温',
  CONSTANT: '恒温',
  COLD: '冷链',
};

/** 库区状态：DRAFT/ACTIVE/LOCKED/DISABLED。 */
export const WMS_ZONE_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ACTIVE' },
  { label: '冻结', value: 'LOCKED' },
  { label: '停用', value: 'DISABLED' },
] as const;
export const WMS_ZONE_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '启用',
  LOCKED: '冻结',
  DISABLED: '停用',
};

/** 库位类型：STORAGE/PICK/FLOOR/STAGE。 */
export const WMS_BIN_TYPE_OPTIONS = [
  { label: '存储位', value: 'STORAGE' },
  { label: '拣选位', value: 'PICK' },
  { label: '地堆位', value: 'FLOOR' },
  { label: '暂存位', value: 'STAGE' },
] as const;
export const WMS_BIN_TYPE_LABEL: Record<string, string> = {
  STORAGE: '存储位',
  PICK: '拣选位',
  FLOOR: '地堆位',
  STAGE: '暂存位',
};

/** 库位状态：IDLE/OCCUPIED/LOCKED/DISABLED。 */
export const WMS_BIN_STATUS_OPTIONS = [
  { label: '空闲', value: 'IDLE' },
  { label: '占用', value: 'OCCUPIED' },
  { label: '锁定', value: 'LOCKED' },
  { label: '停用', value: 'DISABLED' },
] as const;
export const WMS_BIN_STATUS_LABEL: Record<string, string> = {
  IDLE: '空闲',
  OCCUPIED: '占用',
  LOCKED: '锁定',
  DISABLED: '停用',
};

/** 货架类型：SHELF/PALLET/DRIVEIN/CANTILEVER。 */
export const WMS_RACK_TYPE_OPTIONS = [
  { label: '搁板货架', value: 'SHELF' },
  { label: '托盘货架', value: 'PALLET' },
  { label: '驶入式货架', value: 'DRIVEIN' },
  { label: '悬臂式货架', value: 'CANTILEVER' },
] as const;
export const WMS_RACK_TYPE_LABEL: Record<string, string> = {
  SHELF: '搁板货架',
  PALLET: '托盘货架',
  DRIVEIN: '驶入式货架',
  CANTILEVER: '悬臂式货架',
};

/** 货架状态：DRAFT/ACTIVE/LOCKED/DISABLED。 */
export const WMS_RACK_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ACTIVE' },
  { label: '冻结', value: 'LOCKED' },
  { label: '停用', value: 'DISABLED' },
] as const;
export const WMS_RACK_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '启用',
  LOCKED: '冻结',
  DISABLED: '停用',
};

/** 容器类型：PALLET/BIN/BOX/RACK/TROLLEY。 */
export const WMS_CONTAINER_TYPE_OPTIONS = [
  { label: '托盘', value: 'PALLET' },
  { label: '料箱', value: 'BIN' },
  { label: '周转箱', value: 'BOX' },
  { label: '料架', value: 'RACK' },
  { label: '周转车', value: 'TROLLEY' },
] as const;
export const WMS_CONTAINER_TYPE_LABEL: Record<string, string> = {
  PALLET: '托盘',
  BIN: '料箱',
  BOX: '周转箱',
  RACK: '料架',
  TROLLEY: '周转车',
};

/** 容器状态：IDLE/IN_USE/FULL/MAINTENANCE/SCRAPPED。 */
export const WMS_CONTAINER_STATUS_OPTIONS = [
  { label: '空闲', value: 'IDLE' },
  { label: '使用中', value: 'IN_USE' },
  { label: '已满', value: 'FULL' },
  { label: '维护中', value: 'MAINTENANCE' },
  { label: '已报废', value: 'SCRAPPED' },
] as const;
export const WMS_CONTAINER_STATUS_LABEL: Record<string, string> = {
  IDLE: '空闲',
  IN_USE: '使用中',
  FULL: '已满',
  MAINTENANCE: '维护中',
  SCRAPPED: '已报废',
};

/** 策略类型：PUTAWAY/PICK/REPLENISH/ALLOCATE。 */
export const WMS_STRATEGY_TYPE_OPTIONS = [
  { label: '上架策略', value: 'PUTAWAY' },
  { label: '拣选策略', value: 'PICK' },
  { label: '补货策略', value: 'REPLENISH' },
  { label: '分配策略', value: 'ALLOCATE' },
] as const;
export const WMS_STRATEGY_TYPE_LABEL: Record<string, string> = {
  PUTAWAY: '上架策略',
  PICK: '拣选策略',
  REPLENISH: '补货策略',
  ALLOCATE: '分配策略',
};

/** 策略状态：DRAFT/ENABLED/DISABLED。 */
export const WMS_STRATEGY_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' },
] as const;
export const WMS_STRATEGY_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ENABLED: '启用',
  DISABLED: '停用',
};
