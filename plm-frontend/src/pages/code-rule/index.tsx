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
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { codeService } from '@/services/codeService';
import {
  CODE_DICT_TYPE_OPTIONS,
  CODE_RULE_STATUS_COLOR,
  CODE_RULE_STATUS_LABEL,
  CODE_RULE_STATUS_OPTIONS,
  CODE_TYPE_LABEL,
  CODE_TYPE_OPTIONS,
  DATE_PATTERN_LABEL,
  DATE_PATTERN_OPTIONS,
  FILL_MODE_OPTIONS,
  SEGMENT_VALUE_TYPE_LABEL,
  SEGMENT_VALUE_TYPE_OPTIONS,
  SEQ_DIMENSION_LABEL,
  SEQ_DIMENSION_OPTIONS,
  type CodeRuleItem,
  type CodeRulePreviewResult,
  type CodeRuleSaveParams,
  type CodeRuleSegmentItem,
} from '@/types/label';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 分段状态选项 */
const SEGMENT_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

/** 是否默认选项 */
const IS_DEFAULT_OPTIONS = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

interface CodeRuleFormValues {
  ruleCode: string;
  ruleName: string;
  codeType: string;
  ruleVersion?: string;
  totalLength: number;
  seqDimension?: string;
  seqStart?: number;
  seqEnd?: number;
  seqLength?: number;
  isDefault?: number;
  status?: string;
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
  plantCode?: string;
  customerCode?: string;
  projectCode?: string;
  description?: string;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  codeType?: string;
  status?: string;
}

