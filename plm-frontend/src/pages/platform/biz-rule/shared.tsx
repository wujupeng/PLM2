import { Tag } from 'antd';
import { statusTag as approvalStatusTag } from '@/pages/platform/approval/shared';

/** G1-N6 T104 业务规则引擎页面公用渲染辅助。 */

/** 复用可配置审批域的是否标签。 */
export { boolTag } from '@/pages/platform/approval/shared';

/** 业务规则引擎域状态语义色（未命中时回退可配置审批色板）。 */
const BIZ_RULE_STATUS_COLOR: Record<string, string> = {
  // 启用停用状态
  ACTIVE: 'green',
  DISABLED: 'default',
  // 业务规则类型
  LEAD_TIME: 'blue',
  MOQ: 'geekblue',
  LOT_SIZE: 'cyan',
  SUBSTITUTE: 'purple',
  FIFO: 'gold',
  QUALITY_RELEASE: 'green',
  CREDIT_LIMIT: 'volcano',
  // 业务模块
  PLM: 'blue',
  ERP: 'geekblue',
  SRM: 'orange',
  MES: 'cyan',
  WMS: 'purple',
  OA: 'gold',
  // 参数值类型
  STRING: 'blue',
  NUMBER: 'geekblue',
  BOOLEAN: 'cyan',
  LIST: 'purple',
  // 匹配结果
  MATCH: 'green',
  NOT_MATCH: 'default',
  ERROR: 'red',
};

/** 状态彩色标签（空值显示 -，命中业务规则引擎色板优先，否则回退可配置审批色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = BIZ_RULE_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return approvalStatusTag(labelMap, v);
};
