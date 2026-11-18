import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import { intService } from '@/services/intService';
import {
  INT_DEFECT_LEVEL_COLOR,
  INT_DEFECT_LEVEL_LABEL,
  INT_DEFECT_LEVEL_OPTIONS,
  INT_DEFECT_SOURCE_LABEL,
  INT_DEFECT_SOURCE_OPTIONS,
  INT_DEFECT_STATUS_COLOR,
  INT_DEFECT_STATUS_LABEL,
  INT_DEFECT_STATUS_OPTIONS,
  type IntDefectAssignParams,
  type IntDefectItem,
  type IntDefectQuery,
  type IntDefectSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

const SLA_BREACHED_OPTIONS = [
  { label: '已超期', value: 1 },
  { label: '未超期', value: 0 },
];

interface DefectFormValues {
  defectNo?: string;
  source: string;
  severity?: string;
  title: string;
  detail?: string;
  module?: string;
  foundAt?: dayjs.Dayjs;
  slaResponseHours?: number;
  slaFixHours?: number;
  assignee?: string;
  remark?: string;
}

interface DefectAssignFormValues {
  assignee: string;
  remark?: string;
}

interface DefectSearchState {
  defectNo?: string;
  source?: string;
  severity?: string;
  status?: string;
  assignee?: string;
  slaBreached?: number;
}

export default function IntDefectPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DefectFormValues>();
  const [assignForm] = Form.useForm<DefectAssignFormValues>();

  const [data, setData] = useState<IntDefectItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<DefectSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntDefectItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRecord, setAssignRecord] = useState<IntDefectItem | null>(null);
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntDefectQuery = {
          pageNum: page,
          pageSize: size,
          defectNo: cond.defectNo || undefined,
          source: cond.source || undefined,
          severity: cond.severity || undefined,
          status: cond.status || undefined,
          assignee: cond.assignee || undefined,
          slaBreached: cond.slaBreached,
        };
        const res = await intService.defectPage(params);
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

  const onSearch = (values: DefectSearchState) => {
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
    form.setFieldsValue({ severity: 'MAJOR' });
    setModalOpen(true);
  };

  const openEdit = (record: IntDefectItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      foundAt: record.foundAt ? dayjs(record.foundAt) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntDefectSaveParams = {
      defectNo: values.defectNo,
      source: values.source,
      severity: values.severity,
      title: values.title,
      detail: values.detail,
      module: values.module,
      foundAt: values.foundAt ? values.foundAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      slaResponseHours: values.slaResponseHours,
      slaFixHours: values.slaFixHours,
      assignee: values.assignee,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.defectUpdate(editing.defectNo, payload);
        message.success('更新成功');
      } else {
        await intService.defectCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntDefectItem) => {
    await intService.defectRemove(record.defectNo);
    message.success('删除成功');
    void loadData();
  };

  const openAssign = (record: IntDefectItem) => {
    setAssignRecord(record);
    assignForm.resetFields();
    assignForm.setFieldsValue({ assignee: record.assignee });
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    const values = await assignForm.validateFields();
    if (!assignRecord) {
      return;
    }
    const payload: IntDefectAssignParams = {
      assignee: values.assignee,
      remark: values.remark,
    };
    setAssigning(true);
    try {
      await intService.defectAssign(assignRecord.defectNo, payload);
      message.success('分派成功');
      setAssignOpen(false);
      void loadData();
    } finally {
      setAssigning(false);
    }
  };

  const handleEscalate = async (record: IntDefectItem) => {
    await intService.defectEscalate(record.defectNo);
    message.success('升级成功');
    void loadData();
  };

  const handleClose = async (record: IntDefectItem) => {
    await intService.defectClose(record.defectNo);
    message.success('关闭成功');
    void loadData();
  };

  const columns: ColumnsType<IntDefectItem> = [
    { title: '缺陷编号', dataIndex: 'defectNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    {
      title: '来源',
      dataIndex: 'source',
      width: 100,
      render: (v?: string) => (v ? INT_DEFECT_SOURCE_LABEL[v] || v : '-'),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_DEFECT_LEVEL_COLOR[v]}>{INT_DEFECT_LEVEL_LABEL[v] || v}</Tag> : '-',
    },
    { title: '缺陷标题', dataIndex: 'title', width: 180, render: (v) => v || '-' },
    { title: '所属模块', dataIndex: 'module', width: 120, render: (v) => v || '-' },
    {
      title: '发现时间',
      dataIndex: 'foundAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: 'SLA 响应(小时)', dataIndex: 'slaResponseHours', width: 130, render: (v) => (v ?? '-') },
    { title: 'SLA 修复(小时)', dataIndex: 'slaFixHours', width: 120, render: (v) => (v ?? '-') },
    {
      title: '响应时间',
      dataIndex: 'responseAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '修复时间',
      dataIndex: 'fixedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_DEFECT_STATUS_COLOR[v]}>{INT_DEFECT_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '升级级别', dataIndex: 'escalationLevel', width: 100, render: (v) => (v ?? '-') },
    { title: '处理人', dataIndex: 'assignee', width: 110, render: (v) => v || '-' },
    {
      title: '是否超期',
      dataIndex: 'slaBreached',
      width: 100,
      render: (v?: number) =>
        v === 1 ? <Tag color="error">超期</Tag> : v === 0 ? <Tag color="success">正常</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:defect:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:defect:assign') && (
            <Button type="link" size="small" onClick={() => openAssign(record)}>
              分派
            </Button>
          )}
          {hasPermission('int:defect:escalate') && (
            <Popconfirm title="确认升级该缺陷？" onConfirm={() => handleEscalate(record)}>
              <Button type="link" size="small">
                升级
              </Button>
            </Popconfirm>
          )}
          {hasPermission('int:defect:close') && (
            <Popconfirm title="确认关闭该缺陷？" onConfirm={() => handleClose(record)}>
              <Button type="link" size="small">
                关闭
              </Button>
            </Popconfirm>
          )}
          {hasPermission('int:defect:save') && (
            <Popconfirm title="确认删除该缺陷？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        缺陷与 SLA
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="defectNo" label="缺陷编号">
            <Input placeholder="请输入缺陷编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_DEFECT_SOURCE_OPTIONS} />
          </Form.Item>
          <Form.Item name="severity" label="严重程度">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_DEFECT_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_DEFECT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="assignee" label="处理人">
            <Input placeholder="请输入处理人" allowClear style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="slaBreached" label="是否超期">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={SLA_BREACHED_OPTIONS} />
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
        title={`缺陷列表（共 ${total} 条）`}
        extra={
          hasPermission('int:defect:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增缺陷
            </Button>
          )
        }
      >
        <Table<IntDefectItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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

      <Modal
        title={editing ? '编辑缺陷' : '新增缺陷'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="defectNo" label="缺陷编号" extra="留空将自动生成">
            <Input placeholder="请输入缺陷编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="source" label="来源" rules={[{ required: true, message: '请选择来源' }]}>
            <Select placeholder="请选择" options={INT_DEFECT_SOURCE_OPTIONS} />
          </Form.Item>
          <Form.Item name="severity" label="严重程度">
            <Select placeholder="请选择" options={INT_DEFECT_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="title" label="缺陷标题" rules={[{ required: true, message: '请输入缺陷标题' }]}>
            <Input placeholder="请输入缺陷标题" />
          </Form.Item>
          <Form.Item name="detail" label="缺陷详情">
            <Input.TextArea rows={3} placeholder="请输入缺陷详情" />
          </Form.Item>
          <Form.Item name="module" label="所属模块">
            <Input placeholder="请输入所属模块" />
          </Form.Item>
          <Form.Item name="foundAt" label="发现时间">
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item
            name="slaResponseHours"
            label="SLA 响应时限(小时)"
            extra="SLA 时限留空将按后台配置的严重程度默认值计算（致命 2/24、严重 4/72、轻微 8/120 小时）"
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入 SLA 响应时限" />
          </Form.Item>
          <Form.Item name="slaFixHours" label="SLA 修复时限(小时)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入 SLA 修复时限" />
          </Form.Item>
          <Form.Item name="assignee" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`分派缺陷${assignRecord?.defectNo ? `：${assignRecord.defectNo}` : ''}`}
        open={assignOpen}
        onOk={handleAssign}
        confirmLoading={assigning}
        onCancel={() => setAssignOpen(false)}
        destroyOnClose
        width={520}
      >
        <Form form={assignForm} layout="vertical" preserve={false}>
          <Form.Item name="assignee" label="处理人" rules={[{ required: true, message: '请输入处理人' }]}>
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
