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
import { erpSalesReceivableService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_AR_STATUS_LABEL,
  ERP_AR_STATUS_OPTIONS,
  type ErpSalesReceivable,
  type ErpSalesReceivableSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:receivable:manage';

type FormValues = Omit<ErpSalesReceivableSaveRequest, 'dueDate'> & {
  dueDate?: Dayjs;
};

export default function ErpSalesReceivablePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpSalesReceivable[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [arStatus, setArStatus] = useState<string | undefined>(undefined);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = arStatus,
      invoice = invoiceNo,
      customer = customerCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpSalesReceivableService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          arStatus: status,
          invoiceNo: invoice || undefined,
          customerCode: customer || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, arStatus, invoiceNo, customerCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ arStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpSalesReceivable) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpSalesReceivableService.create(payload);
        message.success('应收账款已创建');
      } else {
        await erpSalesReceivableService.update(editId, payload);
        message.success('应收账款已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpSalesReceivableService.remove(id);
    message.success('应收账款已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpSalesReceivable> = [
    { title: '应收单号', dataIndex: 'arNo', width: 160, fixed: 'left', render: plain },
    { title: '发票号', dataIndex: 'invoiceNo', width: 160, render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 160, render: plain },
    { title: '应收金额', dataIndex: 'arAmount', width: 120, render: plain },
    { title: '已收金额', dataIndex: 'receivedAmount', width: 120, render: plain },
    { title: '应收余额', dataIndex: 'arBalance', width: 120, render: plain },
    { title: '到期日期', dataIndex: 'dueDate', width: 130, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '应收状态',
      dataIndex: 'arStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_AR_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该应收账款？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        应收账款
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="应收状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={arStatus}
              onChange={(v) => setArStatus(v)}
              options={[...ERP_AR_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="发票号">
            <Input
              placeholder="请输入发票号"
              allowClear
              style={{ width: 160 }}
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
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
              placeholder="应收单号 / 订单号"
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
                  void loadData(1, pageSize, keyword, arStatus, invoiceNo, customerCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setArStatus(undefined);
                  setInvoiceNo('');
                  setCustomerCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建应收账款</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`应收账款（共 ${total} 条）`}>
        <Table<ErpSalesReceivable>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建应收账款' : '编辑应收账款'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="invoiceNo" label="发票号">
            <Input placeholder="请输入发票号" />
          </Form.Item>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="arAmount" label="应收金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入应收金额" />
          </Form.Item>
          <Form.Item name="receivedAmount" label="已收金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已收金额" />
          </Form.Item>
          <Form.Item name="arBalance" label="应收余额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入应收余额" />
          </Form.Item>
          <Form.Item name="dueDate" label="到期日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择到期日期" />
          </Form.Item>
          <Form.Item name="arStatus" label="应收状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_AR_STATUS_OPTIONS]} />
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
