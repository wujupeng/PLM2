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
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { qualityDefectCodeService, qualityIssueService } from '@/services/qualityService';
import type {
  QualityDefectCodeItem,
  QualityIssueActionItem,
  QualityIssueCloseParams,
  QualityIssueDetail,
  QualityIssueItem,
  QualityIssueSaveParams,
  QualityIssueToEcrParams,
  QualityIssueUpdateParams,
} from '@/types/quality';
import {
  DEFECT_SEVERITY_COLOR,
  DEFECT_SEVERITY_OPTIONS,
  DEFECT_SEVERITY_TEXT,
  QUALITY_ACTION_STATUS_COLOR,
  QUALITY_ACTION_STATUS_TEXT,
  QUALITY_ACTION_TYPE_OPTIONS,
  QUALITY_ACTION_TYPE_TEXT,
  QUALITY_PROBLEM_STATUS_COLOR,
  QUALITY_PROBLEM_STATUS_OPTIONS,
  QUALITY_PROBLEM_STATUS_TEXT,
  QUALITY_SOURCE_TYPE_OPTIONS,
  QUALITY_SOURCE_TYPE_TEXT,
} from '@/types/quality';

const { Title } = Typography;

/** 转 ECR 风险等级选项 */
const RISK_LEVEL_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'middle', label: '中' },
  { value: 'high', label: '高' },
];

/** 转 ECR 紧急程度选项 */
const URGENCY_OPTIONS = [
  { value: 'normal', label: '一般' },
  { value: 'urgent', label: '紧急' },
  { value: 'emergency', label: '特急' },
];

interface IssueFormValues {
  title: string;
  sourceType?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  operationCode?: string;
  defectCode?: string;
  defectName?: string;
  severity?: string;
  foundQty?: number;
  issueDesc?: string;
  responsibleDept?: string;
  responsibleId?: number;
  responsibleName?: string;
  tempAction?: string;
  rootCause?: string;
  permanentAction?: string;
  foundAt?: Dayjs;
  remark?: string;
}

interface IssueEditFormValues {
  title?: string;
  severity?: string;
  issueDesc?: string;
  responsibleDept?: string;
  responsibleId?: number;
  responsibleName?: string;
  tempAction?: string;
  rootCause?: string;
  permanentAction?: string;
  remark?: string;
}

interface ActionFormValues {
  actionType: string;
  content: string;
  ownerId?: number;
  ownerName?: string;
  dueDate?: Dayjs;
}

interface VerifyFormValues {
  result?: string;
  evidence?: string;
}

interface CloseFormValues {
  verifyResult?: string;
  remark?: string;
  tempAction?: string;
  rootCause?: string;
  permanentAction?: string;
}

interface ToEcrFormValues {
  title?: string;
  reason?: string;
  riskLevel?: string;
  urgency?: string;
  affectedProducts?: string;
  affectedMaterials?: string;
  affectedDocuments?: string;
  affectedProcesses?: string;
  remark?: string;
}

interface SearchState {
  issueNo?: string;
  sourceType?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  workOrderNo?: string;
  operationCode?: string;
  defectCode?: string;
  severity?: string;
  status?: string;
}

