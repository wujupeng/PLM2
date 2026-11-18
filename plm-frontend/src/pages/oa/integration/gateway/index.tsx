import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { oaApiGatewayService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import {
  BOOLEAN_FORM_OPTIONS,
  enableTag,
  enumText,
  flagText,
} from '@/pages/oa/integration/shared';
import {
  OA_API_HTTP_METHOD_OPTIONS,
  OA_ENABLE_STATUS_OPTIONS,
  OA_INTEGRATION_AUTH_TYPE_LABEL,
  OA_INTEGRATION_AUTH_TYPE_OPTIONS,
  OA_INTEGRATION_SYSTEM_LABEL,
  OA_INTEGRATION_SYSTEM_OPTIONS,
  type OaApiAccessLogItem,
  type OaApiCredentialItem,
  type OaApiCredentialSaveParams,
  type OaApiPolicyItem,
  type OaApiPolicySaveParams,
} from '@/types/oa';

const { Title } = Typography;

const API_MANAGE = 'oa:integration:api:manage';

interface PolicyFormValues {
  policyNo?: string;
  policyName?: string;
  pathPrefix?: string;
  upstream?: string;
  httpMethods?: string;
  authType?: string;
  rateLimitQps?: number;
  signatureFlag?: boolean;
  apiVersion?: string;
  ipAllowList?: string;
  ipDenyList?: string;
  auditFlag?: boolean;
  status?: number;
  remark?: string;
}

interface CredentialFormValues {
  credentialNo?: string;
  credentialName?: string;
  appKey?: string;
  appSecret?: string;
  ownerSystem?: string;
  expireDate?: Dayjs;
  status?: number;
  remark?: string;
}

interface AccessLogFormValues {
  path?: string;
  httpMethod?: string;
  clientSystem?: string;
  appKey?: string;
  operatorName?: string;
  ipAddress?: string;
  statusCode?: number;
  resultCode?: string;
  costMs?: number;
  requestSummary?: string;
  errorMsg?: string;
  remark?: string;
}

/* ---------------- 1. API 策略 ---------------- */

function PolicyTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<PolicyFormValues>();
  const [data, setData] = useState<OaApiPolicyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, st = status) => {
      setLoading(true);
      try {
        const res = await oaApiGatewayService.pagePolicies({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          status: st,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, status],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1, rateLimitQps: 100, signatureFlag: false, auditFlag: true });
    setOpen(true);
  };

  const openEdit = (record: OaApiPolicyItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      policyNo: record.policyNo,
      policyName: record.policyName,
      pathPrefix: record.pathPrefix,
      upstream: record.upstream,
      httpMethods: record.httpMethods,
      authType: record.authType,
      rateLimitQps: record.rateLimitQps,
      signatureFlag: Number(record.signatureFlag) === 1,
      apiVersion: record.apiVersion,
      ipAllowList: record.ipAllowList,
      ipDenyList: record.ipDenyList,
      auditFlag: Number(record.auditFlag) === 1,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaApiPolicySaveParams = { ...values };
      if (editId == null) {
        await oaApiGatewayService.createPolicy(payload);
        message.success('策略已创建');
      } else {
        await oaApiGatewayService.updatePolicy(editId, payload);
        message.success('策略已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaApiGatewayService.removePolicy(id);
    message.success('策略已删除');
    void loadData();
  };

  const columns: ColumnsType<OaApiPolicyItem> = [
    { title: '策略编号', dataIndex: 'policyNo', width: 170, fixed: 'left', render: plain },
    { title: '策略名称', dataIndex: 'policyName', width: 180, render: plain },
    { title: '路径前缀', dataIndex: 'pathPrefix', width: 200, render: plain },
    { title: '上游服务', dataIndex: 'upstream', width: 160, render: plain },
    { title: '方法', dataIndex: 'httpMethods', width: 120, render: plain },
    {
      title: '认证方式',
      dataIndex: 'authType',
      width: 110,
      render: (v) => enumText(OA_INTEGRATION_AUTH_TYPE_LABEL, v),
    },
    { title: '限流(QPS)', dataIndex: 'rateLimitQps', width: 100, render: plain },
    { title: '签名', dataIndex: 'signatureFlag', width: 70, render: flagText },
    { title: '审计', dataIndex: 'auditFlag', width: 70, render: flagText },
    { title: '版本', dataIndex: 'apiVersion', width: 90, render: plain },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(API_MANAGE) && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该策略？" onConfirm={() => void remove(record.id)}>
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
          <Form.Item label="启用状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={status}
              onChange={(v) => setStatus(v)}
              options={[...OA_ENABLE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 名称 / 路径 / 上游"
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
                  void loadData(1, pageSize, keyword, status);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(API_MANAGE) && <Button onClick={openCreate}>新建策略</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`API 策略（共 ${total} 条）`}>
        <Table<OaApiPolicyItem>
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
        title={editId == null ? '新建 API 策略' : '编辑 API 策略'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="policyNo" label="策略编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="policyName" label="策略名称" rules={[{ required: true, message: '请输入策略名称' }]}>
            <Input placeholder="请输入策略名称" />
          </Form.Item>
          <Form.Item name="pathPrefix" label="路径前缀" rules={[{ required: true, message: '请输入路径前缀' }]}>
            <Input placeholder="如 /oa/api/v1" />
          </Form.Item>
          <Form.Item name="upstream" label="上游服务">
            <Input placeholder="如 plm-system:8082" />
          </Form.Item>
          <Form.Item name="httpMethods" label="允许方法">
            <Input placeholder="如 GET,POST,PUT" />
          </Form.Item>
          <Form.Item name="authType" label="认证方式">
            <Select placeholder="请选择" options={[...OA_INTEGRATION_AUTH_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="rateLimitQps" label="限流(QPS)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="留空取全局默认" />
          </Form.Item>
          <Form.Item name="signatureFlag" label="启用签名校验">
            <Select options={[...BOOLEAN_FORM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="apiVersion" label="API 版本">
            <Input placeholder="如 v1" />
          </Form.Item>
          <Form.Item name="ipAllowList" label="IP 白名单">
            <Input.TextArea rows={2} placeholder="逗号分隔" />
          </Form.Item>
          <Form.Item name="ipDenyList" label="IP 黑名单">
            <Input.TextArea rows={2} placeholder="逗号分隔" />
          </Form.Item>
          <Form.Item name="auditFlag" label="访问审计">
            <Select options={[...BOOLEAN_FORM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 2. API 凭证 ---------------- */

function CredentialTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<CredentialFormValues>();
  const [data, setData] = useState<OaApiCredentialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [ownerSystem, setOwnerSystem] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expiring, setExpiring] = useState<OaApiCredentialItem[]>([]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, sys = ownerSystem) => {
      setLoading(true);
      try {
        const res = await oaApiGatewayService.pageCredentials({
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
    [pageNum, pageSize, keyword, ownerSystem],
  );

  const loadExpiring = useCallback(async () => {
    const res = await oaApiGatewayService.listExpiringCredentials();
    setExpiring(res || []);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    void loadExpiring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setOpen(true);
  };

  const openEdit = (record: OaApiCredentialItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      credentialNo: record.credentialNo,
      credentialName: record.credentialName,
      appKey: record.appKey,
      appSecret: record.appSecret,
      ownerSystem: record.ownerSystem,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaApiCredentialSaveParams = {
        credentialNo: values.credentialNo,
        credentialName: values.credentialName,
        appKey: values.appKey,
        appSecret: values.appSecret,
        ownerSystem: values.ownerSystem,
        expireDate: values.expireDate ? values.expireDate.format(DATE_FORMAT) : undefined,
        status: values.status,
        remark: values.remark,
      };
      if (editId == null) {
        await oaApiGatewayService.createCredential(payload);
        message.success('凭证已创建');
      } else {
        await oaApiGatewayService.updateCredential(editId, payload);
        message.success('凭证已更新');
      }
      setOpen(false);
      void loadData();
      void loadExpiring();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaApiGatewayService.removeCredential(id);
    message.success('凭证已删除');
    void loadData();
    void loadExpiring();
  };

  const columns: ColumnsType<OaApiCredentialItem> = [
    { title: '凭证编号', dataIndex: 'credentialNo', width: 170, fixed: 'left', render: plain },
    { title: '凭证名称', dataIndex: 'credentialName', width: 180, render: plain },
    { title: 'AppKey', dataIndex: 'appKey', width: 220, render: plain },
    {
      title: '归属系统',
      dataIndex: 'ownerSystem',
      width: 110,
      render: (v) => enumText(OA_INTEGRATION_SYSTEM_LABEL, v),
    },
    { title: '到期日', dataIndex: 'expireDate', width: 120, render: (v) => (v ? String(v) : '-') },
    { title: '到期提醒', dataIndex: 'alertFlag', width: 90, render: flagText },
    { title: '最后使用', dataIndex: 'lastUsedTime', width: 160, render: formatDateTime },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(API_MANAGE) && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该凭证？" onConfirm={() => void remove(record.id)}>
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
        <Space size="large" wrap>
          <Statistic title="即将到期凭证" value={expiring.length} valueStyle={{ color: expiring.length ? '#cf1322' : undefined }} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="归属系统">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={ownerSystem}
              onChange={(v) => setOwnerSystem(v)}
              options={[...OA_INTEGRATION_SYSTEM_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 名称 / AppKey"
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
                  void loadData(1, pageSize, keyword, ownerSystem);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setOwnerSystem(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(API_MANAGE) && <Button onClick={openCreate}>新建凭证</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`API 凭证（共 ${total} 条）`}>
        <Table<OaApiCredentialItem>
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
        title={editId == null ? '新建 API 凭证' : '编辑 API 凭证'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="credentialNo" label="凭证编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="credentialName" label="凭证名称" rules={[{ required: true, message: '请输入凭证名称' }]}>
            <Input placeholder="请输入凭证名称" />
          </Form.Item>
          <Form.Item name="appKey" label="AppKey">
            <Input placeholder="请输入 AppKey" />
          </Form.Item>
          <Form.Item name="appSecret" label="AppSecret">
            <Input.Password placeholder="请输入 AppSecret" />
          </Form.Item>
          <Form.Item name="ownerSystem" label="归属系统">
            <Select placeholder="请选择" options={[...OA_INTEGRATION_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="expireDate" label="到期日">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 3. 访问审计 ---------------- */

function AccessLogTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<AccessLogFormValues>();
  const [data, setData] = useState<OaApiAccessLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [clientSystem, setClientSystem] = useState<string | undefined>(undefined);
  const [detail, setDetail] = useState<OaApiAccessLogItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [recording, setRecording] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, sys = clientSystem) => {
      setLoading(true);
      try {
        const res = await oaApiGatewayService.pageAccessLogs({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          clientSystem: sys,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, clientSystem],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (record: OaApiAccessLogItem) => {
    setDetailOpen(true);
    const res = await oaApiGatewayService.accessLogDetail(record.id);
    setDetail(res);
  };

  const submitRecord = async () => {
    const values = await form.validateFields();
    setRecording(true);
    try {
      await oaApiGatewayService.recordAccessLog({ ...values });
      message.success('访问记录已登记');
      setRecordOpen(false);
      form.resetFields();
      void loadData();
    } finally {
      setRecording(false);
    }
  };

  const columns: ColumnsType<OaApiAccessLogItem> = [
    { title: '接入时间', dataIndex: 'accessTime', width: 160, fixed: 'left', render: formatDateTime },
    { title: 'TraceId', dataIndex: 'traceId', width: 170, render: plain },
    { title: '请求路径', dataIndex: 'path', width: 220, ellipsis: true, render: plain },
    { title: '方法', dataIndex: 'httpMethod', width: 80, render: plain },
    {
      title: '来源系统',
      dataIndex: 'clientSystem',
      width: 110,
      render: (v) => enumText(OA_INTEGRATION_SYSTEM_LABEL, v),
    },
    { title: '调用方', dataIndex: 'appKey', width: 160, render: plain },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
    { title: 'IP', dataIndex: 'ipAddress', width: 130, render: plain },
    { title: '状态码', dataIndex: 'statusCode', width: 90, render: plain },
    { title: '结果码', dataIndex: 'resultCode', width: 100, render: plain },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 90, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => void openDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline">
          <Form.Item label="来源系统">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={clientSystem}
              onChange={(v) => setClientSystem(v)}
              options={[...OA_INTEGRATION_SYSTEM_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="TraceId / 路径 / 调用方 / 操作人"
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
                  void loadData(1, pageSize, keyword, clientSystem);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setClientSystem(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(API_MANAGE) && <Button onClick={() => setRecordOpen(true)}>登记访问记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`访问审计（共 ${total} 条）`}>
        <Table<OaApiAccessLogItem>
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
        title="访问记录详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="接入时间">{formatDateTime(detail.accessTime)}</Descriptions.Item>
            <Descriptions.Item label="TraceId">{plain(detail.traceId)}</Descriptions.Item>
            <Descriptions.Item label="请求路径" span={2}>
              {plain(detail.path)}
            </Descriptions.Item>
            <Descriptions.Item label="方法">{plain(detail.httpMethod)}</Descriptions.Item>
            <Descriptions.Item label="来源系统">{enumText(OA_INTEGRATION_SYSTEM_LABEL, detail.clientSystem)}</Descriptions.Item>
            <Descriptions.Item label="调用方">{plain(detail.appKey)}</Descriptions.Item>
            <Descriptions.Item label="操作人">{plain(detail.operatorName)}</Descriptions.Item>
            <Descriptions.Item label="IP">{plain(detail.ipAddress)}</Descriptions.Item>
            <Descriptions.Item label="状态码">{plain(detail.statusCode)}</Descriptions.Item>
            <Descriptions.Item label="结果码">{plain(detail.resultCode)}</Descriptions.Item>
            <Descriptions.Item label="耗时(ms)">{plain(detail.costMs)}</Descriptions.Item>
            <Descriptions.Item label="请求摘要" span={2}>
              {plain(detail.requestSummary)}
            </Descriptions.Item>
            <Descriptions.Item label="错误信息" span={2}>
              {plain(detail.errorMsg)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title="登记访问记录"
        open={recordOpen}
        onOk={() => void submitRecord()}
        confirmLoading={recording}
        onCancel={() => setRecordOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="path" label="请求路径" rules={[{ required: true, message: '请输入请求路径' }]}>
            <Input placeholder="如 /oa/api/v1/customers" />
          </Form.Item>
          <Form.Item name="httpMethod" label="请求方法">
            <Select placeholder="请选择" options={[...OA_API_HTTP_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="clientSystem" label="来源系统">
            <Select placeholder="请选择" options={[...OA_INTEGRATION_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="appKey" label="调用方">
            <Input placeholder="AppKey" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="操作人" />
          </Form.Item>
          <Form.Item name="ipAddress" label="IP">
            <Input placeholder="IP 地址" />
          </Form.Item>
          <Form.Item name="statusCode" label="状态码">
            <InputNumber style={{ width: '100%' }} placeholder="如 200" />
          </Form.Item>
          <Form.Item name="resultCode" label="结果码">
            <Input placeholder="如 SUCCESS" />
          </Form.Item>
          <Form.Item name="costMs" label="耗时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requestSummary" label="请求摘要">
            <Input.TextArea rows={2} />
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

/* ---------------- 页面 ---------------- */

export default function OaApiGatewayPage() {
  const [overview, setOverview] = useState<Record<string, unknown>>({});

  useEffect(() => {
    void oaApiGatewayService.overview().then((res) => setOverview(res || {}));
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        统一 API 网关
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="策略总数" value={Number(overview.policyTotal ?? 0)} />
          <Statistic title="启用策略" value={Number(overview.policyEnabled ?? 0)} />
          <Statistic title="凭证总数" value={Number(overview.credentialTotal ?? 0)} />
          <Statistic
            title="即将到期凭证"
            value={Number(overview.credentialExpiring ?? 0)}
            valueStyle={{ color: Number(overview.credentialExpiring ?? 0) ? '#cf1322' : undefined }}
          />
          <Statistic title="访问总量" value={Number(overview.accessTotal ?? 0)} />
          <Statistic title="访问失败" value={Number(overview.accessFail ?? 0)} />
          <Statistic title="限流默认(QPS)" value={Number(overview.rateLimitDefault ?? 0)} />
        </Space>
      </Card>

      <Tabs
        items={[
          { key: 'policy', label: 'API 策略', children: <PolicyTab /> },
          { key: 'credential', label: '访问凭证', children: <CredentialTab /> },
          { key: 'access-log', label: '访问审计', children: <AccessLogTab /> },
        ]}
      />
    </Space>
  );
}
