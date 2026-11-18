import { Tag } from 'antd';
import { statusTag as baseStatusTag } from '@/pages/platform/report/shared';

/** G1-N3 公共平台底座—统一文件服务页面公用渲染辅助。 */

/** 复用报表平台的是否标签与文件大小展示。 */
export { boolTag, fileSizeText } from '@/pages/platform/report/shared';

/** 文件域状态语义色（未命中时回退报表平台色板）。 */
const FILE_STATUS_COLOR: Record<string, string> = {
  PENDING: 'gold',
  PROCESSING: 'blue',
  SUCCESS: 'green',
  FAILED: 'red',
  CLEAN: 'green',
  INFECTED: 'red',
  ERROR: 'red',
  NORMAL: 'green',
  QUARANTINED: 'orange',
  ARCHIVED: 'blue',
  DELETED: 'default',
  ACTIVE: 'green',
  HISTORY: 'default',
  RESTORING: 'gold',
  RESTORED: 'green',
  EXPIRED: 'default',
  REQUESTED: 'gold',
  DONE: 'green',
  NONE: 'default',
};

/** 状态彩色标签（空值显示 -，命中文件域色板优先，否则回退报表平台色板）。 */
export const statusTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  const color = FILE_STATUS_COLOR[key];
  if (color) return <Tag color={color}>{labelMap[key] || key}</Tag>;
  return baseStatusTag(labelMap, v);
};
