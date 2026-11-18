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
import dayjs from 'dayjs';
import { ediService } from '@/services/ediService';
import {
  EDI_FLAG_OPTIONS,
  EDI_SEND_CHANNEL_LABEL,
  EDI_SEND_CHANNEL_OPTIONS,
  type EdiSupplierMaterialItem,
  type EdiSupplierMaterialQuery,
  type EdiSupplierMaterialSaveParams,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface EdiSupplierMaterialFormValues {
  supplierCode: string;
  supplierName?: string;
  materialCode: string;
  sharePct?: number;
  leadTimeDays?: number;
  priority?: number;
  sendChannel?: string;
  status?: number;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  supplierCode?: string;
  materialCode?: string;
  status?: number;
}

export default function EdiSupplierMaterialPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<EdiSupplierMaterialFormValues>();

  const [data, setData] = useState<EdiSupplierMaterialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EdiSupplierMaterialItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: EdiSupplierMaterialQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          supplierCode: cond.supplierCode || undefined,
          materialCode: cond.materialCode || undefined,
          status: cond.status,
        };
        const res = await ediService.supplierMaterialPage(params);
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
    form.setFieldsValue({ sendChannel: 'API', status: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: EdiSupplierMaterialItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      supplierCode: record.supplierCode,
      supplierName: record.supplierName,
      materialCode: record.materialCode,
      sharePct: record.sharePct,
      leadTimeDays: record.leadTimeDays,
      priority: record.priority,
      sendChannel: record.sendChannel,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: EdiSupplierMaterialSaveParams = {
      supplierCode: values.supplierCode,
      supplierName: values.supplierName,
      materialCode: values.materialCode,
      sharePct: values.sharePct,
      leadTimeDays: values.leadTimeDays,
      priority: values.priority,
      sendChannel: values.sendChannel,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await ediService.supplierMaterialUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await ediService.supplierMaterialCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: EdiSupplierMaterialItem) => {
    await ediService.supplierMaterialRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<EdiSupplierMaterialItem> = [
    { title: '供应商编码', dataIndex: 'supplierCode', width: 140, render: (v) => v || '-' },
    { title: '供应商名称', dataIndex: 'supplierName', width: 180, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    {
      title: '供货份额',
      dataIndex: 'sharePct',
      width: 110,
      render: (v?: number) => (v != null ? `${v}%` : '-'),
    },
    { title: '交付提前期（天）', dataIndex: 'leadTimeDays', width: 140, render: (v) => (v ?? '-') },
    { title: '优先级', dataIndex: 'priority', width: 90, render: (v) => (v ?? '-') },
    {
      title: '发送渠道',
      dataIndex: 'sendChannel',
      width: 110,
      render: (v?: string) => (v ? EDI_SEND_CHANNEL_LABEL[v] || v : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">启用</Tag> : v === 0 ? <Tag color="error">停用</Tag> : '-',
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
          {hasPermission('edi:suppliermaterial:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('edi:suppliermaterial:save') && (
            <Popconfirm title="确认删除该供货关系？" onConfirm={() => handleDelete(record)}>
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
        供应商供货关系
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="供应商 / 物料" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={EDI_FLAG_OPTIONS} />
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
        title={`供应商供货关系列表（共 ${total} 条）`}
        extra={
          hasPermission('edi:suppliermaterial:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增供货关系
            </Button>
          )
        }
      >
        <Table<EdiSupplierMaterialItem>
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

      {/* 新增/编辑供货关系 */}
      <Modal
        title={editing ? '编辑供货关系' : '新增供货关系'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="sharePct" label="供货份额（%）">
            <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="请输入供货份额" />
          </Form.Item>
          <Form.Item name="leadTimeDays" label="交付提前期（天）">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入交付提前期" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入优先级" />
          </Form.Item>
          <Form.Item name="sendChannel" label="发送渠道">
            <Select placeholder="请选择" options={EDI_SEND_CHANNEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={EDI_FLAG_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
