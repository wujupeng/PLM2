import { Tag } from 'antd';
import { statusTag as approvalStatusTag } from '@/pages/platform/approval/shared';

/** G1-N6 T106 移动端与PDA页面公用渲染辅助。 */

/** 复用可配置审批域的是否标签。 */
export { boolTag } from '@/pages/platform/approval/shared';

/** 移动端与PDA状态语义色（未命中时回退可配置审批色板）。 */
const MOBILE_STATUS_COLOR: Record<string, string> = {
  // 启用停用 / 设备状态
  ACTIVE: 'green',
  OFFLINE: 'default',
  DISABLED: 'default',
  // 扫码类型
  RECEIVE: 'blue',
  SHELVE: 'cyan',
  STOCKTAKE: 'geekblue',
  PICK: 'purple',
  REPORT: 'gold',
  LABEL_CHECK: 'orange',
  // 扫码结果
  SUCCESS: 'green',
  FAIL: 'red',
  // 标签类型
  MATERIAL: 'blue',
  PRODUCT: 'geekblue',
  BOX: 'cyan',
  WAREHOUSE: 'purple',
  // 标签校验方式
  FORMAT: 'blue',
  CHECKSUM: 'geekblue',
  LENGTH: 'cyan',
  PREFIX: 'purple',
  // 错误级别
  ERROR: 'red',
  WARN: 'gold',
  // 异常类型
  SCAN_FAIL: 'red',
  LABEL_INVALID: 'volcano',
  OFFLINE_SYNC: 'orange',
  PERMISSION: 'gold',
  DATA_MISMATCH: 'magenta',
  // 异常状态
  OPEN: 'red',
  HANDLING: 'gold',
  RESOLVED: 'green',
  IGNORED: 'default',
};

/** 状态彩色标签（空值显示 -，命中移动端与PDA色板优先，否则回退可配置审批色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = MOBILE_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return approvalStatusTag(labelMap, v);
};
