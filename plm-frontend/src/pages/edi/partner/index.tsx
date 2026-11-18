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
import { ediService } from '@/services/ediService';
import {
  EDI_ENABLED_COLOR,
  EDI_ENABLED_LABEL,
  EDI_ENABLED_OPTIONS,
  EDI_PARTNER_TYPE_COLOR,
  EDI_PARTNER_TYPE_LABEL,
  EDI_PARTNER_TYPE_OPTIONS,
  EDI_PROTOCOL_OPTIONS,
  type EdiPartnerItem,
  type EdiPartnerQuery,
  type EdiPartnerSaveParams,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface EdiPartnerFormValues {
  partnerCode: string;
  partnerName: string;
  partnerType?: string;
  partnerId?: string;
  protocol?: string;
  endpoint?: string;
  port?: number;
  remotePath?: string;
  username?: string;
  secretRef?: string;
  certSubject?: string;
  certExpireDate?: dayjs.Dayjs;
  charset?: string;
  contact?: string;
  email?: string;
  status?: string;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  partnerType?: string;
  protocol?: string;
  status?: string;
}

export default function EdiPartnerPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<EdiPartnerFormValues>();

  const [data, setData] = useState<EdiPartnerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EdiPartnerItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: EdiPartnerQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          partnerType: cond.partnerType || undefined,
          protocol: cond.protocol || undefined,
          status: cond.status || undefined,
        };
        const res = await ediService.partnerPage(params);
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

  const onSearch = (values: SearchState) => {
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
    form.setFieldsValue({ partnerType: 'CUSTOMER', protocol: 'SFTP', charset: 'UTF-8', status: 'enabled' });
    setModalOpen(true);
  };

  const openEdit = (record: EdiPartnerItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      partnerCode: record.partnerCode,
      partnerName: record.partnerName,
      partnerType: record.partnerType,
      partnerId: record.partnerId,
      protocol: record.protocol,
      endpoint: record.endpoint,
      port: record.port,
      remotePath: record.remotePath,
      username: record.username,
      secretRef: record.secretRef,
      certSubject: record.certSubject,
      certExpireDate: record.certExpireDate ? dayjs(record.certExpireDate) : undefined,
      charset: record.charset,
      contact: record.contact,
      email: record.email,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: EdiPartnerSaveParams = {
      partnerCode: values.partnerCode,
      partnerName: values.partnerName,
      partnerType: values.partnerType,
      partnerId: values.partnerId,
      protocol: values.protocol,
      endpoint: values.endpoint,
      port: values.port,
      remotePath: values.remotePath,
      username: values.username,
      secretRef: values.secretRef,
      certSubject: values.certSubject,
      certExpireDate: values.certExpireDate ? values.certExpireDate.format('YYYY-MM-DD') : undefined,
      charset: values.charset,
      contact: values.contact,
      email: values.email,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await ediService.partnerUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await ediService.partnerCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: EdiPartnerItem) => {
    await ediService.partnerRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<EdiPartnerItem> = [
    { title: '伙伴编码', dataIndex: 'partnerCode', width: 140, render: (v) => v || '-' },
    { title: '伙伴名称', dataIndex: 'partnerName', width: 180, render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'partnerType',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={EDI_PARTNER_TYPE_COLOR[v]}>{EDI_PARTNER_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    { title: '传输协议', dataIndex: 'protocol', width: 110, render: (v) => v || '-' },
    { title: '接入地址', dataIndex: 'endpoint', width: 200, render: (v) => v || '-' },
    { title: '端口', dataIndex: 'port', width: 80, render: (v) => (v ?? '-') },
    { title: '联系人', dataIndex: 'contact', width: 110, render: (v) => v || '-' },
    { title: '邮箱', dataIndex: 'email', width: 180, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={EDI_ENABLED_COLOR[v]}>{EDI_ENABLED_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '证书到期',
      dataIndex: 'certExpireDate',
      width: 120,
      render: (v?: string) => v || '-',
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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('edi:partner:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('edi:partner:delete') && (
            <Popconfirm title="确认删除该 EDI 伙伴？" onConfirm={() => handleDelete(record)}>
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
        EDI 伙伴与通道
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="伙伴编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="partnerType" label="伙伴类型">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={EDI_PARTNER_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="protocol" label="传输协议">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={EDI_PROTOCOL_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={EDI_ENABLED_OPTIONS} />
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
        title={`EDI 伙伴列表（共 ${total} 条）`}
        extra={
          hasPermission('edi:partner:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增伙伴
            </Button>
          )
        }
      >
        <Table<EdiPartnerItem>
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

      {/* 新增/编辑伙伴 */}
      <Modal
        title={editing ? '编辑 EDI 伙伴' : '新增 EDI 伙伴'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="partnerCode" label="伙伴编码" rules={[{ required: true, message: '请输入伙伴编码' }]}>
            <Input placeholder="请输入伙伴编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="partnerName" label="伙伴名称" rules={[{ required: true, message: '请输入伙伴名称' }]}>
            <Input placeholder="请输入伙伴名称" />
          </Form.Item>
          <Form.Item name="partnerType" label="伙伴类型">
            <Select placeholder="请选择" options={EDI_PARTNER_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="partnerId" label="伙伴标识">
            <Input placeholder="请输入伙伴标识" />
          </Form.Item>
          <Form.Item name="protocol" label="传输协议">
            <Select placeholder="请选择" options={EDI_PROTOCOL_OPTIONS} />
          </Form.Item>
          <Form.Item name="endpoint" label="接入地址">
            <Input placeholder="请输入接入地址" />
          </Form.Item>
          <Form.Item name="port" label="端口">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入端口" />
          </Form.Item>
          <Form.Item name="remotePath" label="远程路径">
            <Input placeholder="请输入远程路径" />
          </Form.Item>
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="secretRef" label="凭证引用">
            <Input placeholder="请输入凭证引用" />
          </Form.Item>
          <Form.Item name="certSubject" label="证书主题">
            <Input placeholder="请输入证书主题" />
          </Form.Item>
          <Form.Item name="certExpireDate" label="证书到期日">
            <DatePicker style={{ width: '100%' }} placeholder="请选择证书到期日" />
          </Form.Item>
          <Form.Item name="charset" label="字符集">
            <Input placeholder="请输入字符集" />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={EDI_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
