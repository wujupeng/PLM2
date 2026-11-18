import type { PageQuery } from '@/types/common';

/** G6-N8 MES 数据采集（T044，后端 Base: /mes/collect）类型与枚举定义。 */

/* ---------------- 分页查询条件 ---------------- */

/** 采集设备分页查询条件。keyword 匹配 deviceNo/deviceCode/deviceName/gatewayCode。 */
export interface MesCollectDeviceQuery extends PageQuery {
  deviceType?: string;
  deviceStatus?: string;
  protocol?: string;
  deviceCode?: string;
}

/** 采集接口分页查询条件。keyword 匹配 interfaceNo/interfaceName/deviceCode/endpoint。 */
export interface MesCollectInterfaceQuery extends PageQuery {
  interfaceStatus?: string;
  protocol?: string;
  deviceCode?: string;
}

/** 采集数据点分页查询条件。keyword 匹配 pointNo/pointCode/pointName/deviceCode。 */
export interface MesCollectPointQuery extends PageQuery {
  pointStatus?: string;
  dataType?: string;
  interfaceNo?: string;
  deviceCode?: string;
}

/** 校验规则分页查询条件。keyword 匹配 ruleNo/ruleName/pointCode/expression。 */
export interface MesCollectRuleQuery extends PageQuery {
  ruleType?: string;
  ruleAction?: string;
  ruleStatus?: string;
  pointCode?: string;
}

/** 采集数据分页查询条件。keyword 匹配 recordNo/deviceCode/pointCode/collectValue。 */
export interface MesCollectRecordQuery extends PageQuery {
  validateStatus?: string;
  qualityFlag?: string;
  deviceCode?: string;
  pointCode?: string;
}

/* ---------------- 1. 采集设备（测试设备/仪器） ---------------- */

