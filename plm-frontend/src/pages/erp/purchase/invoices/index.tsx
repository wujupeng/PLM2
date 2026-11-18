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
import { erpPurchaseInvoiceService } from '@/services/erpPurchaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PURCHASE_INVOICE_STATUS_LABEL,
  ERP_PURCHASE_INVOICE_STATUS_OPTIONS,
  ERP_PURCHASE_INVOICE_TYPE_LABEL,
  ERP_PURCHASE_INVOICE_TYPE_OPTIONS,
  type ErpPurchaseInvoice,
  type ErpPurchaseInvoiceSaveRequest,
} from '@/types/erpPurchase';

const { Title } = Typography;

const MANAGE = 'erp:purchase:invoice:manage';

type FormValues = Omit<ErpPurchaseInvoiceSaveRequest, 'invoiceDate'> & {
  invoiceDate?: Dayjs;
};

export default function ErpPurchaseInvoicePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpPurchaseInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<string | undefined>(undefined);
  const [invoiceType, setInvoiceType] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
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
      supplier = supplierCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpPurchaseInvoiceService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          invoiceStatus: status,
          invoiceType: type,
          orderNo: no || undefined,
          supplierCode: supplier || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, invoiceStatus, invoiceType, orderNo, supplierCode],
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

  const openEdit = (record: ErpPurchaseInvoice) => {
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
        await erpPurchaseInvoiceService.create(payload);
        message.success('采购发票已创建');
      } else {
        await erpPurchaseInvoiceService.update(editId, payload);
        message.success('采购发票已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpPurchaseInvoiceService.remove(id);
    message.success('采购发票已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpPurchaseInvoice> = [
    { title: '发票号', dataIndex: 'invoiceNo', width: 160, fixed: 'left', render: plain },
    {
      title: '发票类型',
      dataIndex: 'invoiceType',
      width: 160,
      render: (v) => statusTag(ERP_PURCHASE_INVOICE_TYPE_LABEL, v),
    },
    { title: '发票代码', dataIndex: 'invoiceCode', width: 140, render: plain },
    { title: '采购订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '到货单号', dataIndex: 'receiptNo', width: 160, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 130, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '开票日期', dataIndex: 'invoiceDate', width: 130, render: formatDateTime },
    { title: '发票金额', dataIndex: 'invoiceAmount', width: 120, render: plain },
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
      render: (v) => statusTag(ERP_PURCHASE_INVOICE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该采购发票？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        采购发票
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
              options={[...ERP_PURCHASE_INVOICE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="发票类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 180 }}
              value={invoiceType}
              onChange={(v) => setInvoiceType(v)}
              options={[...ERP_PURCHASE_INVOICE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="采购订单号">
            <Input
              placeholder="请输入采购订单号"
              allowClear
              style={{ width: 160 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="供应商编码">
            <Input
              placeholder="请输入供应商编码"
              allowClear
              style={{ width: 160 }}
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="发票号 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, invoiceStatus, invoiceType, orderNo, supplierCode);
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
                  setSupplierCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建发票</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采购发票（共 ${total} 条）`}>
        <Table<ErpPurchaseInvoice>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建发票' : '编辑发票'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="invoiceNo" label="发票号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="invoiceType" label="发票类型">
            <Select placeholder="为空默认 SPECIAL" options={[...ERP_PURCHASE_INVOICE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="invoiceCode" label="发票代码">
            <Input placeholder="请输入发票代码" />
          </Form.Item>
          <Form.Item name="orderNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
          </Form.Item>
          <Form.Item name="receiptNo" label="到货单号">
            <Input placeholder="请输入到货单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="invoiceDate" label="开票日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择开票日期" />
          </Form.Item>
          <Form.Item name="invoiceAmount" label="发票金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入发票金额" />
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
            <Select placeholder="为空默认 DRAFT" options={[...ERP_PURCHASE_INVOICE_STATUS_OPTIONS]} />
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
