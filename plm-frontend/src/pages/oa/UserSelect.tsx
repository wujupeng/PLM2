import { useCallback, useEffect, useState } from 'react';
import { Select } from 'antd';
import { userService } from '@/services/systemService';

interface UserSelectProps {
  value?: number;
  onChange?: (value?: number) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** 编辑回显时，若目标用户不在候选列表中，用于展示名称。 */
  fallbackLabel?: string;
}

/** 用户下拉选择：远程关键字搜索，供员工档案与流程代理授权等表单使用。 */
export default function UserSelect({
  value,
  onChange,
  placeholder,
  allowClear = true,
  disabled,
  style,
  fallbackLabel,
}: UserSelectProps) {
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOptions = useCallback(async (keyword?: string) => {
    setLoading(true);
    try {
      const res = await userService.page({
        pageNum: 1,
        pageSize: 50,
        keyword: keyword || undefined,
      });
      setOptions(
        (res.list || []).map((u) => ({
          value: u.userId,
          label: `${u.displayName || u.username}（${u.username}）`,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const mergedOptions = [...options];
  if (value !== undefined && value !== null && !mergedOptions.some((o) => o.value === value)) {
    mergedOptions.push({ value, label: fallbackLabel || `用户 ${value}` });
  }

  return (
    <Select
      showSearch
      allowClear={allowClear}
      disabled={disabled}
      style={style}
      placeholder={placeholder || '请选择用户'}
      value={value}
      onChange={onChange}
      filterOption={false}
      onSearch={(kw) => void loadOptions(kw)}
      loading={loading}
      options={mergedOptions}
    />
  );
}
