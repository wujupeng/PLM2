import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
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
import {
  ExperimentOutlined,
  FileTextOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  materialCategoryService,
  materialService,
  qualityService,
  supplierService,
} from '@/services/masterDataService';
import type {
  ChangeLogItem,
  LifecycleStatus,
  MaterialCategoryItem,
  MaterialImportResult,
  MaterialImportRow,
  MaterialItem,
  MaterialSaveParams,
  MaterialSubstituteItem,
  MaterialSubstituteParams,
  QualityIssueItem,
  SupplierItem,
} from '@/types/masterData';
import {
  LIFECYCLE_STATUS_OPTIONS,
  LIFECYCLE_STATUS_TEXT,
  MATERIAL_TYPE_OPTIONS,
  MATERIAL_TYPE_TEXT,
  QUALITY_SEVERITY_TEXT,
  SOURCE_TYPE_OPTIONS,
  SOURCE_TYPE_TEXT,
} from '@/types/masterData';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

const LIFECYCLE_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

const QUALITY_STATUS_OPTIONS = [
  { value: 'open', label: '待处理' },
  { value: 'fixed', label: '已修复' },
  { value: 'ignored', label: '已忽略' },
];

interface MaterialFormValues {
  materialCode: string;
  materialName: string;
  categoryCode?: string;
  spec?: string;
  materialType?: string;
  unit?: string;
  sourceType?: string;
  supplierCode?: string;
  lifecycleStatus?: string;
  stdCost?: number;
  effectiveDate?: Dayjs;
  obsoleteDate?: Dayjs;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  categoryCode?: string;
  lifecycleStatus?: string;
  sourceType?: string;
  materialType?: string;
}

