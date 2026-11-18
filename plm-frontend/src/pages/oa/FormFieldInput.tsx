import { useEffect, useState } from 'react';
import { DatePicker, Input, InputNumber, Select, TreeSelect } from 'antd';
import type { Dayjs } from 'dayjs';
import { dictionaryService, organizationService } from '@/services/systemService';
import UserSelect from '@/pages/oa/UserSelect';
import type { OaFormFieldItem } from '@/types/oa';
import type { Organization } from '@/types/system';

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface SelectOption {
  value: string;
  label: string;
}

interface OrgTreeNode {
  title: string;
  value: number;
  children?: OrgTreeNode[];
}

const toOrgTree = (nodes: Organization[]): OrgTreeNode[] =>
  nodes.map((item) => ({
    title: item.orgName,
    value: item.orgId,
    children: item.children && item.children.length ? toOrgTree(item.children) : undefined,
  }));

/** 解析字段的 optionsJson：兼容 [{label,value}]、[{name,code}] 与 ["A","B"] 三种写法。 */
const parseOptions = (optionsJson?: string): SelectOption[] => {
  if (!optionsJson) return [];
  try {
    const parsed: unknown = JSON.parse(optionsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === 'string') return { value: item, label: item };
        const record = item as Record<string, unknown>;
        const value = String(record.value ?? record.code ?? '');
        const label = String(record.label ?? record.name ?? value);
        return { value, label };
      })
      .filter((option) => option.value !== '');
  } catch {
    return [];
  }
};

interface FormFieldInputProps {
  field: OaFormFieldItem;
  value?: unknown;
  onChange?: (value: unknown) => void;
}

/** 依据表单字段定义渲染填报控件：支持文本、数值、日期、下拉、人员与部门。 */
export default function FormFieldInput({ field, value, onChange }: FormFieldInputProps) {
  const [dictOptions, setDictOptions] = useState<SelectOption[]>([]);
  const [orgTree, setOrgTree] = useState<OrgTreeNode[]>([]);

  const fieldType = field.fieldType || 'TEXT';
  const dataSource = field.dataSource;
  const sourceValue = field.sourceValue;

  useEffect(() => {
    if ((fieldType === 'SELECT' || fieldType === 'MULTI_SELECT') && dataSource === 'DICT' && sourceValue) {
      void dictionaryService.byType(sourceValue).then((list) => {
        setDictOptions((list || []).map((d) => ({ value: d.dictValue, label: d.dictLabel })));
      });
    }
    if (fieldType === 'ORG') {
      void organizationService.tree().then((tree) => setOrgTree(toOrgTree(tree || [])));
    }
  }, [fieldType, dataSource, sourceValue]);

  const placeholder = field.placeholder || `请输入${field.fieldName}`;
  const selectOptions = dictOptions.length ? dictOptions : parseOptions(field.optionsJson);
  const selectPlaceholder = field.placeholder || `请选择${field.fieldName}`;

  switch (fieldType) {
    case 'TEXTAREA':
      return (
        <Input.TextArea
          rows={3}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      );
    case 'NUMBER':
      return (
        <InputNumber
          style={{ width: '100%' }}
          value={value as number}
          onChange={onChange}
          placeholder={placeholder}
        />
      );
    case 'AMOUNT':
      return (
        <InputNumber
          style={{ width: '100%' }}
          precision={2}
          addonBefore="¥"
          value={value as number}
          onChange={onChange}
          placeholder={placeholder}
        />
      );
    case 'DATE':
      return (
        <DatePicker
          style={{ width: '100%' }}
          format={DATE_FORMAT}
          value={value as Dayjs | undefined}
          onChange={onChange}
          placeholder={selectPlaceholder}
        />
      );
    case 'DATETIME':
      return (
        <DatePicker
          showTime
          style={{ width: '100%' }}
          format={DATETIME_FORMAT}
          value={value as Dayjs | undefined}
          onChange={onChange}
          placeholder={selectPlaceholder}
        />
      );
    case 'SELECT':
      return (
        <Select
          allowClear
          value={value as string}
          onChange={onChange}
          options={selectOptions}
          placeholder={selectPlaceholder}
        />
      );
    case 'MULTI_SELECT':
      return (
        <Select
          mode="multiple"
          allowClear
          value={value as string[]}
          onChange={onChange}
          options={selectOptions}
          placeholder={selectPlaceholder}
        />
      );
    case 'USER':
      return (
        <UserSelect
          style={{ width: '100%' }}
          value={value as number}
          onChange={onChange}
          placeholder={selectPlaceholder}
        />
      );
    case 'ORG':
      return (
        <TreeSelect
          allowClear
          treeDefaultExpandAll
          style={{ width: '100%' }}
          treeData={orgTree}
          value={value as number}
          onChange={onChange}
          placeholder={selectPlaceholder}
        />
      );
    default:
      return (
        <Input
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      );
  }
}
