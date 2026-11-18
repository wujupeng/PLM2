import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { specInstanceService, specTemplateService } from '@/services/specService';
import type {
  SpecInstanceDetail,
  SpecInstanceItem,
  SpecInstanceSaveParams,
  SpecInstanceValueItem,
  SpecTemplateDetail,
  SpecTemplateFieldItem,
  SpecTemplateItem,
  SpecTemplateSaveParams,
} from '@/types/spec';
import {
  SPEC_CATEGORY_LABEL,
  SPEC_CATEGORY_OPTIONS,
  SPEC_FIELD_DATA_TYPE_LABEL,
  SPEC_FIELD_DATA_TYPE_OPTIONS,
  SPEC_STATUS_LABEL,
  SPEC_STATUS_OPTIONS,
} from '@/types/spec';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 规格状态标签颜色 */
const SPEC_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

/** 必填标记选项 */
const REQUIRED_OPTIONS = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
];

/** 实例取值编辑行：在取值基础上附加数据类型，便于选择录入控件 */
interface InstanceValueRow extends SpecInstanceValueItem {
  dataType?: string;
}

interface TemplateFormValues {
  templateCode: string;
  templateName: string;
  productSeries?: string;
  productCode?: string;
  specCategory?: string;
  versionNo?: string;
  status?: string;
  description?: string;
  remark?: string;
}

interface InstanceFormValues {
  instanceCode: string;
  templateId?: number;
  productCode?: string;
  productName?: string;
  versionNo?: string;
  status?: string;
  effectiveDate?: Dayjs;
  remark?: string;
}

interface TemplateSearchState {
  keyword?: string;
  templateCode?: string;
  specCategory?: string;
  status?: string;
}

interface InstanceSearchState {
  keyword?: string;
  instanceCode?: string;
  productCode?: string;
  templateCode?: string;
  status?: string;
}

/** 按模板字段与已有取值拼装取值编辑行 */
function buildValueRows(
  fields: SpecTemplateFieldItem[],
  values?: SpecInstanceValueItem[],
): InstanceValueRow[] {
  const valueMap = new Map<string, SpecInstanceValueItem>();
  (values || []).forEach((item) => valueMap.set(item.fieldCode, item));
  return fields.map((field) => {
    const value = valueMap.get(field.fieldCode);
    return {
      fieldCode: field.fieldCode,
      fieldName: field.fieldName,
      fieldCategory: field.fieldCategory,
      unit: field.unit,
      minValue: field.minValue,
      maxValue: field.maxValue,
      targetValue: field.targetValue,
      dataType: field.dataType,
      inspectionMethod: field.inspectionMethod,
      sortNo: field.sortNo,
      valueText: value?.valueText,
      valueNumber: value?.valueNumber,
    };
  });
}

