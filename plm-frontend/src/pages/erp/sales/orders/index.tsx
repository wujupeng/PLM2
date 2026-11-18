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
import { erpSalesOrderService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_CREDIT_STATUS_LABEL,
  ERP_CREDIT_STATUS_OPTIONS,
  ERP_ORDER_LINE_STATUS_LABEL,
  ERP_ORDER_LINE_STATUS_OPTIONS,
  ERP_REVIEW_STATUS_LABEL,
  ERP_REVIEW_STATUS_OPTIONS,
  ERP_SALES_ORDER_STATUS_LABEL,
  ERP_SALES_ORDER_STATUS_OPTIONS,
  ERP_SALES_ORDER_TYPE_LABEL,
  ERP_SALES_ORDER_TYPE_OPTIONS,
  type ErpSalesOrder,
  type ErpSalesOrderDetail,
  type ErpSalesOrderLine,
  type ErpSalesOrderLineSaveRequest,
  type ErpSalesOrderSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:order:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type OrderHeaderForm = Omit<ErpSalesOrderSaveRequest, 'orderDate' | 'deliveryDate'> & {
  orderDate?: Dayjs;
  deliveryDate?: Dayjs;
};

/** 明细行表单：日期字段放宽为 Dayjs。 */
type OrderLineForm = Omit<ErpSalesOrderLineSaveRequest, 'deliveryDate'> & {
  deliveryDate?: Dayjs;
};

export default function ErpSalesOrderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OrderHeaderForm>();
  const [lineForm] = Form.useForm<OrderLineForm>();

  const [data, setData] = useState<ErpSalesOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | undefined>(undefined);
  const [reviewStatus, setReviewStatus] = useState<string | undefined>(undefined);
  const [orderType, setOrderType] = useState<string | undefined>(undefined);
  const [customerCode, setCustomerCode] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpSalesOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpSalesOrderLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = orderStatus,
      review = reviewStatus,
      type = orderType,
      customer = customerCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpSalesOrderService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          orderStatus: status,
          reviewStatus: review,
          orderType: type,
          customerCode: customer || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, orderStatus, reviewStatus, orderType, customerCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpSalesOrderService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpSalesOrder) => {
    if (record.id == null) return;
    setHeaderId(record.id);
    setDetail(null);
    setDrawerOpen(true);
    void loadDetail(record.id);
  };

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      orderType: 'STANDARD',
      currencyCode: 'CNY',
      exchangeRate: 1,
      paymentTerm: 'NET30',
      settleMethod: 'TRANSFER',
      creditStatus: 'OK',
      reviewStatus: 'PENDING',
      orderStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpSalesOrder) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      orderDate: record.orderDate ? dayjs(record.orderDate) : undefined,
      deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { orderDate, deliveryDate, ...rest } = values;
    const payload: ErpSalesOrderSaveRequest = {
      ...rest,
      orderDate: orderDate ? orderDate.format(DATETIME_FORMAT) : undefined,
      deliveryDate: deliveryDate ? deliveryDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpSalesOrderService.create(payload);
        message.success('销售订单已创建');
      } else {
        await erpSalesOrderService.update(editId, payload);
        message.success('销售订单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpSalesOrderService.remove(id);
    message.success('销售订单已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ lineStatus: 'OPEN', uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpSalesOrderLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({
      ...line,
      deliveryDate: line.deliveryDate ? dayjs(line.deliveryDate) : undefined,
    });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const { deliveryDate, ...rest } = values;
    const payload: ErpSalesOrderLineSaveRequest = {
      ...rest,
      deliveryDate: deliveryDate ? deliveryDate.format(DATETIME_FORMAT) : undefined,
    };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpSalesOrderService.updateLine(lineEditing.id, payload);
        message.success('订单行已更新');
      } else if (headerId != null) {
        await erpSalesOrderService.addLine(headerId, payload);
        message.success('订单行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpSalesOrderLine) => {
    if (line.id == null) return;
    await erpSalesOrderService.removeLine(line.id);
    message.success('订单行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpSalesOrder> = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, fixed: 'left', render: plain },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 120,
      render: (v) => statusTag(ERP_SALES_ORDER_TYPE_LABEL, v),
    },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 160, render: plain },
    { title: '销售员', dataIndex: 'salesperson', width: 110, render: plain },
    { title: '订单日期', dataIndex: 'orderDate', width: 170, render: formatDateTime },
    { title: '交货日期', dataIndex: 'deliveryDate', width: 170, render: formatDateTime },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '汇率', dataIndex: 'exchangeRate', width: 100, render: plain },
    { title: '订单总额', dataIndex: 'totalAmount', width: 120, render: plain },
    { title: '税额', dataIndex: 'taxAmount', width: 110, render: plain },
    { title: '净额', dataIndex: 'netAmount', width: 120, render: plain },
    { title: '已发货金额', dataIndex: 'deliveredAmount', width: 120, render: plain },
    {
      title: '信用状态',
      dataIndex: 'creditStatus',
      width: 110,
      render: (v) => statusTag(ERP_CREDIT_STATUS_LABEL, v),
    },
    {
      title: '评审状态',
      dataIndex: 'reviewStatus',
      width: 110,
      render: (v) => statusTag(ERP_REVIEW_STATUS_LABEL, v),
    },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_SALES_ORDER_STATUS_LABEL, v),
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
              title="确认删除该销售订单？"
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

  const lineColumns: ColumnsType<ErpSalesOrderLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    {
      title: '行状态',
      dataIndex: 'lineStatus',
      width: 100,
      render: (v) => statusTag(ERP_ORDER_LINE_STATUS_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '订单数量', dataIndex: 'orderQty', width: 100, render: plain },
    { title: '已发货数量', dataIndex: 'deliveredQty', width: 110, render: plain },
    { title: '剩余数量', dataIndex: 'remainingQty', width: 100, render: plain },
    { title: '单价', dataIndex: 'unitPrice', width: 100, render: plain },
    { title: '税率', dataIndex: 'taxRate', width: 90, render: plain },
    { title: '金额', dataIndex: 'amount', width: 110, render: plain },
    { title: '交货日期', dataIndex: 'deliveryDate', width: 170, render: formatDateTime },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
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
            <Popconfirm title="确认删除该订单行？" onConfirm={() => void removeLine(record)}>
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
        销售订单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="订单状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={orderStatus}
              onChange={(v) => setOrderStatus(v)}
              options={[...ERP_SALES_ORDER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="评审状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reviewStatus}
              onChange={(v) => setReviewStatus(v)}
              options={[...ERP_REVIEW_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={orderType}
              onChange={(v) => setOrderType(v)}
              options={[...ERP_SALES_ORDER_TYPE_OPTIONS]}
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
              placeholder="订单号 / 客户名称"
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
                  void loadData(1, pageSize, keyword, orderStatus, reviewStatus, orderType, customerCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setOrderStatus(undefined);
                  setReviewStatus(undefined);
                  setOrderType(undefined);
                  setCustomerCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建销售订单
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`销售订单（共 ${total} 条）`}>
        <Table<ErpSalesOrder>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2600 }}
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
        title={editId == null ? '新建销售订单' : '编辑销售订单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderType" label="订单类型">
            <Select placeholder="为空默认 STANDARD" options={[...ERP_SALES_ORDER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="salesRegion" label="销售区域">
            <Input placeholder="请输入销售区域" />
          </Form.Item>
          <Form.Item name="salesperson" label="销售员">
            <Input placeholder="请输入销售员" />
          </Form.Item>
          <Form.Item name="projectCode" label="项目编号">
            <Input placeholder="请输入项目编号" />
          </Form.Item>
          <Form.Item name="orderDate" label="订单日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deliveryDate" label="交货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="exchangeRate" label="汇率">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入汇率" />
          </Form.Item>
          <Form.Item name="taxCode" label="税码">
            <Input placeholder="请输入税码" />
          </Form.Item>
          <Form.Item name="paymentTerm" label="付款条件">
            <Input placeholder="为空默认 NET30" />
          </Form.Item>
          <Form.Item name="settleMethod" label="结算方式">
            <Input placeholder="为空默认 TRANSFER" />
          </Form.Item>
          <Form.Item name="creditStatus" label="信用状态">
            <Select placeholder="为空默认 OK" options={[...ERP_CREDIT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reviewStatus" label="评审状态">
            <Select placeholder="为空默认 PENDING" options={[...ERP_REVIEW_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orderStatus" label="订单状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_SALES_ORDER_STATUS_OPTIONS]} />
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
        title={`销售订单明细${detail?.header?.orderNo ? `：${detail.header.orderNo}` : ''}`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="客户编码">{plain(detail?.header?.customerCode)}</Descriptions.Item>
          <Descriptions.Item label="客户名称">{plain(detail?.header?.customerName)}</Descriptions.Item>
          <Descriptions.Item label="订单类型">
            {statusTag(ERP_SALES_ORDER_TYPE_LABEL, detail?.header?.orderType)}
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            {statusTag(ERP_SALES_ORDER_STATUS_LABEL, detail?.header?.orderStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="订单日期">{formatDateTime(detail?.header?.orderDate)}</Descriptions.Item>
          <Descriptions.Item label="交货日期">{formatDateTime(detail?.header?.deliveryDate)}</Descriptions.Item>
          <Descriptions.Item label="币种">{plain(detail?.header?.currencyCode)}</Descriptions.Item>
          <Descriptions.Item label="汇率">{plain(detail?.header?.exchangeRate)}</Descriptions.Item>
          <Descriptions.Item label="付款条件">{plain(detail?.header?.paymentTerm)}</Descriptions.Item>
          <Descriptions.Item label="结算方式">{plain(detail?.header?.settleMethod)}</Descriptions.Item>
          <Descriptions.Item label="信用状态">
            {statusTag(ERP_CREDIT_STATUS_LABEL, detail?.header?.creditStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="评审状态">
            {statusTag(ERP_REVIEW_STATUS_LABEL, detail?.header?.reviewStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="订单总额">{plain(detail?.header?.totalAmount)}</Descriptions.Item>
          <Descriptions.Item label="净额">{plain(detail?.header?.netAmount)}</Descriptions.Item>
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
            新增订单行
          </Button>
        )}

        <Table<ErpSalesOrderLine>
          rowKey="id"
          size="small"
          loading={detailLoading}
          columns={lineColumns}
          dataSource={detail?.lines || []}
          scroll={{ x: 1500 }}
          pagination={false}
        />
      </Drawer>

      <Modal
        title={lineEditing ? '编辑订单行' : '新增订单行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="lineStatus" label="行状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_ORDER_LINE_STATUS_OPTIONS]} />
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
          <Form.Item name="orderQty" label="订单数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入订单数量" />
          </Form.Item>
          <Form.Item name="deliveredQty" label="已发货数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已发货数量" />
          </Form.Item>
          <Form.Item name="remainingQty" label="剩余数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入剩余数量" />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入单价" />
          </Form.Item>
          <Form.Item name="taxRate" label="税率">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入税率" />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>
          <Form.Item name="deliveryDate" label="交货日期">
            <DatePicker style={{ width: '100%' }} />
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
