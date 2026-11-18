import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { iamSsoProviderService } from '@/services/iamService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/iam/shared';
import {
  IAM_PROTOCOL_LABEL,
  IAM_PROTOCOL_OPTIONS,
  IAM_PROVIDER_STATUS_LABEL,
  IAM_PROVIDER_STATUS_OPTIONS,
  type IamSsoProviderItem,
  type IamSsoProviderSaveParams,
  type IamSsoProviderStats,
} from '@/types/iam';

const { Title } = Typography;

const SSO_MANAGE = 'platform:iam:ssoprovider:manage';

export default function IamSsoProviderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IamSsoProviderSaveParams>();
  const [data, setData] = useState<IamSsoProviderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [protocol, setProtocol] = useState<string | undefined>(undefined);
  const [providerStatus, setProviderStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<IamSsoProviderStats>({});

  const loadStats = useCallback(async () => {
    const res = await iamSsoProviderService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, proto = protocol, pstatus = providerStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await iamSsoProviderService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          protocol: proto,
          providerStatus: pstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, protocol, providerStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ protocol: 'SAML', protocolVer: '2.0', providerStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: IamSsoProviderItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IamSsoProviderSaveParams = { ...values, providerName: values.providerName! };
      if (editId == null) {
        await iamSsoProviderService.create(payload);
        message.success('SSO 提供方已创建');
      } else {
        await iamSsoProviderService.update(editId, payload);
        message.success('SSO 提供方已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await iamSsoProviderService.remove(id);
    message.success('SSO 提供方已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<IamSsoProviderItem> = [
    { title: '提供方编码', dataIndex: 'providerCode', width: 170, fixed: 'left', render: plain },
    { title: '提供方名称', dataIndex: 'providerName', width: 180, render: plain },
    { title: '协议', dataIndex: 'protocol', width: 100, render: (v) => enumText(IAM_PROTOCOL_LABEL, v) },
    { title: '协议版本', dataIndex: 'protocolVer', width: 100, render: plain },
    { title: '签发方', dataIndex: 'issuer', width: 180, ellipsis: true, render: plain },
    { title: 'SSO 地址', dataIndex: 'ssoUrl', width: 200, ellipsis: true, render: plain },
    { title: '登出地址', dataIndex: 'logoutUrl', width: 200, ellipsis: true, render: plain },
    { title: '元数据地址', dataIndex: 'metadataUrl', width: 200, ellipsis: true, render: plain },
    { title: '客户端 ID', dataIndex: 'clientId', width: 160, render: plain },
    { title: '证书算法', dataIndex: 'certificateAlgo', width: 120, render: plain },
    { title: '最近同步', dataIndex: 'lastSyncAt', width: 160, render: formatDateTime },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '提供方状态',
      dataIndex: 'providerStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(IAM_PROVIDER_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(SSO_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该 SSO 提供方？"
              onConfirm={() => void act(iamSsoProviderService.publish, record.id, 'SSO 提供方已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该 SSO 提供方？"
              onConfirm={() => void act(iamSsoProviderService.disable, record.id, 'SSO 提供方已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该 SSO 提供方？" onConfirm={() => void remove(record.id)}>
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
      <Title level={4} style={{ margin: 0 }}>
        单点登录
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="提供方总数" value={Number(stats.total ?? 0)} />
          <Statistic title="草稿" value={Number(stats.draft ?? 0)} />
          <Statistic title="已启用" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="协议">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={protocol}
              onChange={(v) => setProtocol(v)}
              options={[...IAM_PROTOCOL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="提供方状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={providerStatus}
              onChange={(v) => setProviderStatus(v)}
              options={[...IAM_PROVIDER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="提供方编码 / 名称 / 签发方"
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
                  void loadData(1, pageSize, keyword, protocol, providerStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setProtocol(undefined);
                  setProviderStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(SSO_MANAGE) && <Button onClick={openCreate}>新建提供方</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`单点登录提供方（共 ${total} 条）`}>
        <Table<IamSsoProviderItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2600 }}
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
        title={editId == null ? '新建 SSO 提供方' : '编辑 SSO 提供方'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="providerCode" label="提供方编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="providerName" label="提供方名称" rules={[{ required: true, message: '请输入提供方名称' }]}>
            <Input placeholder="请输入提供方名称" />
          </Form.Item>
          <Form.Item name="protocol" label="协议">
            <Select placeholder="请选择" options={[...IAM_PROTOCOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="protocolVer" label="协议版本">
            <Input placeholder="如 2.0" />
          </Form.Item>
          <Form.Item name="issuer" label="签发方">
            <Input placeholder="请输入签发方" />
          </Form.Item>
          <Form.Item name="ssoUrl" label="SSO 地址">
            <Input placeholder="请输入 SSO 地址" />
          </Form.Item>
          <Form.Item name="logoutUrl" label="登出地址">
            <Input placeholder="请输入登出地址" />
          </Form.Item>
          <Form.Item name="metadataUrl" label="元数据地址">
            <Input placeholder="请输入元数据地址" />
          </Form.Item>
          <Form.Item name="clientId" label="客户端 ID">
            <Input placeholder="请输入客户端 ID" />
          </Form.Item>
          <Form.Item name="certificateAlgo" label="证书算法">
            <Input placeholder="如 RSA-SHA256" />
          </Form.Item>
          <Form.Item name="providerStatus" label="提供方状态">
            <Select placeholder="请选择" options={[...IAM_PROVIDER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="lastSyncAt" label="最近同步时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
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