export interface MesCollectDevice {
  id?: number;
  deviceNo?: string;
  deviceCode?: string;
  deviceName?: string;
  deviceType?: string;
  model?: string;
  vendor?: string;
  protocol?: string;
  ipAddress?: string;
  port?: number | null;
  gatewayCode?: string;
  location?: string;
  deviceStatus?: string;
  installDate?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesCollectDeviceSaveRequest = Omit<
  MesCollectDevice,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 2. 采集接口（PLC/网关） ---------------- */

export interface MesCollectInterface {
  id?: number;
  interfaceNo?: string;
  interfaceName?: string;
  deviceNo?: string;
  deviceCode?: string;
  protocol?: string;
  endpoint?: string;
  address?: string;
  dataFormat?: string;
  sampleInterval?: number | null;
  interfaceStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesCollectInterfaceSaveRequest = Omit<
  MesCollectInterface,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 3. 采集数据点 ---------------- */

export interface MesCollectPoint {
  id?: number;
  pointNo?: string;
  pointCode?: string;
  pointName?: string;
  interfaceNo?: string;
  deviceCode?: string;
  address?: string;
  dataType?: string;
  uom?: string;
  scaleFactor?: number | null;
  upperLimit?: number | null;
  lowerLimit?: number | null;
  pointStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesCollectPointSaveRequest = Omit<
  MesCollectPoint,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 4. 校验规则 ---------------- */

export interface MesCollectRule {
  id?: number;
  ruleNo?: string;
  ruleName?: string;
  pointCode?: string;
  ruleType?: string;
  minValue?: number | null;
  maxValue?: number | null;
  expression?: string;
  timestampTolerance?: number | null;
  ruleAction?: string;
  ruleStatus?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesCollectRuleSaveRequest = Omit<
  MesCollectRule,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 5. 采集数据（含时间戳与校验结果） ---------------- */

export interface MesCollectRecord {
  id?: number;
  recordNo?: string;
  deviceCode?: string;
  interfaceNo?: string;
  pointCode?: string;
  collectValue?: string;
  dataType?: string;
  uom?: string;
  collectTime?: string;
  receiveTime?: string;
  qualityFlag?: string;
  validateStatus?: string;
  validateMessage?: string;
  orgId?: number | null;
  orgName?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MesCollectRecordSaveRequest = Omit<
  MesCollectRecord,
  'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'orgName'
>;

/* ---------------- 枚举选项与标签 ---------------- */

function build(options: Array<{ label: string; value: string }>) {
  return {
    options: options as ReadonlyArray<{ label: string; value: string }>,
    label: options.reduce<Record<string, string>>((acc, cur) => {
      acc[cur.value] = cur.label;
      return acc;
    }, {}),
  };
}

/** 采集设备类型：TEST/INSTRUMENT/PLC/GATEWAY/OTHER。 */
const COLLECT_DEVICE_TYPE = build([
  { label: '测试设备', value: 'TEST' },
  { label: '仪器', value: 'INSTRUMENT' },
  { label: 'PLC', value: 'PLC' },
  { label: '网关', value: 'GATEWAY' },
  { label: '其他', value: 'OTHER' },
]);
export const MES_COLLECT_DEVICE_TYPE_OPTIONS = COLLECT_DEVICE_TYPE.options;
export const MES_COLLECT_DEVICE_TYPE_LABEL = COLLECT_DEVICE_TYPE.label;

/** 通讯协议：OPCUA/MODBUS_TCP/MODBUS_RTU/TCP/SERIAL/HTTP。 */
const COLLECT_PROTOCOL = build([
  { label: 'OPC UA', value: 'OPCUA' },
  { label: 'Modbus TCP', value: 'MODBUS_TCP' },
  { label: 'Modbus RTU', value: 'MODBUS_RTU' },
  { label: 'TCP', value: 'TCP' },
  { label: '串口', value: 'SERIAL' },
  { label: 'HTTP', value: 'HTTP' },
]);
export const MES_COLLECT_PROTOCOL_OPTIONS = COLLECT_PROTOCOL.options;
export const MES_COLLECT_PROTOCOL_LABEL = COLLECT_PROTOCOL.label;

/** 采集状态：OFFLINE/ONLINE/COLLECTING/FAULT。 */
const COLLECT_STATUS = build([
  { label: '离线', value: 'OFFLINE' },
  { label: '在线', value: 'ONLINE' },
  { label: '采集中', value: 'COLLECTING' },
  { label: '故障', value: 'FAULT' },
]);
export const MES_COLLECT_STATUS_OPTIONS = COLLECT_STATUS.options;
export const MES_COLLECT_STATUS_LABEL = COLLECT_STATUS.label;

/** 数据类型：NUMERIC/TEXT/BOOL/JSON。 */
const COLLECT_DATA_TYPE = build([
  { label: '数值', value: 'NUMERIC' },
  { label: '文本', value: 'TEXT' },
  { label: '布尔', value: 'BOOL' },
  { label: 'JSON', value: 'JSON' },
]);
export const MES_COLLECT_DATA_TYPE_OPTIONS = COLLECT_DATA_TYPE.options;
export const MES_COLLECT_DATA_TYPE_LABEL = COLLECT_DATA_TYPE.label;

/** 校验类型：RANGE/NULL/TIMESTAMP/ENUM/RATE。 */
const COLLECT_RULE_TYPE = build([
  { label: '量程校验', value: 'RANGE' },
  { label: '空值校验', value: 'NULL' },
  { label: '时间戳校验', value: 'TIMESTAMP' },
  { label: '枚举校验', value: 'ENUM' },
  { label: '变化率校验', value: 'RATE' },
]);
export const MES_COLLECT_RULE_TYPE_OPTIONS = COLLECT_RULE_TYPE.options;
export const MES_COLLECT_RULE_TYPE_LABEL = COLLECT_RULE_TYPE.label;

/** 处理动作：WARN/REJECT。 */
const COLLECT_RULE_ACTION = build([
  { label: '告警', value: 'WARN' },
  { label: '拒收', value: 'REJECT' },
]);
export const MES_COLLECT_RULE_ACTION_OPTIONS = COLLECT_RULE_ACTION.options;
export const MES_COLLECT_RULE_ACTION_LABEL = COLLECT_RULE_ACTION.label;

/** 数据质量标识：VALID/INVALID/SUSPECT。 */
const COLLECT_QUALITY_FLAG = build([
  { label: '有效', value: 'VALID' },
  { label: '无效', value: 'INVALID' },
  { label: '可疑', value: 'SUSPECT' },
]);
export const MES_COLLECT_QUALITY_FLAG_OPTIONS = COLLECT_QUALITY_FLAG.options;
export const MES_COLLECT_QUALITY_FLAG_LABEL = COLLECT_QUALITY_FLAG.label;

/** 校验状态：PENDING/PASSED/FAILED。 */
const COLLECT_VALIDATE_STATUS = build([
  { label: '待校验', value: 'PENDING' },
  { label: '已通过', value: 'PASSED' },
  { label: '未通过', value: 'FAILED' },
]);
export const MES_COLLECT_VALIDATE_STATUS_OPTIONS = COLLECT_VALIDATE_STATUS.options;
export const MES_COLLECT_VALIDATE_STATUS_LABEL = COLLECT_VALIDATE_STATUS.label;
