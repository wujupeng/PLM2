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
import { wmsShipmentOrderService as service } from '@/services/wmsOutboundService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_SHIPMENT_STATUS_LABEL,
  WMS_SHIPMENT_STATUS_OPTIONS,
  WMS_SHIPMENT_TYPE_LABEL,
  WMS_SHIPMENT_TYPE_OPTIONS,
  type WmsShipmentOrder,
  type WmsShipmentOrderQuery,
  type WmsShipmentOrderSaveRequest,
} from '@/types/wmsOutbound';

const { Title } = Typography;

const MANAGE = 'wms:outbound:shipment:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsShipmentOrderSaveRequest, 'loadTime' | 'shipTime'> & {
  loadTime?: Dayjs;
  shipTime?: Dayjs;
};

export default function WmsShipmentOrderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsShipmentOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = shipmentStatus) => {
      setLoading(true);
      try {
        const params: WmsShipmentOrderQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          shipmentStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, shipmentStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ shipmentType: 'SALES', shipmentStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsShipmentOrder) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      loadTime: record.loadTime ? dayjs(record.loadTime) : undefined,
      shipTime: record.shipTime ? dayjs(record.shipTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsShipmentOrderSaveRequest = {
        ...values,
        loadTime: values.loadTime ? values.loadTime.format(DATETIME_FORMAT) : undefined,
        shipTime: values.shipTime ? values.shipTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('发运单已创建');
      } else {
        await service.update(editId, payload);
        message.success('发运单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('发运单已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsShipmentOrder> = [
    { title: '发运单号', dataIndex: 'shipmentNo', width: 190, fixed: 'left', render: plain },
    {
      title: '发运类型',
      dataIndex: 'shipmentType',
      width: 110,
      render: (v) => statusTag(WMS_SHIPMENT_TYPE_LABEL, v),
    },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 100, render: plain },
    { title: '已发运数量', dataIndex: 'shippedQty', width: 110, render: plain },
    { title: '承运商', dataIndex: 'carrier', width: 130, render: plain },
    { title: '车牌号', dataIndex: 'vehicleNo', width: 130, render: plain },
    { title: '司机', dataIndex: 'driverName', width: 110, render: plain },
    { title: '司机电话', dataIndex: 'driverPhone', width: 140, render: plain },
    { title: '收货地址', dataIndex: 'deliveryAddress', width: 200, render: plain },
    {
      title: '发运状态',
      dataIndex: 'shipmentStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_SHIPMENT_STATUS_LABEL, v),
    },
    { title: '装车人', dataIndex: 'loadBy', width: 120, render: plain },
    { title: '装车时间', dataIndex: 'loadTime', width: 170, render: formatDateTime },
    { title: '发运人', dataIndex: 'shipBy', width: 120, render: plain },
    { title: '发运时间', dataIndex: 'shipTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该发运单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        发运单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="发运状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={shipmentStatus}
              onChange={(v) => setShipmentStatus(v)}
              options={[...WMS_SHIPMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="发运单号 / 客户名称 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, shipmentStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setShipmentStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建发运单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`发运单（共 ${total} 条）`}>
        <Table<WmsShipmentOrder>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3000 }}
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
        title={editId == null ? '新建发运单' : '编辑发运单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="shipmentNo" label="发运单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="shipmentType" label="发运类型">
            <Select placeholder="为空默认 SALES" options={[...WMS_SHIPMENT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shippedQty" label="已发运数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="carrier" label="承运商">
            <Input placeholder="请输入承运商" />
          </Form.Item>
          <Form.Item name="vehicleNo" label="车牌号">
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="driverName" label="司机姓名">
            <Input placeholder="请输入司机姓名" />
          </Form.Item>
          <Form.Item name="driverPhone" label="司机电话">
            <Input placeholder="请输入司机电话" />
          </Form.Item>
          <Form.Item name="deliveryAddress" label="收货地址">
            <Input placeholder="请输入收货地址" />
          </Form.Item>
          <Form.Item name="shipmentStatus" label="发运状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_SHIPMENT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="loadBy" label="装车人">
            <Input placeholder="请输入装车人" />
          </Form.Item>
          <Form.Item name="loadTime" label="装车时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shipBy" label="发运人">
            <Input placeholder="请输入发运人" />
          </Form.Item>
          <Form.Item name="shipTime" label="发运时间">
            <DatePicker showTime style={{ width: '100%' }} />
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
