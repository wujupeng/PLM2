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
import { erpPurchaseInquiryService } from '@/services/erpPurchaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INQUIRY_STATUS_LABEL,
  ERP_INQUIRY_STATUS_OPTIONS,
  type ErpPurchaseInquiry,
  type ErpPurchaseInquirySaveRequest,
} from '@/types/erpPurchase';

const { Title } = Typography;

const MANAGE = 'erp:purchase:inquiry:manage';

type FormValues = Omit<
  ErpPurchaseInquirySaveRequest,
  'inquiryDate' | 'quoteDeadline' | 'quoteDate' | 'validUntil'
> & {
  inquiryDate?: Dayjs;
  quoteDeadline?: Dayjs;
  quoteDate?: Dayjs;
  validUntil?: Dayjs;
};

export default function ErpPurchaseInquiryPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpPurchaseInquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState<string | undefined>(undefined);
  const [materialCode, setMaterialCode] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = inquiryStatus,
      material = materialCode,
      supplier = supplierCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpPurchaseInquiryService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          inquiryStatus: status,
          materialCode: material || undefined,
          supplierCode: supplier || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, inquiryStatus, materialCode, supplierCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ uom: 'PCS', currencyCode: 'CNY', inquiryStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpPurchaseInquiry) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      inquiryDate: record.inquiryDate ? dayjs(record.inquiryDate) : undefined,
      quoteDeadline: record.quoteDeadline ? dayjs(record.quoteDeadline) : undefined,
      quoteDate: record.quoteDate ? dayjs(record.quoteDate) : undefined,
      validUntil: record.validUntil ? dayjs(record.validUntil) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        inquiryDate: values.inquiryDate ? values.inquiryDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
        quoteDeadline: values.quoteDeadline
          ? values.quoteDeadline.format('YYYY-MM-DDTHH:mm:ss')
          : undefined,
        quoteDate: values.quoteDate ? values.quoteDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
        validUntil: values.validUntil ? values.validUntil.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpPurchaseInquiryService.create(payload);
        message.success('询价单已创建');
      } else {
        await erpPurchaseInquiryService.update(editId, payload);
        message.success('询价单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpPurchaseInquiryService.remove(id);
    message.success('询价单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpPurchaseInquiry> = [
    { title: '询价单号', dataIndex: 'inquiryNo', width: 160, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格', dataIndex: 'spec', width: 140, render: plain },
    { title: '单位', dataIndex: 'uom', width: 90, render: plain },
    { title: '询价数量', dataIndex: 'inquiryQty', width: 110, render: plain },
    { title: '询价日期', dataIndex: 'inquiryDate', width: 130, render: formatDateTime },
    { title: '报价截止', dataIndex: 'quoteDeadline', width: 130, render: formatDateTime },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 130, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '报价', dataIndex: 'quotePrice', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '报价日期', dataIndex: 'quoteDate', width: 130, render: formatDateTime },
    { title: '有效期至', dataIndex: 'validUntil', width: 130, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '询价状态',
      dataIndex: 'inquiryStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_INQUIRY_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该询价单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        询价单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="询价状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={inquiryStatus}
              onChange={(v) => setInquiryStatus(v)}
              options={[...ERP_INQUIRY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="物料编码">
            <Input
              placeholder="请输入物料编码"
              allowClear
              style={{ width: 160 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
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
              placeholder="询价单号 / 物料编码"
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
                  void loadData(1, pageSize, keyword, inquiryStatus, materialCode, supplierCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInquiryStatus(undefined);
                  setMaterialCode('');
                  setSupplierCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建询价单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`询价单（共 ${total} 条）`}>
        <Table<ErpPurchaseInquiry>
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
        title={editId == null ? '新建询价单' : '编辑询价单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="inquiryNo" label="询价单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="uom" label="单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="inquiryQty" label="询价数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入询价数量" />
          </Form.Item>
          <Form.Item name="inquiryDate" label="询价日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择询价日期" />
          </Form.Item>
          <Form.Item name="quoteDeadline" label="报价截止">
            <DatePicker style={{ width: '100%' }} placeholder="请选择报价截止" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="quotePrice" label="报价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入报价" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="quoteDate" label="报价日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择报价日期" />
          </Form.Item>
          <Form.Item name="validUntil" label="有效期至">
            <DatePicker style={{ width: '100%' }} placeholder="请选择有效期至" />
          </Form.Item>
          <Form.Item name="inquiryStatus" label="询价状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_INQUIRY_STATUS_OPTIONS]} />
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
