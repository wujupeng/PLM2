import { statusTag as baseStatusTag, boolTag as baseBoolTag } from '@/pages/platform/integration/shared';

/** G1-N2 公共平台底座—报表平台页面公用渲染辅助。 */

/** 状态彩色标签（复用集成平台语义色映射：ACTIVE=green/PUBLISHED=blue/SUCCESS=green/FAILED=red 等）。 */
export const statusTag = baseStatusTag;

/** 是否标志彩色标签（1=是，0=否）。 */
export const boolTag = baseBoolTag;

/** 文件大小展示：按字节自动换算 B/KB/MB。 */
export const fileSizeText = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '-';
  const bytes = Number(v);
  if (Number.isNaN(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};
