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
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { intService } from '@/services/intService';
import {
  INT_BACKUP_SCOPE_LABEL,
  INT_BACKUP_SCOPE_OPTIONS,
  INT_BACKUP_TYPE_LABEL,
  INT_BACKUP_TYPE_OPTIONS,
  INT_ENABLED_COLOR,
  INT_ENABLED_LABEL,
  INT_ENABLED_OPTIONS,
  INT_ISSUE_STATUS_COLOR,
  INT_ISSUE_STATUS_LABEL,
  INT_ISSUE_STATUS_OPTIONS,
  INT_RESULT_COLOR,
  INT_RESULT_LABEL,
  INT_RESULT_OPTIONS,
  INT_SECURITY_CATEGORY_LABEL,
  INT_SECURITY_CATEGORY_OPTIONS,
  INT_SEVERITY_COLOR,
  INT_SEVERITY_LABEL,
  INT_SEVERITY_OPTIONS,
  type IntBackupRecordItem,
  type IntBackupRecordQuery,
  type IntBackupRecordSaveParams,
  type IntSecurityIssueItem,
  type IntSecurityIssueQuery,
  type IntSecurityIssueSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 安全问题 ================= */

interface SecurityFormValues {
  issueNo?: string;
  category: string;
  severity?: string;
  title: string;
  detail?: string;
  discoveredBy?: string;
  remark?: string;
}

interface SecurityFixFormValues {
  fixPlan?: string;
  status?: string;
}

interface SecuritySearchState {
  issueNo?: string;
  category?: string;
  severity?: string;
  status?: string;
}

function SecurityIssueTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<SecurityFormValues>();
  const [fixForm] = Form.useForm<SecurityFixFormValues>();

  const [data, setData] = useState<IntSecurityIssueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SecuritySearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntSecurityIssueItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fixOpen, setFixOpen] = useState(false);
  const [fixRecord, setFixRecord] = useState<IntSecurityIssueItem | null>(null);
  const [fixing, setFixing] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntSecurityIssueQuery = {
          pageNum: page,
          pageSize: size,
          issueNo: cond.issueNo || undefined,
          category: cond.category || undefined,
          severity: cond.severity || undefined,
          status: cond.status || undefined,
        };
        const res = await intService.securityPage(params);
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

  const onSearch = (values: SecuritySearchState) => {
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
    form.setFieldsValue({ severity: 'MEDIUM' });
    setModalOpen(true);
  };

  const openEdit = (record: IntSecurityIssueItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntSecurityIssueSaveParams = {
      issueNo: values.issueNo,
      category: values.category,
      severity: values.severity,
      title: values.title,
      detail: values.detail,
      discoveredBy: values.discoveredBy,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.securityUpdate(editing.issueNo, payload);
        message.success('更新成功');
      } else {
        await intService.securityCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntSecurityIssueItem) => {
    await intService.securityRemove(record.issueNo);
    message.success('删除成功');
    void loadData();
  };

  const openFix = (record: IntSecurityIssueItem) => {
    setFixRecord(record);
    fixForm.resetFields();
    fixForm.setFieldsValue({ status: 'FIXED' });
    setFixOpen(true);
  };

  const handleFix = async () => {
    const values = await fixForm.validateFields();
    if (!fixRecord) {
      return;
    }
    setFixing(true);
    try {
      await intService.securityFix(fixRecord.issueNo, values);
      message.success('整改提交成功');
      setFixOpen(false);
      void loadData();
    } finally {
      setFixing(false);
    }
  };

  const handleVerify = async (record: IntSecurityIssueItem) => {
    await intService.securityVerify(record.issueNo);
    message.success('验证成功');
    void loadData();
  };

  const columns: ColumnsType<IntSecurityIssueItem> = [
    { title: '问题编号', dataIndex: 'issueNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    {
      title: '问题类别',
      dataIndex: 'category',
      width: 120,
      render: (v?: string) => (v ? INT_SECURITY_CATEGORY_LABEL[v] || v : '-'),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_SEVERITY_COLOR[v]}>{INT_SEVERITY_LABEL[v] || v}</Tag> : '-',
    },
    { title: '问题标题', dataIndex: 'title', width: 180, render: (v) => v || '-' },
    { title: '发现人', dataIndex: 'discoveredBy', width: 110, render: (v) => v || '-' },
    {
      title: '发现时间',
      dataIndex: 'discoveredAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_ISSUE_STATUS_COLOR[v]}>{INT_ISSUE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '整改方案', dataIndex: 'fixPlan', width: 200, ellipsis: true, render: (v) => v || '-' },
    { title: '验证人', dataIndex: 'verifier', width: 110, render: (v) => v || '-' },
    {
      title: '验证时间',
      dataIndex: 'verifiedAt',
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
          {hasPermission('int:security:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:security:fix') && (
            <Button type="link" size="small" onClick={() => openFix(record)}>
              整改
            </Button>
          )}
          {hasPermission('int:security:fix') && (
            <Button type="link" size="small" onClick={() => void handleVerify(record)}>
              验证
            </Button>
          )}
          {hasPermission('int:security:save') && (
            <Popconfirm title="确认删除该安全问题？" onConfirm={() => handleDelete(record)}>
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
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="issueNo" label="问题编号">
            <Input placeholder="请输入问题编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="category" label="问题类别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={INT_SECURITY_CATEGORY_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="severity" label="严重程度">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_SEVERITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              options={INT_ISSUE_STATUS_OPTIONS}
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
        title={`安全问题列表（共 ${total} 条）`}
        extra={
          hasPermission('int:security:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增问题
            </Button>
          )
        }
      >
        <Table<IntSecurityIssueItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1780 }}
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
        title={editing ? '编辑安全问题' : '新增安全问题'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="issueNo" label="问题编号" extra="留空将自动生成">
            <Input placeholder="请输入问题编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="category"
            label="问题类别"
            rules={[{ required: true, message: '请选择问题类别' }]}
          >
            <Select placeholder="请选择" options={INT_SECURITY_CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="severity" label="严重程度">
            <Select placeholder="请选择" options={INT_SEVERITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="title" label="问题标题" rules={[{ required: true, message: '请输入问题标题' }]}>
            <Input placeholder="请输入问题标题" />
          </Form.Item>
          <Form.Item name="detail" label="问题详情">
            <Input.TextArea rows={3} placeholder="请输入问题详情" />
          </Form.Item>
          <Form.Item name="discoveredBy" label="发现人">
            <Input placeholder="请输入发现人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`整改问题${fixRecord?.issueNo ? `：${fixRecord.issueNo}` : ''}`}
        open={fixOpen}
        onOk={handleFix}
        confirmLoading={fixing}
        onCancel={() => setFixOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={fixForm} layout="vertical" preserve={false}>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={INT_ISSUE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="fixPlan" label="整改方案">
            <Input.TextArea rows={4} placeholder="请输入整改方案" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 备份恢复 ================= */

interface BackupFormValues {
  recordNo?: string;
  recordType: string;
  scope?: string;
  backupAt?: dayjs.Dayjs;
  sizeMb?: number;
  targetPath?: string;
  rpoMinutes?: number;
  rtoMinutes?: number;
  elapsedMinutes?: number;
  resultStatus?: string;
  operator?: string;
  remark?: string;
}

interface BackupSearchState {
  recordNo?: string;
  recordType?: string;
  scope?: string;
  resultStatus?: string;
  verified?: number;
}

function BackupRecordTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BackupFormValues>();

  const [data, setData] = useState<IntBackupRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<BackupSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntBackupRecordItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntBackupRecordQuery = {
          pageNum: page,
          pageSize: size,
          recordNo: cond.recordNo || undefined,
          recordType: cond.recordType || undefined,
          scope: cond.scope || undefined,
          resultStatus: cond.resultStatus || undefined,
          verified: cond.verified,
        };
        const res = await intService.backupPage(params);
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

  const onSearch = (values: BackupSearchState) => {
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
    form.setFieldsValue({ recordType: 'BACKUP', scope: 'DB', resultStatus: 'SUCCESS' });
    setModalOpen(true);
  };

  const openEdit = (record: IntBackupRecordItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      backupAt: record.backupAt ? dayjs(record.backupAt) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntBackupRecordSaveParams = {
      recordNo: values.recordNo,
      recordType: values.recordType,
      scope: values.scope,
      backupAt: values.backupAt ? values.backupAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      sizeMb: values.sizeMb,
      targetPath: values.targetPath,
      rpoMinutes: values.rpoMinutes,
      rtoMinutes: values.rtoMinutes,
      elapsedMinutes: values.elapsedMinutes,
      resultStatus: values.resultStatus,
      operator: values.operator,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.backupUpdate(editing.recordNo, payload);
        message.success('更新成功');
      } else {
        await intService.backupCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntBackupRecordItem) => {
    await intService.backupRemove(record.recordNo);
    message.success('删除成功');
    void loadData();
  };

  const handleVerify = async (record: IntBackupRecordItem) => {
    await intService.backupVerify(record.recordNo);
    message.success('验证成功');
    void loadData();
  };

  const columns: ColumnsType<IntBackupRecordItem> = [
    { title: '记录编号', dataIndex: 'recordNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    {
      title: '记录类型',
      dataIndex: 'recordType',
      width: 110,
      render: (v?: string) => (v ? INT_BACKUP_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '备份范围',
      dataIndex: 'scope',
      width: 110,
      render: (v?: string) => (v ? INT_BACKUP_SCOPE_LABEL[v] || v : '-'),
    },
    {
      title: '备份时间',
      dataIndex: 'backupAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '备份大小(MB)', dataIndex: 'sizeMb', width: 120, render: (v) => (v ?? '-') },
    { title: '存放路径', dataIndex: 'targetPath', width: 200, ellipsis: true, render: (v) => v || '-' },
    { title: 'RPO(分钟)', dataIndex: 'rpoMinutes', width: 100, render: (v) => (v ?? '-') },
    { title: 'RTO(分钟)', dataIndex: 'rtoMinutes', width: 100, render: (v) => (v ?? '-') },
    { title: '实际耗时(分钟)', dataIndex: 'elapsedMinutes', width: 130, render: (v) => (v ?? '-') },
    {
      title: '结果状态',
      dataIndex: 'resultStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_RESULT_COLOR[v]}>{INT_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '已验证',
      dataIndex: 'verified',
      width: 100,
      render: (v?: number) =>
        v === null || v === undefined ? (
          '-'
        ) : (
          <Tag color={INT_ENABLED_COLOR[String(v)]}>{INT_ENABLED_LABEL[String(v)] || v}</Tag>
        ),
    },
    { title: '操作人', dataIndex: 'operator', width: 110, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:backup:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:backup:verify') && (
            <Button type="link" size="small" onClick={() => void handleVerify(record)}>
              验证
            </Button>
          )}
          {hasPermission('int:backup:save') && (
            <Popconfirm title="确认删除该备份记录？" onConfirm={() => handleDelete(record)}>
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
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="recordNo" label="记录编号">
            <Input placeholder="请输入记录编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="recordType" label="记录类型">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_BACKUP_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="scope" label="备份范围">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_BACKUP_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="resultStatus" label="结果状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="verified" label="已验证">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_ENABLED_OPTIONS} />
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
        title={`备份恢复记录（共 ${total} 条）`}
        extra={
          hasPermission('int:backup:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增记录
            </Button>
          )
        }
      >
        <Table<IntBackupRecordItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1880 }}
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
        title={editing ? '编辑备份记录' : '新增备份记录'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="recordNo" label="记录编号" extra="留空将自动生成">
            <Input placeholder="请输入记录编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="recordType"
            label="记录类型"
            rules={[{ required: true, message: '请选择记录类型' }]}
          >
            <Select placeholder="请选择" options={INT_BACKUP_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="scope" label="备份范围">
            <Select placeholder="请选择" options={INT_BACKUP_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="backupAt" label="备份时间">
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item name="sizeMb" label="备份大小(MB)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入备份大小" />
          </Form.Item>
          <Form.Item name="targetPath" label="存放路径">
            <Input placeholder="请输入存放路径" />
          </Form.Item>
          <Form.Item name="rpoMinutes" label="RPO(分钟)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入 RPO" />
          </Form.Item>
          <Form.Item name="rtoMinutes" label="RTO(分钟)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入 RTO" />
          </Form.Item>
          <Form.Item name="elapsedMinutes" label="实际耗时(分钟)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入实际耗时" />
          </Form.Item>
          <Form.Item name="resultStatus" label="结果状态">
            <Select placeholder="请选择" options={INT_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function IntSecurityPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        安全与备份
      </Title>
      <Tabs
        items={[
          { key: 'security', label: '安全问题', children: <SecurityIssueTab /> },
          { key: 'backup', label: '备份恢复', children: <BackupRecordTab /> },
        ]}
      />
    </Space>
  );
}
