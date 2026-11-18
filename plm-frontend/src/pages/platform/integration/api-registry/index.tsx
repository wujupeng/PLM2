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
  Statistic,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { platformApiRegistryService, platformApiVersionService } from '@/services/platformService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/integration/shared';
import {
  PLATFORM_API_STATUS_LABEL,
  PLATFORM_API_STATUS_OPTIONS,
  PLATFORM_AUTH_TYPE_LABEL,
  PLATFORM_AUTH_TYPE_OPTIONS,
  PLATFORM_CHANGE_TYPE_LABEL,
  PLATFORM_CHANGE_TYPE_OPTIONS,
  PLATFORM_COMPATIBILITY_LABEL,
  PLATFORM_COMPATIBILITY_OPTIONS,
  PLATFORM_DIRECTION_LABEL,
  PLATFORM_DIRECTION_OPTIONS,
  PLATFORM_HTTP_METHOD_LABEL,
  PLATFORM_HTTP_METHOD_OPTIONS,
  PLATFORM_PROTOCOL_LABEL,
  PLATFORM_PROTOCOL_OPTIONS,
  PLATFORM_SYSTEM_LABEL,
  PLATFORM_SYSTEM_OPTIONS,
  PLATFORM_VERSION_STATUS_LABEL,
  PLATFORM_VERSION_STATUS_OPTIONS,
  type PlatformApiRegistryItem,
  type PlatformApiRegistrySaveParams,
  type PlatformApiVersionItem,
  type PlatformApiVersionSaveParams,
  type PlatformStats,
} from '@/types/platform';

const { Title } = Typography;

const API_MANAGE = 'platform:integration:api:manage';

/* ---------------- 1. 接口注册 ---------------- */

