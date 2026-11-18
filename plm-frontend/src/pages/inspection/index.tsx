import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { inspectionSpecService } from '@/services/inspectionService';
import { qualityDefectCodeService } from '@/services/qualityService';
import type {
  InspectionItemItem,
  InspectionItemSaveParams,
  InspectionSpecDetail,
  InspectionSpecItem,
} from '@/types/inspection';
import {
  INSPECTION_STATUS_COLOR,
  INSPECTION_STATUS_OPTIONS,
  INSPECTION_STATUS_TEXT,
  INSPECTION_TYPE_OPTIONS,
  INSPECTION_TYPE_TEXT,
} from '@/types/inspection';
import type { QualityDefectCodeItem } from '@/types/quality';
import {
  DEFECT_SEVERITY_COLOR,
  DEFECT_SEVERITY_OPTIONS,
  DEFECT_SEVERITY_TEXT,
} from '@/types/quality';

const { Title, Text } = Typography;

const STATUS_ENABLE_OPTIONS = [
  { value: 1, label: '启用' },
  { value: 0, label: '停用' },
];

interface SpecFormValues {
  specCode: string;
  specName: string;
  inspectionType?: string;
  productCode?: string;
  materialCode?: string;
  versionNo?: string;
  samplingPlan?: string;
  aqlLevel?: string;
  status?: string;
  effectiveDate?: Dayjs;
  remark?: string;
}

interface ItemRow {
  seqNo?: number;
  itemCode?: string;
  itemName?: string;
  inspectionMethod?: string;
  equipment?: string;
  unit?: string;
  standardValue?: string;
  upperLimit?: number;
  lowerLimit?: number;
  verdictRule?: string;
  keyItem?: boolean;
  remark?: string;
}

interface DefectFormValues {
  defectCode: string;
  defectName: string;
  defectCategory?: string;
  operationCode?: string;
  station?: string;
  responsibleDept?: string;
  defaultCause?: string;
  defaultAction?: string;
  severity?: string;
  status?: number;
  remark?: string;
}

interface MatchFormValues {
  productCode?: string;
  materialCode?: string;
  inspectionType?: string;
}

interface SpecSearchState {
  specCode?: string;
  inspectionType?: string;
  productCode?: string;
  materialCode?: string;
  status?: string;
}

interface DefectSearchState {
  defectCode?: string;
  defectCategory?: string;
  operationCode?: string;
  severity?: string;
  status?: number;
}

