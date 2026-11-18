import { useCallback, useEffect, useState } from 'react';
import { Select } from 'antd';
import { userService } from '@/services/systemService';

interface UserMultiSelectProps {
  value?: number[];
  onChange?: (value: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** 多选用户下拉：远程关键字搜索，供邮件收件人与消息群发等表单使用。 */
export default function UserMultiSelect({
  value,
  onChange,
  placeholder,
  disabled,
  style,
}: UserMultiSelectProps) {
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

  return (
    <Select
      mode="multiple"
      showSearch
      allowClear
      disabled={disabled}
      style={style}
      placeholder={placeholder || '请选择用户'}
      value={value}
      onChange={onChange}
      filterOption={false}
      onSearch={(kw) => void loadOptions(kw)}
      loading={loading}
      options={options}
    />
  );
}