export default function TechSpecPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [templateForm] = Form.useForm<TemplateFormValues>();
  const [instanceForm] = Form.useForm<InstanceFormValues>();

  const [activeTab, setActiveTab] = useState('instance');

  // 规格实例列表
  const [iData, setIData] = useState<SpecInstanceItem[]>([]);
  const [iTotal, setITotal] = useState(0);
  const [iLoading, setILoading] = useState(false);
  const [iPageNum, setIPageNum] = useState(1);
  const [iPageSize, setIPageSize] = useState(10);
  const [iSearch, setISearch] = useState<InstanceSearchState>({});

  // 规格模板列表
  const [tData, setTData] = useState<SpecTemplateItem[]>([]);
  const [tTotal, setTTotal] = useState(0);
  const [tLoading, setTLoading] = useState(false);
  const [tPageNum, setTPageNum] = useState(1);
  const [tPageSize, setTPageSize] = useState(10);
  const [tSearch, setTSearch] = useState<TemplateSearchState>({});

  const [templates, setTemplates] = useState<SpecTemplateItem[]>([]);

  // 规格实例编辑
  const [iModalOpen, setIModalOpen] = useState(false);
  const [iEditing, setIEditing] = useState<SpecInstanceItem | null>(null);
  const [iSubmitting, setISubmitting] = useState(false);
  const [instanceValues, setInstanceValues] = useState<InstanceValueRow[]>([]);

  // 规格模板编辑
  const [tModalOpen, setTModalOpen] = useState(false);
  const [tEditing, setTEditing] = useState<SpecTemplateItem | null>(null);
  const [tSubmitting, setTSubmitting] = useState(false);
  const [templateFields, setTemplateFields] = useState<SpecTemplateFieldItem[]>([]);

  // 详情抽屉
  const [iDetailOpen, setIDetailOpen] = useState(false);
  const [iDetail, setIDetail] = useState<SpecInstanceDetail | null>(null);
  const [iDetailLoading, setIDetailLoading] = useState(false);

  const [tDetailOpen, setTDetailOpen] = useState(false);
  const [tDetail, setTDetail] = useState<SpecTemplateDetail | null>(null);
  const [tDetailLoading, setTDetailLoading] = useState(false);

  const loadInstances = useCallback(
    async (page = iPageNum, size = iPageSize, cond = iSearch) => {
      setILoading(true);
      try {
        const res = await specInstanceService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          instanceCode: cond.instanceCode || undefined,
          productCode: cond.productCode || undefined,
          templateCode: cond.templateCode || undefined,
          status: cond.status || undefined,
        });
        setIData(res.list || []);
        setITotal(res.total || 0);
      } finally {
        setILoading(false);
      }
    },
    [iPageNum, iPageSize, iSearch],
  );

  const loadTemplates = useCallback(
    async (page = tPageNum, size = tPageSize, cond = tSearch) => {
      setTLoading(true);
      try {
        const res = await specTemplateService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          templateCode: cond.templateCode || undefined,
          specCategory: cond.specCategory || undefined,
          status: cond.status || undefined,
        });
        setTData(res.list || []);
        setTTotal(res.total || 0);
      } finally {
        setTLoading(false);
      }
    },
    [tPageNum, tPageSize, tSearch],
  );

  const loadTemplateOptions = () => {
    specTemplateService
      .options()
      .then((res) => setTemplates(res || []))
      .catch(() => undefined);
  };

  useEffect(() => {
    void loadInstances(1, iPageSize, {});
    void loadTemplates(1, tPageSize, {});
    loadTemplateOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- 规格实例 ---------------- */

  const onInstanceSearch = (values: InstanceSearchState) => {
    const cond = { ...values };
    setISearch(cond);
    setIPageNum(1);
    void loadInstances(1, iPageSize, cond);
  };

  const onInstanceReset = () => {
    setISearch({});
    setIPageNum(1);
    void loadInstances(1, iPageSize, {});
  };

  const openInstanceCreate = () => {
    setIEditing(null);
    instanceForm.resetFields();
    instanceForm.setFieldsValue({ status: 'draft', versionNo: 'V1' });
    setInstanceValues([]);
    setIModalOpen(true);
  };

  const openInstanceEdit = async (record: SpecInstanceItem) => {
    setIEditing(record);
    instanceForm.resetFields();
    instanceForm.setFieldsValue({
      instanceCode: record.instanceCode,
      templateId: record.templateId,
      productCode: record.productCode,
      productName: record.productName,
      versionNo: record.versionNo,
      status: record.status,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      remark: record.remark,
    });
    setInstanceValues([]);
    setIModalOpen(true);
    const detail = await specInstanceService.detail(record.id);
    if (record.templateId) {
      const tpl = await specTemplateService.detail(record.templateId);
      setInstanceValues(buildValueRows(tpl.fields || [], detail.values));
    } else {
      setInstanceValues((detail.values || []).map((item) => ({ ...item })));
    }
  };

  /** 选择模板后按模板字段刷新取值行，已录入的取值按字段编码保留 */
  const handleInstanceTemplateChange = async (templateId?: number) => {
    if (!templateId) {
      setInstanceValues([]);
      return;
    }
    const detail = await specTemplateService.detail(templateId);
    const current = new Map(instanceValues.map((row) => [row.fieldCode, row]));
    setInstanceValues(
      (detail.fields || []).map((field) => ({
        fieldCode: field.fieldCode,
        fieldName: field.fieldName,
        fieldCategory: field.fieldCategory,
        unit: field.unit,
        minValue: field.minValue,
        maxValue: field.maxValue,
        targetValue: field.targetValue,
        dataType: field.dataType,
        inspectionMethod: field.inspectionMethod,
        sortNo: field.sortNo,
        valueText: current.get(field.fieldCode)?.valueText,
        valueNumber: current.get(field.fieldCode)?.valueNumber,
      })),
    );
  };

  const updateInstanceValue = (index: number, patch: Partial<InstanceValueRow>) => {
    setInstanceValues((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleInstanceSubmit = async () => {
    const values = await instanceForm.validateFields();
    const template = templates.find((item) => item.id === values.templateId);
    const payload: SpecInstanceSaveParams = {
      instanceCode: values.instanceCode,
      templateId: values.templateId,
      templateCode: template?.templateCode,
      productCode: values.productCode,
      productName: values.productName,
      versionNo: values.versionNo,
      status: values.status,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      remark: values.remark,
      values: instanceValues.map((row) => ({
        fieldCode: row.fieldCode,
        valueText: row.valueText,
        valueNumber: row.valueNumber,
      })),
    };
    setISubmitting(true);
    try {
      if (iEditing) {
        await specInstanceService.update(iEditing.id, payload);
        message.success('更新成功');
      } else {
        await specInstanceService.create(payload);
        message.success('新增成功');
      }
      setIModalOpen(false);
      void loadInstances();
    } finally {
      setISubmitting(false);
    }
  };

  const handleInstanceRelease = async (record: SpecInstanceItem) => {
    await specInstanceService.release(record.id);
    message.success('已发布');
    void loadInstances();
  };

  const handleInstanceDelete = async (record: SpecInstanceItem) => {
    await specInstanceService.remove(record.id);
    message.success('删除成功');
    void loadInstances();
  };

  const openInstanceDetail = async (record: SpecInstanceItem) => {
    setIDetailOpen(true);
    setIDetailLoading(true);
    try {
      const res = await specInstanceService.detail(record.id);
      setIDetail(res);
    } finally {
      setIDetailLoading(false);
    }
  };

  /* ---------------- 规格模板 ---------------- */

  const onTemplateSearch = (values: TemplateSearchState) => {
    const cond = { ...values };
    setTSearch(cond);
    setTPageNum(1);
    void loadTemplates(1, tPageSize, cond);
  };

  const onTemplateReset = () => {
    setTSearch({});
    setTPageNum(1);
    void loadTemplates(1, tPageSize, {});
  };

  const openTemplateCreate = () => {
    setTEditing(null);
    templateForm.resetFields();
    templateForm.setFieldsValue({ status: 'draft', versionNo: 'V1' });
    setTemplateFields([{ fieldCode: '', fieldName: '', dataType: 'number', requiredFlag: 0, sortNo: 0, status: 1 }]);
    setTModalOpen(true);
  };

  const openTemplateEdit = async (record: SpecTemplateItem) => {
    setTEditing(record);
    templateForm.resetFields();
    templateForm.setFieldsValue({
      templateCode: record.templateCode,
      templateName: record.templateName,
      productSeries: record.productSeries,
      productCode: record.productCode,
      specCategory: record.specCategory,
      versionNo: record.versionNo,
      status: record.status,
      description: record.description,
      remark: record.remark,
    });
    setTemplateFields([]);
    setTModalOpen(true);
    const detail = await specTemplateService.detail(record.id);
    setTemplateFields(detail.fields || []);
  };

  const addTemplateField = () => {
    setTemplateFields((prev) => [
      ...prev,
      { fieldCode: '', fieldName: '', dataType: 'number', requiredFlag: 0, sortNo: prev.length, status: 1 },
    ]);
  };

  const updateTemplateField = (index: number, patch: Partial<SpecTemplateFieldItem>) => {
    setTemplateFields((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeTemplateField = (index: number) => {
    setTemplateFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTemplateSubmit = async () => {
    const values = await templateForm.validateFields();
    const payload: SpecTemplateSaveParams = {
      templateCode: values.templateCode,
      templateName: values.templateName,
      productSeries: values.productSeries,
      productCode: values.productCode,
      specCategory: values.specCategory,
      versionNo: values.versionNo,
      status: values.status,
      description: values.description,
      remark: values.remark,
      fields: templateFields,
    };
    setTSubmitting(true);
    try {
      if (tEditing) {
        await specTemplateService.update(tEditing.id, payload);
        message.success('更新成功');
      } else {
        await specTemplateService.create(payload);
        message.success('新增成功');
      }
      setTModalOpen(false);
      void loadTemplates();
      loadTemplateOptions();
    } finally {
      setTSubmitting(false);
    }
  };

  const handleTemplateRelease = async (record: SpecTemplateItem) => {
    await specTemplateService.release(record.id);
    message.success('已发布');
    void loadTemplates();
    loadTemplateOptions();
  };

  const handleTemplateDelete = async (record: SpecTemplateItem) => {
    await specTemplateService.remove(record.id);
    message.success('删除成功');
    void loadTemplates();
    loadTemplateOptions();
  };

  const openTemplateDetail = async (record: SpecTemplateItem) => {
    setTDetailOpen(true);
    setTDetailLoading(true);
    try {
      const res = await specTemplateService.detail(record.id);
      setTDetail(res);
    } finally {
      setTDetailLoading(false);
    }
  };

  /* ---------------- 表格列 ---------------- */

  const instanceColumns: ColumnsType<SpecInstanceItem> = [
    { title: '实例编码', dataIndex: 'instanceCode', width: 170 },
    { title: '模板编码', dataIndex: 'templateCode', width: 150, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 140, render: (v) => v || '-' },
    { title: '产品名称', dataIndex: 'productName', width: 160, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'versionNo', width: 90, render: (v) => v || '-' },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={SPEC_STATUS_COLOR[v] || 'default'}>{SPEC_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openInstanceDetail(record)}>
            详情
          </Button>
          {hasPermission('spec:update') && (
            <Button
              type="link"
              size="small"
              disabled={record.status === 'released'}
              onClick={() => openInstanceEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission('spec:release') && (
            <Popconfirm title="确认发布该规格实例？" onConfirm={() => handleInstanceRelease(record)}>
              <Button type="link" size="small" disabled={record.status === 'released'}>
                发布
              </Button>
            </Popconfirm>
          )}
          {hasPermission('spec:delete') && (
            <Popconfirm title="确认删除该规格实例？" onConfirm={() => handleInstanceDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const templateColumns: ColumnsType<SpecTemplateItem> = [
    { title: '模板编码', dataIndex: 'templateCode', width: 170 },
    { title: '模板名称', dataIndex: 'templateName', width: 180 },
    {
      title: '规格分类',
      dataIndex: 'specCategory',
      width: 120,
      render: (v?: string) => (v ? SPEC_CATEGORY_LABEL[v] || v : '-'),
    },
    { title: '产品系列', dataIndex: 'productSeries', width: 120, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 130, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'versionNo', width: 90, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={SPEC_STATUS_COLOR[v] || 'default'}>{SPEC_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openTemplateDetail(record)}>
            详情
          </Button>
          {hasPermission('spec:template:save') && (
            <>
              <Button type="link" size="small" onClick={() => openTemplateEdit(record)}>
                编辑
              </Button>
              <Popconfirm title="确认发布该规格模板？" onConfirm={() => handleTemplateRelease(record)}>
                <Button type="link" size="small" disabled={record.status === 'released'}>
                  发布
                </Button>
              </Popconfirm>
              <Popconfirm title="确认删除该规格模板？" onConfirm={() => handleTemplateDelete(record)}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const templateFieldColumns: ColumnsType<SpecTemplateFieldItem> = [
    {
      title: '字段编码',
      dataIndex: 'fieldCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTemplateField(index, { fieldCode: e.target.value })} />
      ),
    },
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTemplateField(index, { fieldName: e.target.value })} />
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      width: 110,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={SPEC_FIELD_DATA_TYPE_OPTIONS}
          onChange={(val) => updateTemplateField(index, { dataType: val })}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 90,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTemplateField(index, { unit: e.target.value })} />
      ),
    },
    {
      title: '下限',
      dataIndex: 'minValue',
      width: 100,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateTemplateField(index, { minValue: val ?? undefined })}
        />
      ),
    },
    {
      title: '上限',
      dataIndex: 'maxValue',
      width: 100,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateTemplateField(index, { maxValue: val ?? undefined })}
        />
      ),
    },
    {
      title: '目标值',
      dataIndex: 'targetValue',
      width: 100,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTemplateField(index, { targetValue: e.target.value })} />
      ),
    },
    {
      title: '必填',
      dataIndex: 'requiredFlag',
      width: 90,
      render: (v: number, _r, index) => (
        <Select
          value={v ?? 0}
          style={{ width: '100%' }}
          options={REQUIRED_OPTIONS}
          onChange={(val) => updateTemplateField(index, { requiredFlag: val })}
        />
      ),
    },
    {
      title: '检验方法',
      dataIndex: 'inspectionMethod',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTemplateField(index, { inspectionMethod: e.target.value })} />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortNo',
      width: 90,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateTemplateField(index, { sortNo: val ?? undefined })}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, __, index) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => removeTemplateField(index)}>
          删除
        </Button>
      ),
    },
  ];

  const templateFieldReadColumns: ColumnsType<SpecTemplateFieldItem> = [
    { title: '字段编码', dataIndex: 'fieldCode', width: 150 },
    { title: '字段名称', dataIndex: 'fieldName', width: 150 },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      width: 100,
      render: (v?: string) => (v ? SPEC_FIELD_DATA_TYPE_LABEL[v] || v : '-'),
    },
    { title: '单位', dataIndex: 'unit', width: 90, render: (v) => v || '-' },
    { title: '下限', dataIndex: 'minValue', width: 90, render: (v) => (v ?? '-') },
    { title: '上限', dataIndex: 'maxValue', width: 90, render: (v) => (v ?? '-') },
    { title: '目标值', dataIndex: 'targetValue', width: 100, render: (v) => v || '-' },
    {
      title: '必填',
      dataIndex: 'requiredFlag',
      width: 80,
      render: (v?: number) => (v === 1 ? <Tag color="red">是</Tag> : <Tag>否</Tag>),
    },
    { title: '检验方法', dataIndex: 'inspectionMethod', width: 150, render: (v) => v || '-' },
    { title: '排序', dataIndex: 'sortNo', width: 80, render: (v) => (v ?? '-') },
  ];

  const instanceValueColumns: ColumnsType<InstanceValueRow> = [
    { title: '字段名称', dataIndex: 'fieldName', width: 150, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '下限', dataIndex: 'minValue', width: 90, render: (v) => (v ?? '-') },
    { title: '上限', dataIndex: 'maxValue', width: 90, render: (v) => (v ?? '-') },
    { title: '目标值', dataIndex: 'targetValue', width: 100, render: (v) => v || '-' },
    {
      title: '取值',
      key: 'value',
      width: 180,
      render: (_, record, index) => {
        const isNumber = record.dataType === 'number' || record.dataType === 'range';
        return isNumber ? (
          <InputNumber
            value={record.valueNumber}
            style={{ width: '100%' }}
            onChange={(val) => updateInstanceValue(index, { valueNumber: val ?? undefined, valueText: undefined })}
          />
        ) : (
          <Input
            value={record.valueText}
            onChange={(e) => updateInstanceValue(index, { valueText: e.target.value, valueNumber: undefined })}
          />
        );
      },
    },
    { title: '检验方法', dataIndex: 'inspectionMethod', width: 150, render: (v) => v || '-' },
  ];

  const instanceValueReadColumns: ColumnsType<SpecInstanceValueItem> = [
    { title: '字段名称', dataIndex: 'fieldName', width: 150, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '下限', dataIndex: 'minValue', width: 90, render: (v) => (v ?? '-') },
    { title: '上限', dataIndex: 'maxValue', width: 90, render: (v) => (v ?? '-') },
    { title: '目标值', dataIndex: 'targetValue', width: 100, render: (v) => v || '-' },
    {
      title: '取值',
      key: 'value',
      width: 140,
      render: (_, record) =>
        record.valueNumber != null ? `${record.valueNumber}` : record.valueText || '-',
    },
    {
      title: '判定',
      dataIndex: 'passFlag',
      width: 100,
      render: (v?: number) =>
        v === 1 ? (
          <Tag color="success">合格</Tag>
        ) : v === 0 ? (
          <Tag color="error">超界</Tag>
        ) : (
          <Tag>未判定</Tag>
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        技术规格
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'instance', label: '规格实例' },
          { key: 'template', label: '规格模板' },
        ]}
      />

      {activeTab === 'instance' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onInstanceSearch}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="实例编码 / 产品名称" allowClear style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="instanceCode" label="实例编码">
                <Input placeholder="实例编码" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="productCode" label="产品编码">
                <Input placeholder="产品编码" allowClear style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="templateCode" label="模板编码">
                <Input placeholder="模板编码" allowClear style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" allowClear style={{ width: 130 }} options={SPEC_STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item>
                <Space wrap>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onInstanceReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={`规格实例（共 ${iTotal} 条）`}
            extra={
              hasPermission('spec:create') && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openInstanceCreate}>
                  新增规格实例
                </Button>
              )
            }
          >
            <Table<SpecInstanceItem>
              rowKey="id"
              loading={iLoading}
              columns={instanceColumns}
              dataSource={iData}
              scroll={{ x: 1300 }}
              pagination={{
                current: iPageNum,
                pageSize: iPageSize,
                total: iTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setIPageNum(page);
                  setIPageSize(size);
                  void loadInstances(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {activeTab === 'template' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onTemplateSearch}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="模板编码 / 名称" allowClear style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="templateCode" label="模板编码">
                <Input placeholder="模板编码" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="specCategory" label="规格分类">
                <Select placeholder="请选择" allowClear style={{ width: 140 }} options={SPEC_CATEGORY_OPTIONS} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" allowClear style={{ width: 130 }} options={SPEC_STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item>
                <Space wrap>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onTemplateReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={`规格模板（共 ${tTotal} 条）`}
            extra={
              hasPermission('spec:template:save') && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openTemplateCreate}>
                  新增规格模板
                </Button>
              )
            }
          >
            <Table<SpecTemplateItem>
              rowKey="id"
              loading={tLoading}
              columns={templateColumns}
              dataSource={tData}
              scroll={{ x: 1300 }}
              pagination={{
                current: tPageNum,
                pageSize: tPageSize,
                total: tTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setTPageNum(page);
                  setTPageSize(size);
                  void loadTemplates(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {/* 新增/编辑规格实例 */}
      <Modal
        title={iEditing ? '编辑规格实例' : '新增规格实例'}
        open={iModalOpen}
        onOk={handleInstanceSubmit}
        confirmLoading={iSubmitting}
        onCancel={() => setIModalOpen(false)}
        destroyOnClose
        width={1000}
      >
        <Form form={instanceForm} layout="vertical" preserve={false}>
          <Form.Item
            name="instanceCode"
            label="实例编码"
            rules={[{ required: true, message: '请输入实例编码' }]}
          >
            <Input placeholder="请输入实例编码" disabled={!!iEditing} />
          </Form.Item>
          <Form.Item name="templateId" label="规格模板">
            <Select
              placeholder="请选择规格模板"
              allowClear
              showSearch
              optionFilterProp="label"
              onChange={(val) => void handleInstanceTemplateChange(val)}
              options={templates.map((item) => ({
                value: item.id,
                label: `${item.templateCode} ${item.templateName}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="缺省为 V1" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={SPEC_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <div>
            <Space style={{ marginBottom: 8 }}>
              <span>指标取值（按模板字段生成）</span>
            </Space>
            <Table<InstanceValueRow>
              rowKey={(record) => record.fieldCode}
              columns={instanceValueColumns}
              dataSource={instanceValues}
              size="small"
              pagination={false}
              scroll={{ x: 900 }}
            />
          </div>
        </Form>
      </Modal>

      {/* 新增/编辑规格模板 */}
      <Modal
        title={tEditing ? '编辑规格模板' : '新增规格模板'}
        open={tModalOpen}
        onOk={handleTemplateSubmit}
        confirmLoading={tSubmitting}
        onCancel={() => setTModalOpen(false)}
        destroyOnClose
        width={1100}
      >
        <Form form={templateForm} layout="vertical" preserve={false}>
          <Form.Item
            name="templateCode"
            label="模板编码"
            rules={[{ required: true, message: '请输入模板编码' }]}
          >
            <Input placeholder="请输入模板编码" disabled={!!tEditing} />
          </Form.Item>
          <Form.Item
            name="templateName"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item name="specCategory" label="规格分类">
            <Select placeholder="请选择" allowClear options={SPEC_CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="productSeries" label="产品系列">
            <Input placeholder="请输入产品系列" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="缺省为 V1" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={SPEC_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Button icon={<PlusOutlined />} onClick={addTemplateField}>
                新增字段
              </Button>
            </Space>
            <Table<SpecTemplateFieldItem>
              rowKey={(_, index) => String(index)}
              columns={templateFieldColumns}
              dataSource={templateFields}
              size="small"
              pagination={false}
              scroll={{ x: 1300 }}
            />
          </div>
        </Form>
      </Modal>

      {/* 规格实例详情 */}
      <Drawer
        title={`规格实例详情 - ${iDetail?.instance.instanceCode || ''}`}
        width={900}
        open={iDetailOpen}
        onClose={() => setIDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" title="基本信息" loading={iDetailLoading}>
            {iDetail && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'instanceCode', label: '实例编码', children: iDetail.instance.instanceCode },
                  { key: 'templateCode', label: '模板编码', children: iDetail.instance.templateCode || '-' },
                  { key: 'productCode', label: '产品编码', children: iDetail.instance.productCode || '-' },
                  { key: 'productName', label: '产品名称', children: iDetail.instance.productName || '-' },
                  { key: 'versionNo', label: '版本号', children: iDetail.instance.versionNo || '-' },
                  {
                    key: 'effectiveDate',
                    label: '生效日期',
                    children: iDetail.instance.effectiveDate
                      ? dayjs(iDetail.instance.effectiveDate).format('YYYY-MM-DD')
                      : '-',
                  },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={SPEC_STATUS_COLOR[iDetail.instance.status || ''] || 'default'}>
                        {SPEC_STATUS_LABEL[iDetail.instance.status || ''] || iDetail.instance.status}
                      </Tag>
                    ),
                  },
                  { key: 'remark', label: '备注', children: iDetail.instance.remark || '-' },
                ]}
              />
            )}
          </Card>
          <Card size="small" title="指标取值与判定">
            <Table<SpecInstanceValueItem>
              rowKey={(record, index) => `${record.fieldCode}-${index}`}
              columns={instanceValueReadColumns}
              dataSource={iDetail?.values || []}
              size="small"
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>
        </Space>
      </Drawer>

      {/* 规格模板详情 */}
      <Drawer
        title={`规格模板详情 - ${tDetail?.template.templateCode || ''}`}
        width={900}
        open={tDetailOpen}
        onClose={() => setTDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" title="基本信息" loading={tDetailLoading}>
            {tDetail && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'templateCode', label: '模板编码', children: tDetail.template.templateCode },
                  { key: 'templateName', label: '模板名称', children: tDetail.template.templateName },
                  {
                    key: 'specCategory',
                    label: '规格分类',
                    children: tDetail.template.specCategory
                      ? SPEC_CATEGORY_LABEL[tDetail.template.specCategory] || tDetail.template.specCategory
                      : '-',
                  },
                  { key: 'productSeries', label: '产品系列', children: tDetail.template.productSeries || '-' },
                  { key: 'productCode', label: '产品编码', children: tDetail.template.productCode || '-' },
                  { key: 'versionNo', label: '版本号', children: tDetail.template.versionNo || '-' },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={SPEC_STATUS_COLOR[tDetail.template.status || ''] || 'default'}>
                        {SPEC_STATUS_LABEL[tDetail.template.status || ''] || tDetail.template.status}
                      </Tag>
                    ),
                  },
                  { key: 'description', label: '描述', children: tDetail.template.description || '-' },
                ]}
              />
            )}
          </Card>
          <Card size="small" title="字段明细">
            <Table<SpecTemplateFieldItem>
              rowKey={(record, index) => `${record.fieldCode}-${index}`}
              columns={templateFieldReadColumns}
              dataSource={tDetail?.fields || []}
              size="small"
              pagination={false}
              scroll={{ x: 1100 }}
            />
          </Card>
        </Space>
      </Drawer>
    </Space>
  );
}
