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
import { erpFinancePaymentService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_PARTY_TYPE_LABEL,
  ERP_FINANCE_PARTY_TYPE_OPTIONS,
  ERP_FINANCE_PAYMENT_METHOD_LABEL,
  ERP_FINANCE_PAYMENT_METHOD_OPTIONS,
  ERP_FINANCE_PAYMENT_STATUS_LABEL,
  ERP_FINANCE_PAYMENT_STATUS_OPTIONS,
  ERP_FINANCE_PAYMENT_TYPE_LABEL,
  ERP_FINANCE_PAYMENT_TYPE_OPTIONS,
  type ErpFinancePayment,
  type ErpFinancePaymentQuery,
  type ErpFinancePaymentSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:payment:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinancePaymentSaveRequest, 'paymentDate'> & {
  paymentDate?: Dayjs;
};

export default function ErpFinancePaymentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinancePayment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [paymentType, setPaymentType] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined);
  const [partyCode, setPartyCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = paymentType,
      status = paymentStatus,
      party = partyCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinancePaymentQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          paymentType: type,
          paymentStatus: status,
          partyCode: party || undefined,
        };
        const res = await erpFinancePaymentService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, paymentType, paymentStatus, partyCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      paymentType: 'RECEIPT',
      partyType: 'CUSTOMER',
      paymentMethod: 'TRANSFER',
      currencyCode: 'CNY',
      paymentStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpFinancePayment) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      paymentDate: record.paymentDate ? dayjs(record.paymentDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinancePaymentSaveRequest = {
        ...values,
        paymentDate: values.paymentDate ? values.paymentDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinancePaymentService.create(payload);
        message.success('收付款单已创建');
      } else {
        await erpFinancePaymentService.update(editId, payload);
        message.success('收付款单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinancePaymentService.remove(id);
    message.success('收付款单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinancePayment> = [
    { title: '收付款单号', dataIndex: 'paymentNo', width: 170, fixed: 'left', render: plain },
    {
      title: '收付款类型',
      dataIndex: 'paymentType',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_PAYMENT_TYPE_LABEL, v),
    },
    {
      title: '往来单位类型',
      dataIndex: 'partyType',
      width: 120,
      render: (v) => statusTag(ERP_FINANCE_PARTY_TYPE_LABEL, v),
    },
    { title: '往来单位编码', dataIndex: 'partyCode', width: 130, render: plain },
    { title: '往来单位名称', dataIndex: 'partyName', width: 160, render: plain },
    { title: '银行账号', dataIndex: 'bankAccount', width: 160, render: plain },
    { title: '开户银行', dataIndex: 'bankName', width: 150, render: plain },
    {
      title: '结算方式',
      dataIndex: 'paymentMethod',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_PAYMENT_METHOD_LABEL, v),
    },
    { title: '金额', dataIndex: 'amount', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '收付款日期', dataIndex: 'paymentDate', width: 120, render: plain },
    { title: '来源单据号', dataIndex: 'sourceNo', width: 150, render: plain },
    {
      title: '收付款状态',
      dataIndex: 'paymentStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_PAYMENT_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该收付款单？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
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
        收付款单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="收付款类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={paymentType}
              onChange={(v) => setPaymentType(v)}
              options={[...ERP_FINANCE_PAYMENT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="收付款状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={paymentStatus}
              onChange={(v) => setPaymentStatus(v)}
              options={[...ERP_FINANCE_PAYMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="往来单位编码">
            <Input
              placeholder="请输入往来单位编码"
              allowClear
              style={{ width: 160 }}
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="收付款单号 / 往来单位名称"
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
                  void loadData(1, pageSize, keyword, paymentType, paymentStatus, partyCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPaymentType(undefined);
                  setPaymentStatus(undefined);
                  setPartyCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建收付款单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`收付款单（共 ${total} 条）`}>
        <Table<ErpFinancePayment>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建收付款单' : '编辑收付款单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="paymentNo" label="收付款单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="paymentType" label="收付款类型">
            <Select placeholder="为空默认 RECEIPT" options={[...ERP_FINANCE_PAYMENT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="partyType" label="往来单位类型">
            <Select placeholder="为空默认 CUSTOMER" options={[...ERP_FINANCE_PARTY_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="partyCode"
            label="往来单位编码"
            rules={[{ required: true, message: '请输入往来单位编码' }]}
          >
            <Input placeholder="请输入往来单位编码" />
          </Form.Item>
          <Form.Item name="partyName" label="往来单位名称">
            <Input placeholder="请输入往来单位名称" />
          </Form.Item>
          <Form.Item name="bankAccount" label="银行账号">
            <Input placeholder="请输入银行账号" />
          </Form.Item>
          <Form.Item name="bankName" label="开户银行">
            <Input placeholder="请输入开户银行" />
          </Form.Item>
          <Form.Item name="paymentMethod" label="结算方式">
            <Select placeholder="为空默认 TRANSFER" options={[...ERP_FINANCE_PAYMENT_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="paymentDate" label="收付款日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择收付款日期" />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单据号">
            <Input placeholder="请输入来源单据号" />
          </Form.Item>
          <Form.Item name="paymentStatus" label="收付款状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_FINANCE_PAYMENT_STATUS_OPTIONS]} />
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
