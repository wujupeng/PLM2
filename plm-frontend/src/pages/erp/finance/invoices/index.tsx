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
import { erpFinanceInvoiceService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_INVOICE_DIRECTION_LABEL,
  ERP_FINANCE_INVOICE_DIRECTION_OPTIONS,
  ERP_FINANCE_INVOICE_STATUS_LABEL,
  ERP_FINANCE_INVOICE_STATUS_OPTIONS,
  ERP_FINANCE_INVOICE_TYPE_LABEL,
  ERP_FINANCE_INVOICE_TYPE_OPTIONS,
  ERP_FINANCE_INVOICE_VERIFY_STATUS_LABEL,
  ERP_FINANCE_INVOICE_VERIFY_STATUS_OPTIONS,
  ERP_FINANCE_PARTY_TYPE_OPTIONS,
  ERP_FINANCE_PARTY_TYPE_LABEL,
  type ErpFinanceInvoice,
  type ErpFinanceInvoiceQuery,
  type ErpFinanceInvoiceSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:invoice:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinanceInvoiceSaveRequest, 'invoiceDate'> & {
  invoiceDate?: Dayjs;
};

export default function ErpFinanceInvoicePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinanceInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [invoiceType, setInvoiceType] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<string | undefined>(undefined);
  const [invoiceStatus, setInvoiceStatus] = useState<string | undefined>(undefined);
  const [verifyStatus, setVerifyStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = invoiceType,
      dir = direction,
      invStatus = invoiceStatus,
      verStatus = verifyStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinanceInvoiceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          invoiceType: type,
          direction: dir,
          invoiceStatus: invStatus,
          verifyStatus: verStatus,
        };
        const res = await erpFinanceInvoiceService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, invoiceType, direction, invoiceStatus, verifyStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      invoiceType: 'VAT_SPECIAL',
      direction: 'OUT',
      partyType: 'CUSTOMER',
      currencyCode: 'CNY',
      verifyStatus: 'UNVERIFIED',
      invoiceStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpFinanceInvoice) => {
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
      const payload: ErpFinanceInvoiceSaveRequest = {
        ...values,
        invoiceDate: values.invoiceDate ? values.invoiceDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinanceInvoiceService.create(payload);
        message.success('发票登记已创建');
      } else {
        await erpFinanceInvoiceService.update(editId, payload);
        message.success('发票登记已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinanceInvoiceService.remove(id);
    message.success('发票登记已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinanceInvoice> = [
    { title: '发票号码', dataIndex: 'invoiceNo', width: 150, fixed: 'left', render: plain },
    { title: '发票代码', dataIndex: 'invoiceCode', width: 140, render: plain },
    {
      title: '发票类型',
      dataIndex: 'invoiceType',
      width: 150,
      render: (v) => statusTag(ERP_FINANCE_INVOICE_TYPE_LABEL, v),
    },
    {
      title: '收发方向',
      dataIndex: 'direction',
      width: 100,
      render: (v) => statusTag(ERP_FINANCE_INVOICE_DIRECTION_LABEL, v),
    },
    {
      title: '往来单位类型',
      dataIndex: 'partyType',
      width: 120,
      render: (v) => statusTag(ERP_FINANCE_PARTY_TYPE_LABEL, v),
    },
    { title: '往来单位编码', dataIndex: 'partyCode', width: 130, render: plain },
    { title: '往来单位名称', dataIndex: 'partyName', width: 160, render: plain },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '不含税金额', dataIndex: 'amount', width: 110, render: plain },
    { title: '税率', dataIndex: 'taxRate', width: 90, render: plain },
    { title: '税额', dataIndex: 'taxAmount', width: 100, render: plain },
    { title: '价税合计', dataIndex: 'totalAmount', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '开票日期', dataIndex: 'invoiceDate', width: 120, render: plain },
    {
      title: '查验状态',
      dataIndex: 'verifyStatus',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_INVOICE_VERIFY_STATUS_LABEL, v),
    },
    {
      title: '发票状态',
      dataIndex: 'invoiceStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_INVOICE_STATUS_LABEL, v),
    },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该发票登记？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        发票登记
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="发票类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={invoiceType}
              onChange={(v) => setInvoiceType(v)}
              options={[...ERP_FINANCE_INVOICE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="收发方向">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={direction}
              onChange={(v) => setDirection(v)}
              options={[...ERP_FINANCE_INVOICE_DIRECTION_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="发票状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={invoiceStatus}
              onChange={(v) => setInvoiceStatus(v)}
              options={[...ERP_FINANCE_INVOICE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="查验状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={verifyStatus}
              onChange={(v) => setVerifyStatus(v)}
              options={[...ERP_FINANCE_INVOICE_VERIFY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="发票号码 / 发票代码 / 往来单位名称"
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
                  void loadData(1, pageSize, keyword, invoiceType, direction, invoiceStatus, verifyStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInvoiceType(undefined);
                  setDirection(undefined);
                  setInvoiceStatus(undefined);
                  setVerifyStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建发票登记</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`发票登记（共 ${total} 条）`}>
        <Table<ErpFinanceInvoice>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2500 }}
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
        title={editId == null ? '新建发票登记' : '编辑发票登记'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="invoiceNo"
            label="发票号码"
            rules={[{ required: true, message: '请输入发票号码' }]}
          >
            <Input placeholder="请输入发票号码" />
          </Form.Item>
          <Form.Item name="invoiceCode" label="发票代码">
            <Input placeholder="请输入发票代码" />
          </Form.Item>
          <Form.Item name="invoiceType" label="发票类型">
            <Select placeholder="为空默认 VAT_SPECIAL" options={[...ERP_FINANCE_INVOICE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="direction" label="收发方向">
            <Select placeholder="为空默认 OUT" options={[...ERP_FINANCE_INVOICE_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="partyType" label="往来单位类型">
            <Select placeholder="为空默认 CUSTOMER" options={[...ERP_FINANCE_PARTY_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="partyCode" label="往来单位编码">
            <Input placeholder="请输入往来单位编码" />
          </Form.Item>
          <Form.Item name="partyName" label="往来单位名称">
            <Input placeholder="请输入往来单位名称" />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="amount" label="不含税金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入不含税金额" />
          </Form.Item>
          <Form.Item name="taxRate" label="税率">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税率" />
          </Form.Item>
          <Form.Item name="taxAmount" label="税额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税额" />
          </Form.Item>
          <Form.Item name="totalAmount" label="价税合计">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入价税合计" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="invoiceDate" label="开票日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择开票日期" />
          </Form.Item>
          <Form.Item name="verifyStatus" label="查验状态">
            <Select
              placeholder="为空默认 UNVERIFIED"
              options={[...ERP_FINANCE_INVOICE_VERIFY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="invoiceStatus" label="发票状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_FINANCE_INVOICE_STATUS_OPTIONS]} />
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
