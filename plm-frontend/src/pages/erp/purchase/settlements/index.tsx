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
import { erpPurchaseSettlementService } from '@/services/erpPurchaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PURCHASE_SETTLEMENT_STATUS_LABEL,
  ERP_PURCHASE_SETTLEMENT_STATUS_OPTIONS,
  type ErpPurchaseSettlement,
  type ErpPurchaseSettlementSaveRequest,
} from '@/types/erpPurchase';

const { Title } = Typography;

const MANAGE = 'erp:purchase:settlement:manage';

type FormValues = Omit<ErpPurchaseSettlementSaveRequest, 'settlementDate'> & {
  settlementDate?: Dayjs;
};

export default function ErpPurchaseSettlementPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpPurchaseSettlement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [settlementStatus, setSettlementStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = settlementStatus,
      no = orderNo,
      supplier = supplierCode,
      invoice = invoiceNo,
    ) => {
      setLoading(true);
      try {
        const res = await erpPurchaseSettlementService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          settlementStatus: status,
          orderNo: no || undefined,
          supplierCode: supplier || undefined,
          invoiceNo: invoice || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, settlementStatus, orderNo, supplierCode, invoiceNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ paymentTerm: 'NET30', settlementStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpPurchaseSettlement) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      settlementDate: record.settlementDate ? dayjs(record.settlementDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        settlementDate: values.settlementDate
          ? values.settlementDate.format('YYYY-MM-DDTHH:mm:ss')
          : undefined,
      };
      if (editId == null) {
        await erpPurchaseSettlementService.create(payload);
        message.success('采购结算已创建');
      } else {
        await erpPurchaseSettlementService.update(editId, payload);
        message.success('采购结算已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpPurchaseSettlementService.remove(id);
    message.success('采购结算已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpPurchaseSettlement> = [
    { title: '结算单号', dataIndex: 'settlementNo', width: 160, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 130, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '采购订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '发票号', dataIndex: 'invoiceNo', width: 160, render: plain },
    { title: '结算日期', dataIndex: 'settlementDate', width: 130, render: formatDateTime },
    { title: '结算金额', dataIndex: 'settlementAmount', width: 120, render: plain },
    { title: '已付金额', dataIndex: 'paidAmount', width: 120, render: plain },
    { title: '结算余额', dataIndex: 'settleBalance', width: 120, render: plain },
    { title: '付款条件', dataIndex: 'paymentTerm', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '结算状态',
      dataIndex: 'settlementStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_PURCHASE_SETTLEMENT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该采购结算？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        采购结算
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="结算状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={settlementStatus}
              onChange={(v) => setSettlementStatus(v)}
              options={[...ERP_PURCHASE_SETTLEMENT_STATUS_OPTIONS]}
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
          <Form.Item label="发票号">
            <Input
              placeholder="请输入发票号"
              allowClear
              style={{ width: 160 }}
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="结算单号 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, settlementStatus, orderNo, supplierCode, invoiceNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSettlementStatus(undefined);
                  setOrderNo('');
                  setSupplierCode('');
                  setInvoiceNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建结算单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采购结算（共 ${total} 条）`}>
        <Table<ErpPurchaseSettlement>
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
        title={editId == null ? '新建结算单' : '编辑结算单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="settlementNo" label="结算单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="orderNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
          </Form.Item>
          <Form.Item name="invoiceNo" label="发票号">
            <Input placeholder="请输入发票号" />
          </Form.Item>
          <Form.Item name="settlementDate" label="结算日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择结算日期" />
          </Form.Item>
          <Form.Item name="settlementAmount" label="结算金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入结算金额" />
          </Form.Item>
          <Form.Item name="paidAmount" label="已付金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已付金额" />
          </Form.Item>
          <Form.Item name="settleBalance" label="结算余额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入结算余额" />
          </Form.Item>
          <Form.Item name="paymentTerm" label="付款条件">
            <Input placeholder="为空默认 NET30" />
          </Form.Item>
          <Form.Item name="settlementStatus" label="结算状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_PURCHASE_SETTLEMENT_STATUS_OPTIONS]} />
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
