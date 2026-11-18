import { Tag } from 'antd';
import { statusTag as orgStatusTag } from '@/pages/platform/org/shared';

/** G1-N5 公共平台底座—多币种多税率页面公用渲染辅助。 */

/** 复用多组织多工厂域的是否标签。 */
export { boolTag } from '@/pages/platform/org/shared';

/** 多币种多税率域状态语义色（未命中时回退多组织多工厂 / 身份与权限 / 统一文件色板）。 */
const FINANCE_STATUS_COLOR: Record<string, string> = {
  // 财务规则状态补充
  ACTIVE: 'green',
  DISABLED: 'default',
  // 费率 / 税率状态补充
  EXPIRED: 'orange',
  // 价格口径
  TAX_INCLUSIVE: 'green',
  TAX_EXCLUSIVE: 'blue',
  // 舍入方式
  HALF_UP: 'green',
  HALF_EVEN: 'geekblue',
  UP: 'cyan',
  DOWN: 'orange',
  // 舍入对象
  PRICE: 'blue',
  AMOUNT: 'geekblue',
  TAX: 'gold',
  QTY: 'cyan',
  // 汇率类型
  SPOT: 'blue',
  BUY: 'green',
  SELL: 'orange',
  AVG: 'geekblue',
  // 税率类型
  VAT: 'green',
  CIT: 'purple',
  OTHER: 'default',
};

/** 状态彩色标签（空值显示 -，命中多币种多税率色板优先，否则回退多组织多工厂色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = FINANCE_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return orgStatusTag(labelMap, v);
};
