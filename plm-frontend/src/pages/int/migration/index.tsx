import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
  INT_EXCEPTION_TYPE_LABEL,
  INT_EXCEPTION_TYPE_OPTIONS,
  INT_HANDLE_STATUS_COLOR,
  INT_HANDLE_STATUS_LABEL,
  INT_HANDLE_STATUS_OPTIONS,
  INT_MIGRATION_SCOPE_LABEL,
  INT_MIGRATION_SCOPE_OPTIONS,
  INT_MIGRATION_STATUS_COLOR,
  INT_MIGRATION_STATUS_LABEL,
  INT_MIGRATION_STATUS_OPTIONS,
  type IntMigrationExceptionHandleParams,
  type IntMigrationExceptionItem,
  type IntMigrationExceptionQuery,
  type IntMigrationTaskItem,
  type IntMigrationTaskQuery,
  type IntMigrationTaskSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 迁移任务 ================= */

interface MigrationTaskFormValues {
  taskNo?: string;
  scope: string;
  sourceSystem?: string;
  targetTable?: string;
  sourceCount?: number;
  failCount?: number;
  skipCount?: number;
  remark?: string;
}

interface MigrationTaskSearchState {
  taskNo?: string;
  scope?: string;
  sourceSystem?: string;
  targetTable?: string;
  taskStatus?: string;
}

function MigrationTaskTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MigrationTaskFormValues>();

  const [data, setData] = useState<IntMigrationTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<MigrationTaskSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntMigrationTaskItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntMigrationTaskQuery = {
          pageNum: page,
          pageSize: size,
          taskNo: cond.taskNo || undefined,
          scope: cond.scope || undefined,
          sourceSystem: cond.sourceSystem || undefined,
          targetTable: cond.targetTable || undefined,
          taskStatus: cond.taskStatus || undefined,
        };
        const res = await intService.migrationPage(params);
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

  const onSearch = (values: MigrationTaskSearchState) => {
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
    form.setFieldsValue({ sourceSystem: 'LEGACY' });
    setModalOpen(true);
  };

  const openEdit = (record: IntMigrationTaskItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntMigrationTaskSaveParams = {
      taskNo: values.taskNo,
      scope: values.scope,
      sourceSystem: values.sourceSystem,
      targetTable: values.targetTable,
      sourceCount: values.sourceCount,
      failCount: values.failCount,
      skipCount: values.skipCount,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.migrationUpdate(editing.taskNo, payload);
        message.success('更新成功');
      } else {
        await intService.migrationCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntMigrationTaskItem) => {
    await intService.migrationRemove(record.taskNo);
    message.success('删除成功');
    void loadData();
  };

  const handleRun = async (record: IntMigrationTaskItem) => {
    const res = await intService.migrationRun(record.taskNo);
    message.success(`迁移执行完成，状态：${res.taskStatus ? INT_MIGRATION_STATUS_LABEL[res.taskStatus] || res.taskStatus : '未知'}`);
    void loadData();
  };

  const handleVerify = async (record: IntMigrationTaskItem) => {
    const res = await intService.migrationVerify(record.taskNo);
    if (res.taskStatus === 'SUCCESS') {
      message.success('结果核对通过');
    } else {
      message.warning(
        `核对完成，当前状态：${res.taskStatus ? INT_MIGRATION_STATUS_LABEL[res.taskStatus] || res.taskStatus : '未知'}`,
      );
    }
    void loadData();
  };

  const columns: ColumnsType<IntMigrationTaskItem> = [
    { title: '任务编号', dataIndex: 'taskNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    {
      title: '迁移范围',
      dataIndex: 'scope',
      width: 110,
      render: (v?: string) => (v ? INT_MIGRATION_SCOPE_LABEL[v] || v : '-'),
    },
    { title: '来源系统', dataIndex: 'sourceSystem', width: 110, render: (v) => v || '-' },
    { title: '目标表', dataIndex: 'targetTable', width: 160, render: (v) => v || '-' },
    { title: '源数据条数', dataIndex: 'sourceCount', width: 110, render: (v) => (v ?? '-') },
    { title: '成功条数', dataIndex: 'successCount', width: 100, render: (v) => (v ?? '-') },
    { title: '失败条数', dataIndex: 'failCount', width: 100, render: (v) => (v ?? '-') },
    { title: '跳过条数', dataIndex: 'skipCount', width: 100, render: (v) => (v ?? '-') },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_MIGRATION_STATUS_COLOR[v]}>{INT_MIGRATION_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'finishedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '核对报告', dataIndex: 'reportPath', width: 180, render: (v) => v || '-' },
    { title: '操作人', dataIndex: 'operator', width: 100, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:migration:run') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:migration:run') && (
            <Popconfirm title="确认执行该迁移任务？" onConfirm={() => handleRun(record)}>
              <Button type="link" size="small">
                执行迁移
              </Button>
            </Popconfirm>
          )}
          {hasPermission('int:migration:verify') && (
            <Button type="link" size="small" onClick={() => handleVerify(record)}>
              结果核对
            </Button>
          )}
          {hasPermission('int:migration:run') && (
            <Popconfirm title="确认删除该迁移任务？" onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="taskNo" label="任务编号">
            <Input placeholder="请输入任务编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="scope" label="迁移范围">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_MIGRATION_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="请输入来源系统" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="targetTable" label="目标表">
            <Input placeholder="请输入目标表" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="taskStatus" label="任务状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_MIGRATION_STATUS_OPTIONS} />
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
        title={`迁移任务列表（共 ${total} 条）`}
        extra={
          hasPermission('int:migration:run') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增任务
            </Button>
          )
        }
      >
        <Table<IntMigrationTaskItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editing ? '编辑迁移任务' : '新增迁移任务'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taskNo" label="任务编号" extra="留空将自动生成">
            <Input placeholder="请输入任务编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="scope" label="迁移范围" rules={[{ required: true, message: '请选择迁移范围' }]}>
            <Select placeholder="请选择" options={INT_MIGRATION_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="如 LEGACY / ERP" />
          </Form.Item>
          <Form.Item name="targetTable" label="目标表">
            <Input placeholder="请输入目标表" />
          </Form.Item>
          <Form.Item name="sourceCount" label="源数据条数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入源数据条数" />
          </Form.Item>
          <Form.Item name="failCount" label="失败条数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入失败条数" />
          </Form.Item>
          <Form.Item name="skipCount" label="跳过条数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入跳过条数" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 迁移异常 ================= */

interface ExceptionHandleFormValues {
  handleStatus: string;
  remark?: string;
}

interface ExceptionSearchState {
  taskNo?: string;
  exceptionType?: string;
  handleStatus?: string;
  sourceKey?: string;
}

function MigrationExceptionTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ExceptionHandleFormValues>();

  const [data, setData] = useState<IntMigrationExceptionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<ExceptionSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [handling, setHandling] = useState<IntMigrationExceptionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntMigrationExceptionQuery = {
          pageNum: page,
          pageSize: size,
          taskNo: cond.taskNo || undefined,
          exceptionType: cond.exceptionType || undefined,
          handleStatus: cond.handleStatus || undefined,
          sourceKey: cond.sourceKey || undefined,
        };
        const res = await intService.migrationExceptionPage(params);
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

  const onSearch = (values: ExceptionSearchState) => {
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

  const openHandle = (record: IntMigrationExceptionItem) => {
    setHandling(record);
    form.resetFields();
    form.setFieldsValue({ handleStatus: 'RESOLVED' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!handling) {
      return;
    }
    const values = await form.validateFields();
    const payload: IntMigrationExceptionHandleParams = {
      handleStatus: values.handleStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      await intService.migrationExceptionHandle(handling.id!, payload);
      message.success('处理成功');
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<IntMigrationExceptionItem> = [
    { title: '关联任务编号', dataIndex: 'taskNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '源数据主键', dataIndex: 'sourceKey', width: 160, render: (v) => v || '-' },
    {
      title: '异常类型',
      dataIndex: 'exceptionType',
      width: 120,
      render: (v?: string) => (v ? INT_EXCEPTION_TYPE_LABEL[v] || v : '-'),
    },
    { title: '异常字段', dataIndex: 'fieldName', width: 130, render: (v) => v || '-' },
    { title: '异常原因', dataIndex: 'reason', width: 220, render: (v) => v || '-' },
    { title: '原始数据', dataIndex: 'rawData', width: 220, ellipsis: true, render: (v) => v || '-' },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_HANDLE_STATUS_COLOR[v]}>{INT_HANDLE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '处理人', dataIndex: 'handler', width: 100, render: (v) => v || '-' },
    {
      title: '处理时间',
      dataIndex: 'handledAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:migration:exception:handle') && record.handleStatus === 'OPEN' && (
            <Button type="link" size="small" onClick={() => openHandle(record)}>
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="taskNo" label="关联任务编号">
            <Input placeholder="请输入任务编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="exceptionType" label="异常类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_EXCEPTION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="handleStatus" label="处理状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_HANDLE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceKey" label="源数据主键">
            <Input placeholder="请输入源数据主键" allowClear style={{ width: 160 }} />
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

      <Card title={`迁移异常列表（共 ${total} 条）`}>
        <Table<IntMigrationExceptionItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1750 }}
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
        title="处理迁移异常"
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="handleStatus" label="处理状态" rules={[{ required: true, message: '请选择处理状态' }]}>
            <Select placeholder="请选择" options={INT_HANDLE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="处理说明">
            <Input.TextArea rows={3} placeholder="请输入处理说明" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function IntMigrationPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        数据迁移
      </Title>
      <Tabs
        items={[
          { key: 'task', label: '迁移任务', children: <MigrationTaskTab /> },
          { key: 'exception', label: '迁移异常', children: <MigrationExceptionTab /> },
        ]}
      />
    </Space>
  );
}
