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
import { erpSalesForecastService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FORECAST_STATUS_LABEL,
  ERP_FORECAST_STATUS_OPTIONS,
  ERP_FORECAST_TYPE_LABEL,
  ERP_FORECAST_TYPE_OPTIONS,
  type ErpSalesForecast,
  type ErpSalesForecastSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:forecast:manage';

type FormValues = Omit<ErpSalesForecastSaveRequest, 'forecastDate'> & {
  forecastDate?: Dayjs;
};

export default function ErpSalesForecastPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpSalesForecast[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [forecastStatus, setForecastStatus] = useState<string | undefined>(undefined);
  const [forecastType, setForecastType] = useState<string | undefined>(undefined);
  const [customerCode, setCustomerCode] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = forecastStatus,
      type = forecastType,
      customer = customerCode,
      material = materialCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpSalesForecastService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          forecastStatus: status,
          forecastType: type,
          customerCode: customer || undefined,
          materialCode: material || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, forecastStatus, forecastType, customerCode, materialCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ forecastType: 'MONTHLY', forecastStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpSalesForecast) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      forecastDate: record.forecastDate ? dayjs(record.forecastDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        forecastDate: values.forecastDate ? values.forecastDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpSalesForecastService.create(payload);
        message.success('销售预测已创建');
      } else {
        await erpSalesForecastService.update(editId, payload);
        message.success('销售预测已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpSalesForecastService.remove(id);
    message.success('销售预测已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpSalesForecast> = [
    { title: '预测单号', dataIndex: 'forecastNo', width: 160, fixed: 'left', render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '预测周期', dataIndex: 'forecastPeriod', width: 120, render: plain },
    { title: '预测日期', dataIndex: 'forecastDate', width: 130, render: formatDateTime },
    { title: '预测数量', dataIndex: 'forecastQty', width: 110, render: plain },
    {
      title: '预测类型',
      dataIndex: 'forecastType',
      width: 100,
      render: (v) => statusTag(ERP_FORECAST_TYPE_LABEL, v),
    },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '预测状态',
      dataIndex: 'forecastStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_FORECAST_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该销售预测？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        销售预测
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="预测状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={forecastStatus}
              onChange={(v) => setForecastStatus(v)}
              options={[...ERP_FORECAST_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="预测类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={forecastType}
              onChange={(v) => setForecastType(v)}
              options={[...ERP_FORECAST_TYPE_OPTIONS]}
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
          <Form.Item label="物料编码">
            <Input
              placeholder="请输入物料编码"
              allowClear
              style={{ width: 160 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="预测单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, forecastStatus, forecastType, customerCode, materialCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setForecastStatus(undefined);
                  setForecastType(undefined);
                  setCustomerCode('');
                  setMaterialCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建销售预测</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`销售预测（共 ${total} 条）`}>
        <Table<ErpSalesForecast>
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
        title={editId == null ? '新建销售预测' : '编辑销售预测'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="forecastPeriod" label="预测周期">
            <Input placeholder="请输入预测周期" />
          </Form.Item>
          <Form.Item name="forecastDate" label="预测日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择预测日期" />
          </Form.Item>
          <Form.Item name="forecastQty" label="预测数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预测数量" />
          </Form.Item>
          <Form.Item name="forecastType" label="预测类型">
            <Select placeholder="为空默认 MONTHLY" options={[...ERP_FORECAST_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="forecastStatus" label="预测状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_FORECAST_STATUS_OPTIONS]} />
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
