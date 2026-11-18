import { Tag } from 'antd';
import { statusTag as approvalStatusTag } from '@/pages/platform/approval/shared';

/** G1-N6 T105 数据质量控制页面公用渲染辅助。 */

/** 复用可配置审批域的是否标签。 */
export { boolTag } from '@/pages/platform/approval/shared';

/** 数据质量控制域状态语义色（未命中时回退可配置审批色板）。 */
const DATA_QUALITY_STATUS_COLOR: Record<string, string> = {
  // 启用停用状态
  ACTIVE: 'green',
  DISABLED: 'default',
  // 数据质量规则类型
  REQUIRED: 'blue',
  UNIQUE: 'geekblue',
  CODE_PATTERN: 'cyan',
  VALIDITY: 'purple',
  VERSION_CONSISTENCY: 'gold',
  REFERENCE: 'orange',
  // 错误级别
  ERROR: 'red',
  WARN: 'gold',
  // 数据异常状态
  OPEN: 'red',
  HANDLING: 'gold',
  RESOLVED: 'green',
  IGNORED: 'default',
  // 编码重置周期
  NONE: 'default',
  DAILY: 'blue',
  MONTHLY: 'geekblue',
  YEARLY: 'purple',
};

/** 状态彩色标签（空值显示 -，命中数据质量控制色板优先，否则回退可配置审批色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = DATA_QUALITY_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return approvalStatusTag(labelMap, v);
};
