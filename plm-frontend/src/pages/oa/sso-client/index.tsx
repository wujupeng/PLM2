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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { oaSsoClientService } from '@/services/oaService';
import {
  OA_ENABLED_STATUS_COLOR,
  OA_ENABLED_STATUS_LABEL,
  OA_ENABLED_STATUS_OPTIONS,
  type OaSsoClientItem,
  type OaSsoClientQuery,
  type OaSsoClientSaveParams,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 授权类型候选，与后端 SsoClientService 支持的 grantType 对齐。 */
const GRANT_TYPE_OPTIONS = [
  { value: 'password', label: 'password（用户凭证换令牌）' },
  { value: 'client_credentials', label: 'client_credentials（客户端凭证换令牌）' },
  { value: 'refresh_token', label: 'refresh_token' },
];

interface SsoClientFormValues {
  clientId: string;
  clientSecret?: string;
  clientName: string;
  redirectUri?: string;
  grantTypes?: string[];
  scopes?: string;
  tokenTtlSeconds?: number;
  status?: string;
  remark?: string;
}

interface SsoClientSearchState {
  keyword?: string;
  status?: string;
}

export default function OaSsoClientPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<SsoClientFormValues>();

  const [data, setData] = useState<OaSsoClientItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SsoClientSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaSsoClientItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaSsoClientQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          status: cond.status || undefined,
        };
        const res = await oaSsoClientService.page(params);
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

  const onSearch = (values: SsoClientSearchState) => {
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
      grantTypes: ['client_credentials'],
      tokenTtlSeconds: 3600,
      status: 'enabled',
    });
    setModalOpen(true);
  };

  const openEdit = (record: OaSsoClientItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      clientId: record.clientId,
      clientSecret: undefined,
      clientName: record.clientName,
      redirectUri: record.redirectUri,
      grantTypes: record.grantTypes ? record.grantTypes.split(',').filter(Boolean) : [],
      scopes: record.scopes,
      tokenTtlSeconds: record.tokenTtlSeconds,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaSsoClientSaveParams = {
      clientId: values.clientId,
      clientSecret: values.clientSecret || undefined,
      clientName: values.clientName,
      redirectUri: values.redirectUri,
      grantTypes: values.grantTypes ? values.grantTypes.join(',') : undefined,
      scopes: values.scopes,
      tokenTtlSeconds: values.tokenTtlSeconds,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaSsoClientService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaSsoClientService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaSsoClientItem) => {
    await oaSsoClientService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<OaSsoClientItem> = [
    { title: '客户端 ID', dataIndex: 'clientId', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '客户端名称', dataIndex: 'clientName', width: 160, render: (v) => v || '-' },
    {
      title: '客户端密钥',
      dataIndex: 'clientSecret',
      width: 130,
      render: (v?: string) => (v ? '******' : '-'),
    },
    { title: '授权类型', dataIndex: 'grantTypes', width: 220, render: (v) => v || '-' },
    { title: '授权范围', dataIndex: 'scopes', width: 160, render: (v) => v || '-' },
    {
      title: '令牌有效期(秒)',
      dataIndex: 'tokenTtlSeconds',
      width: 130,
      render: (v) => v ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={OA_ENABLED_STATUS_COLOR[v]}>{OA_ENABLED_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '备注', dataIndex: 'remark', width: 220, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:sso:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:sso:delete') && (
            <Popconfirm title="确认删除该 SSO 客户端？" onConfirm={() => handleDelete(record)}>
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
        SSO 客户端
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="客户端">
            <Input placeholder="客户端 ID / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={OA_ENABLED_STATUS_OPTIONS} />
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
        title={`SSO 客户端列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:sso:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增客户端
            </Button>
          )
        }
      >
        <Table<OaSsoClientItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title={editing ? '编辑 SSO 客户端' : '新增 SSO 客户端'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="clientId"
            label="客户端 ID"
            rules={[{ required: true, message: '请输入客户端 ID' }]}
          >
            <Input placeholder="请输入客户端 ID" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="clientSecret"
            label="客户端密钥"
            extra={editing ? '留空表示不修改现有密钥' : undefined}
          >
            <Input.Password placeholder={editing ? '留空表示不修改' : '请输入客户端密钥'} />
          </Form.Item>
          <Form.Item
            name="clientName"
            label="客户端名称"
            rules={[{ required: true, message: '请输入客户端名称' }]}
          >
            <Input placeholder="请输入客户端名称" />
          </Form.Item>
          <Form.Item name="redirectUri" label="回调地址">
            <Input placeholder="请输入回调地址" />
          </Form.Item>
          <Form.Item
            name="grantTypes"
            label="授权类型"
            rules={[{ required: true, message: '请选择授权类型' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择授权类型"
              optionFilterProp="label"
              options={GRANT_TYPE_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="scopes" label="授权范围">
            <Input placeholder="多个范围以英文逗号分隔，如 openid,profile" />
          </Form.Item>
          <Form.Item name="tokenTtlSeconds" label="令牌有效期(秒)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 3600" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={OA_ENABLED_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
