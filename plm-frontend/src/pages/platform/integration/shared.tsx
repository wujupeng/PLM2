import { Tag } from 'antd';

/** G1-N1 公共平台底座—集成平台页面公用渲染辅助。 */

/** 状态语义色映射，覆盖集成平台各类状态。 */
const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  ACTIVE: 'green',
  DEPRECATED: 'orange',
  OFFLINE: 'default',
  DISABLED: 'default',
  PUBLISHED: 'blue',
  RELEASED: 'green',
  ENABLED: 'green',
  PENDING: 'gold',
  SENT: 'green',
  FAILED: 'red',
  DEAD_LETTER: 'red',
  HANDLED: 'green',
  IGNORED: 'default',
  PROCESSING: 'gold',
  SUCCESS: 'green',
  DUPLICATE: 'orange',
  HEALTHY: 'green',
  WARNING: 'gold',
  CRITICAL: 'red',
  TEST_OK: 'green',
};

/** 枚举彩色标签（空值显示 -）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={STATUS_COLOR[key] || 'default'}>{labelMap[key] || key}</Tag>;
};

/** 健康度彩色标签：HEALTHY=green/WARNING=gold/CRITICAL=red。 */
export const healthTag = (labelMap: Record<string, string>, v: unknown) => statusTag(labelMap, v);

/** 1/0 布尔标签（1=是，0=否）。 */
export const boolTag = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '-';
  return Number(v) === 1 ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>;
};

/** 失败率/占比百分比展示。 */
export const percentText = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '-';
  const num = Number(v);
  return Number.isNaN(num) ? '-' : `${num}%`;
};
