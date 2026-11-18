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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { supplierService } from '@/services/masterDataService';
import type { SupplierItem, SupplierSaveParams } from '@/types/masterData';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface SearchState {
  keyword?: string;
  status?: number;
}

export default function SuppliersPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<SupplierSaveParams>();

  const [data, setData] = useState<SupplierItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await supplierService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          status: cond.status,
        });
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
    form.setFieldsValue({ status: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: SupplierItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      supplierCode: record.supplierCode,
      supplierName: record.supplierName,
      contact: record.contact,
      phone: record.phone,
      email: record.email,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        await supplierService.update(editing.id, values);
        message.success('更新成功');
      } else {
        await supplierService.create(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: SupplierItem) => {
    await supplierService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<SupplierItem> = [
    { title: '供应商编码', dataIndex: 'supplierCode', width: 160 },
    { title: '供应商名称', dataIndex: 'supplierName', width: 200 },
    { title: '联系人', dataIndex: 'contact', width: 130, render: (v) => v || '-' },
    { title: '联系电话', dataIndex: 'phone', width: 150, render: (v) => v || '-' },
    { title: '邮箱', dataIndex: 'email', width: 200, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: number) => (v === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag>),
    },
    { title: '备注', dataIndex: 'remark', render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('supplier:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('supplier:delete') && (
            <Popconfirm title="确认删除该供应商？" onConfirm={() => handleDelete(record)}>
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
        供应商
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="供应商编码 / 名称" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '停用' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
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
        title={`供应商列表（共 ${total} 条）`}
        extra={
          hasPermission('supplier:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增供应商
            </Button>
          )
        }
      >
        <Table<SupplierItem>
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
        title={editing ? '编辑供应商' : '新增供应商'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="supplierCode"
            label="供应商编码"
            rules={[{ required: true, message: '请输入供应商编码' }]}
          >
            <Input placeholder="请输入供应商编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="supplierName"
            label="供应商名称"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '停用' },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
