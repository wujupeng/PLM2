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
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { erpSalesInvoiceService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INVOICE_STATUS_LABEL,
  ERP_INVOICE_STATUS_OPTIONS,
  ERP_INVOICE_TYPE_LABEL,
  ERP_INVOICE_TYPE_OPTIONS,
  type ErpSalesInvoice,
  type ErpSalesInvoiceSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:invoice:manage';

type FormValues = Omit<ErpSalesInvoiceSaveRequest, 'invoiceDate'> & {
  invoiceDate?: Dayjs;
};

export default function ErpSalesInvoicePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpSalesInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<string | undefined>(undefined);
  const [invoiceType, setInvoiceType] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = invoiceStatus,
      type = invoiceType,
      no = orderNo,
      customer = customerCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpSalesInvoiceService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          invoiceStatus: status,
          invoiceType: type,
          orderNo: no || undefined,
          customerCode: customer || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, invoiceStatus, invoiceType, orderNo, customerCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ invoiceType: 'SPECIAL', invoiceStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpSalesInvoice) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      invoiceDate: record.invoiceDate ? dayjs(record.invoiceDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        invoiceDate: values.invoiceDate ? values.invoiceDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpSalesInvoiceService.create(payload);
        message.success('销售发票已创建');
      } else {
        await erpSalesInvoiceService.update(editId, payload);
        message.success('销售发票已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpSalesInvoiceService.remove(id);
    message.success('销售发票已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpSalesInvoice> = [
    { title: '发票号', dataIndex: 'invoiceNo', width: 160, fixed: 'left', render: plain },
    {
      title: '发票类型',
      dataIndex: 'invoiceType',
      width: 130,
      render: (v) => statusTag(ERP_INVOICE_TYPE_LABEL, v),
    },
    { title: '发票代码', dataIndex: 'invoiceCode', width: 140, render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '发货单号', dataIndex: 'deliveryNo', width: 160, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 160, render: plain },
    { title: '开票日期', dataIndex: 'invoiceDate', width: 130, render: formatDateTime },
    { title: '开票金额', dataIndex: 'invoiceAmount', width: 120, render: plain },
    { title: '税率', dataIndex: 'taxRate', width: 100, render: plain },
    { title: '税额', dataIndex: 'taxAmount', width: 110, render: plain },
    { title: '不含税金额', dataIndex: 'netAmount', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '发票状态',
      dataIndex: 'invoiceStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_INVOICE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该销售发票？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        销售发票
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="发票状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={invoiceStatus}
              onChange={(v) => setInvoiceStatus(v)}
              options={[...ERP_INVOICE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="发票类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              value={invoiceType}
              onChange={(v) => setInvoiceType(v)}
              options={[...ERP_INVOICE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单号">
            <Input
              placeholder="请输入订单号"
              allowClear
              style={{ width: 160 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="客户编码">
            <Input
              placeholder="请输入客户编码"
              allowClear
              style={{ width: 160 }}
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="发票号 / 发票代码"
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
                  void loadData(1, pageSize, keyword, invoiceStatus, invoiceType, orderNo, customerCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInvoiceStatus(undefined);
                  setInvoiceType(undefined);
                  setOrderNo('');
                  setCustomerCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建销售发票</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`销售发票（共 ${total} 条）`}>
        <Table<ErpSalesInvoice>
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
        title={editId == null ? '新建销售发票' : '编辑销售发票'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="invoiceType" label="发票类型">
            <Select placeholder="为空默认 SPECIAL" options={[...ERP_INVOICE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="invoiceCode" label="发票代码">
            <Input placeholder="请输入发票代码" />
          </Form.Item>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="deliveryNo" label="发货单号">
            <Input placeholder="请输入发货单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="invoiceDate" label="开票日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择开票日期" />
          </Form.Item>
          <Form.Item name="invoiceAmount" label="开票金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入开票金额" />
          </Form.Item>
          <Form.Item name="taxRate" label="税率">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税率" />
          </Form.Item>
          <Form.Item name="taxAmount" label="税额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税额" />
          </Form.Item>
          <Form.Item name="netAmount" label="不含税金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入不含税金额" />
          </Form.Item>
          <Form.Item name="invoiceStatus" label="发票状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_INVOICE_STATUS_OPTIONS]} />
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
