import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
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
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { erpDeliveryOrderService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_DELIVERY_STATUS_LABEL,
  ERP_DELIVERY_STATUS_OPTIONS,
  ERP_DELIVERY_TYPE_LABEL,
  ERP_DELIVERY_TYPE_OPTIONS,
  type ErpDeliveryOrder,
  type ErpDeliveryOrderDetail,
  type ErpDeliveryOrderLine,
  type ErpDeliveryOrderLineSaveRequest,
  type ErpDeliveryOrderSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:delivery:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type DeliveryHeaderForm = Omit<ErpDeliveryOrderSaveRequest, 'deliveryDate'> & {
  deliveryDate?: Dayjs;
};

export default function ErpDeliveryOrderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DeliveryHeaderForm>();
  const [lineForm] = Form.useForm<ErpDeliveryOrderLineSaveRequest>();

  const [data, setData] = useState<ErpDeliveryOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | undefined>(undefined);
  const [deliveryType, setDeliveryType] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [customerCode, setCustomerCode] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpDeliveryOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpDeliveryOrderLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = deliveryStatus,
      type = deliveryType,
      order = orderNo,
      customer = customerCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpDeliveryOrderService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          deliveryStatus: status,
          deliveryType: type,
          orderNo: order || undefined,
          customerCode: customer || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, deliveryStatus, deliveryType, orderNo, customerCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpDeliveryOrderService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpDeliveryOrder) => {
    if (record.id == null) return;
    setHeaderId(record.id);
    setDetail(null);
    setDrawerOpen(true);
    void loadDetail(record.id);
  };

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ deliveryType: 'NORMAL', deliveryStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpDeliveryOrder) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { deliveryDate, ...rest } = values;
    const payload: ErpDeliveryOrderSaveRequest = {
      ...rest,
      deliveryDate: deliveryDate ? deliveryDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpDeliveryOrderService.create(payload);
        message.success('发货单已创建');
      } else {
        await erpDeliveryOrderService.update(editId, payload);
        message.success('发货单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpDeliveryOrderService.remove(id);
    message.success('发货单已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpDeliveryOrderLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpDeliveryOrderService.updateLine(lineEditing.id, values);
        message.success('发货行已更新');
      } else if (headerId != null) {
        await erpDeliveryOrderService.addLine(headerId, values);
        message.success('发货行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpDeliveryOrderLine) => {
    if (line.id == null) return;
    await erpDeliveryOrderService.removeLine(line.id);
    message.success('发货行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpDeliveryOrder> = [
    { title: '发货单号', dataIndex: 'deliveryNo', width: 170, fixed: 'left', render: plain },
    {
      title: '发货类型',
      dataIndex: 'deliveryType',
      width: 120,
      render: (v) => statusTag(ERP_DELIVERY_TYPE_LABEL, v),
    },
    { title: '订单号', dataIndex: 'orderNo', width: 170, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 160, render: plain },
    { title: '发货日期', dataIndex: 'deliveryDate', width: 170, render: formatDateTime },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '承运商', dataIndex: 'carrier', width: 120, render: plain },
    { title: '运单号', dataIndex: 'trackingNo', width: 150, render: plain },
    { title: '联系人', dataIndex: 'contact', width: 110, render: plain },
    { title: '联系电话', dataIndex: 'phone', width: 130, render: plain },
    { title: '发货数量', dataIndex: 'totalQty', width: 110, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '发货状态',
      dataIndex: 'deliveryStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_DELIVERY_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            明细
          </Button>
          {hasPermission(MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(MANAGE) && (
            <Popconfirm
              title="确认删除该发货单？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const lineColumns: ColumnsType<ErpDeliveryOrderLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '订单行号', dataIndex: 'orderLineNo', width: 90, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '发货数量', dataIndex: 'deliveryQty', width: 110, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openLineEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该发货行？" onConfirm={() => void removeLine(record)}>
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
        发货单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="发货状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={deliveryStatus}
              onChange={(v) => setDeliveryStatus(v)}
              options={[...ERP_DELIVERY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="发货类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={deliveryType}
              onChange={(v) => setDeliveryType(v)}
              options={[...ERP_DELIVERY_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单号">
            <Input
              placeholder="请输入订单号"
              allowClear
              style={{ width: 170 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
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
              placeholder="发货单号 / 客户名称"
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
                  void loadData(1, pageSize, keyword, deliveryStatus, deliveryType, orderNo, customerCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDeliveryStatus(undefined);
                  setDeliveryType(undefined);
                  setOrderNo('');
                  setCustomerCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建发货单
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`发货单（共 ${total} 条）`}>
        <Table<ErpDeliveryOrder>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2300 }}
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
        title={editId == null ? '新建发货单' : '编辑发货单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="deliveryNo" label="发货单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="deliveryType" label="发货类型">
            <Select placeholder="为空默认 NORMAL" options={[...ERP_DELIVERY_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orderNo" label="订单号" rules={[{ required: true, message: '请输入订单号' }]}>
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="deliveryDate" label="发货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="receiverAddress" label="收货地址">
            <Input placeholder="请输入收货地址" />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="carrier" label="承运商">
            <Input placeholder="请输入承运商" />
          </Form.Item>
          <Form.Item name="trackingNo" label="运单号">
            <Input placeholder="请输入运单号" />
          </Form.Item>
          <Form.Item name="deliveryStatus" label="发货状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_DELIVERY_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="totalQty" label="发货数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入发货数量" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`发货单明细${detail?.header?.deliveryNo ? `：${detail.header.deliveryNo}` : ''}`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="发货类型">
            {statusTag(ERP_DELIVERY_TYPE_LABEL, detail?.header?.deliveryType)}
          </Descriptions.Item>
          <Descriptions.Item label="发货状态">
            {statusTag(ERP_DELIVERY_STATUS_LABEL, detail?.header?.deliveryStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="订单号">{plain(detail?.header?.orderNo)}</Descriptions.Item>
          <Descriptions.Item label="客户编码">{plain(detail?.header?.customerCode)}</Descriptions.Item>
          <Descriptions.Item label="客户名称">{plain(detail?.header?.customerName)}</Descriptions.Item>
          <Descriptions.Item label="发货日期">{formatDateTime(detail?.header?.deliveryDate)}</Descriptions.Item>
          <Descriptions.Item label="仓库编码">{plain(detail?.header?.warehouseCode)}</Descriptions.Item>
          <Descriptions.Item label="承运商">{plain(detail?.header?.carrier)}</Descriptions.Item>
          <Descriptions.Item label="运单号">{plain(detail?.header?.trackingNo)}</Descriptions.Item>
          <Descriptions.Item label="联系人">{plain(detail?.header?.contact)}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{plain(detail?.header?.phone)}</Descriptions.Item>
          <Descriptions.Item label="收货地址">{plain(detail?.header?.receiverAddress)}</Descriptions.Item>
          <Descriptions.Item label="发货数量">{plain(detail?.header?.totalQty)}</Descriptions.Item>
          <Descriptions.Item label="组织名称">{plain(detail?.header?.orgName)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDateTime(detail?.header?.createdAt)}</Descriptions.Item>
        </Descriptions>

        {hasPermission(MANAGE) && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            style={{ marginBottom: 12 }}
            onClick={openLineCreate}
          >
            新增发货行
          </Button>
        )}

        <Table<ErpDeliveryOrderLine>
          rowKey="id"
          size="small"
          loading={detailLoading}
          columns={lineColumns}
          dataSource={detail?.lines || []}
          scroll={{ x: 1400 }}
          pagination={false}
        />
      </Drawer>

      <Modal
        title={lineEditing ? '编辑发货行' : '新增发货行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="orderLineNo" label="订单行号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入订单行号" />
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
          <Form.Item name="uom" label="单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="deliveryQty" label="发货数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入发货数量" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
