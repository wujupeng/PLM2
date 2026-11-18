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
import { productService } from '@/services/masterDataService';
import type { ProductItem, ProductSaveParams } from '@/types/masterData';
import { PRODUCT_STATUS_OPTIONS, PRODUCT_STATUS_TEXT } from '@/types/masterData';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

interface SearchState {
  keyword?: string;
  seriesCode?: string;
  customerCode?: string;
  status?: string;
}

export default function ProductsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ProductSaveParams>();

  const [data, setData] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await productService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          seriesCode: cond.seriesCode || undefined,
          customerCode: cond.customerCode || undefined,
          status: (cond.status as ProductItem['status']) || undefined,
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
    form.setFieldsValue({ status: 'draft' });
    setModalOpen(true);
  };

  const openEdit = (record: ProductItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      productCode: record.productCode,
      productName: record.productName,
      seriesCode: record.seriesCode,
      seriesName: record.seriesName,
      customerCode: record.customerCode,
      model: record.model,
      status: record.status,
      description: record.description,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        await productService.update(editing.id, values);
        message.success('更新成功');
      } else {
        await productService.create(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: ProductItem) => {
    await productService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<ProductItem> = [
    { title: '产品编码', dataIndex: 'productCode', width: 160 },
    { title: '产品名称', dataIndex: 'productName', width: 180 },
    { title: '系列编码', dataIndex: 'seriesCode', width: 130, render: (v) => v || '-' },
    { title: '系列名称', dataIndex: 'seriesName', width: 150, render: (v) => v || '-' },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: (v) => v || '-' },
    { title: '型号', dataIndex: 'model', width: 140, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => <Tag color={STATUS_COLOR[v] || 'default'}>{PRODUCT_STATUS_TEXT[v] || v}</Tag>,
    },
    { title: '描述', dataIndex: 'description', width: 200, render: (v) => v || '-' },
    { title: '备注', dataIndex: 'remark', width: 160, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('product:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('product:delete') && (
            <Popconfirm title="确认删除该产品型号？" onConfirm={() => handleDelete(record)}>
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
        产品型号
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="产品编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="seriesCode" label="系列编码">
            <Input placeholder="请输入系列编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={PRODUCT_STATUS_OPTIONS} />
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
        title={`产品型号列表（共 ${total} 条）`}
        extra={
          hasPermission('product:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增产品型号
            </Button>
          )
        }
      >
        <Table<ProductItem>
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
        title={editing ? '编辑产品型号' : '新增产品型号'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="seriesCode" label="系列编码">
            <Input placeholder="请输入系列编码" />
          </Form.Item>
          <Form.Item name="seriesName" label="系列名称">
            <Input placeholder="请输入系列名称" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="model" label="型号">
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select options={PRODUCT_STATUS_OPTIONS} />
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