export default function MaterialManagement() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MaterialFormValues>();
  const [subForm] = Form.useForm<MaterialSubstituteParams>();

  const [activeTab, setActiveTab] = useState('material');

  // 物料列表
  const [data, setData] = useState<MaterialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [categories, setCategories] = useState<MaterialCategoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 生命周期变更
  const [lifeOpen, setLifeOpen] = useState(false);
  const [lifeTarget, setLifeTarget] = useState<MaterialItem | null>(null);
  const [lifeStatus, setLifeStatus] = useState<string>('draft');
  const [lifeSaving, setLifeSaving] = useState(false);

  // 替代关系
  const [subOpen, setSubOpen] = useState(false);
  const [subTarget, setSubTarget] = useState<MaterialItem | null>(null);
  const [subs, setSubs] = useState<MaterialSubstituteItem[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subSaving, setSubSaving] = useState(false);

  // 变更留痕
  const [logOpen, setLogOpen] = useState(false);
  const [logTarget, setLogTarget] = useState<MaterialItem | null>(null);
  const [logs, setLogs] = useState<ChangeLogItem[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  // 批量导入
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState('');
  const [importRows, setImportRows] = useState<MaterialImportRow[]>([]);
  const [importJson, setImportJson] = useState('');
  const [importResult, setImportResult] = useState<MaterialImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  // 数据质量
  const [qData, setQData] = useState<QualityIssueItem[]>([]);
  const [qTotal, setQTotal] = useState(0);
  const [qLoading, setQLoading] = useState(false);
  const [qPageNum, setQPageNum] = useState(1);
  const [qPageSize, setQPageSize] = useState(10);
  const [qSearch, setQSearch] = useState<{ status?: string; severity?: string }>({});
  const [scanning, setScanning] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await materialService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          categoryCode: cond.categoryCode || undefined,
          lifecycleStatus: (cond.lifecycleStatus as LifecycleStatus) || undefined,
          sourceType: (cond.sourceType as MaterialItem['sourceType']) || undefined,
          materialType: (cond.materialType as MaterialItem['materialType']) || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadQuality = useCallback(
    async (page = qPageNum, size = qPageSize, cond = qSearch) => {
      setQLoading(true);
      try {
        const res = await qualityService.page({
          pageNum: page,
          pageSize: size,
          status: cond.status || undefined,
          severity: cond.severity || undefined,
        });
        setQData(res.list || []);
        setQTotal(res.total || 0);
      } finally {
        setQLoading(false);
      }
    },
    [qPageNum, qPageSize, qSearch],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadQuality(1, qPageSize, {});
    materialCategoryService
      .list()
      .then((res) => setCategories(res || []))
      .catch(() => undefined);
    supplierService
      .options()
      .then((res) => setSuppliers(res || []))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: SearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ lifecycleStatus: 'draft', materialType: 'part', sourceType: 'make' });
    setModalOpen(true);
  };

  const openEdit = (record: MaterialItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      materialCode: record.materialCode,
      materialName: record.materialName,
      categoryCode: record.categoryCode,
      spec: record.spec,
      materialType: record.materialType,
      unit: record.unit,
      sourceType: record.sourceType,
      supplierCode: record.supplierCode,
      lifecycleStatus: record.lifecycleStatus,
      stdCost: record.stdCost,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      obsoleteDate: record.obsoleteDate ? dayjs(record.obsoleteDate) : undefined,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const categoryId = categories.find((c) => c.categoryCode === values.categoryCode)?.id;
    const supplierId = suppliers.find((s) => s.supplierCode === values.supplierCode)?.id;
    const payload: MaterialSaveParams = {
      materialCode: values.materialCode,
      materialName: values.materialName,
      categoryCode: values.categoryCode,
      categoryId,
      spec: values.spec,
      materialType: values.materialType as MaterialSaveParams['materialType'],
      unit: values.unit,
      sourceType: values.sourceType as MaterialSaveParams['sourceType'],
      supplierCode: values.supplierCode,
      supplierId,
      lifecycleStatus: values.lifecycleStatus as MaterialSaveParams['lifecycleStatus'],
      stdCost: values.stdCost,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      obsoleteDate: values.obsoleteDate ? values.obsoleteDate.format('YYYY-MM-DD') : undefined,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await materialService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await materialService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MaterialItem) => {
    await materialService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const openLifecycle = (record: MaterialItem) => {
    setLifeTarget(record);
    setLifeStatus(record.lifecycleStatus || 'draft');
    setLifeOpen(true);
  };

  const handleLifecycle = async () => {
    if (!lifeTarget) return;
    setLifeSaving(true);
    try {
      await materialService.changeLifecycle(lifeTarget.id, lifeStatus);
      message.success('生命周期已更新');
      setLifeOpen(false);
      void loadData();
    } finally {
      setLifeSaving(false);
    }
  };

  const openSubstitutes = async (record: MaterialItem) => {
    setSubTarget(record);
    setSubOpen(true);
    setSubLoading(true);
    subForm.resetFields();
    try {
      const res = await materialService.substitutes(record.id);
      setSubs(res || []);
    } finally {
      setSubLoading(false);
    }
  };

  const reloadSubstitutes = async () => {
    if (!subTarget) return;
    setSubLoading(true);
    try {
      const res = await materialService.substitutes(subTarget.id);
      setSubs(res || []);
    } finally {
      setSubLoading(false);
    }
  };

  const handleAddSubstitute = async () => {
    if (!subTarget) return;
    const values = await subForm.validateFields();
    setSubSaving(true);
    try {
      await materialService.addSubstitute(subTarget.id, values);
      message.success('替代关系已新增');
      subForm.resetFields();
      await reloadSubstitutes();
    } finally {
      setSubSaving(false);
    }
  };

  const handleRemoveSubstitute = async (record: MaterialSubstituteItem) => {
    await materialService.removeSubstitute(record.id);
    message.success('替代关系已删除');
    await reloadSubstitutes();
  };

  const openLogs = async (record: MaterialItem) => {
    setLogTarget(record);
    setLogOpen(true);
    setLogLoading(true);
    try {
      const res = await materialService.changeLogs(record.id);
      setLogs(res || []);
    } finally {
      setLogLoading(false);
    }
  };

  // 批量导入
  const openImport = () => {
    setImportFile('');
    setImportRows([]);
    setImportJson('');
    setImportResult(null);
    setImportOpen(true);
  };

  const updateImportRow = (index: number, field: keyof MaterialImportRow, value: string) => {
    setImportRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === 'rowNumber' || field === 'stdCost') {
          const num = value === '' ? undefined : Number(value);
          return { ...row, [field]: Number.isNaN(num) ? undefined : num };
        }
        return { ...row, [field]: value };
      }),
    );
  };

  const addImportRow = () => {
    setImportRows((prev) => [...prev, { rowNumber: prev.length + 1, sheetName: 'Sheet1' }]);
  };

  const removeImportRow = (index: number) => {
    setImportRows((prev) => prev.filter((_, i) => i !== index));
  };

  const parseImportJson = () => {
    if (!importJson.trim()) {
      message.warning('请先粘贴 JSON 内容');
      return;
    }
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) {
        message.error('JSON 需为行对象数组');
        return;
      }
      setImportRows((prev) => [...prev, ...(parsed as MaterialImportRow[])]);
      setImportJson('');
      message.success('已解析并填入表格');
    } catch {
      message.error('JSON 解析失败，请检查格式');
    }
  };

  const handleImport = async () => {
    if (!importRows.length) {
      message.warning('请至少录入一行数据');
      return;
    }
    setImporting(true);
    try {
      const res = await materialService.importMaterials({
        sourceFile: importFile || undefined,
        rows: importRows,
      });
      setImportResult(res);
      message.success(`导入完成：成功 ${res.successRows} 条，失败 ${res.failRows} 条`);
      void loadData();
      void loadQuality();
    } finally {
      setImporting(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await qualityService.scan();
      message.success(`扫描完成：共执行 ${res.scannedRules} 条规则，发现 ${res.issueCount} 个问题`);
      setActiveTab('quality');
      setQPageNum(1);
      void loadQuality(1, qPageSize, qSearch);
    } finally {
      setScanning(false);
    }
  };

  const handleQualityStatus = async (record: QualityIssueItem, status: string) => {
    await qualityService.updateStatus(record.id, status);
    message.success('状态已更新');
    void loadQuality();
  };

  const materialColumns: ColumnsType<MaterialItem> = [
    { title: '物料编码', dataIndex: 'materialCode', width: 160 },
    { title: '物料名称', dataIndex: 'materialName', width: 180 },
    { title: '分类', dataIndex: 'categoryCode', width: 120, render: (v) => v || '-' },
    { title: '规格', dataIndex: 'spec', width: 150, render: (v) => v || '-' },
    {
      title: '物料类型',
      dataIndex: 'materialType',
      width: 100,
      render: (v?: string) => (v ? MATERIAL_TYPE_TEXT[v] || v : '-'),
    },
    { title: '单位', dataIndex: 'unit', width: 90, render: (v) => v || '-' },
    {
      title: '来源',
      dataIndex: 'sourceType',
      width: 90,
      render: (v?: string) => (v ? SOURCE_TYPE_TEXT[v] || v : '-'),
    },
    { title: '供应商', dataIndex: 'supplierCode', width: 120, render: (v) => v || '-' },
    {
      title: '生命周期',
      dataIndex: 'lifecycleStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={LIFECYCLE_COLOR[v] || 'default'}>{LIFECYCLE_STATUS_TEXT[v] || v}</Tag> : '-',
    },
    { title: '版本', dataIndex: 'versionNo', width: 100, render: (v) => v || '-' },
    { title: '标准成本', dataIndex: 'stdCost', width: 110, render: (v) => (v ?? '-') },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('material:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('material:update') && (
            <Button type="link" size="small" onClick={() => openLifecycle(record)}>
              生命周期
            </Button>
          )}
          {hasPermission('material:substitute') && (
            <Button
              type="link"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => openSubstitutes(record)}
            >
              替代关系
            </Button>
          )}
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => openLogs(record)}>
            变更留痕
          </Button>
          {hasPermission('material:delete') && (
            <Popconfirm title="确认删除该物料？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const substituteColumns: ColumnsType<MaterialSubstituteItem> = [
    { title: '替代物料编码', dataIndex: 'substituteMaterialCode', width: 160 },
    { title: '优先级', dataIndex: 'priority', width: 90, render: (v) => (v ?? '-') },
    { title: '适用条件', dataIndex: 'applicableCondition', width: 200, render: (v) => v || '-' },
    { title: '生效起', dataIndex: 'validFrom', width: 130, render: (v) => v || '-' },
    { title: '生效止', dataIndex: 'validTo', width: 130, render: (v) => v || '-' },
    { title: '备注', dataIndex: 'remark', render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, record) =>
        hasPermission('material:substitute') && (
          <Popconfirm title="确认删除该替代关系？" onConfirm={() => handleRemoveSubstitute(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        ),
    },
  ];

  const logColumns: ColumnsType<ChangeLogItem> = [
    { title: '变更类型', dataIndex: 'changeType', width: 120, render: (v) => v || '-' },
    { title: '字段', dataIndex: 'fieldName', width: 140, render: (v) => v || '-' },
    { title: '旧值', dataIndex: 'oldValue', width: 180, render: (v) => v || '-' },
    { title: '新值', dataIndex: 'newValue', width: 180, render: (v) => v || '-' },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: (v) => v || '-' },
    { title: '时间', dataIndex: 'createdAt', width: 180, render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-') },
    { title: '备注', dataIndex: 'remark', render: (v) => v || '-' },
  ];

  const importColumns: ColumnsType<MaterialImportRow> = [
    { title: '#', width: 50, render: (_, __, index) => index + 1 },
    {
      title: '工作表',
      dataIndex: 'sheetName',
      width: 110,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'sheetName', e.target.value)} />
      ),
    },
    {
      title: '行号',
      dataIndex: 'rowNumber',
      width: 80,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateImportRow(index, 'rowNumber', val == null ? '' : String(val))}
        />
      ),
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'materialCode', e.target.value)} />
      ),
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'materialName', e.target.value)} />
      ),
    },
    {
      title: '分类编码',
      dataIndex: 'categoryCode',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'categoryCode', e.target.value)} />
      ),
    },
    {
      title: '规格',
      dataIndex: 'spec',
      width: 130,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'spec', e.target.value)} />
      ),
    },
    {
      title: '物料类型',
      dataIndex: 'materialType',
      width: 120,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          allowClear
          options={MATERIAL_TYPE_OPTIONS}
          onChange={(val) => updateImportRow(index, 'materialType', val || '')}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 90,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'unit', e.target.value)} />
      ),
    },
    {
      title: '来源',
      dataIndex: 'sourceType',
      width: 110,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          allowClear
          options={SOURCE_TYPE_OPTIONS}
          onChange={(val) => updateImportRow(index, 'sourceType', val || '')}
        />
      ),
    },
    {
      title: '供应商编码',
      dataIndex: 'supplierCode',
      width: 130,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateImportRow(index, 'supplierCode', e.target.value)} />
      ),
    },
    {
      title: '生命周期',
      dataIndex: 'lifecycleStatus',
      width: 120,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          allowClear
          options={LIFECYCLE_STATUS_OPTIONS}
          onChange={(val) => updateImportRow(index, 'lifecycleStatus', val || '')}
        />
      ),
    },
    {
      title: '标准成本',
      dataIndex: 'stdCost',
      width: 110,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateImportRow(index, 'stdCost', val == null ? '' : String(val))}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_, __, index) => (
        <Button type="link" size="small" danger onClick={() => removeImportRow(index)}>
          删除
        </Button>
      ),
    },
  ];

  const qualityColumns: ColumnsType<QualityIssueItem> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 140, render: (v) => v || '-' },
    { title: '规则名称', dataIndex: 'ruleName', width: 160, render: (v) => v || '-' },
    { title: '对象类型', dataIndex: 'entityType', width: 110, render: (v) => v || '-' },
    { title: '对象编码', dataIndex: 'entityCode', width: 150, render: (v) => v || '-' },
    {
      title: '严重程度',
      dataIndex: 'severity',
      width: 100,
      render: (v?: string) => {
        if (!v) return '-';
        const color = v === 'high' ? 'red' : v === 'medium' ? 'orange' : 'blue';
        return <Tag color={color}>{QUALITY_SEVERITY_TEXT[v] || v}</Tag>;
      },
    },
    { title: '问题描述', dataIndex: 'message', width: 260, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 150,
      render: (v: string, record) =>
        hasPermission('material:quality:scan') ? (
          <Select
            value={v}
            size="small"
            style={{ width: 120 }}
            options={QUALITY_STATUS_OPTIONS}
            onChange={(val) => handleQualityStatus(record, val)}
          />
        ) : (
          QUALITY_STATUS_OPTIONS.find((o) => o.value === v)?.label || v || '-'
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        物料管理
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'material', label: '物料主档' },
          { key: 'quality', label: '数据质量' },
        ]}
      />

      {activeTab === 'material' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onSearch}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="物料编码 / 名称" allowClear style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="categoryCode" label="物料分类">
                <Select
                  placeholder="请选择"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  style={{ width: 180 }}
                  options={categories.map((c) => ({
                    value: c.categoryCode,
                    label: `${c.categoryCode} ${c.categoryName}`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="lifecycleStatus" label="生命周期">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 130 }}
                  options={LIFECYCLE_STATUS_OPTIONS}
                />
              </Form.Item>
              <Form.Item name="sourceType" label="来源">
                <Select placeholder="请选择" allowClear style={{ width: 110 }} options={SOURCE_TYPE_OPTIONS} />
              </Form.Item>
              <Form.Item name="materialType" label="物料类型">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 130 }}
                  options={MATERIAL_TYPE_OPTIONS}
                />
              </Form.Item>
              <Form.Item>
                <Space wrap>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={`物料列表（共 ${total} 条）`}
            extra={
              <Space>
                {hasPermission('material:quality:scan') && (
                  <Button icon={<ExperimentOutlined />} loading={scanning} onClick={handleScan}>
                    数据质量扫描
                  </Button>
                )}
                {hasPermission('material:import') && (
                  <Button icon={<ImportOutlined />} onClick={openImport}>
                    批量导入
                  </Button>
                )}
                {hasPermission('material:create') && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    新增物料
                  </Button>
                )}
              </Space>
            }
          >
            <Table<MaterialItem>
              rowKey="id"
              loading={loading}
              columns={materialColumns}
              dataSource={data}
              scroll={{ x: 1700 }}
              pagination={{
                current: pageNum,
                pageSize,
                total,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setPageNum(page);
                  setPageSize(size);
                  void loadData(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {activeTab === 'quality' && (
        <>
          <Card>
            <Space wrap>
              <Select
                placeholder="处理状态"
                allowClear
                style={{ width: 140 }}
                value={qSearch.status}
                onChange={(v) => setQSearch((prev) => ({ ...prev, status: v }))}
                options={QUALITY_STATUS_OPTIONS}
              />
              <Select
                placeholder="严重程度"
                allowClear
                style={{ width: 140 }}
                value={qSearch.severity}
                onChange={(v) => setQSearch((prev) => ({ ...prev, severity: v }))}
                options={[
                  { value: 'high', label: '高' },
                  { value: 'medium', label: '中' },
                  { value: 'low', label: '低' },
                ]}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setQPageNum(1);
                  void loadQuality(1, qPageSize, qSearch);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setQSearch({});
                  setQPageNum(1);
                  void loadQuality(1, qPageSize, {});
                }}
              >
                重置
              </Button>
              {hasPermission('material:quality:scan') && (
                <Button icon={<ExperimentOutlined />} loading={scanning} onClick={handleScan}>
                  数据质量扫描
                </Button>
              )}
            </Space>
          </Card>

          <Card title={`质量问题清单（共 ${qTotal} 条）`}>
            <Table<QualityIssueItem>
              rowKey="id"
              loading={qLoading}
              columns={qualityColumns}
              dataSource={qData}
              scroll={{ x: 1200 }}
              pagination={{
                current: qPageNum,
                pageSize: qPageSize,
                total: qTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setQPageNum(page);
                  setQPageSize(size);
                  void loadQuality(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {/* 新增/编辑物料 */}
      <Modal
        title={editing ? '编辑物料' : '新增物料'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="materialName"
            label="物料名称"
            rules={[{ required: true, message: '请输入物料名称' }]}
          >
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="categoryCode" label="物料分类">
            <Select
              placeholder="请选择物料分类"
              allowClear
              showSearch
              optionFilterProp="label"
              options={categories.map((c) => ({
                value: c.categoryCode,
                label: `${c.categoryCode} ${c.categoryName}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="materialType" label="物料类型">
            <Select placeholder="请选择" allowClear options={MATERIAL_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="请选择" allowClear options={SOURCE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商">
            <Select
              placeholder="请选择供应商"
              allowClear
              showSearch
              optionFilterProp="label"
              options={suppliers.map((s) => ({
                value: s.supplierCode,
                label: `${s.supplierCode} ${s.supplierName}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="lifecycleStatus" label="生命周期状态">
            <Select placeholder="请选择" allowClear options={LIFECYCLE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="stdCost" label="标准成本">
            <InputNumber style={{ width: '100%' }} placeholder="请输入标准成本" min={0} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="obsoleteDate" label="失效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 生命周期变更 */}
      <Modal
        title={`生命周期变更 - ${lifeTarget?.materialName || ''}`}
        open={lifeOpen}
        onOk={handleLifecycle}
        confirmLoading={lifeSaving}
        onCancel={() => setLifeOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="目标状态" required>
            <Select value={lifeStatus} onChange={setLifeStatus} options={LIFECYCLE_STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 替代关系 */}
      <Drawer
        title={`替代关系 - ${subTarget?.materialCode || ''}`}
        width={760}
        open={subOpen}
        onClose={() => setSubOpen(false)}
        destroyOnClose
      >
        <Form form={subForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item
            name="substituteMaterialCode"
            label="替代物料编码"
            rules={[{ required: true, message: '请输入替代物料编码' }]}
          >
            <Input placeholder="替代物料编码" style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} style={{ width: 90 }} />
          </Form.Item>
          <Form.Item name="applicableCondition" label="适用条件">
            <Input placeholder="适用条件" style={{ width: 140 }} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={subSaving}
              onClick={handleAddSubstitute}
            >
              新增
            </Button>
          </Form.Item>
        </Form>
        <Table<MaterialSubstituteItem>
          rowKey="id"
          loading={subLoading}
          columns={substituteColumns}
          dataSource={subs}
          size="small"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Drawer>

      {/* 变更留痕 */}
      <Drawer
        title={`变更留痕 - ${logTarget?.materialCode || ''}`}
        width={860}
        open={logOpen}
        onClose={() => setLogOpen(false)}
        destroyOnClose
      >
        <Table<ChangeLogItem>
          rowKey="id"
          loading={logLoading}
          columns={logColumns}
          dataSource={logs}
          size="small"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1000 }}
        />
      </Drawer>

      {/* 批量导入 */}
      <Modal
        title="物料批量导入"
        open={importOpen}
        onOk={handleImport}
        confirmLoading={importing}
        onCancel={() => setImportOpen(false)}
        width={1100}
        okText="提交导入"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            addonBefore="来源文件"
            placeholder="如 material_import.xlsx"
            value={importFile}
            onChange={(e) => setImportFile(e.target.value)}
          />
          <Input.TextArea
            rows={3}
            placeholder='可粘贴 JSON 行数组，例如：[{"sheetName":"Sheet1","rowNumber":2,"materialCode":"M001","materialName":"螺栓"}]'
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
          />
          <Space>
            <Button onClick={parseImportJson}>解析 JSON 并填入表格</Button>
            <Button icon={<PlusOutlined />} onClick={addImportRow}>
              添加空行
            </Button>
            <Button
              danger
              disabled={!importRows.length}
              onClick={() => setImportRows([])}
            >
              清空表格
            </Button>
          </Space>
          <Table<MaterialImportRow>
            rowKey={(_, index) => String(index)}
            columns={importColumns}
            dataSource={importRows}
            size="small"
            pagination={false}
            scroll={{ x: 1500 }}
          />
          {importResult && (
            <>
              <Alert
                type={importResult.failRows > 0 ? 'warning' : 'success'}
                showIcon
                message={`导入结果：共 ${importResult.totalRows} 行，成功 ${importResult.successRows} 行，失败 ${importResult.failRows} 行`}
              />
              {importResult.errors?.length > 0 && (
                <Table
                  rowKey={(_, index) => String(index)}
                  size="small"
                  pagination={false}
                  dataSource={importResult.errors}
                  columns={[
                    { title: '工作表', dataIndex: 'sheetName', width: 120, render: (v) => v || '-' },
                    { title: '行号', dataIndex: 'rowNumber', width: 80, render: (v) => (v ?? '-') },
                    { title: '字段', dataIndex: 'field', width: 140, render: (v) => v || '-' },
                    { title: '错误信息', dataIndex: 'message', render: (v) => v || '-' },
                  ]}
                />
              )}
            </>
          )}
        </Space>
      </Modal>
    </Space>
  );
}
