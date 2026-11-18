import { Tag } from 'antd';
import { statusTag as financeStatusTag } from '@/pages/platform/finance/shared';

/** G1-N6 T102 单据状态机页面公用渲染辅助。 */

/** 复用多币种多税率域的是否标签。 */
export { boolTag } from '@/pages/platform/finance/shared';

/** 单据状态机域状态语义色（未命中时回退多币种多税率色板）。 */
const DOC_STATE_STATUS_COLOR: Record<string, string> = {
  // 单据状态类型
  DRAFT: 'default',
  SUBMITTED: 'blue',
  APPROVED: 'green',
  EXECUTING: 'geekblue',
  CLOSED: 'default',
  VOID: 'red',
  REVERSED: 'magenta',
  // 流转类型
  FORWARD: 'blue',
  REVERSE: 'orange',
  // 状态补充
  ACTIVE: 'green',
  DISABLED: 'default',
};

/** 状态彩色标签（空值显示 -，命中单据状态机色板优先，否则回退多币种多税率色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = DOC_STATE_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return financeStatusTag(labelMap, v);
};
