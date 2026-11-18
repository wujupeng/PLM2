import { Tag } from 'antd';
import { statusTag as docStateStatusTag } from '@/pages/platform/doc-state/shared';

/** G1-N6 T103 可配置审批页面公用渲染辅助。 */

/** 复用单据状态机域的是否标签。 */
export { boolTag } from '@/pages/platform/doc-state/shared';

/** 可配置审批域状态语义色（未命中时回退单据状态机色板）。 */
const APPROVAL_STATUS_COLOR: Record<string, string> = {
  // 启用停用状态
  ACTIVE: 'green',
  DISABLED: 'default',
  // 条件逻辑类型
  AND: 'blue',
  OR: 'orange',
  // 比较运算符
  EQ: 'blue',
  NE: 'orange',
  GT: 'red',
  GE: 'volcano',
  LT: 'geekblue',
  LE: 'cyan',
  IN: 'purple',
  BETWEEN: 'magenta',
  // 审批人类型
  ROLE: 'purple',
  USER: 'blue',
  ORG: 'cyan',
  // 审批方式
  ANY: 'geekblue',
  ALL: 'magenta',
  // 审批实例 / 任务状态
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELED: 'default',
  TRANSFERRED: 'orange',
};

/** 状态彩色标签（空值显示 -，命中可配置审批色板优先，否则回退单据状态机色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = APPROVAL_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return docStateStatusTag(labelMap, v);
};
