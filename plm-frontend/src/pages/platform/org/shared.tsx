import { Tag } from 'antd';
import { statusTag as iamStatusTag } from '@/pages/platform/iam/shared';

/** G1-N5 公共平台底座—多组织多工厂页面公用渲染辅助。 */

/** 复用身份与权限域的是否标签。 */
export { boolTag } from '@/pages/platform/iam/shared';

/** 多组织多工厂域状态语义色（未命中时回退身份与权限色板）。 */
const ORG_STATUS_COLOR: Record<string, string> = {
  // 工厂类型 / 产线类型 / 授权类型（类别语义色）
  MANUFACTURE: 'blue',
  ASSEMBLY: 'geekblue',
  WAREHOUSE: 'cyan',
  OEM: 'purple',
  MACHINING: 'purple',
  PACKAGING: 'cyan',
  TESTING: 'magenta',
  LEGAL: 'blue',
  FACTORY: 'geekblue',
  LINE: 'purple',
  ORG: 'cyan',
  // 仓库类型
  RAW: 'gold',
  SEMI: 'orange',
  FINISHED: 'green',
  SPARE: 'blue',
  INTRANSIT: 'geekblue',
  // 授权状态补充
  EXPIRED: 'orange',
  REVOKED: 'red',
};

/** 状态彩色标签（空值显示 -，命中多组织多工厂色板优先，否则回退身份与权限色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = ORG_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return iamStatusTag(labelMap, v);
};
