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
  Switch,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { oaIntegrationConnectorService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enableTag, enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_ENABLE_STATUS_OPTIONS,
  OA_INTEGRATION_AUTH_TYPE_LABEL,
  OA_INTEGRATION_AUTH_TYPE_OPTIONS,
  OA_INTEGRATION_SYSTEM_LABEL,
  OA_INTEGRATION_SYSTEM_OPTIONS,
  OA_MASTER_DATA_OBJECT_LABEL,
  OA_MASTER_DATA_OBJECT_OPTIONS,
  OA_SYNC_DIRECTION_LABEL,
  OA_SYNC_DIRECTION_OPTIONS,
  OA_SYNC_RECEIPT_STATUS_LABEL,
  OA_SYNC_STATUS_LABEL,
  OA_SYNC_STATUS_OPTIONS,
  type OaConnectorSyncLogItem,
  type OaConnectorSyncLogSaveParams,
  type OaIntegrationConnectorItem,
  type OaIntegrationConnectorSaveParams,
  type OaMasterDataMappingItem,
  type OaMasterDataMappingSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const CONNECTOR_MANAGE = 'oa:integration:connector:manage';

interface ConnectorFormValues {
  connectorNo?: string;
  connectorName?: string;
  systemCode?: string;
  systemType?: string;
  baseUrl?: string;
  authType?: string;
  authoritySystem?: string;
  syncDirection?: string;
  ssoFlag?: boolean;
  todoSyncFlag?: boolean;
  masterDataScope?: string;
  credentialId?: number;
  credentialExpireDate?: Dayjs;
  status?: number;
  remark?: string;
}

interface SyncFormValues {
  objectType?: string;
  direction?: string;
  sourceFlag?: string;
  dataTimestamp?: string;
  recordCount?: number;
  syncStatus?: string;
  receiptNo?: string;
  receiptStatus?: string;
  costMs?: number;
  errorMsg?: string;
  remark?: string;
}

interface MappingFormValues {
  mappingNo?: string;
  objectType?: string;
  localCode?: string;
  externalCode?: string;
  authoritySystem?: string;
  sourceSystem?: string;
  syncDirection?: string;
  status?: number;
  remark?: string;
}

/* ---------------- 1. 集成连接器 ---------------- */

function ConnectorTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ConnectorFormValues>();
  const [data, setData] = useState<OaIntegrationConnectorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [systemCode, setSystemCode] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, sys = systemCode) => {
      setLoading(true);
      try {
        const res = await oaIntegrationConnectorService.pageConnectors({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          systemCode: sys,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, systemCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1, syncDirection: 'BIDIRECTIONAL', authType: 'OAUTH2', ssoFlag: false, todoSyncFlag: true });
    setOpen(true);
  };

  const openEdit = (record: OaIntegrationConnectorItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      connectorNo: record.connectorNo,
      connectorName: record.connectorName,
      systemCode: record.systemCode,
      systemType: record.systemType,
      baseUrl: record.baseUrl,
      authType: record.authType,
      authoritySystem: record.authoritySystem,
      syncDirection: record.syncDirection,
      ssoFlag: Number(record.ssoFlag) === 1,
      todoSyncFlag: Number(record.todoSyncFlag) === 1,
      masterDataScope: record.masterDataScope,
      credentialId: record.credentialId,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaIntegrationConnectorSaveParams = {
        ...values,
        credentialExpireDate: values.credentialExpireDate
          ? values.credentialExpireDate.format(DATE_FORMAT)
          : undefined,
      };
      if (editId == null) {
        await oaIntegrationConnectorService.createConnector(payload);
        message.success('连接器已创建');
      } else {
        await oaIntegrationConnectorService.updateConnector(editId, payload);
        message.success('连接器已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaIntegrationConnectorService.removeConnector(id);
    message.success('连接器已删除');
    void loadData();
  };

  const columns: ColumnsType<OaIntegrationConnectorItem> = [
    { title: '连接器编号', dataIndex: 'connectorNo', width: 170, fixed: 'left', render: plain },
    { title: '连接器名称', dataIndex: 'connectorName', width: 180, render: plain },
    {
      title: '系统编码',
      dataIndex: 'systemCode',
      width: 110,
      render: (v) => enumText(OA_INTEGRATION_SYSTEM_LABEL, v),
    },
    { title: '服务地址', dataIndex: 'baseUrl', width: 220, ellipsis: true, render: plain },
    {
      title: '认证方式',
      dataIndex: 'authType',
      width: 110,
      render: (v) => enumText(OA_INTEGRATION_AUTH_TYPE_LABEL, v),
    },
    { title: '权威系统', dataIndex: 'authoritySystem', width: 110, render: plain },
    {
      title: '同步方向',
      dataIndex: 'syncDirection',
      width: 110,
      render: (v) => enumText(OA_SYNC_DIRECTION_LABEL, v),
    },
    { title: 'SSO', dataIndex: 'ssoFlag', width: 70, render: flagText },
    { title: '待办同步', dataIndex: 'todoSyncFlag', width: 90, render: flagText },
    { title: '最近同步', dataIndex: 'lastSyncTime', width: 160, render: formatDateTime },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(CONNECTOR_MANAGE) && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该连接器？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Form layout="inline">
          <Form.Item label="系统编码">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={systemCode}
              onChange={(v) => setSystemCode(v)}
              options={[...OA_INTEGRATION_SYSTEM_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 名称 / 服务地址"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, systemCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSystemCode(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(CONNECTOR_MANAGE) && <Button onClick={openCreate}>新建连接器</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`集成连接器（共 ${total} 条）`}>
        <Table<OaIntegrationConnectorItem>
          rowKey="id"
          loading={loading}
          columns={columns}
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

      <Modal
        title={editId == null ? '新建集成连接器' : '编辑集成连接器'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="connectorNo" label="连接器编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="connectorName" label="连接器名称" rules={[{ required: true, message: '请输入连接器名称' }]}>
            <Input placeholder="请输入连接器名称" />
          </Form.Item>
          <Form.Item name="systemCode" label="系统编码" rules={[{ required: true, message: '请选择系统编码' }]}>
            <Select placeholder="请选择" options={[...OA_INTEGRATION_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="systemType" label="系统类型">
            <Input placeholder="留空默认同系统编码" />
          </Form.Item>
          <Form.Item name="baseUrl" label="服务地址">
            <Input placeholder="https://erp.example.com/api" />
          </Form.Item>
          <Form.Item name="authType" label="认证方式">
            <Select placeholder="请选择" options={[...OA_INTEGRATION_AUTH_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="authoritySystem" label="权威系统">
            <Input placeholder="主数据权威归属系统" />
          </Form.Item>
          <Form.Item name="syncDirection" label="同步方向">
            <Select placeholder="请选择" options={[...OA_SYNC_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ssoFlag" label="启用 SSO" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="todoSyncFlag" label="同步待办" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="masterDataScope" label="主数据范围">
            <Input placeholder="如 CUSTOMER,SUPPLIER,MATERIAL" />
          </Form.Item>
          <Form.Item name="credentialId" label="关联凭证ID">
            <InputNumber style={{ width: '100%' }} placeholder="API 凭证 ID" />
          </Form.Item>
          <Form.Item name="credentialExpireDate" label="凭证到期日">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 2. 同步记录 ---------------- */

function SyncLogTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<SyncFormValues>();
  const [data, setData] = useState<OaConnectorSyncLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [syncStatus, setSyncStatus] = useState<string | undefined>(undefined);
  const [connectors, setConnectors] = useState<OaIntegrationConnectorItem[]>([]);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncConnector, setSyncConnector] = useState<OaIntegrationConnectorItem | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, obj = objectType, status = syncStatus) => {
      setLoading(true);
      try {
        const res = await oaIntegrationConnectorService.pageSyncLogs({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: obj,
          syncStatus: status,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, syncStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSync = async () => {
    const res = await oaIntegrationConnectorService.listEnabledConnectors();
    setConnectors(res || []);
    form.resetFields();
    form.setFieldsValue({ direction: 'INBOUND', syncStatus: 'SUCCESS', receiptStatus: 'ACCEPTED' });
    setSyncConnector(null);
    setSyncOpen(true);
  };

  const submitSync = async () => {
    if (!syncConnector) {
      message.warning('请选择连接器');
      return;
    }
    const values = await form.validateFields();
    setSyncing(true);
    try {
      const payload: OaConnectorSyncLogSaveParams = { connectorId: syncConnector.id, ...values };
      await oaIntegrationConnectorService.sync(syncConnector.id, payload);
      message.success('同步已执行');
      setSyncOpen(false);
      void loadData();
    } finally {
      setSyncing(false);
    }
  };

  const columns: ColumnsType<OaConnectorSyncLogItem> = [
    { title: '同步时间', dataIndex: 'syncTime', width: 160, fixed: 'left', render: formatDateTime },
    { title: '连接器编号', dataIndex: 'connectorNo', width: 170, render: plain },
    {
      title: '系统编码',
      dataIndex: 'systemCode',
      width: 110,
      render: (v) => enumText(OA_INTEGRATION_SYSTEM_LABEL, v),
    },
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 110,
      render: (v) => enumText(OA_MASTER_DATA_OBJECT_LABEL, v),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 100,
      render: (v) => enumText(OA_SYNC_DIRECTION_LABEL, v),
    },
    { title: '来源标识', dataIndex: 'sourceFlag', width: 160, render: plain },
    { title: '数据时间戳', dataIndex: 'dataTimestamp', width: 160, render: formatDateTime },
    { title: '记录数', dataIndex: 'recordCount', width: 90, render: plain },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 100,
      render: (v) => enumTag(OA_SYNC_STATUS_LABEL, v),
    },
    { title: '回执号', dataIndex: 'receiptNo', width: 170, render: plain },
    {
      title: '回执状态',
      dataIndex: 'receiptStatus',
      width: 110,
      render: (v) => enumText(OA_SYNC_RECEIPT_STATUS_LABEL, v),
    },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 90, render: plain },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
    { title: '错误信息', dataIndex: 'errorMsg', width: 170, ellipsis: true, render: plain },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline">
          <Form.Item label="对象类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...OA_MASTER_DATA_OBJECT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="同步状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={syncStatus}
              onChange={(v) => setSyncStatus(v)}
              options={[...OA_SYNC_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="回执号 / 连接器编号 / 来源标识"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, objectType, syncStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setSyncStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(CONNECTOR_MANAGE) && <Button onClick={() => void openSync()}>触发同步</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`同步记录（共 ${total} 条）`}>
        <Table<OaConnectorSyncLogItem>
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
        title="触发连接器同步"
        open={syncOpen}
        onOk={() => void submitSync()}
        confirmLoading={syncing}
        onCancel={() => setSyncOpen(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="连接器" required>
            <Select
              placeholder="请选择连接器"
              value={syncConnector?.id}
              onChange={(v) => setSyncConnector(connectors.find((c) => c.id === v) || null)}
              options={connectors.map((c) => ({
                label: `${c.connectorName || ''}（${c.systemCode || ''}）`,
                value: c.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="objectType" label="对象类型" rules={[{ required: true, message: '请选择对象类型' }]}>
            <Select placeholder="请选择" options={[...OA_MASTER_DATA_OBJECT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" options={[...OA_SYNC_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="syncStatus" label="同步状态">
            <Select placeholder="请选择" options={[...OA_SYNC_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="receiptStatus" label="回执状态">
            <Select
              placeholder="请选择"
              options={[
                { label: OA_SYNC_RECEIPT_STATUS_LABEL.ACCEPTED, value: 'ACCEPTED' },
                { label: OA_SYNC_RECEIPT_STATUS_LABEL.REJECTED, value: 'REJECTED' },
              ]}
            />
          </Form.Item>
          <Form.Item name="recordCount" label="记录数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="costMs" label="耗时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="errorMsg" label="错误信息">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 3. 主数据映射 ---------------- */

function MappingTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MappingFormValues>();
  const [data, setData] = useState<OaMasterDataMappingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, obj = objectType) => {
      setLoading(true);
      try {
        const res = await oaIntegrationConnectorService.pageMappings({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: obj,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1, syncDirection: 'INBOUND' });
    setOpen(true);
  };

  const openEdit = (record: OaMasterDataMappingItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      mappingNo: record.mappingNo,
      objectType: record.objectType,
      localCode: record.localCode,
      externalCode: record.externalCode,
      authoritySystem: record.authoritySystem,
      sourceSystem: record.sourceSystem,
      syncDirection: record.syncDirection,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMasterDataMappingSaveParams = { ...values };
      if (editId == null) {
        await oaIntegrationConnectorService.createMapping(payload);
        message.success('映射已创建');
      } else {
        await oaIntegrationConnectorService.updateMapping(editId, payload);
        message.success('映射已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaIntegrationConnectorService.removeMapping(id);
    message.success('映射已删除');
    void loadData();
  };

  const columns: ColumnsType<OaMasterDataMappingItem> = [
    { title: '映射编号', dataIndex: 'mappingNo', width: 170, fixed: 'left', render: plain },
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 110,
      render: (v) => enumText(OA_MASTER_DATA_OBJECT_LABEL, v),
    },
    { title: '本地编码', dataIndex: 'localCode', width: 180, render: plain },
    { title: '外部编码', dataIndex: 'externalCode', width: 180, render: plain },
    { title: '权威系统', dataIndex: 'authoritySystem', width: 110, render: plain },
    { title: '来源系统', dataIndex: 'sourceSystem', width: 110, render: plain },
    {
      title: '同步方向',
      dataIndex: 'syncDirection',
      width: 110,
      render: (v) => enumText(OA_SYNC_DIRECTION_LABEL, v),
    },
    { title: '最近同步', dataIndex: 'lastSyncTime', width: 160, render: formatDateTime },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(CONNECTOR_MANAGE) && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该映射？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Form layout="inline">
          <Form.Item label="对象类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...OA_MASTER_DATA_OBJECT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="映射编号 / 本地编码 / 外部编码"
              allowClear
              style={{ width: 240 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, objectType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(CONNECTOR_MANAGE) && <Button onClick={openCreate}>新建映射</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`主数据映射（共 ${total} 条）`}>
        <Table<OaMasterDataMappingItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1500 }}
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
        title={editId == null ? '新建主数据映射' : '编辑主数据映射'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="mappingNo" label="映射编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="objectType" label="对象类型" rules={[{ required: true, message: '请选择对象类型' }]}>
            <Select placeholder="请选择" options={[...OA_MASTER_DATA_OBJECT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="localCode" label="本地编码" rules={[{ required: true, message: '请输入本地编码' }]}>
            <Input placeholder="请输入本地编码" />
          </Form.Item>
          <Form.Item name="externalCode" label="外部编码" rules={[{ required: true, message: '请输入外部编码' }]}>
            <Input placeholder="请输入外部编码" />
          </Form.Item>
          <Form.Item name="authoritySystem" label="权威系统">
            <Input placeholder="留空取配置默认" />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Select placeholder="请选择" options={[...OA_INTEGRATION_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="syncDirection" label="同步方向">
            <Select placeholder="请选择" options={[...OA_SYNC_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function OaIntegrationConnectorPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        应用连接器与主数据映射
      </Title>

      <Tabs
        items={[
          { key: 'connector', label: '集成连接器', children: <ConnectorTab /> },
          { key: 'sync-log', label: '同步记录', children: <SyncLogTab /> },
          { key: 'mapping', label: '主数据映射', children: <MappingTab /> },
        ]}
      />
    </Space>
  );
}
