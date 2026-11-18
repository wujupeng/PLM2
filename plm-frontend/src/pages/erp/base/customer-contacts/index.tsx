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
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { erpCustomerContactService } from '@/services/erpBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_ACTIVE_STATUS_LABEL,
  ERP_ACTIVE_STATUS_OPTIONS,
  type ErpCustomerContact,
  type ErpCustomerContactSaveRequest,
} from '@/types/erpBase';

const { Title } = Typography;

const MANAGE = 'erp:base:customercontact:manage';

const PRIMARY_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false },
] as const;

const primaryText = (v: unknown): string => (v == null ? '-' : v ? '是' : '否');

export default function ErpCustomerContactPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpCustomerContactSaveRequest>();
  const [data, setData] = useState<ErpCustomerContact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [contactStatus, setContactStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      cCode = customerCode,
      cStatus = contactStatus,
    ) => {
      setLoading(true);
      try {
        const res = await erpCustomerContactService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          customerCode: cCode || undefined,
          contactStatus: cStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, customerCode, contactStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ isPrimary: false, contactStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: ErpCustomerContact) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpCustomerContactService.create(values);
        message.success('客户联系人已创建');
      } else {
        await erpCustomerContactService.update(editId, values);
        message.success('客户联系人已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpCustomerContactService.remove(id);
    message.success('客户联系人已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpCustomerContact> = [
    { title: '联系人编号', dataIndex: 'contactNo', width: 160, fixed: 'left', render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: plain },
    { title: '联系人姓名', dataIndex: 'contactName', width: 140, render: plain },
    { title: '职位', dataIndex: 'positionName', width: 140, render: plain },
    { title: '联系电话', dataIndex: 'phone', width: 150, render: plain },
    { title: '邮箱', dataIndex: 'email', width: 200, ellipsis: true, render: plain },
    { title: '主联系人', dataIndex: 'isPrimary', width: 100, render: primaryText },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '联系人状态',
      dataIndex: 'contactStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_ACTIVE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该客户联系人？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        客户联系人
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="客户编码">
            <Input
              placeholder="请输入客户编码"
              allowClear
              style={{ width: 160 }}
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="联系人状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={contactStatus}
              onChange={(v) => setContactStatus(v)}
              options={[...ERP_ACTIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="联系人编号 / 姓名"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(1, pageSize, keyword, customerCode, contactStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCustomerCode('');
                  setContactStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建客户联系人</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`客户联系人（共 ${total} 条）`}>
        <Table<ErpCustomerContact>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建客户联系人' : '编辑客户联系人'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="contactNo" label="联系人编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="contactName" label="联系人姓名" rules={[{ required: true, message: '请输入联系人姓名' }]}>
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>
          <Form.Item name="positionName" label="职位">
            <Input placeholder="请输入职位" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="isPrimary" label="主联系人">
            <Select placeholder="为空默认否" options={[...PRIMARY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="contactStatus" label="联系人状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_ACTIVE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
