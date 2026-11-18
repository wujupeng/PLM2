import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
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
  INT_DIFF_TYPE_LABEL,
  INT_DIFF_TYPE_OPTIONS,
  INT_HANDLE_STATUS_COLOR,
  INT_HANDLE_STATUS_LABEL,
  INT_HANDLE_STATUS_OPTIONS,
  INT_MASTER_TYPE_LABEL,
  INT_MASTER_TYPE_OPTIONS,
  INT_SYNC_DIRECTION_LABEL,
  INT_SYNC_DIRECTION_OPTIONS,
  INT_SYNC_STATUS_COLOR,
  INT_SYNC_STATUS_LABEL,
  INT_SYNC_STATUS_OPTIONS,
  type IntMasterDataDiffItem,
  type IntMasterDataDiffQuery,
  type IntMasterDataDiffResolveParams,
  type IntMasterDataSyncItem,
  type IntMasterDataSyncQuery,
  type IntMasterDataSyncSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 同步记录 ================= */

interface SyncFormValues {
  syncNo?: string;
  masterType: string;
  masterCode: string;
  masterName?: string;
  masterVersion?: string;
  sourceSystem?: string;
  targetSystem?: string;
  syncDirection?: string;
  sourceVersion?: string;
  sourceHash?: string;
  remark?: string;
}

interface SyncSearchState {
  syncNo?: string;
  masterType?: string;
  masterCode?: string;
  syncStatus?: string;
  syncDirection?: string;
  targetSystem?: string;
}

function SyncRecordTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<SyncFormValues>();

  const [data, setData] = useState<IntMasterDataSyncItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SyncSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntMasterDataSyncItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntMasterDataSyncQuery = {
          pageNum: page,
          pageSize: size,
          syncNo: cond.syncNo || undefined,
          masterType: cond.masterType || undefined,
          masterCode: cond.masterCode || undefined,
          syncStatus: cond.syncStatus || undefined,
          syncDirection: cond.syncDirection || undefined,
          targetSystem: cond.targetSystem || undefined,
        };
        const res = await intService.syncPage(params);
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

  const onSearch = (values: SyncSearchState) => {
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
    form.setFieldsValue({
      sourceSystem: 'PLM',
      targetSystem: 'ERP',
      syncDirection: 'PLM_TO_ERP',
    });
    setModalOpen(true);
  };

  const openEdit = (record: IntMasterDataSyncItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntMasterDataSyncSaveParams = {
      syncNo: values.syncNo,
      masterType: values.masterType,
      masterCode: values.masterCode,
      masterName: values.masterName,
      masterVersion: values.masterVersion,
      sourceSystem: values.sourceSystem,
      targetSystem: values.targetSystem,
      syncDirection: values.syncDirection,
      sourceVersion: values.sourceVersion,
      sourceHash: values.sourceHash,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.syncUpdate(editing.syncNo, payload);
        message.success('更新成功');
      } else {
        await intService.syncCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntMasterDataSyncItem) => {
    await intService.syncRemove(record.syncNo);
    message.success('删除成功');
    void loadData();
  };

  const handleRun = async (record: IntMasterDataSyncItem) => {
    await intService.syncRun(record.syncNo);
    message.success('同步已执行');
    void loadData();
  };

  const columns: ColumnsType<IntMasterDataSyncItem> = [
    { title: '同步编号', dataIndex: 'syncNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    {
      title: '主数据类型',
      dataIndex: 'masterType',
      width: 110,
      render: (v?: string) => (v ? INT_MASTER_TYPE_LABEL[v] || v : '-'),
    },
    { title: '主数据编码', dataIndex: 'masterCode', width: 150, render: (v) => v || '-' },
    { title: '主数据名称', dataIndex: 'masterName', width: 160, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'masterVersion', width: 100, render: (v) => v || '-' },
    { title: '来源系统', dataIndex: 'sourceSystem', width: 110, render: (v) => v || '-' },
    { title: '目标系统', dataIndex: 'targetSystem', width: 110, render: (v) => v || '-' },
    {
      title: '同步方向',
      dataIndex: 'syncDirection',
      width: 110,
      render: (v?: string) => (v ? INT_SYNC_DIRECTION_LABEL[v] || v : '-'),
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_SYNC_STATUS_COLOR[v]}>{INT_SYNC_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '存在差异',
      dataIndex: 'diffFlag',
      width: 100,
      render: (v?: number) =>
        v === undefined ? (
          '-'
        ) : v === 1 ? (
          <Tag color="warning">有差异</Tag>
        ) : (
          <Tag color="success">一致</Tag>
        ),
    },
    { title: '来源端版本', dataIndex: 'sourceVersion', width: 120, render: (v) => v || '-' },
    { title: '目标端版本', dataIndex: 'targetVersion', width: 120, render: (v) => v || '-' },
    {
      title: '最近同步',
      dataIndex: 'lastSyncAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:mds:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:mds:sync') && (
            <Popconfirm title="确认执行同步？" onConfirm={() => handleRun(record)}>
              <Button type="link" size="small">
                执行同步
              </Button>
            </Popconfirm>
          )}
          {hasPermission('int:mds:save') && (
            <Popconfirm title="确认删除该同步记录？" onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="syncNo" label="同步编号">
            <Input placeholder="请输入同步编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="masterType" label="主数据类型">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_MASTER_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码">
            <Input placeholder="请输入主数据编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="syncStatus" label="同步状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_SYNC_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="syncDirection" label="同步方向">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_SYNC_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="targetSystem" label="目标系统">
            <Input placeholder="请输入目标系统" allowClear style={{ width: 130 }} />
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
        title={`同步记录（共 ${total} 条）`}
        extra={
          hasPermission('int:mds:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增同步记录
            </Button>
          )
        }
      >
        <Table<IntMasterDataSyncItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title={editing ? '编辑同步记录' : '新增同步记录'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="syncNo" label="同步编号" extra="留空将自动生成">
            <Input placeholder="请输入同步编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="masterType" label="主数据类型" rules={[{ required: true, message: '请选择主数据类型' }]}>
            <Select placeholder="请选择" options={INT_MASTER_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码" rules={[{ required: true, message: '请输入主数据编码' }]}>
            <Input placeholder="请输入主数据编码" />
          </Form.Item>
          <Form.Item name="masterName" label="主数据名称">
            <Input placeholder="请输入主数据名称" />
          </Form.Item>
          <Form.Item name="masterVersion" label="版本">
            <Input placeholder="请输入版本" />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="请输入来源系统" />
          </Form.Item>
          <Form.Item name="targetSystem" label="目标系统">
            <Input placeholder="请输入目标系统" />
          </Form.Item>
          <Form.Item name="syncDirection" label="同步方向">
            <Select placeholder="请选择" options={INT_SYNC_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceVersion" label="来源端版本">
            <Input placeholder="请输入来源端版本" />
          </Form.Item>
          <Form.Item name="sourceHash" label="来源端哈希">
            <Input.TextArea rows={2} placeholder="请输入来源端哈希" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 差异清单 ================= */

interface DiffSearchState {
  syncNo?: string;
  masterType?: string;
  masterCode?: string;
  diffType?: string;
  handleStatus?: string;
}

interface DiffResolveFormValues {
  handleStatus: string;
  resolution?: string;
}

function SyncDiffTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DiffResolveFormValues>();

  const [data, setData] = useState<IntMasterDataDiffItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<DiffSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [resolving, setResolving] = useState<IntMasterDataDiffItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntMasterDataDiffQuery = {
          pageNum: page,
          pageSize: size,
          syncNo: cond.syncNo || undefined,
          masterType: cond.masterType || undefined,
          masterCode: cond.masterCode || undefined,
          diffType: cond.diffType || undefined,
          handleStatus: cond.handleStatus || undefined,
        };
        const res = await intService.diffPage(params);
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

  const onSearch = (values: DiffSearchState) => {
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

  const openResolve = (record: IntMasterDataDiffItem) => {
    setResolving(record);
    form.resetFields();
    form.setFieldsValue({ handleStatus: 'RESOLVED' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntMasterDataDiffResolveParams = {
      handleStatus: values.handleStatus,
      resolution: values.resolution,
    };
    setSubmitting(true);
    try {
      await intService.diffResolve(resolving!.id!, payload);
      message.success('处理成功');
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<IntMasterDataDiffItem> = [
    { title: '关联同步编号', dataIndex: 'syncNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    {
      title: '主数据类型',
      dataIndex: 'masterType',
      width: 110,
      render: (v?: string) => (v ? INT_MASTER_TYPE_LABEL[v] || v : '-'),
    },
    { title: '主数据编码', dataIndex: 'masterCode', width: 150, render: (v) => v || '-' },
    { title: '差异字段', dataIndex: 'fieldName', width: 140, render: (v) => v || '-' },
    { title: '来源端取值', dataIndex: 'sourceValue', width: 180, render: (v) => v || '-' },
    { title: '目标端取值', dataIndex: 'targetValue', width: 180, render: (v) => v || '-' },
    {
      title: '差异类型',
      dataIndex: 'diffType',
      width: 120,
      render: (v?: string) => (v ? INT_DIFF_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_HANDLE_STATUS_COLOR[v]}>{INT_HANDLE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '处理人', dataIndex: 'resolvedBy', width: 110, render: (v) => v || '-' },
    {
      title: '处理时间',
      dataIndex: 'resolvedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '处理说明', dataIndex: 'resolution', width: 200, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:mds:diff:resolve') && record.handleStatus === 'OPEN' && (
            <Button type="link" size="small" onClick={() => openResolve(record)}>
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
          <Form.Item name="syncNo" label="同步编号">
            <Input placeholder="请输入同步编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="masterType" label="主数据类型">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_MASTER_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="masterCode" label="主数据编码">
            <Input placeholder="请输入主数据编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="diffType" label="差异类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_DIFF_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="handleStatus" label="处理状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_HANDLE_STATUS_OPTIONS} />
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

      <Card title={`差异清单（共 ${total} 条）`}>
        <Table<IntMasterDataDiffItem>
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

      <Modal
        title={`处理差异${resolving?.masterCode ? `：${resolving.masterCode}` : ''}`}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="handleStatus" label="处理状态" rules={[{ required: true, message: '请选择处理状态' }]}>
            <Select placeholder="请选择" options={INT_HANDLE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="resolution" label="处理说明">
            <Input.TextArea rows={4} placeholder="请输入处理说明" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function IntMasterDataPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        主数据同步
      </Title>
      <Tabs
        items={[
          { key: 'record', label: '同步记录', children: <SyncRecordTab /> },
          { key: 'diff', label: '差异清单', children: <SyncDiffTab /> },
        ]}
      />
    </Space>
  );
}
