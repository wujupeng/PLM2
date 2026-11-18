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
import { srmPriceAgreementService as service } from '@/services/srmSourcingService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_CURRENCY_LABEL,
  SRM_CURRENCY_OPTIONS,
  SRM_PRICE_AGREEMENT_STATUS_LABEL,
  SRM_PRICE_AGREEMENT_STATUS_OPTIONS,
  SRM_PRICE_TYPE_LABEL,
  SRM_PRICE_TYPE_OPTIONS,
  type SrmPriceAgreement,
  type SrmPriceAgreementQuery,
  type SrmPriceAgreementSaveRequest,
} from '@/types/srmSourcing';

const { Title } = Typography;

const MANAGE = 'srm:sourcing:price:manage';

type FormValues = Omit<SrmPriceAgreementSaveRequest, 'effectiveDate' | 'expireDate'> & {
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
};

export default function SrmPriceAgreementPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmPriceAgreement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [priceType, setPriceType] = useState<string | undefined>(undefined);
  const [agreementStatus, setAgreementStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = priceType,
      status = agreementStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmPriceAgreementQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          priceType: type,
          agreementStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, priceType, agreementStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ priceType: 'AGREEMENT', agreementStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmPriceAgreement) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmPriceAgreementSaveRequest = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format(DATE_FORMAT) : undefined,
        expireDate: values.expireDate ? values.expireDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('定点定价已创建');
      } else {
        await service.update(editId, payload);
        message.success('定点定价已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('定点定价已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmPriceAgreement> = [
    { title: '协议编号', dataIndex: 'agreementNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 140, render: plain },
    {
      title: '价格类型',
      dataIndex: 'priceType',
      width: 120,
      render: (v) => statusTag(SRM_PRICE_TYPE_LABEL, v),
    },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '协议单价', dataIndex: 'unitPrice', width: 120, render: plain },
    {
      title: '币种',
      dataIndex: 'currency',
      width: 100,
      render: (v) => statusTag(SRM_CURRENCY_LABEL, v),
    },
    { title: '税率(%)', dataIndex: 'taxRate', width: 100, render: plain },
    { title: '最小起订量', dataIndex: 'moq', width: 120, render: plain },
    { title: '交货周期(天)', dataIndex: 'leadTimeDays', width: 120, render: plain },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 120, render: formatDate },
    { title: '失效日期', dataIndex: 'expireDate', width: 120, render: formatDate },
    {
      title: '协议状态',
      dataIndex: 'agreementStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_PRICE_AGREEMENT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该定点定价？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        定点定价
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="价格类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={priceType}
              onChange={(v) => setPriceType(v)}
              options={[...SRM_PRICE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="协议状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={agreementStatus}
              onChange={(v) => setAgreementStatus(v)}
              options={[...SRM_PRICE_AGREEMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="协议编号 / 供应商编码 / 供应商名称 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, priceType, agreementStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPriceType(undefined);
                  setAgreementStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建定点定价</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`定点定价（共 ${total} 条）`}>
        <Table<SrmPriceAgreement>
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
        title={editId == null ? '新建定点定价' : '编辑定点定价'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="agreementNo" label="协议编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="supplierCode"
            label="供应商编码"
            rules={[{ required: true, message: '请输入供应商编码' }]}
          >
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
          <Form.Item name="priceType" label="价格类型">
            <Select placeholder="为空默认 AGREEMENT" options={[...SRM_PRICE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="unitPrice" label="协议单价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入协议单价" />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Select placeholder="为空默认 CNY" options={[...SRM_CURRENCY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="taxRate" label="税率(%)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税率" />
          </Form.Item>
          <Form.Item name="moq" label="最小起订量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入最小起订量" />
          </Form.Item>
          <Form.Item name="leadTimeDays" label="交货周期(天)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入交货周期" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择生效日期" />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择失效日期" />
          </Form.Item>
          <Form.Item name="agreementStatus" label="协议状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_PRICE_AGREEMENT_STATUS_OPTIONS]} />
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