export default function CodeRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<CodeRuleFormValues>();

  const [data, setData] = useState<CodeRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CodeRuleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 分段配置
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [segmentLoading, setSegmentLoading] = useState(false);
  const [segmentRule, setSegmentRule] = useState<CodeRuleItem | null>(null);
  const [segments, setSegments] = useState<CodeRuleSegmentItem[]>([]);
  const [segmentSaving, setSegmentSaving] = useState(false);

  // 分段校验结果
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<CodeRulePreviewResult | null>(null);

  // 规则详情
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<CodeRuleItem | null>(null);
  const [detailSegments, setDetailSegments] = useState<CodeRuleSegmentItem[]>([]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await codeService.rulePage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          codeType: cond.codeType || undefined,
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

  useEffect(() => {
    void loadData(1, pageSize, {});
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
    form.setFieldsValue({ ruleVersion: 'V1', isDefault: 0, status: 'draft' });
    setModalOpen(true);
  };

  const openEdit = (record: CodeRuleItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ruleCode: record.ruleCode,
      ruleName: record.ruleName,
      codeType: record.codeType,
      ruleVersion: record.ruleVersion,
      totalLength: record.totalLength,
      seqDimension: record.seqDimension,
      seqStart: record.seqStart,
      seqEnd: record.seqEnd,
      seqLength: record.seqLength,
      isDefault: record.isDefault,
      status: record.status,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
      plantCode: record.plantCode,
      customerCode: record.customerCode,
      projectCode: record.projectCode,
      description: record.description,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: CodeRuleSaveParams = {
      ruleCode: values.ruleCode,
      ruleName: values.ruleName,
      codeType: values.codeType,
      ruleVersion: values.ruleVersion,
      totalLength: values.totalLength,
      seqDimension: values.seqDimension,
      seqStart: values.seqStart,
      seqEnd: values.seqEnd,
      seqLength: values.seqLength,
      isDefault: values.isDefault,
      status: values.status,
      effectiveDate: values.effectiveDate ? dayjs(values.effectiveDate).format('YYYY-MM-DD') : undefined,
      expireDate: values.expireDate ? dayjs(values.expireDate).format('YYYY-MM-DD') : undefined,
      plantCode: values.plantCode,
      customerCode: values.customerCode,
      projectCode: values.projectCode,
      description: values.description,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await codeService.ruleUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await codeService.ruleCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: CodeRuleItem) => {
    await codeService.ruleRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleEnable = async (record: CodeRuleItem) => {
    await codeService.ruleEnable(record.id);
    message.success('已启用');
    void loadData();
  };

  const handleDisable = async (record: CodeRuleItem) => {
    await codeService.ruleDisable(record.id);
    message.success('已停用');
    void loadData();
  };

  const openSegments = async (record: CodeRuleItem) => {
    setSegmentRule(record);
    setSegmentOpen(true);
    setSegmentLoading(true);
    try {
      const res = await codeService.ruleDetail(record.id);
      setSegments(res.segments || []);
    } finally {
      setSegmentLoading(false);
    }
  };

  const addSegment = () => {
    setSegments((prev) => [
      ...prev,
      {
        segNo: prev.length + 1,
        segName: '',
        segKey: '',
        startPos: 1,
        endPos: 1,
        segLength: 1,
        status: 1,
        sortNo: prev.length + 1,
      },
    ]);
  };

  const updateSegment = (index: number, patch: Partial<CodeRuleSegmentItem>) => {
    setSegments((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeSegment = (index: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreviewSegments = async () => {
    if (!segmentRule) return;
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewResult(null);
    try {
      const res = await codeService.rulePreview({
        codeType: segmentRule.codeType,
        ruleCode: segmentRule.ruleCode,
        totalLength: segmentRule.totalLength,
        segments,
      });
      setPreviewResult(res);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveSegments = async () => {
    if (!segmentRule) return;
    setSegmentSaving(true);
    try {
      await codeService.ruleSaveSegments(segmentRule.id, segments);
      message.success('分段保存成功');
      setSegmentOpen(false);
    } finally {
      setSegmentSaving(false);
    }
  };

  const openDetail = async (record: CodeRuleItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await codeService.ruleDetail(record.id);
      setDetail(res.rule || record);
      setDetailSegments(res.segments || []);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<CodeRuleItem> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 180, render: (v) => v || '-' },
    { title: '规则名称', dataIndex: 'ruleName', width: 170, render: (v) => v || '-' },
    {
      title: '编码类型',
      dataIndex: 'codeType',
      width: 130,
      render: (v?: string) => (v ? CODE_TYPE_LABEL[v] || v : '-'),
    },
    { title: '总长度', dataIndex: 'totalLength', width: 90, render: (v) => (v ?? '-') },
    {
      title: '流水号维度',
      dataIndex: 'seqDimension',
      width: 110,
      render: (v?: string) => (v ? SEQ_DIMENSION_LABEL[v] || v : '-'),
    },
    {
      title: '是否默认',
      dataIndex: 'isDefault',
      width: 100,
      render: (v?: number) => (v === 1 ? <Tag color="green">默认</Tag> : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={CODE_RULE_STATUS_COLOR[v] || 'default'}>{CODE_RULE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '失效日期',
      dataIndex: 'expireDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    { title: '适用制造地', dataIndex: 'plantCode', width: 110, render: (v) => v || '-' },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {hasPermission('code:rule:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('code:rule:save') && (
            <Button type="link" size="small" onClick={() => openSegments(record)}>
              分段配置
            </Button>
          )}
          {hasPermission('code:rule:save') && (
            <Popconfirm
              title={record.status === 'enabled' ? '确认停用该规则？' : '确认启用该规则？'}
              onConfirm={() => (record.status === 'enabled' ? handleDisable(record) : handleEnable(record))}
            >
              <Button type="link" size="small">
                {record.status === 'enabled' ? '停用' : '启用'}
              </Button>
            </Popconfirm>
          )}
          {hasPermission('code:rule:delete') && (
            <Popconfirm title="确认删除该规则？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const segmentEditColumns: ColumnsType<CodeRuleSegmentItem> = [
    {
      title: '序号',
      dataIndex: 'segNo',
      width: 80,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateSegment(index, { segNo: val ?? 0 })}
        />
      ),
    },
    {
      title: '分段名称',
      dataIndex: 'segName',
      width: 130,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateSegment(index, { segName: e.target.value })} />
      ),
    },
    {
      title: '分段标识',
      dataIndex: 'segKey',
      width: 130,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateSegment(index, { segKey: e.target.value })} />
      ),
    },
    {
      title: '起始位',
      dataIndex: 'startPos',
      width: 90,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateSegment(index, { startPos: val ?? 0 })}
        />
      ),
    },
    {
      title: '结束位',
      dataIndex: 'endPos',
      width: 90,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateSegment(index, { endPos: val ?? 0 })}
        />
      ),
    },
    {
      title: '长度',
      dataIndex: 'segLength',
      width: 90,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateSegment(index, { segLength: val ?? 0 })}
        />
      ),
    },
    {
      title: '取值类型',
      dataIndex: 'valueType',
      width: 120,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={SEGMENT_VALUE_TYPE_OPTIONS}
          onChange={(val) => updateSegment(index, { valueType: val })}
        />
      ),
    },
    {
      title: '固定值',
      dataIndex: 'fixedValue',
      width: 100,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateSegment(index, { fixedValue: e.target.value })} />
      ),
    },
    {
      title: '字段键',
      dataIndex: 'fieldKey',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateSegment(index, { fieldKey: e.target.value })} />
      ),
    },
    {
      title: '码表类型',
      dataIndex: 'dictType',
      width: 170,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={CODE_DICT_TYPE_OPTIONS}
          onChange={(val) => updateSegment(index, { dictType: val })}
        />
      ),
    },
    {
      title: '日期格式',
      dataIndex: 'datePattern',
      width: 170,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={DATE_PATTERN_OPTIONS}
          onChange={(val) => updateSegment(index, { datePattern: val })}
        />
      ),
    },
    {
      title: '日偏移',
      dataIndex: 'dayOffset',
      width: 90,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateSegment(index, { dayOffset: val ?? undefined })}
        />
      ),
    },
    {
      title: '补位字符',
      dataIndex: 'fillChar',
      width: 90,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateSegment(index, { fillChar: e.target.value })} />
      ),
    },
    {
      title: '补位方式',
      dataIndex: 'fillMode',
      width: 110,
      render: (v: string, _r, index) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={FILL_MODE_OPTIONS}
          onChange={(val) => updateSegment(index, { fillMode: val })}
        />
      ),
    },
    {
      title: '来源',
      dataIndex: 'sourceRef',
      width: 140,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateSegment(index, { sourceRef: e.target.value })} />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortNo',
      width: 80,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateSegment(index, { sortNo: val ?? undefined })}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: number, _r, index) => (
        <Select<number>
          value={v}
          style={{ width: '100%' }}
          options={SEGMENT_STATUS_OPTIONS}
          onChange={(val) => updateSegment(index, { status: val })}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, __, index) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => removeSegment(index)}>
          删除
        </Button>
      ),
    },
  ];

  const segmentReadColumns: ColumnsType<CodeRuleSegmentItem> = [
    { title: '序号', dataIndex: 'segNo', width: 70, render: (v) => (v ?? '-') },
    { title: '分段名称', dataIndex: 'segName', width: 130, render: (v) => v || '-' },
    { title: '分段标识', dataIndex: 'segKey', width: 130, render: (v) => v || '-' },
    { title: '起始位', dataIndex: 'startPos', width: 80, render: (v) => (v ?? '-') },
    { title: '结束位', dataIndex: 'endPos', width: 80, render: (v) => (v ?? '-') },
    { title: '长度', dataIndex: 'segLength', width: 70, render: (v) => (v ?? '-') },
    {
      title: '取值类型',
      dataIndex: 'valueType',
      width: 110,
      render: (v?: string) => (v ? SEGMENT_VALUE_TYPE_LABEL[v] || v : '-'),
    },
    { title: '固定值', dataIndex: 'fixedValue', width: 100, render: (v) => v || '-' },
    { title: '字段键', dataIndex: 'fieldKey', width: 120, render: (v) => v || '-' },
    { title: '码表类型', dataIndex: 'dictType', width: 160, render: (v) => v || '-' },
    {
      title: '日期格式',
      dataIndex: 'datePattern',
      width: 110,
      render: (v?: string) => (v ? DATE_PATTERN_LABEL[v] || v : '-'),
    },
    { title: '日偏移', dataIndex: 'dayOffset', width: 80, render: (v) => (v ?? '-') },
    { title: '补位字符', dataIndex: 'fillChar', width: 90, render: (v) => v || '-' },
    { title: '补位方式', dataIndex: 'fillMode', width: 100, render: (v) => v || '-' },
    { title: '来源', dataIndex: 'sourceRef', width: 140, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">启用</Tag> : v === 0 ? <Tag color="error">停用</Tag> : '-',
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        编码规则
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="规则编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="codeType" label="编码类型">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={CODE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={CODE_RULE_STATUS_OPTIONS} />
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
        title={`编码规则列表（共 ${total} 条）`}
        extra={
          hasPermission('code:rule:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增规则
            </Button>
          )
        }
      >
        <Table<CodeRuleItem>
          rowKey="id"
          loading={loading}
          columns={columns}
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

      {/* 新增/编辑编码规则 */}
      <Modal
        title={editing ? '编辑编码规则' : '新增编码规则'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={900}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true, message: '请输入规则编码' }]}>
            <Input placeholder="请输入规则编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="codeType" label="编码类型" rules={[{ required: true, message: '请选择编码类型' }]}>
            <Select placeholder="请选择" options={CODE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="ruleVersion" label="规则版本">
            <Input placeholder="请输入规则版本" />
          </Form.Item>
          <Form.Item name="totalLength" label="总长度" rules={[{ required: true, message: '请输入总长度' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="seqDimension" label="流水号维度">
            <Select placeholder="请选择" allowClear options={SEQ_DIMENSION_OPTIONS} />
          </Form.Item>
          <Form.Item name="seqStart" label="流水号起始">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="seqEnd" label="流水号结束">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="seqLength" label="流水号长度">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="isDefault" label="是否默认">
            <Select placeholder="请选择" allowClear options={IS_DEFAULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={CODE_RULE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择生效日期" />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择失效日期" />
          </Form.Item>
          <Form.Item name="plantCode" label="适用制造地">
            <Input placeholder="请输入制造地代码" />
          </Form.Item>
          <Form.Item name="customerCode" label="适用客户">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="projectCode" label="适用项目">
            <Input placeholder="请输入项目编码" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分段配置 */}
      <Drawer
        title={`分段配置 - ${segmentRule?.ruleCode || ''}`}
        width={1300}
        open={segmentOpen}
        onClose={() => setSegmentOpen(false)}
        destroyOnClose
        footer={
          <Space>
            <Button onClick={() => setSegmentOpen(false)}>关闭</Button>
            <Button loading={previewLoading} onClick={handlePreviewSegments}>
              校验分段
            </Button>
            <Button type="primary" loading={segmentSaving} onClick={handleSaveSegments}>
              保存分段
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <Button icon={<PlusOutlined />} onClick={addSegment}>
              新增分段
            </Button>
          </Space>
          <Table<CodeRuleSegmentItem>
            rowKey={(_, index) => String(index)}
            loading={segmentLoading}
            columns={segmentEditColumns}
            dataSource={segments}
            size="small"
            pagination={false}
            scroll={{ x: 1900 }}
          />
        </Space>
      </Drawer>

      {/* 分段校验结果 */}
      <Modal
        title="分段校验结果"
        open={previewOpen}
        onOk={() => setPreviewOpen(false)}
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setPreviewOpen(false)}>
            关闭
          </Button>,
        ]}
      >
        {previewResult ? (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {!previewResult.valid && <Alert type="error" showIcon message="分段校验未通过" />}
            <div>总长度：{previewResult.totalLength ?? '-'}</div>
            <div>校验结果：{previewResult.valid ? '通过' : '未通过'}</div>
            {previewResult.message && <div>提示：{previewResult.message}</div>}
            {previewResult.segmentDescriptions && previewResult.segmentDescriptions.length > 0 && (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {previewResult.segmentDescriptions.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            )}
          </Space>
        ) : (
          <div>{previewLoading ? '校验中…' : '暂无校验结果'}</div>
        )}
      </Modal>

      {/* 编码规则详情 */}
      <Drawer
        title={`编码规则详情 - ${detail?.ruleCode || ''}`}
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
                  { key: 'ruleCode', label: '规则编码', children: detail.ruleCode },
                  { key: 'ruleName', label: '规则名称', children: detail.ruleName },
                  {
                    key: 'codeType',
                    label: '编码类型',
                    children: CODE_TYPE_LABEL[detail.codeType] || detail.codeType,
                  },
                  { key: 'ruleVersion', label: '规则版本', children: detail.ruleVersion || '-' },
                  { key: 'totalLength', label: '总长度', children: detail.totalLength ?? '-' },
                  {
                    key: 'seqDimension',
                    label: '流水号维度',
                    children: detail.seqDimension
                      ? SEQ_DIMENSION_LABEL[detail.seqDimension] || detail.seqDimension
                      : '-',
                  },
                  { key: 'seqStart', label: '流水号起始', children: detail.seqStart ?? '-' },
                  { key: 'seqEnd', label: '流水号结束', children: detail.seqEnd ?? '-' },
                  { key: 'seqLength', label: '流水号长度', children: detail.seqLength ?? '-' },
                  {
                    key: 'isDefault',
                    label: '是否默认',
                    children: detail.isDefault === 1 ? '是' : '否',
                  },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={CODE_RULE_STATUS_COLOR[detail.status || ''] || 'default'}>
                        {CODE_RULE_STATUS_LABEL[detail.status || ''] || detail.status}
                      </Tag>
                    ),
                  },
                  { key: 'plantCode', label: '适用制造地', children: detail.plantCode || '-' },
                  { key: 'customerCode', label: '适用客户', children: detail.customerCode || '-' },
                  { key: 'projectCode', label: '适用项目', children: detail.projectCode || '-' },
                  {
                    key: 'effectiveDate',
                    label: '生效日期',
                    children: detail.effectiveDate ? dayjs(detail.effectiveDate).format('YYYY-MM-DD') : '-',
                  },
                  {
                    key: 'expireDate',
                    label: '失效日期',
                    children: detail.expireDate ? dayjs(detail.expireDate).format('YYYY-MM-DD') : '-',
                  },
                  { key: 'description', label: '描述', children: detail.description || '-' },
                  { key: 'remark', label: '备注', children: detail.remark || '-' },
                ]}
              />
            )}
          </Card>
          <Card size="small" title="分段明细">
            <Table<CodeRuleSegmentItem>
              rowKey={(record, index) => `${record.id ?? 'new'}-${index}`}
              columns={segmentReadColumns}
              dataSource={detailSegments}
              size="small"
              pagination={false}
              scroll={{ x: 1650 }}
            />
          </Card>
        </Space>
      </Drawer>
    </Space>
  );
}