export default function QualityIssuePage() {
  const [form] = Form.useForm<IssueFormValues>();
  const [editForm] = Form.useForm<IssueEditFormValues>();
  const [actionForm] = Form.useForm<ActionFormValues>();
  const [verifyForm] = Form.useForm<VerifyFormValues>();
  const [closeForm] = Form.useForm<CloseFormValues>();
  const [ecrForm] = Form.useForm<ToEcrFormValues>();

  // 列表
  const [data, setData] = useState<QualityIssueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});
  const [defectOptions, setDefectOptions] = useState<QualityDefectCodeItem[]>([]);

  // 登记/编辑
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QualityIssueItem | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // 详情
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<QualityIssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 措施
  const [actionAdding, setActionAdding] = useState(false);

  // 验证措施
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<QualityIssueActionItem | null>(null);
  const [verifying, setVerifying] = useState(false);

  // 关闭
  const [closeOpen, setCloseOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // 转 ECR
  const [ecrOpen, setEcrOpen] = useState(false);
  const [ecrSubmitting, setEcrSubmitting] = useState(false);
  const [ecrNo, setEcrNo] = useState<string>('');

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await qualityIssueService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.issueNo || undefined,
          issueNo: cond.issueNo || undefined,
          sourceType: cond.sourceType || undefined,
          productCode: cond.productCode || undefined,
          materialCode: cond.materialCode || undefined,
          batchNo: cond.batchNo || undefined,
          workOrderNo: cond.workOrderNo || undefined,
          operationCode: cond.operationCode || undefined,
          defectCode: cond.defectCode || undefined,
          severity: cond.severity || undefined,
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

  const loadDefectOptions = () => {
    qualityDefectCodeService
      .options()
      .then((res) => setDefectOptions(res || []))
      .catch(() => undefined);
  };

  useEffect(() => {
    void loadData(1, pageSize, {});
    loadDefectOptions();
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

  // 登记问题
  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ sourceType: 'internal' });
    setModalOpen(true);
  };

  /** 选择缺陷代码时带出缺陷名称、责任部门、严重度与默认措施（后端开启自动带出时同样生效） */
  const onDefectChange = (value?: string) => {
    if (!value) return;
    const defect = defectOptions.find((d) => d.defectCode === value);
    if (!defect) return;
    form.setFieldsValue({
      defectName: defect.defectName,
      responsibleDept: defect.responsibleDept,
      severity: defect.severity,
      tempAction: form.getFieldValue('tempAction') || defect.defaultAction,
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: QualityIssueSaveParams = {
      title: values.title,
      sourceType: values.sourceType,
      productCode: values.productCode,
      materialCode: values.materialCode,
      batchNo: values.batchNo,
      workOrderNo: values.workOrderNo,
      operationCode: values.operationCode,
      defectCode: values.defectCode,
      defectName: values.defectName,
      severity: values.severity,
      foundQty: values.foundQty,
      issueDesc: values.issueDesc,
      responsibleDept: values.responsibleDept,
      responsibleId: values.responsibleId,
      responsibleName: values.responsibleName,
      tempAction: values.tempAction,
      rootCause: values.rootCause,
      permanentAction: values.permanentAction,
      foundAt: values.foundAt ? values.foundAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      await qualityIssueService.create(payload);
      message.success('登记成功');
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  // 编辑处理信息
  const openEdit = (record: QualityIssueItem) => {
    setEditTarget(record);
    editForm.resetFields();
    editForm.setFieldsValue({
      title: record.title,
      severity: record.severity,
      issueDesc: record.issueDesc,
      responsibleDept: record.responsibleDept,
      responsibleId: record.responsibleId,
      responsibleName: record.responsibleName,
      tempAction: record.tempAction,
      rootCause: record.rootCause,
      permanentAction: record.permanentAction,
      remark: record.remark,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    const values = await editForm.validateFields();
    const payload: QualityIssueUpdateParams = { ...values };
    setEditSubmitting(true);
    try {
      await qualityIssueService.update(editTarget.id, payload);
      message.success('更新成功');
      setEditOpen(false);
      void loadData();
      if (detail && detail.issue.id === editTarget.id) await reloadDetail();
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (record: QualityIssueItem) => {
    await qualityIssueService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const openDetail = async (record: QualityIssueItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await qualityIssueService.detail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadDetail = async () => {
    if (!detail) return;
    setDetailLoading(true);
    try {
      const res = await qualityIssueService.detail(detail.issue.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  // 措施
  const handleAddAction = async () => {
    if (!detail) return;
    const values = await actionForm.validateFields();
    setActionAdding(true);
    try {
      await qualityIssueService.addAction(detail.issue.id, {
        actionType: values.actionType,
        content: values.content,
        ownerId: values.ownerId,
        ownerName: values.ownerName,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
      });
      message.success('措施已追加');
      actionForm.resetFields();
      await reloadDetail();
    } finally {
      setActionAdding(false);
    }
  };

  const handleCompleteAction = async (record: QualityIssueActionItem) => {
    if (!detail) return;
    await qualityIssueService.completeAction(detail.issue.id, record.id);
    message.success('措施已完成');
    await reloadDetail();
  };

  const openVerify = (record: QualityIssueActionItem) => {
    setVerifyTarget(record);
    verifyForm.resetFields();
    setVerifyOpen(true);
  };

  const handleVerify = async () => {
    if (!detail || !verifyTarget) return;
    const values = await verifyForm.validateFields();
    setVerifying(true);
    try {
      await qualityIssueService.verifyAction(detail.issue.id, verifyTarget.id, values);
      message.success('措施已验证');
      setVerifyOpen(false);
      await reloadDetail();
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteAction = async (record: QualityIssueActionItem) => {
    if (!detail) return;
    await qualityIssueService.deleteAction(detail.issue.id, record.id);
    message.success('措施已删除');
    await reloadDetail();
  };

  // 关闭问题
  const openClose = () => {
    closeForm.resetFields();
    setCloseOpen(true);
  };

  const handleClose = async () => {
    if (!detail) return;
    const values = await closeForm.validateFields();
    const payload: QualityIssueCloseParams = { ...values };
    setClosing(true);
    try {
      await qualityIssueService.close(detail.issue.id, payload);
      message.success('问题已关闭');
      setCloseOpen(false);
      await reloadDetail();
      void loadData();
    } catch (err) {
      // 后端配置要求关闭前必须存在已验证的效果验证措施，否则返回中文提示，此处显式展示给用户
      const tip =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        '关闭失败';
      message.error(tip);
    } finally {
      setClosing(false);
    }
  };

  // 转 ECR
  const openEcr = () => {
    if (!detail) return;
    ecrForm.resetFields();
    ecrForm.setFieldsValue({
      title: `质量问题转变更：${detail.issue.issueNo || ''} ${detail.issue.title}`,
      reason: detail.issue.issueDesc,
      urgency: 'normal',
      affectedProducts: detail.issue.productCode,
      affectedMaterials: detail.issue.materialCode,
    });
    setEcrNo('');
    setEcrOpen(true);
  };

  const handleToEcr = async () => {
    if (!detail) return;
    const values = await ecrForm.validateFields();
    const payload: QualityIssueToEcrParams = { ...values };
    setEcrSubmitting(true);
    try {
      const res = await qualityIssueService.toEcr(detail.issue.id, payload);
      const no = res?.ecrNo || '';
      setEcrNo(no);
      message.success(`已转 ECR：${no || res?.message || '成功'}`);
      await reloadDetail();
      void loadData();
    } finally {
      setEcrSubmitting(false);
    }
  };

  const issueColumns: ColumnsType<QualityIssueItem> = [
    { title: '问题单号', dataIndex: 'issueNo', width: 150, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200 },
    {
      title: '来源',
      dataIndex: 'sourceType',
      width: 110,
      render: (v?: string) => (v ? QUALITY_SOURCE_TYPE_TEXT[v] || v : '-'),
    },
    { title: '产品编码', dataIndex: 'productCode', width: 120, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 120, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 120, render: (v) => v || '-' },
    { title: '工单号', dataIndex: 'workOrderNo', width: 120, render: (v) => v || '-' },
    { title: '缺陷名称', dataIndex: 'defectName', width: 140, render: (v) => v || '-' },
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
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={QUALITY_PROBLEM_STATUS_COLOR[v] || 'default'}>
            {QUALITY_PROBLEM_STATUS_TEXT[v] || v}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '发现时间',
      dataIndex: 'foundAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该质量问题？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const actionColumns: ColumnsType<QualityIssueActionItem> = [
    {
      title: '措施类型',
      dataIndex: 'actionType',
      width: 110,
      render: (v?: string) => (v ? QUALITY_ACTION_TYPE_TEXT[v] || v : '-'),
    },
    { title: '措施内容', dataIndex: 'content', width: 220, render: (v) => v || '-' },
    { title: '责任人', dataIndex: 'ownerName', width: 110, render: (v) => v || '-' },
    {
      title: '计划完成',
      dataIndex: 'dueDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? (
          <Tag color={QUALITY_ACTION_STATUS_COLOR[v] || 'default'}>
            {QUALITY_ACTION_STATUS_TEXT[v] || v}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '验证结果', dataIndex: 'result', width: 140, render: (v) => v || '-' },
    { title: '验证证据', dataIndex: 'evidence', width: 140, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.status === 'open' && (
            <Popconfirm title="确认标记该措施已完成？" onConfirm={() => handleCompleteAction(record)}>
              <Button type="link" size="small">
                完成
              </Button>
            </Popconfirm>
          )}
          {record.status === 'done' && (
            <Button type="link" size="small" onClick={() => openVerify(record)}>
              验证
            </Button>
          )}
          <Popconfirm title="确认删除该措施？" onConfirm={() => handleDeleteAction(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const issue = detail?.issue;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        质量问题
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="issueNo" label="问题单号">
            <Input placeholder="问题单号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="sourceType" label="来源">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={QUALITY_SOURCE_TYPE_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              options={QUALITY_PROBLEM_STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="severity" label="严重度">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              options={DEFECT_SEVERITY_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="产品编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="物料编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="批次号" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="工单号" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="operationCode" label="工序编码">
            <Input placeholder="工序编码" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="defectCode" label="缺陷代码">
            <Input placeholder="缺陷代码" allowClear style={{ width: 130 }} />
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
        title={`质量问题列表（共 ${total} 条）`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            登记问题
          </Button>
        }
      >
        <Table<QualityIssueItem>
          rowKey="id"
          loading={loading}
          columns={issueColumns}
          dataSource={data}
          scroll={{ x: 1800 }}
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

      {/* 登记问题 */}
      <Modal
        title="登记质量问题"
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="问题标题" rules={[{ required: true, message: '请输入问题标题' }]}>
            <Input placeholder="请输入问题标题" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item name="sourceType" label="来源类型" style={{ width: 180 }}>
              <Select placeholder="请选择" allowClear options={QUALITY_SOURCE_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="severity" label="严重度" style={{ width: 150 }}>
              <Select placeholder="请选择" allowClear options={DEFECT_SEVERITY_OPTIONS} />
            </Form.Item>
            <Form.Item name="defectCode" label="缺陷代码" style={{ width: 220 }}>
              <Select
                placeholder="选择后自动带出缺陷信息"
                allowClear
                showSearch
                optionFilterProp="label"
                onChange={onDefectChange}
                options={defectOptions.map((d) => ({
                  value: d.defectCode,
                  label: `${d.defectCode} ${d.defectName}`,
                }))}
              />
            </Form.Item>
            <Form.Item name="defectName" label="缺陷名称" style={{ width: 220 }}>
              <Input placeholder="选择缺陷代码后带出" />
            </Form.Item>
          </Space>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="选择缺陷代码后会自动带出缺陷名称、责任部门、严重度与默认措施，可手动调整。"
          />
          <Space size="middle" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item name="productCode" label="产品编码" style={{ width: 200 }}>
              <Input placeholder="请输入产品编码" />
            </Form.Item>
            <Form.Item name="materialCode" label="物料编码" style={{ width: 200 }}>
              <Input placeholder="请输入物料编码" />
            </Form.Item>
            <Form.Item name="batchNo" label="批次号" style={{ width: 180 }}>
              <Input placeholder="请输入批次号" />
            </Form.Item>
            <Form.Item name="workOrderNo" label="工单号" style={{ width: 180 }}>
              <Input placeholder="请输入工单号" />
            </Form.Item>
            <Form.Item name="operationCode" label="工序编码" style={{ width: 180 }}>
              <Input placeholder="请输入工序编码" />
            </Form.Item>
            <Form.Item name="foundQty" label="不良数量" style={{ width: 160 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="foundAt" label="发现时间" style={{ width: 220 }}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="responsibleDept" label="责任部门" style={{ width: 180 }}>
              <Input placeholder="请输入责任部门" />
            </Form.Item>
            <Form.Item name="responsibleId" label="责任人 ID" style={{ width: 160 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="responsibleName" label="责任人" style={{ width: 180 }}>
              <Input placeholder="请输入责任人姓名" />
            </Form.Item>
          </Space>
          <Form.Item name="issueDesc" label="问题描述">
            <Input.TextArea rows={2} placeholder="请输入问题描述" />
          </Form.Item>
          <Form.Item name="tempAction" label="临时措施">
            <Input.TextArea rows={2} placeholder="请输入临时措施" />
          </Form.Item>
          <Form.Item name="rootCause" label="根因分析">
            <Input.TextArea rows={2} placeholder="请输入根因分析" />
          </Form.Item>
          <Form.Item name="permanentAction" label="永久措施">
            <Input.TextArea rows={2} placeholder="请输入永久措施" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑处理信息 */}
      <Modal
        title={`编辑质量问题 - ${editTarget?.issueNo || ''}`}
        open={editOpen}
        onOk={handleEditSubmit}
        confirmLoading={editSubmitting}
        onCancel={() => setEditOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={editForm} layout="vertical" preserve={false}>
          <Form.Item name="title" label="问题标题">
            <Input placeholder="请输入问题标题" />
          </Form.Item>
          <Form.Item name="severity" label="严重度">
            <Select placeholder="请选择" allowClear options={DEFECT_SEVERITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="issueDesc" label="问题描述">
            <Input.TextArea rows={2} placeholder="请输入问题描述" />
          </Form.Item>
          <Form.Item name="responsibleDept" label="责任部门">
            <Input placeholder="请输入责任部门" />
          </Form.Item>
          <Form.Item name="responsibleId" label="责任人 ID">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="responsibleName" label="责任人">
            <Input placeholder="请输入责任人姓名" />
          </Form.Item>
          <Form.Item name="tempAction" label="临时措施">
            <Input.TextArea rows={2} placeholder="请输入临时措施" />
          </Form.Item>
          <Form.Item name="rootCause" label="根因分析">
            <Input.TextArea rows={2} placeholder="请输入根因分析" />
          </Form.Item>
          <Form.Item name="permanentAction" label="永久措施">
            <Input.TextArea rows={2} placeholder="请输入永久措施" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title={`质量问题详情 - ${issue?.issueNo || ''}`}
        width={1100}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card
            size="small"
            title="基本信息"
            loading={detailLoading}
            extra={
              <Space wrap>
                <Button size="small" onClick={openEcr} disabled={issue?.status === 'closed'}>
                  转 ECR
                </Button>
                <Button
                  size="small"
                  type="primary"
                  danger
                  onClick={openClose}
                  disabled={issue?.status === 'closed'}
                >
                  关闭问题
                </Button>
              </Space>
            }
          >
            {issue && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'issueNo', label: '问题单号', children: issue.issueNo || '-' },
                  { key: 'title', label: '问题标题', children: issue.title || '-' },
                  {
                    key: 'sourceType',
                    label: '来源类型',
                    children: issue.sourceType
                      ? QUALITY_SOURCE_TYPE_TEXT[issue.sourceType] || issue.sourceType
                      : '-',
                  },
                  {
                    key: 'severity',
                    label: '严重度',
                    children: issue.severity ? (
                      <Tag color={DEFECT_SEVERITY_COLOR[issue.severity] || 'default'}>
                        {DEFECT_SEVERITY_TEXT[issue.severity] || issue.severity}
                      </Tag>
                    ) : (
                      '-'
                    ),
                  },
                  {
                    key: 'status',
                    label: '状态',
                    children: issue.status ? (
                      <Tag color={QUALITY_PROBLEM_STATUS_COLOR[issue.status] || 'default'}>
                        {QUALITY_PROBLEM_STATUS_TEXT[issue.status] || issue.status}
                      </Tag>
                    ) : (
                      '-'
                    ),
                  },
                  { key: 'productCode', label: '产品编码', children: issue.productCode || '-' },
                  { key: 'materialCode', label: '物料编码', children: issue.materialCode || '-' },
                  { key: 'batchNo', label: '批次号', children: issue.batchNo || '-' },
                  { key: 'workOrderNo', label: '工单号', children: issue.workOrderNo || '-' },
                  { key: 'operationCode', label: '工序编码', children: issue.operationCode || '-' },
                  {
                    key: 'defect',
                    label: '缺陷',
                    children: issue.defectCode
                      ? `${issue.defectCode} ${issue.defectName || ''}`
                      : '-',
                  },
                  { key: 'foundQty', label: '不良数量', children: issue.foundQty ?? '-' },
                  { key: 'responsibleDept', label: '责任部门', children: issue.responsibleDept || '-' },
                  { key: 'responsibleName', label: '责任人', children: issue.responsibleName || '-' },
                  {
                    key: 'foundAt',
                    label: '发现时间',
                    children: issue.foundAt
                      ? dayjs(issue.foundAt).format('YYYY-MM-DD HH:mm:ss')
                      : '-',
                  },
                  {
                    key: 'closedAt',
                    label: '关闭时间',
                    children: issue.closedAt
                      ? dayjs(issue.closedAt).format('YYYY-MM-DD HH:mm:ss')
                      : '-',
                  },
                  { key: 'ecrNo', label: '关联 ECR', children: issue.ecrNo || '-' },
                  { key: 'issueDesc', label: '问题描述', span: 2, children: issue.issueDesc || '-' },
                  { key: 'tempAction', label: '临时措施', span: 2, children: issue.tempAction || '-' },
                  { key: 'rootCause', label: '根因分析', span: 2, children: issue.rootCause || '-' },
                  {
                    key: 'permanentAction',
                    label: '永久措施',
                    span: 2,
                    children: issue.permanentAction || '-',
                  },
                  { key: 'verifyResult', label: '验证结果', span: 2, children: issue.verifyResult || '-' },
                  { key: 'remark', label: '备注', span: 2, children: issue.remark || '-' },
                ]}
              />
            )}
          </Card>

          <Card size="small" title="措施记录">
            <Form form={actionForm} layout="inline" style={{ marginBottom: 12 }} preserve={false}>
              <Form.Item name="actionType" label="措施类型" rules={[{ required: true, message: '请选择' }]}>
                <Select style={{ width: 130 }} options={QUALITY_ACTION_TYPE_OPTIONS} />
              </Form.Item>
              <Form.Item name="content" label="措施内容" rules={[{ required: true, message: '请输入' }]}>
                <Input style={{ width: 220 }} placeholder="请输入措施内容" />
              </Form.Item>
              <Form.Item name="ownerName" label="责任人">
                <Input style={{ width: 130 }} placeholder="责任人姓名" />
              </Form.Item>
              <Form.Item name="ownerId" label="责任人 ID">
                <InputNumber style={{ width: 110 }} />
              </Form.Item>
              <Form.Item name="dueDate" label="计划完成">
                <DatePicker />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  loading={actionAdding}
                  onClick={handleAddAction}
                >
                  追加措施
                </Button>
              </Form.Item>
            </Form>
            <Table<QualityIssueActionItem>
              rowKey="id"
              loading={detailLoading}
              size="small"
              columns={actionColumns}
              dataSource={detail?.actions || []}
              pagination={false}
              scroll={{ x: 1500 }}
            />
          </Card>
        </Space>
      </Drawer>

      {/* 验证措施 */}
      <Modal
        title="验证措施"
        open={verifyOpen}
        onOk={handleVerify}
        confirmLoading={verifying}
        okText="提交验证"
        onCancel={() => setVerifyOpen(false)}
        destroyOnClose
      >
        <Form form={verifyForm} layout="vertical" preserve={false}>
          <Form.Item name="result" label="验证结果" rules={[{ required: true, message: '请输入验证结果' }]}>
            <Input.TextArea rows={2} placeholder="请输入验证结果" />
          </Form.Item>
          <Form.Item name="evidence" label="验证证据">
            <Input.TextArea rows={2} placeholder="请输入验证证据" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 关闭问题 */}
      <Modal
        title={`关闭问题 - ${issue?.issueNo || ''}`}
        open={closeOpen}
        onOk={handleClose}
        confirmLoading={closing}
        okText="关闭"
        onCancel={() => setCloseOpen(false)}
        destroyOnClose
        width={720}
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="关闭前必须存在已验证的效果验证措施，否则将无法关闭。"
        />
        <Form form={closeForm} layout="vertical" preserve={false}>
          <Form.Item name="verifyResult" label="验证结果">
            <Input.TextArea rows={2} placeholder="请输入验证结果" />
          </Form.Item>
          <Form.Item name="tempAction" label="临时措施">
            <Input.TextArea rows={2} placeholder="可选，请输入临时措施" />
          </Form.Item>
          <Form.Item name="rootCause" label="根因分析">
            <Input.TextArea rows={2} placeholder="可选，请输入根因分析" />
          </Form.Item>
          <Form.Item name="permanentAction" label="永久措施">
            <Input.TextArea rows={2} placeholder="可选，请输入永久措施" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 转 ECR */}
      <Modal
        title={`质量问题转 ECR - ${issue?.issueNo || ''}`}
        open={ecrOpen}
        onOk={handleToEcr}
        confirmLoading={ecrSubmitting}
        okText="生成 ECR"
        onCancel={() => setEcrOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={ecrForm} layout="vertical" preserve={false}>
          <Form.Item name="title" label="变更标题">
            <Input placeholder="留空由后端生成" />
          </Form.Item>
          <Form.Item name="reason" label="变更原因">
            <Input.TextArea rows={2} placeholder="留空使用问题描述" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item name="riskLevel" label="风险等级" style={{ width: 160 }}>
              <Select placeholder="留空按严重度映射" allowClear options={RISK_LEVEL_OPTIONS} />
            </Form.Item>
            <Form.Item name="urgency" label="紧急程度" style={{ width: 160 }}>
              <Select placeholder="请选择" allowClear options={URGENCY_OPTIONS} />
            </Form.Item>
          </Space>
          <Form.Item name="affectedProducts" label="受影响产品">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="affectedMaterials" label="受影响物料">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="affectedDocuments" label="受影响图文档">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="affectedProcesses" label="受影响工艺">
            <Input placeholder="多个以逗号分隔" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
        {ecrNo && (
          <Alert type="success" showIcon message={`已生成 ECR 单号：${ecrNo}`} />
        )}
      </Modal>
    </Space>
  );
}
