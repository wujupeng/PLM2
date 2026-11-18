import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
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
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { packagingService } from '@/services/packagingService';
import type { PackagingItem, PackagingSaveParams } from '@/types/packaging';
import { SPEC_STATUS_LABEL, SPEC_STATUS_OPTIONS } from '@/types/spec';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 规格状态标签颜色（包装复用 draft/released/obsolete） */
const PACKAGING_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

interface PackagingFormValues {
  packagingCode: string;
  productCode?: string;
  productName?: string;
  customerCode?: string;
  versionNo?: string;
  packQty?: number;
  labelTemplateCode?: string;
  qrRuleKey?: string;
  packagingMaterial?: string;
  dimensionText?: string;
  specialRequirement?: string;
  status?: string;
  effectiveDate?: Dayjs;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  packagingCode?: string;
  productCode?: string;
  customerCode?: string;
  status?: string;
}

export default function PackagingPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<PackagingFormValues>();

  const [data, setData] = useState<PackagingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PackagingItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<PackagingItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await packagingService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          packagingCode: cond.packagingCode || undefined,
          productCode: cond.productCode || undefined,
          customerCode: cond.customerCode || undefined,
          status: cond.status || undefined,
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
    form.setFieldsValue({ status: 'draft', versionNo: 'V1' });
    setModalOpen(true);
  };

  const openEdit = (record: PackagingItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      packagingCode: record.packagingCode,
      productCode: record.productCode,
      productName: record.productName,
      customerCode: record.customerCode,
      versionNo: record.versionNo,
      packQty: record.packQty,
      labelTemplateCode: record.labelTemplateCode,
      qrRuleKey: record.qrRuleKey,
      packagingMaterial: record.packagingMaterial,
      dimensionText: record.dimensionText,
      specialRequirement: record.specialRequirement,
      status: record.status,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: PackagingSaveParams = {
      packagingCode: values.packagingCode,
      productCode: values.productCode,
      productName: values.productName,
      customerCode: values.customerCode,
      versionNo: values.versionNo,
      packQty: values.packQty,
      labelTemplateCode: values.labelTemplateCode,
      qrRuleKey: values.qrRuleKey,
      packagingMaterial: values.packagingMaterial,
      dimensionText: values.dimensionText,
      specialRequirement: values.specialRequirement,
      status: values.status,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await packagingService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await packagingService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: PackagingItem) => {
    await packagingService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleRelease = async (record: PackagingItem) => {
    await packagingService.release(record.id);
    message.success('已发布');
    void loadData();
  };

  const openDetail = async (record: PackagingItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await packagingService.detail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<PackagingItem> = [
    { title: '包装编码', dataIndex: 'packagingCode', width: 170 },
    { title: '产品编码', dataIndex: 'productCode', width: 140, render: (v) => v || '-' },
    { title: '产品名称', dataIndex: 'productName', width: 160, render: (v) => v || '-' },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'versionNo', width: 90, render: (v) => v || '-' },
    { title: '包装数量', dataIndex: 'packQty', width: 100, render: (v) => (v ?? '-') },
    { title: '标签模板', dataIndex: 'labelTemplateCode', width: 140, render: (v) => v || '-' },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={PACKAGING_STATUS_COLOR[v] || 'default'}>{SPEC_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {hasPermission('packaging:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('packaging:update') && (
            <Popconfirm title="确认发布该包装规格？" onConfirm={() => handleRelease(record)}>
              <Button type="link" size="small" disabled={record.status === 'released'}>
                发布
              </Button>
            </Popconfirm>
          )}
          {hasPermission('packaging:delete') && (
            <Popconfirm title="确认删除该包装规格？" onConfirm={() => handleDelete(record)}>
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
        包装标签
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="包装编码 / 产品名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="packagingCode" label="包装编码">
            <Input placeholder="包装编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="按产品筛选" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="客户编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={SPEC_STATUS_OPTIONS} />
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
        title={`包装标签列表（共 ${total} 条）`}
        extra={
          hasPermission('packaging:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增包装规格
            </Button>
          )
        }
      >
        <Table<PackagingItem>
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

      {/* 新增/编辑包装规格 */}
      <Modal
        title={editing ? '编辑包装规格' : '新增包装规格'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="packagingCode"
            label="包装编码"
            rules={[{ required: true, message: '请输入包装编码' }]}
          >
            <Input placeholder="请输入包装编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="缺省为 V1" />
          </Form.Item>
          <Form.Item name="packQty" label="包装数量">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="labelTemplateCode" label="标签模板编码">
            <Input placeholder="请输入标签模板编码" />
          </Form.Item>
          <Form.Item name="qrRuleKey" label="二维码规则键">
            <Input placeholder="请输入二维码规则键" />
          </Form.Item>
          <Form.Item name="packagingMaterial" label="包装材料">
            <Input placeholder="请输入包装材料" />
          </Form.Item>
          <Form.Item name="dimensionText" label="尺寸描述">
            <Input placeholder="请输入尺寸描述" />
          </Form.Item>
          <Form.Item name="specialRequirement" label="特殊要求">
            <Input.TextArea rows={2} placeholder="请输入特殊要求" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={SPEC_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 包装规格详情 */}
      <Drawer
        title={`包装规格详情 - ${detail?.packagingCode || ''}`}
        width={760}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Card size="small" title="基本信息" loading={detailLoading}>
          {detail && (
            <Descriptions
              size="small"
              bordered
              column={2}
              items={[
                { key: 'packagingCode', label: '包装编码', children: detail.packagingCode },
                { key: 'productCode', label: '产品编码', children: detail.productCode || '-' },
                { key: 'productName', label: '产品名称', children: detail.productName || '-' },
                { key: 'customerCode', label: '客户编码', children: detail.customerCode || '-' },
                { key: 'versionNo', label: '版本号', children: detail.versionNo || '-' },
                { key: 'packQty', label: '包装数量', children: detail.packQty ?? '-' },
                { key: 'labelTemplateCode', label: '标签模板编码', children: detail.labelTemplateCode || '-' },
                { key: 'qrRuleKey', label: '二维码规则键', children: detail.qrRuleKey || '-' },
                { key: 'packagingMaterial', label: '包装材料', children: detail.packagingMaterial || '-' },
                { key: 'dimensionText', label: '尺寸描述', children: detail.dimensionText || '-' },
                {
                  key: 'effectiveDate',
                  label: '生效日期',
                  children: detail.effectiveDate ? dayjs(detail.effectiveDate).format('YYYY-MM-DD') : '-',
                },
                {
                  key: 'status',
                  label: '状态',
                  children: (
                    <Tag color={PACKAGING_STATUS_COLOR[detail.status || ''] || 'default'}>
                      {SPEC_STATUS_LABEL[detail.status || ''] || detail.status}
                    </Tag>
                  ),
                },
                { key: 'specialRequirement', label: '特殊要求', children: detail.specialRequirement || '-' },
                { key: 'remark', label: '备注', children: detail.remark || '-' },
              ]}
            />
          )}
        </Card>
      </Drawer>
    </Space>
  );
}