export default function InspectionSpecPage() {
  const [specForm] = Form.useForm<SpecFormValues>();
  const [defectForm] = Form.useForm<DefectFormValues>();
  const [matchForm] = Form.useForm<MatchFormValues>();

  const [activeTab, setActiveTab] = useState('specs');

  // 检验规范列表
  const [data, setData] = useState<InspectionSpecItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SpecSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InspectionSpecItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<ItemRow[]>([]);

  // 详情
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<InspectionSpecDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 自动匹配
  const [matchOpen, setMatchOpen] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<InspectionSpecItem | null>(null);
  const [matchDone, setMatchDone] = useState(false);

  // 缺陷代码库
  const [defectData, setDefectData] = useState<QualityDefectCodeItem[]>([]);
  const [defectTotal, setDefectTotal] = useState(0);
  const [defectLoading, setDefectLoading] = useState(false);
  const [defectPageNum, setDefectPageNum] = useState(1);
  const [defectPageSize, setDefectPageSize] = useState(10);
  const [defectSearch, setDefectSearch] = useState<DefectSearchState>({});
  const [defectModalOpen, setDefectModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<QualityDefectCodeItem | null>(null);
  const [defectSubmitting, setDefectSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await inspectionSpecService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.specCode || undefined,
          specCode: cond.specCode || undefined,
          inspectionType: cond.inspectionType || undefined,
          productCode: cond.productCode || undefined,
          materialCode: cond.materialCode || undefined,
          status: cond.status || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadDefects = useCallback(
    async (page = defectPageNum, size = defectPageSize, cond = defectSearch) => {
      setDefectLoading(true);
      try {
        const res = await qualityDefectCodeService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.defectCode || undefined,
          defectCode: cond.defectCode || undefined,
          defectCategory: cond.defectCategory || undefined,
          operationCode: cond.operationCode || undefined,
          severity: cond.severity || undefined,
          status: cond.status,
        });
        setDefectData(res.list || []);
        setDefectTotal(res.total || 0);
      } finally {
        setDefectLoading(false);
      }
    },
    [defectPageNum, defectPageSize, defectSearch],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadDefects(1, defectPageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: SpecSearchState) => {
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

  const onDefectSearch = (values: DefectSearchState) => {
    const cond = { ...values };
    setDefectSearch(cond);
    setDefectPageNum(1);
    void loadDefects(1, defectPageSize, cond);
  };

  const onDefectReset = () => {
    setDefectSearch({});
    setDefectPageNum(1);
    void loadDefects(1, defectPageSize, {});
  };

  // 检验规范新增/编辑
  const openCreate = () => {
    setEditing(null);
    specForm.resetFields();
    specForm.setFieldsValue({ status: 'draft' });
    setItems([]);
    setModalOpen(true);
  };

  const openEdit = async (record: InspectionSpecItem) => {
    setEditing(record);
    specForm.resetFields();
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await inspectionSpecService.detail(record.id);
      specForm.setFieldsValue({
        specCode: res.spec.specCode,
        specName: res.spec.specName,
        inspectionType: res.spec.inspectionType,
        productCode: res.spec.productCode,
        materialCode: res.spec.materialCode,
        versionNo: res.spec.versionNo,
        samplingPlan: res.spec.samplingPlan,
        aqlLevel: res.spec.aqlLevel,
        status: res.spec.status,
        effectiveDate: res.spec.effectiveDate ? dayjs(res.spec.effectiveDate) : undefined,
        remark: res.spec.remark,
      });
      setItems(
        (res.items || []).map((it) => ({
          seqNo: it.seqNo,
          itemCode: it.itemCode,
          itemName: it.itemName,
          inspectionMethod: it.inspectionMethod,
          equipment: it.equipment,
          unit: it.unit,
          standardValue: it.standardValue,
          upperLimit: it.upperLimit,
          lowerLimit: it.lowerLimit,
          verdictRule: it.verdictRule,
          keyItem: it.keyItem === 1,
          remark: it.remark,
        })),
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const updateItem = (index: number, field: keyof ItemRow, value: unknown) => {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? ({ ...row, [field]: value } as ItemRow) : row)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { keyItem: false }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const values = await specForm.validateFields();
    const payload = {
      specCode: values.specCode,
      specName: values.specName,
      inspectionType: values.inspectionType,
      productCode: values.productCode,
      materialCode: values.materialCode,
      versionNo: values.versionNo,
      samplingPlan: values.samplingPlan,
      aqlLevel: values.aqlLevel,
      status: values.status,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      remark: values.remark,
      items: items
        .filter((it) => it.itemName && it.itemName.trim())
        .map<InspectionItemSaveParams>((it) => ({
          seqNo: it.seqNo,
          itemCode: it.itemCode,
          itemName: it.itemName || '',
          inspectionMethod: it.inspectionMethod,
          equipment: it.equipment,
          unit: it.unit,
          standardValue: it.standardValue,
          upperLimit: it.upperLimit,
          lowerLimit: it.lowerLimit,
          verdictRule: it.verdictRule,
          keyItem: it.keyItem ? 1 : 0,
          remark: it.remark,
        })),
    };
    setSubmitting(true);
    try {
      if (editing) {
        await inspectionSpecService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await inspectionSpecService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: InspectionSpecItem) => {
    await inspectionSpecService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleRelease = async (record: InspectionSpecItem) => {
    await inspectionSpecService.release(record.id);
    message.success('发布成功');
    void loadData();
  };

  const openDetail = async (record: InspectionSpecItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await inspectionSpecService.detail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  // 自动匹配
  const openMatch = () => {
    matchForm.resetFields();
    setMatchResult(null);
    setMatchDone(false);
    setMatchOpen(true);
  };

  const handleMatch = async () => {
    const values = await matchForm.validateFields();
    if (!values.productCode && !values.materialCode && !values.inspectionType) {
      message.warning('请至少填写产品编码、物料编码或检验类型之一');
      return;
    }
    setMatching(true);
    try {
      const res = await inspectionSpecService.match({
        productCode: values.productCode,
        materialCode: values.materialCode,
        inspectionType: values.inspectionType,
      });
      setMatchResult(res || null);
      setMatchDone(true);
    } finally {
      setMatching(false);
    }
  };

  // 缺陷代码库新增/编辑
  const openDefectCreate = () => {
    setEditingDefect(null);
    defectForm.resetFields();
    defectForm.setFieldsValue({ status: 1, severity: 'minor' });
    setDefectModalOpen(true);
  };

  const openDefectEdit = (record: QualityDefectCodeItem) => {
    setEditingDefect(record);
    defectForm.resetFields();
    defectForm.setFieldsValue({
      defectCode: record.defectCode,
      defectName: record.defectName,
      defectCategory: record.defectCategory,
      operationCode: record.operationCode,
      station: record.station,
      responsibleDept: record.responsibleDept,
      defaultCause: record.defaultCause,
      defaultAction: record.defaultAction,
      severity: record.severity,
      status: record.status,
      remark: record.remark,
    });
    setDefectModalOpen(true);
  };

  const handleDefectSubmit = async () => {
    const values = await defectForm.validateFields();
    setDefectSubmitting(true);
    try {
      if (editingDefect) {
        await qualityDefectCodeService.update(editingDefect.id, values);
        message.success('更新成功');
      } else {
        await qualityDefectCodeService.create(values);
        message.success('新增成功');
      }
      setDefectModalOpen(false);
      void loadDefects();
    } finally {
      setDefectSubmitting(false);
    }
  };

  const handleDefectDelete = async (record: QualityDefectCodeItem) => {
    await qualityDefectCodeService.remove(record.id);
    message.success('删除成功');
    void loadDefects();
  };

  const specColumns: ColumnsType<InspectionSpecItem> = [
    { title: '规范编码', dataIndex: 'specCode', width: 150 },
    { title: '规范名称', dataIndex: 'specName', width: 180 },
    {
      title: '检验类型',
      dataIndex: 'inspectionType',
      width: 110,
      render: (v?: string) => (v ? INSPECTION_TYPE_TEXT[v] || v : '-'),
    },
    { title: '产品编码', dataIndex: 'productCode', width: 130, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: (v) => v || '-' },
    { title: '版本号', dataIndex: 'versionNo', width: 90, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? (
          <Tag color={INSPECTION_STATUS_COLOR[v] || 'default'}>{INSPECTION_STATUS_TEXT[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          {record.status !== 'released' && (
            <Popconfirm title="确认发布该检验规范？" onConfirm={() => handleRelease(record)}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
          )}
          <Popconfirm title="确认删除该检验规范？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const itemDetailColumns: ColumnsType<InspectionItemItem> = [
    { title: '序号', dataIndex: 'seqNo', width: 70, render: (v) => (v ?? '-') },
    { title: '项目编码', dataIndex: 'itemCode', width: 120, render: (v) => v || '-' },
    { title: '项目名称', dataIndex: 'itemName', width: 150 },
    { title: '检验方法', dataIndex: 'inspectionMethod', width: 130, render: (v) => v || '-' },
    { title: '检验设备', dataIndex: 'equipment', width: 120, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '标准值', dataIndex: 'standardValue', width: 110, render: (v) => v || '-' },
    { title: '上限', dataIndex: 'upperLimit', width: 90, render: (v) => (v ?? '-') },
    { title: '下限', dataIndex: 'lowerLimit', width: 90, render: (v) => (v ?? '-') },
    { title: '判定规则', dataIndex: 'verdictRule', width: 140, render: (v) => v || '-' },
    {
      title: '关键项',
      dataIndex: 'keyItem',
      width: 90,
      render: (v?: number) => (v === 1 ? <Tag color="warning">是</Tag> : <Tag>否</Tag>),
    },
    { title: '备注', dataIndex: 'remark', width: 140, render: (v) => v || '-' },
  ];

  const itemEditColumns: ColumnsType<ItemRow> = [
    {
      title: '序号',
      dataIndex: 'seqNo',
      width: 80,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          min={1}
          style={{ width: '100%' }}
          onChange={(val) => updateItem(index, 'seqNo', val ?? undefined)}
        />
      ),
    },
    {
      title: '项目编码',
      dataIndex: 'itemCode',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateItem(index, 'itemCode', e.target.value)} />
      ),
    },
    {
      title: '项目名称',
      dataIndex: 'itemName',
      width: 150,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          placeholder="必填"
          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
        />
      ),
    },
    {
      title: '检验方法',
      dataIndex: 'inspectionMethod',
      width: 130,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          onChange={(e) => updateItem(index, 'inspectionMethod', e.target.value)}
        />
      ),
    },
    {
      title: '检验设备',
      dataIndex: 'equipment',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateItem(index, 'equipment', e.target.value)} />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 90,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateItem(index, 'unit', e.target.value)} />
      ),
    },
    {
      title: '标准值',
      dataIndex: 'standardValue',
      width: 110,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateItem(index, 'standardValue', e.target.value)} />
      ),
    },
    {
      title: '上限',
      dataIndex: 'upperLimit',
      width: 100,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateItem(index, 'upperLimit', val ?? undefined)}
        />
      ),
    },
    {
      title: '下限',
      dataIndex: 'lowerLimit',
      width: 100,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateItem(index, 'lowerLimit', val ?? undefined)}
        />
      ),
    },
    {
      title: '判定规则',
      dataIndex: 'verdictRule',
      width: 140,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateItem(index, 'verdictRule', e.target.value)} />
      ),
    },
    {
      title: '关键项',
      dataIndex: 'keyItem',
      width: 90,
      render: (v: boolean, _r, index) => (
        <Switch checked={!!v} onChange={(val) => updateItem(index, 'keyItem', val)} />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateItem(index, 'remark', e.target.value)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_, __, index) => (
        <Button type="link" size="small" danger onClick={() => removeItem(index)}>
          删除
        </Button>
      ),
    },
  ];

  const defectColumns: ColumnsType<QualityDefectCodeItem> = [
    { title: '缺陷代码', dataIndex: 'defectCode', width: 130 },
    { title: '缺陷名称', dataIndex: 'defectName', width: 160 },
    { title: '缺陷分类', dataIndex: 'defectCategory', width: 120, render: (v) => v || '-' },
    { title: '工序编码', dataIndex: 'operationCode', width: 120, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'station', width: 100, render: (v) => v || '-' },
    { title: '责任部门', dataIndex: 'responsibleDept', width: 120, render: (v) => v || '-' },
    {
      title: '严重度',
      dataIndex: 'severity',
      width: 100,
      render: (v?: string) =>
        v ? (
          <Tag color={DEFECT_SEVERITY_COLOR[v] || 'default'}>{DEFECT_SEVERITY_TEXT[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openDefectEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该缺陷代码？" onConfirm={() => handleDefectDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        检验规范
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'specs', label: '检验规范' },
          { key: 'defects', label: '缺陷代码库' },
        ]}
      />

      {activeTab === 'specs' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onSearch}>
              <Form.Item name="specCode" label="规范编码">
                <Input placeholder="规范编码" allowClear style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="inspectionType" label="检验类型">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 130 }}
                  options={INSPECTION_TYPE_OPTIONS}
                />
              </Form.Item>
              <Form.Item name="productCode" label="产品编码">
                <Input placeholder="产品编码" allowClear style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="materialCode" label="物料编码">
                <Input placeholder="物料编码" allowClear style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 130 }}
                  options={INSPECTION_STATUS_OPTIONS}
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
            title={`检验规范列表（共 ${total} 条）`}
            extra={
              <Space wrap>
                <Button onClick={openMatch}>自动匹配</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                  新增检验规范
                </Button>
              </Space>
            }
          >
            <Table<InspectionSpecItem>
              rowKey="id"
              loading={loading}
              columns={specColumns}
              dataSource={data}
              scroll={{ x: 1400 }}
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

      {activeTab === 'defects' && (
        <>
          <Card>
            <Form layout="inline" onFinish={onDefectSearch}>
              <Form.Item name="defectCode" label="缺陷代码">
                <Input placeholder="缺陷代码" allowClear style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="defectCategory" label="缺陷分类">
                <Input placeholder="缺陷分类" allowClear style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="operationCode" label="工序编码">
                <Input placeholder="工序编码" allowClear style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="severity" label="严重度">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 120 }}
                  options={DEFECT_SEVERITY_OPTIONS}
                />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select
                  placeholder="请选择"
                  allowClear
                  style={{ width: 120 }}
                  options={STATUS_ENABLE_OPTIONS}
                />
              </Form.Item>
              <Form.Item>
                <Space wrap>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onDefectReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={`缺陷代码库（共 ${defectTotal} 条）`}
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={openDefectCreate}>
                新增缺陷代码
              </Button>
            }
          >
            <Table<QualityDefectCodeItem>
              rowKey="id"
              loading={defectLoading}
              columns={defectColumns}
              dataSource={defectData}
              scroll={{ x: 1300 }}
              pagination={{
                current: defectPageNum,
                pageSize: defectPageSize,
                total: defectTotal,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setDefectPageNum(page);
                  setDefectPageSize(size);
                  void loadDefects(page, size);
                },
              }}
            />
          </Card>
        </>
      )}

      {/* 新增/编辑检验规范 */}
      <Modal
        title={editing ? '编辑检验规范' : '新增检验规范'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={1100}
      >
        <Form form={specForm} layout="vertical" preserve={false}>
          <Space size="middle" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item
              name="specCode"
              label="规范编码"
              rules={[{ required: true, message: '请输入规范编码' }]}
              style={{ width: 260 }}
            >
              <Input placeholder="请输入规范编码" disabled={!!editing} />
            </Form.Item>
            <Form.Item
              name="specName"
              label="规范名称"
              rules={[{ required: true, message: '请输入规范名称' }]}
              style={{ width: 260 }}
            >
              <Input placeholder="请输入规范名称" />
            </Form.Item>
            <Form.Item name="inspectionType" label="检验类型" style={{ width: 180 }}>
              <Select placeholder="请选择" allowClear options={INSPECTION_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="productCode" label="产品编码" style={{ width: 220 }}>
              <Input placeholder="请输入产品编码" />
            </Form.Item>
            <Form.Item name="materialCode" label="物料编码" style={{ width: 220 }}>
              <Input placeholder="请输入物料编码" />
            </Form.Item>
            <Form.Item name="versionNo" label="版本号" style={{ width: 160 }}>
              <Input placeholder="默认为 V1" />
            </Form.Item>
            <Form.Item name="samplingPlan" label="抽样方案" style={{ width: 220 }}>
              <Input placeholder="留空按配置兜底" />
            </Form.Item>
            <Form.Item name="aqlLevel" label="AQL 水平" style={{ width: 160 }}>
              <Input placeholder="请输入 AQL 水平" />
            </Form.Item>
            <Form.Item name="status" label="状态" style={{ width: 160 }}>
              <Select options={INSPECTION_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日期" style={{ width: 180 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>

        <Space style={{ marginBottom: 8 }}>
          <Text strong>检验项目明细</Text>
          <Button icon={<PlusOutlined />} onClick={addItem}>
            添加项目
          </Button>
        </Space>
        <Table<ItemRow>
          rowKey={(_, index) => String(index)}
          columns={itemEditColumns}
          dataSource={items}
          size="small"
          pagination={false}
          scroll={{ x: 1500 }}
        />
      </Modal>

      {/* 检验规范详情 */}
      <Drawer
        title={`检验规范详情 - ${detail?.spec.specCode || ''}`}
        width={1000}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" title="基本信息" loading={detailLoading}>
            {detail && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'specCode', label: '规范编码', children: detail.spec.specCode },
                  { key: 'specName', label: '规范名称', children: detail.spec.specName },
                  {
                    key: 'inspectionType',
                    label: '检验类型',
                    children: detail.spec.inspectionType
                      ? INSPECTION_TYPE_TEXT[detail.spec.inspectionType] || detail.spec.inspectionType
                      : '-',
                  },
                  { key: 'productCode', label: '产品编码', children: detail.spec.productCode || '-' },
                  { key: 'materialCode', label: '物料编码', children: detail.spec.materialCode || '-' },
                  { key: 'versionNo', label: '版本号', children: detail.spec.versionNo || '-' },
                  { key: 'samplingPlan', label: '抽样方案', children: detail.spec.samplingPlan || '-' },
                  { key: 'aqlLevel', label: 'AQL 水平', children: detail.spec.aqlLevel || '-' },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={INSPECTION_STATUS_COLOR[detail.spec.status || ''] || 'default'}>
                        {INSPECTION_STATUS_TEXT[detail.spec.status || ''] || detail.spec.status}
                      </Tag>
                    ),
                  },
                  {
                    key: 'effectiveDate',
                    label: '生效日期',
                    children: detail.spec.effectiveDate
                      ? dayjs(detail.spec.effectiveDate).format('YYYY-MM-DD')
                      : '-',
                  },
                  { key: 'remark', label: '备注', span: 2, children: detail.spec.remark || '-' },
                ]}
              />
            )}
          </Card>

          <Card size="small" title={`检验项目（${detail?.items.length || 0}）`}>
            <Table<InspectionItemItem>
              rowKey="id"
              size="small"
              columns={itemDetailColumns}
              dataSource={detail?.items || []}
              pagination={false}
              scroll={{ x: 1400 }}
            />
          </Card>
        </Space>
      </Drawer>

      {/* 自动匹配 */}
      <Modal
        title="检验规范自动匹配"
        open={matchOpen}
        onOk={handleMatch}
        confirmLoading={matching}
        okText="匹配"
        onCancel={() => setMatchOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={matchForm} layout="vertical" preserve={false}>
          <Space size="middle" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item name="productCode" label="产品编码" style={{ width: 200 }}>
              <Input placeholder="请输入产品编码" allowClear />
            </Form.Item>
            <Form.Item name="materialCode" label="物料编码" style={{ width: 200 }}>
              <Input placeholder="请输入物料编码" allowClear />
            </Form.Item>
            <Form.Item name="inspectionType" label="检验类型" style={{ width: 180 }}>
              <Select placeholder="请选择" allowClear options={INSPECTION_TYPE_OPTIONS} />
            </Form.Item>
          </Space>
        </Form>
        {matchDone &&
          (matchResult ? (
            <Descriptions
              size="small"
              bordered
              column={1}
              items={[
                { key: 'specCode', label: '规范编码', children: matchResult.specCode },
                { key: 'specName', label: '规范名称', children: matchResult.specName },
                {
                  key: 'inspectionType',
                  label: '检验类型',
                  children: matchResult.inspectionType
                    ? INSPECTION_TYPE_TEXT[matchResult.inspectionType] || matchResult.inspectionType
                    : '-',
                },
                { key: 'productCode', label: '产品编码', children: matchResult.productCode || '-' },
                { key: 'materialCode', label: '物料编码', children: matchResult.materialCode || '-' },
                { key: 'samplingPlan', label: '抽样方案', children: matchResult.samplingPlan || '-' },
                { key: 'aqlLevel', label: 'AQL 水平', children: matchResult.aqlLevel || '-' },
              ]}
            />
          ) : (
            <Alert type="info" showIcon message="未匹配到可用的检验规范" />
          ))}
      </Modal>

      {/* 新增/编辑缺陷代码 */}
      <Modal
        title={editingDefect ? '编辑缺陷代码' : '新增缺陷代码'}
        open={defectModalOpen}
        onOk={handleDefectSubmit}
        confirmLoading={defectSubmitting}
        onCancel={() => setDefectModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={defectForm} layout="vertical" preserve={false}>
          <Form.Item
            name="defectCode"
            label="缺陷代码"
            rules={[{ required: true, message: '请输入缺陷代码' }]}
          >
            <Input placeholder="请输入缺陷代码" disabled={!!editingDefect} />
          </Form.Item>
          <Form.Item
            name="defectName"
            label="缺陷名称"
            rules={[{ required: true, message: '请输入缺陷名称' }]}
          >
            <Input placeholder="请输入缺陷名称" />
          </Form.Item>
          <Form.Item name="defectCategory" label="缺陷分类">
            <Input placeholder="请输入缺陷分类" />
          </Form.Item>
          <Form.Item name="operationCode" label="工序编码">
            <Input placeholder="请输入工序编码" />
          </Form.Item>
          <Form.Item name="station" label="工位">
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="responsibleDept" label="责任部门">
            <Input placeholder="请输入责任部门" />
          </Form.Item>
          <Form.Item name="defaultCause" label="默认原因">
            <Input.TextArea rows={2} placeholder="请输入默认原因" />
          </Form.Item>
          <Form.Item name="defaultAction" label="默认措施">
            <Input.TextArea rows={2} placeholder="请输入默认措施" />
          </Form.Item>
          <Form.Item name="severity" label="严重度">
            <Select placeholder="请选择" allowClear options={DEFECT_SEVERITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={STATUS_ENABLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
