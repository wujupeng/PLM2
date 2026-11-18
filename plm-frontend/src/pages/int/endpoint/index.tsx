import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
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
  INT_DIRECTION_LABEL,
  INT_DIRECTION_OPTIONS,
  INT_DOMAIN_LABEL,
  INT_DOMAIN_OPTIONS,
  INT_ENABLED_COLOR,
  INT_ENABLED_LABEL,
  INT_ENABLED_OPTIONS,
  INT_ENDPOINT_STATUS_COLOR,
  INT_ENDPOINT_STATUS_LABEL,
  INT_ENDPOINT_STATUS_OPTIONS,
  INT_PROTOCOL_LABEL,
  INT_PROTOCOL_OPTIONS,
  INT_RESULT_STATUS_COLOR,
  INT_RESULT_STATUS_LABEL,
  INT_RESULT_STATUS_OPTIONS,
  type IntEndpointItem,
  type IntEndpointQuery,
  type IntEndpointSaveParams,
  type IntInterfaceLogItem,
  type IntInterfaceLogQuery,
  type IntInterfaceLogSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 接口配置 ================= */

interface EndpointFormValues {
  endpointCode?: string;
  endpointName?: string;
  domain: string;
  direction?: string;
  protocol?: string;
  endpointUrl?: string;
  authType?: string;
  timeoutMs?: number;
  retryMax?: number;
  idempotentEnabled?: number;
  compensateEnabled?: number;
  status?: string;
  remark?: string;
}

interface EndpointSearchState {
  endpointCode?: string;
  domain?: string;
  direction?: string;
  protocol?: string;
  status?: string;
}

function EndpointConfigTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<EndpointFormValues>();

  const [data, setData] = useState<IntEndpointItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<EndpointSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntEndpointItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntEndpointQuery = {
          pageNum: page,
          pageSize: size,
          endpointCode: cond.endpointCode || undefined,
          domain: cond.domain || undefined,
          direction: cond.direction || undefined,
          protocol: cond.protocol || undefined,
          status: cond.status || undefined,
        };
        const res = await intService.endpointPage(params);
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

  const onSearch = (values: EndpointSearchState) => {
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
      status: 'enabled',
      idempotentEnabled: 1,
      compensateEnabled: 0,
      direction: 'OUTBOUND',
      protocol: 'REST',
      timeoutMs: 10000,
      retryMax: 3,
    });
    setModalOpen(true);
  };

  const openEdit = (record: IntEndpointItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntEndpointSaveParams = {
      endpointCode: values.endpointCode,
      endpointName: values.endpointName,
      domain: values.domain,
      direction: values.direction,
      protocol: values.protocol,
      endpointUrl: values.endpointUrl,
      authType: values.authType,
      timeoutMs: values.timeoutMs,
      retryMax: values.retryMax,
      idempotentEnabled: values.idempotentEnabled,
      compensateEnabled: values.compensateEnabled,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.endpointUpdate(editing.endpointCode, payload);
        message.success('更新成功');
      } else {
        await intService.endpointCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntEndpointItem) => {
    await intService.endpointRemove(record.endpointCode);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<IntEndpointItem> = [
    { title: '接口编码', dataIndex: 'endpointCode', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '接口名称', dataIndex: 'endpointName', width: 160, render: (v) => v || '-' },
    {
      title: '所属域',
      dataIndex: 'domain',
      width: 90,
      render: (v?: string) => (v ? INT_DOMAIN_LABEL[v] || v : '-'),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 90,
      render: (v?: string) => (v ? INT_DIRECTION_LABEL[v] || v : '-'),
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      width: 110,
      render: (v?: string) => (v ? INT_PROTOCOL_LABEL[v] || v : '-'),
    },
    { title: '接口地址', dataIndex: 'endpointUrl', width: 240, render: (v) => v || '-' },
    { title: '超时(ms)', dataIndex: 'timeoutMs', width: 100, render: (v) => (v ?? '-') },
    { title: '重试上限', dataIndex: 'retryMax', width: 100, render: (v) => (v ?? '-') },
    {
      title: '幂等',
      dataIndex: 'idempotentEnabled',
      width: 80,
      render: (v?: number) =>
        v === undefined ? '-' : (
          <Tag color={INT_ENABLED_COLOR[String(v)]}>{INT_ENABLED_LABEL[String(v)] || v}</Tag>
        ),
    },
    {
      title: '补偿',
      dataIndex: 'compensateEnabled',
      width: 80,
      render: (v?: number) =>
        v === undefined ? '-' : (
          <Tag color={INT_ENABLED_COLOR[String(v)]}>{INT_ENABLED_LABEL[String(v)] || v}</Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={INT_ENDPOINT_STATUS_COLOR[v]}>{INT_ENDPOINT_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:endpoint:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:endpoint:delete') && (
            <Popconfirm title="确认删除该接口配置？" onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="endpointCode" label="接口编码">
            <Input placeholder="请输入接口编码" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="domain" label="所属域">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_DOMAIN_OPTIONS} />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="protocol" label="协议">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_PROTOCOL_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_ENDPOINT_STATUS_OPTIONS} />
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
        title={`接口配置列表（共 ${total} 条）`}
        extra={
          hasPermission('int:endpoint:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增接口
            </Button>
          )
        }
      >
        <Table<IntEndpointItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editing ? '编辑接口配置' : '新增接口配置'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="endpointCode" label="接口编码" extra="留空将自动生成">
            <Input placeholder="请输入接口编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="endpointName" label="接口名称">
            <Input placeholder="请输入接口名称" />
          </Form.Item>
          <Form.Item name="domain" label="所属域" rules={[{ required: true, message: '请选择所属域' }]}>
            <Select placeholder="请选择" options={INT_DOMAIN_OPTIONS} />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" options={INT_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="protocol" label="协议">
            <Select placeholder="请选择" options={INT_PROTOCOL_OPTIONS} />
          </Form.Item>
          <Form.Item name="endpointUrl" label="接口地址">
            <Input placeholder="请输入接口地址" />
          </Form.Item>
          <Form.Item name="authType" label="认证方式">
            <Input placeholder="如 NONE / TOKEN / OAUTH2" />
          </Form.Item>
          <Form.Item name="timeoutMs" label="超时时间(ms)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入超时时间" />
          </Form.Item>
          <Form.Item name="retryMax" label="重试上限">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入重试上限" />
          </Form.Item>
          <Form.Item name="idempotentEnabled" label="幂等开关">
            <Select placeholder="请选择" options={INT_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="compensateEnabled" label="补偿开关">
            <Select placeholder="请选择" options={INT_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={INT_ENDPOINT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 接口调用日志 ================= */

interface LogFormValues {
  idempotentKey: string;
  endpointCode?: string;
  interfaceCode?: string;
  direction?: string;
  bizKey?: string;
  requestBody?: string;
  responseBody?: string;
  httpStatus?: number;
  resultStatus?: string;
  retryMax?: number;
  errorMessage?: string;
  sourceSystem?: string;
  targetSystem?: string;
  costMs?: number;
  remark?: string;
}

interface LogSearchState {
  logNo?: string;
  endpointCode?: string;
  bizKey?: string;
  resultStatus?: string;
  direction?: string;
}

function InterfaceLogTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<LogFormValues>();

  const [data, setData] = useState<IntInterfaceLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<LogSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<IntInterfaceLogItem | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntInterfaceLogQuery = {
          pageNum: page,
          pageSize: size,
          logNo: cond.logNo || undefined,
          endpointCode: cond.endpointCode || undefined,
          bizKey: cond.bizKey || undefined,
          resultStatus: cond.resultStatus || undefined,
          direction: cond.direction || undefined,
        };
        const res = await intService.logPage(params);
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

  const onSearch = (values: LogSearchState) => {
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

  const openRecord = () => {
    form.resetFields();
    form.setFieldsValue({ resultStatus: 'SUCCESS', direction: 'OUTBOUND' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntInterfaceLogSaveParams = {
      idempotentKey: values.idempotentKey,
      endpointCode: values.endpointCode,
      interfaceCode: values.interfaceCode,
      direction: values.direction,
      bizKey: values.bizKey,
      requestBody: values.requestBody,
      responseBody: values.responseBody,
      httpStatus: values.httpStatus,
      resultStatus: values.resultStatus,
      retryMax: values.retryMax,
      errorMessage: values.errorMessage,
      sourceSystem: values.sourceSystem,
      targetSystem: values.targetSystem,
      costMs: values.costMs,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      await intService.logRecord(payload);
      message.success('登记成功');
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async (record: IntInterfaceLogItem) => {
    await intService.logRetry(record.logNo);
    message.success('已触发重试');
    void loadData();
  };

  const handleCompensate = async (record: IntInterfaceLogItem) => {
    await intService.logCompensate(record.logNo);
    message.success('已触发补偿');
    void loadData();
  };

  const openDetail = (record: IntInterfaceLogItem) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  const columns: ColumnsType<IntInterfaceLogItem> = [
    { title: '日志编号', dataIndex: 'logNo', width: 190, fixed: 'left', render: (v) => v || '-' },
    { title: '接口编码', dataIndex: 'endpointCode', width: 170, render: (v) => v || '-' },
    { title: '业务接口', dataIndex: 'interfaceCode', width: 160, render: (v) => v || '-' },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 90,
      render: (v?: string) => (v ? INT_DIRECTION_LABEL[v] || v : '-'),
    },
    { title: '业务键', dataIndex: 'bizKey', width: 160, render: (v) => v || '-' },
    { title: '幂等键', dataIndex: 'idempotentKey', width: 170, render: (v) => v || '-' },
    {
      title: '结果状态',
      dataIndex: 'resultStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={INT_RESULT_STATUS_COLOR[v]}>{INT_RESULT_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: 'HTTP', dataIndex: 'httpStatus', width: 90, render: (v) => (v ?? '-') },
    {
      title: '重试',
      dataIndex: 'retryCount',
      width: 90,
      render: (_, record) => `${record.retryCount ?? 0} / ${record.retryMax ?? '-'}`,
    },
    {
      title: '下次重试',
      dataIndex: 'nextRetryAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '已补偿',
      dataIndex: 'compensated',
      width: 90,
      render: (v?: number) =>
        v === undefined ? '-' : (
          <Tag color={INT_ENABLED_COLOR[String(v)]}>{INT_ENABLED_LABEL[String(v)] || v}</Tag>
        ),
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      width: 220,
      render: (v?: string) =>
        v ? (
          <Typography.Text ellipsis={{ tooltip: v }} style={{ maxWidth: 200, display: 'inline-block' }}>
            {v}
          </Typography.Text>
        ) : (
          '-'
        ),
    },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 100, render: (v) => (v ?? '-') },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
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
          {(record.resultStatus === 'FAILED' || record.resultStatus === 'RETRYING') &&
            hasPermission('int:log:retry') && (
              <Button type="link" size="small" onClick={() => handleRetry(record)}>
                重试
              </Button>
            )}
          {record.resultStatus === 'FAILED' && record.compensated !== 1 && hasPermission('int:log:compensate') && (
            <Button type="link" size="small" onClick={() => handleCompensate(record)}>
              补偿
            </Button>
          )}
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="logNo" label="日志编号">
            <Input placeholder="请输入日志编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="endpointCode" label="接口编码">
            <Input placeholder="请输入接口编码" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="bizKey" label="业务键">
            <Input placeholder="请输入业务键" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="resultStatus" label="结果状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_RESULT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_DIRECTION_OPTIONS} />
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
        title={`接口调用日志（共 ${total} 条）`}
        extra={
          hasPermission('int:log:list') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openRecord}>
              登记日志
            </Button>
          )
        }
      >
        <Table<IntInterfaceLogItem>
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
        title="登记接口日志"
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="idempotentKey"
            label="幂等键"
            rules={[{ required: true, message: '请输入幂等键' }]}
          >
            <Input placeholder="请输入幂等键" />
          </Form.Item>
          <Form.Item name="endpointCode" label="接口编码">
            <Input placeholder="请输入接口编码" />
          </Form.Item>
          <Form.Item name="interfaceCode" label="业务接口">
            <Input placeholder="请输入业务接口" />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" options={INT_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="bizKey" label="业务键">
            <Input placeholder="请输入业务键" />
          </Form.Item>
          <Form.Item name="requestBody" label="请求报文">
            <Input.TextArea rows={4} placeholder="请输入请求报文" />
          </Form.Item>
          <Form.Item name="responseBody" label="响应报文">
            <Input.TextArea rows={4} placeholder="请输入响应报文" />
          </Form.Item>
          <Form.Item name="httpStatus" label="HTTP 状态码">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入 HTTP 状态码" />
          </Form.Item>
          <Form.Item name="resultStatus" label="结果状态">
            <Select placeholder="请选择" options={INT_RESULT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="retryMax" label="重试上限">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入重试上限" />
          </Form.Item>
          <Form.Item name="errorMessage" label="错误信息">
            <Input placeholder="请输入错误信息" />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="请输入来源系统" />
          </Form.Item>
          <Form.Item name="targetSystem" label="目标系统">
            <Input placeholder="请输入目标系统" />
          </Form.Item>
          <Form.Item name="costMs" label="耗时(ms)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入耗时" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`接口日志详情${detailRecord?.logNo ? `：${detailRecord.logNo}` : ''}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={
          <Button type="primary" onClick={() => setDetailOpen(false)}>
            关闭
          </Button>
        }
        width={820}
      >
        {detailRecord && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="日志编号">{detailRecord.logNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="接口编码">{detailRecord.endpointCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="业务接口">{detailRecord.interfaceCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="方向">
              {detailRecord.direction ? INT_DIRECTION_LABEL[detailRecord.direction] || detailRecord.direction : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="业务键">{detailRecord.bizKey || '-'}</Descriptions.Item>
            <Descriptions.Item label="幂等键">{detailRecord.idempotentKey || '-'}</Descriptions.Item>
            <Descriptions.Item label="结果状态">
              {detailRecord.resultStatus
                ? INT_RESULT_STATUS_LABEL[detailRecord.resultStatus] || detailRecord.resultStatus
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="HTTP 状态码">{detailRecord.httpStatus ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="重试次数">{detailRecord.retryCount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="重试上限">{detailRecord.retryMax ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="下次重试">
              {detailRecord.nextRetryAt ? dayjs(detailRecord.nextRetryAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="是否已补偿">
              {detailRecord.compensated === undefined
                ? '-'
                : INT_ENABLED_LABEL[String(detailRecord.compensated)] || detailRecord.compensated}
            </Descriptions.Item>
            <Descriptions.Item label="来源系统">{detailRecord.sourceSystem || '-'}</Descriptions.Item>
            <Descriptions.Item label="目标系统">{detailRecord.targetSystem || '-'}</Descriptions.Item>
            <Descriptions.Item label="耗时(ms)">{detailRecord.costMs ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {detailRecord.updatedAt ? dayjs(detailRecord.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="请求报文" span={2}>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {detailRecord.requestBody || '-'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="响应报文" span={2}>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {detailRecord.responseBody || '-'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="错误信息" span={2}>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {detailRecord.errorMessage || '-'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{detailRecord.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Space>
  );
}

export default function IntEndpointPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        接口配置与监控
      </Title>
      <Tabs
        items={[
          { key: 'config', label: '接口配置', children: <EndpointConfigTab /> },
          { key: 'log', label: '接口调用日志', children: <InterfaceLogTab /> },
        ]}
      />
    </Space>
  );
}
