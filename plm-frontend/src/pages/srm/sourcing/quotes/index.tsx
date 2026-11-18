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
import { srmSupplierQuoteService as service } from '@/services/srmSourcingService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_QUOTE_STATUS_LABEL,
  SRM_QUOTE_STATUS_OPTIONS,
  SRM_CURRENCY_LABEL,
  SRM_CURRENCY_OPTIONS,
  type SrmSupplierQuote,
  type SrmSupplierQuoteQuery,
  type SrmSupplierQuoteSaveRequest,
} from '@/types/srmSourcing';

const { Title } = Typography;

const MANAGE = 'srm:sourcing:quote:manage';

type FormValues = Omit<SrmSupplierQuoteSaveRequest, 'quoteDate' | 'validUntil'> & {
  quoteDate?: Dayjs;
  validUntil?: Dayjs;
};

export default function SrmSupplierQuotePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSupplierQuote[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [quoteStatus, setQuoteStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = quoteStatus) => {
      setLoading(true);
      try {
        const params: SrmSupplierQuoteQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          quoteStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, quoteStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ quoteStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmSupplierQuote) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      quoteDate: record.quoteDate ? dayjs(record.quoteDate) : undefined,
      validUntil: record.validUntil ? dayjs(record.validUntil) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSupplierQuoteSaveRequest = {
        ...values,
        quoteDate: values.quoteDate ? values.quoteDate.format(DATE_FORMAT) : undefined,
        validUntil: values.validUntil ? values.validUntil.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('供应商报价已创建');
      } else {
        await service.update(editId, payload);
        message.success('供应商报价已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('供应商报价已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSupplierQuote> = [
    { title: '报价单号', dataIndex: 'quoteNo', width: 170, fixed: 'left', render: plain },
    { title: '询价单号', dataIndex: 'rfqNo', width: 170, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 140, render: plain },
    { title: '报价数量', dataIndex: 'quoteQty', width: 110, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '单价', dataIndex: 'unitPrice', width: 110, render: plain },
    { title: '税率(%)', dataIndex: 'taxRate', width: 100, render: plain },
    { title: '报价总额', dataIndex: 'totalAmount', width: 130, render: plain },
    {
      title: '币种',
      dataIndex: 'currency',
      width: 100,
      render: (v) => statusTag(SRM_CURRENCY_LABEL, v),
    },
    { title: '交货天数', dataIndex: 'deliveryDays', width: 100, render: plain },
    { title: '付款条件', dataIndex: 'paymentTerm', width: 140, render: plain },
    { title: '报价日期', dataIndex: 'quoteDate', width: 120, render: formatDate },
    { title: '报价有效期', dataIndex: 'validUntil', width: 130, render: formatDate },
    {
      title: '报价状态',
      dataIndex: 'quoteStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_QUOTE_STATUS_LABEL, v),
    },
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
            <Popconfirm title="确认删除该供应商报价？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        供应商报价
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="报价状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={quoteStatus}
              onChange={(v) => setQuoteStatus(v)}
              options={[...SRM_QUOTE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="报价单号 / 询价单号 / 供应商编码 / 供应商名称 / 物料编码"
              allowClear
              style={{ width: 320 }}
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
                  void loadData(1, pageSize, keyword, quoteStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setQuoteStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建供应商报价</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`供应商报价（共 ${total} 条）`}>
        <Table<SrmSupplierQuote>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2900 }}
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
        title={editId == null ? '新建供应商报价' : '编辑供应商报价'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="quoteNo" label="报价单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="rfqNo" label="询价单号">
            <Input placeholder="请输入询价单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="quoteQty" label="报价数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入报价数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入单价" />
          </Form.Item>
          <Form.Item name="taxRate" label="税率(%)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税率" />
          </Form.Item>
          <Form.Item name="totalAmount" label="报价总额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入报价总额" />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Select placeholder="为空默认 CNY" options={[...SRM_CURRENCY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="deliveryDays" label="交货天数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入交货天数" />
          </Form.Item>
          <Form.Item name="paymentTerm" label="付款条件">
            <Input placeholder="请输入付款条件" />
          </Form.Item>
          <Form.Item name="quoteDate" label="报价日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择报价日期" />
          </Form.Item>
          <Form.Item name="validUntil" label="报价有效期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择报价有效期" />
          </Form.Item>
          <Form.Item name="quoteStatus" label="报价状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_QUOTE_STATUS_OPTIONS]} />
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
