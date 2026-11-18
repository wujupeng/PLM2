import { Tag } from 'antd';
import { statusTag as baseStatusTag } from '@/pages/platform/file/shared';

/** G1-N4 公共平台底座—身份与权限增强页面公用渲染辅助。 */

/** 复用统一文件服务的是否标签。 */
export { boolTag } from '@/pages/platform/file/shared';

/** 身份与权限域状态语义色（未命中时回退统一文件服务色板）。 */
const IAM_STATUS_COLOR: Record<string, string> = {
  PENDING: 'gold',
  BOUND: 'green',
  UNBOUND: 'orange',
  DISABLED: 'default',
  SUCCESS: 'green',
  FAIL: 'red',
  EXPIRED: 'orange',
  DRAFT: 'default',
  ACTIVE: 'green',
  HIDDEN: 'default',
  MASKED: 'orange',
  READONLY: 'blue',
  EDITABLE: 'green',
  OPEN: 'red',
  HANDLING: 'gold',
  RESOLVED: 'green',
  IGNORED: 'default',
  HIGH: 'red',
  MEDIUM: 'gold',
  LOW: 'green',
};

/** 状态彩色标签（空值显示 -，命中身份与权限色板优先，否则回退统一文件服务色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = IAM_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return baseStatusTag(labelMap, v);
};
