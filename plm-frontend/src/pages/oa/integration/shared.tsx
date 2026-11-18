import { Tag } from 'antd';

/** OA-N9 集成平台页面公用渲染辅助。 */

/** 枚举中文文案（空值显示 -）。 */
export const enumText = (map: Record<string, string>, v: unknown): string => {
  const key = v === null || v === undefined ? '' : String(v);
  return key ? map[key] || key : '-';
};

/** 按状态语义推导标签颜色。 */
export const integrationStatusColor = (v: unknown): string => {
  const key = String(v ?? '').toUpperCase();
  if (
    ['SUCCESS', 'APPROVED', 'HANDLED', 'ACCEPTED', 'ENABLED', 'ACTIVE', 'DONE', 'MATCH', 'CONFIRMED', 'CLEANED'].includes(
      key,
    )
  )
    return 'green';
  if (['FAILED', 'REJECTED', 'DEAD', 'ERROR', 'ALERT', 'EXCEPTION', 'DIFF'].includes(key)) return 'red';
  if (['PENDING', 'RUNNING', 'PARTIAL', 'PROCESSING', 'RETRYING', 'READY'].includes(key)) return 'gold';
  return 'default';
};

/** 枚举彩色标签。 */
export const enumTag = (labelMap: Record<string, string>, v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={integrationStatusColor(key)}>{labelMap[key] || key}</Tag>;
};

/** 1/0 布尔文案。 */
export const flagText = (v: unknown): string => (Number(v) === 1 ? '是' : '否');

/** 1/0 启用状态标签。 */
export const enableTag = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '-';
  return Number(v) === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>;
};

/** 布尔下拉选项（用于表单签名/审计等开关）。 */
export const BOOLEAN_FORM_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false },
] as const;