interface RegistryFormValues {
  apiCode?: string;
  apiName?: string;
  systemCode?: string;
  direction?: string;
  protocol?: string;
  httpMethod?: string;
  urlPath?: string;
  apiVersion?: string;
  authType?: string;
  timeoutMs?: number;
  slaMs?: number;
  ownerName?: string;
  apiStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

function ApiRegistryTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<RegistryFormValues>();
  const [data, setData] = useState<PlatformApiRegistryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [systemCode, setSystemCode] = useState<string | undefined>(undefined);
  const [apiStatus, setApiStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, sys = systemCode, st = apiStatus) => {
      setLoading(true);
      try {
        const res = await platformApiRegistryService.pageApis({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          systemCode: sys,
          apiStatus: st,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, systemCode, apiStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ apiStatus: 'DRAFT', direction: 'OUT', protocol: 'HTTP', authType: 'JWT', apiVersion: 'v1' });
    setOpen(true);
  };

  const openEdit = (record: PlatformApiRegistryItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformApiRegistrySaveParams = { ...values, apiName: values.apiName!, systemCode: values.systemCode! };
      if (editId == null) {
        await platformApiRegistryService.create(payload);
        message.success('接口已创建');
      } else {
        await platformApiRegistryService.update(editId, payload);
        message.success('接口已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformApiRegistryService.remove(id);
    message.success('接口已删除');
    void loadData();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
  };

  const columns: ColumnsType<PlatformApiRegistryItem> = [
    { title: '接口编码', dataIndex: 'apiCode', width: 170, fixed: 'left', render: plain },
    { title: '接口名称', dataIndex: 'apiName', width: 180, render: plain },
    { title: '所属系统', dataIndex: 'systemCode', width: 100, render: (v) => enumText(PLATFORM_SYSTEM_LABEL, v) },
    { title: '方向', dataIndex: 'direction', width: 90, render: (v) => enumText(PLATFORM_DIRECTION_LABEL, v) },
    { title: '协议', dataIndex: 'protocol', width: 90, render: (v) => enumText(PLATFORM_PROTOCOL_LABEL, v) },
    { title: '方法', dataIndex: 'httpMethod', width: 80, render: (v) => enumText(PLATFORM_HTTP_METHOD_LABEL, v) },
    { title: '接口路径', dataIndex: 'urlPath', width: 200, ellipsis: true, render: plain },
    { title: '版本', dataIndex: 'apiVersion', width: 80, render: plain },
    { title: '认证方式', dataIndex: 'authType', width: 110, render: (v) => enumText(PLATFORM_AUTH_TYPE_LABEL, v) },
    { title: '超时(ms)', dataIndex: 'timeoutMs', width: 90, render: plain },
    { title: 'SLA(ms)', dataIndex: 'slaMs', width: 90, render: plain },
    { title: '责任人', dataIndex: 'ownerName', width: 100, render: plain },
    {
      title: '状态',
      dataIndex: 'apiStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(PLATFORM_API_STATUS_LABEL, v),
    },
    { title: '备注', dataIndex: 'remark', width: 140, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(API_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认发布该接口？" onConfirm={() => void act(platformApiRegistryService.publish, record.id, '接口已发布')}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
            <Popconfirm title="确认废弃该接口？" onConfirm={() => void act(platformApiRegistryService.deprecate, record.id, '接口已废弃')}>
              <Button type="link" size="small">
                废弃
              </Button>
            </Popconfirm>
            <Popconfirm title="确认下线该接口？" onConfirm={() => void act(platformApiRegistryService.offline, record.id, '接口已下线')}>
              <Button type="link" size="small">
                下线
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该接口？" onConfirm={() => void remove(record.id)}>
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
          <Form.Item label="所属系统">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={systemCode}
              onChange={(v) => setSystemCode(v)}
              options={[...PLATFORM_SYSTEM_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="接口状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={apiStatus}
              onChange={(v) => setApiStatus(v)}
              options={[...PLATFORM_API_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编码 / 名称 / 路径"
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
                  void loadData(1, pageSize, keyword, systemCode, apiStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSystemCode(undefined);
                  setApiStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(API_MANAGE) && <Button onClick={openCreate}>新建接口</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`接口注册（共 ${total} 条）`}>
        <Table<PlatformApiRegistryItem>
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
        title={editId == null ? '新建接口' : '编辑接口'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="apiCode" label="接口编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="apiName" label="接口名称" rules={[{ required: true, message: '请输入接口名称' }]}>
            <Input placeholder="请输入接口名称" />
          </Form.Item>
          <Form.Item name="systemCode" label="所属系统" rules={[{ required: true, message: '请选择所属系统' }]}>
            <Select placeholder="请选择" options={[...PLATFORM_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="direction" label="交互方向">
            <Select placeholder="请选择" options={[...PLATFORM_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="protocol" label="协议">
            <Select placeholder="请选择" options={[...PLATFORM_PROTOCOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="httpMethod" label="HTTP 方法">
            <Select placeholder="请选择" allowClear options={[...PLATFORM_HTTP_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="urlPath" label="接口路径">
            <Input placeholder="如 /platform/api/v1/orders" />
          </Form.Item>
          <Form.Item name="apiVersion" label="接口版本">
            <Input placeholder="如 v1" />
          </Form.Item>
          <Form.Item name="authType" label="认证方式">
            <Select placeholder="请选择" options={[...PLATFORM_AUTH_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="timeoutMs" label="超时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 5000" />
          </Form.Item>
          <Form.Item name="slaMs" label="SLA(ms)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 2000" />
          </Form.Item>
          <Form.Item name="ownerName" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="apiStatus" label="接口状态">
            <Select placeholder="请选择" options={[...PLATFORM_API_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="接口说明">
            <Input.TextArea rows={2} placeholder="请输入接口说明" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 2. 接口版本记录 ---------------- */

interface VersionFormValues {
  recordNo?: string;
  apiCode?: string;
  apiName?: string;
  versionNo?: string;
  changeType?: string;
  compatibility?: string;
  changeLog?: string;
  releaseDate?: string;
  versionStatus?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

function ApiVersionTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<VersionFormValues>();
  const [data, setData] = useState<PlatformApiVersionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [changeType, setChangeType] = useState<string | undefined>(undefined);
  const [versionStatus, setVersionStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, ct = changeType, vs = versionStatus) => {
      setLoading(true);
      try {
        const res = await platformApiVersionService.pageRecords({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          changeType: ct,
          versionStatus: vs,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, changeType, versionStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      changeType: 'MINOR',
      compatibility: 'COMPATIBLE',
      versionStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: PlatformApiVersionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformApiVersionSaveParams = {
        ...values,
        apiCode: values.apiCode!,
        versionNo: values.versionNo!,
      };
      if (editId == null) {
        await platformApiVersionService.create(payload);
        message.success('版本记录已创建');
      } else {
        await platformApiVersionService.update(editId, payload);
        message.success('版本记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformApiVersionService.remove(id);
    message.success('版本记录已删除');
    void loadData();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
  };

  const columns: ColumnsType<PlatformApiVersionItem> = [
    { title: '记录编号', dataIndex: 'recordNo', width: 170, fixed: 'left', render: plain },
    { title: '接口编码', dataIndex: 'apiCode', width: 160, render: plain },
    { title: '接口名称', dataIndex: 'apiName', width: 170, render: plain },
    { title: '版本号', dataIndex: 'versionNo', width: 100, render: plain },
    { title: '变更类型', dataIndex: 'changeType', width: 110, render: (v) => enumText(PLATFORM_CHANGE_TYPE_LABEL, v) },
    {
      title: '兼容性',
      dataIndex: 'compatibility',
      width: 120,
      render: (v) => statusTag(PLATFORM_COMPATIBILITY_LABEL, v),
    },
    { title: '发布日期', dataIndex: 'releaseDate', width: 160, render: formatDateTime },
    {
      title: '版本状态',
      dataIndex: 'versionStatus',
      width: 100,
      render: (v) => statusTag(PLATFORM_VERSION_STATUS_LABEL, v),
    },
    { title: '操作人', dataIndex: 'operatorName', width: 100, render: plain },
    { title: '备注', dataIndex: 'remark', width: 140, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(API_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认发布该版本？" onConfirm={() => void act(platformApiVersionService.publish, record.id, '版本已发布')}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
            <Popconfirm title="确认生效该版本？" onConfirm={() => void act(platformApiVersionService.release, record.id, '版本已生效')}>
              <Button type="link" size="small">
                生效
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该版本记录？" onConfirm={() => void remove(record.id)}>
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
          <Form.Item label="变更类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={changeType}
              onChange={(v) => setChangeType(v)}
              options={[...PLATFORM_CHANGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="版本状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={versionStatus}
              onChange={(v) => setVersionStatus(v)}
              options={[...PLATFORM_VERSION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 接口编码 / 版本号"
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
                  void loadData(1, pageSize, keyword, changeType, versionStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setChangeType(undefined);
                  setVersionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(API_MANAGE) && <Button onClick={openCreate}>新建版本记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`接口版本记录（共 ${total} 条）`}>
        <Table<PlatformApiVersionItem>
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
        title={editId == null ? '新建版本记录' : '编辑版本记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="recordNo" label="记录编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="apiCode" label="接口编码" rules={[{ required: true, message: '请输入接口编码' }]}>
            <Input placeholder="请输入接口编码" />
          </Form.Item>
          <Form.Item name="apiName" label="接口名称">
            <Input placeholder="请输入接口名称" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号" rules={[{ required: true, message: '请输入版本号' }]}>
            <Input placeholder="如 v1.1.0" />
          </Form.Item>
          <Form.Item name="changeType" label="变更类型">
            <Select placeholder="请选择" options={[...PLATFORM_CHANGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="compatibility" label="兼容性">
            <Select placeholder="请选择" options={[...PLATFORM_COMPATIBILITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="changeLog" label="变更日志">
            <Input.TextArea rows={3} placeholder="请输入变更日志" />
          </Form.Item>
          <Form.Item name="releaseDate" label="发布日期">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空自动填充" />
          </Form.Item>
          <Form.Item name="versionStatus" label="版本状态">
            <Select placeholder="请选择" options={[...PLATFORM_VERSION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 页面 ---------------- */

const REGISTRY_STATS: { key: string; title: string }[] = [
  { key: 'total', title: '接口总数' },
  { key: 'draft', title: '草稿' },
  { key: 'active', title: '已发布' },
  { key: 'deprecated', title: '已废弃' },
  { key: 'offline', title: '已下线' },
  { key: 'inCount', title: '接收(IN)' },
  { key: 'outCount', title: '发布(OUT)' },
];

const VERSION_STATS: { key: string; title: string }[] = [
  { key: 'total', title: '版本总数' },
  { key: 'draft', title: '草稿' },
  { key: 'published', title: '已发布' },
  { key: 'released', title: '已生效' },
  { key: 'breakingCount', title: '破坏性变更' },
  { key: 'compatibleCount', title: '向后兼容' },
  { key: 'majorCount', title: '主版本' },
  { key: 'minorCount', title: '次版本' },
  { key: 'patchCount', title: '补丁' },
];

export default function PlatformApiRegistryPage() {
  const [registryStats, setRegistryStats] = useState<PlatformStats>({});
  const [versionStats, setVersionStats] = useState<PlatformStats>({});

  useEffect(() => {
    void platformApiRegistryService.stats().then((res) => setRegistryStats(res || {}));
    void platformApiVersionService.stats().then((res) => setVersionStats(res || {}));
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        接口注册中心
      </Title>

      <Card>
        <Tabs
          items={[
            {
              key: 'registry',
              label: '接口注册',
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space size="large" wrap>
                    {REGISTRY_STATS.map((s) => (
                      <Statistic key={s.key} title={s.title} value={Number(registryStats[s.key] ?? 0)} />
                    ))}
                  </Space>
                  <ApiRegistryTab />
                </Space>
              ),
            },
            {
              key: 'version',
              label: '接口版本记录',
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space size="large" wrap>
                    {VERSION_STATS.map((s) => (
                      <Statistic key={s.key} title={s.title} value={Number(versionStats[s.key] ?? 0)} />
                    ))}
                  </Space>
                  <ApiVersionTab />
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
}
