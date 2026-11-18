import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MinusCircleOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mfgService } from '@/services/mfgService';
import {
  MFG_LINE_SCAN_STATUS_LABEL,
  MFG_LINE_STATUS_LABEL,
  MFG_RELEASE_STATUS_COLOR,
  MFG_RELEASE_STATUS_LABEL,
  MFG_RELEASE_STATUS_OPTIONS,
  MFG_SCAN_RESULT_COLOR,
  MFG_SCAN_RESULT_LABEL,
  MFG_SCAN_TYPE_LABEL,
  MFG_SCAN_TYPE_OPTIONS,
  MFG_SHIPMENT_STATUS_COLOR,
  MFG_SHIPMENT_STATUS_LABEL,
  MFG_SHIPMENT_STATUS_OPTIONS,
  type MfgShipmentDetailResponse,
  type MfgShipmentItem,
  type MfgShipmentLineParams,
  type MfgShipmentQuery,
  type MfgShipmentSaveParams,
  type MfgShipScanLogItem,
  type MfgShipScanLogQuery,
} from '@/types/mfg';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface ShipmentFormValues {
  shipmentNo?: string;
  customerCode?: string;
  customerName?: string;
  orderNo?: string;
  deliveryPlanNo?: string;
  productCode?: string;
  productName?: string;
  productVersion?: string;
  orderQty?: number;
  plannedQty?: number;
  packageCount?: number;
  carrier?: string;
  vehicleNo?: string;
  driver?: string;
  driverPhone?: string;
  shipDate?: dayjs.Dayjs;
  remark?: string;
  lines?: MfgShipmentLineParams[];
}

interface ScanFormValues {
  scanCode: string;
  scanType?: string;
  qty?: number;
}

interface ReleaseFormValues {
  carrier?: string;
  vehicleNo?: string;
  driver?: string;
  driverPhone?: string;
  shipDate?: dayjs.Dayjs;
  sendAsn?: boolean;
  remark?: string;
}

function ShipmentTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const username = useAuthStore((state) => state.userInfo?.username);
  const [form] = Form.useForm<ShipmentFormValues>();
  const [scanForm] = Form.useForm<ScanFormValues>();
  const [releaseForm] = Form.useForm<ReleaseFormValues>();

  const [data, setData] = useState<MfgShipmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{
    shipmentNo?: string;
    customerCode?: string;
    orderNo?: string;
    shipmentStatus?: string;
    releaseStatus?: string;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MfgShipmentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [scanOpen, setScanOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState<MfgShipmentItem | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<MfgShipScanLogItem[]>([]);

  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<MfgShipmentDetailResponse | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgShipmentQuery = {
          pageNum: page,
          pageSize: size,
          shipmentNo: cond.shipmentNo || undefined,
          customerCode: cond.customerCode || undefined,
          orderNo: cond.orderNo || undefined,
          shipmentStatus: cond.shipmentStatus || undefined,
          releaseStatus: cond.releaseStatus || undefined,
        };
        const res = await mfgService.shipmentPage(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: typeof search) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ lines: [{}] });
    setModalOpen(true);
  };

  const openEdit = (record: MfgShipmentItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      shipDate: record.shipDate ? dayjs(record.shipDate) : undefined,
      lines: [],
    });
    void mfgService.shipmentListLines(record.shipmentNo).then((lines) => {
      form.setFieldsValue({ lines: lines.length ? lines : [{}] });
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgShipmentSaveParams = {
      shipmentNo: values.shipmentNo,
      customerCode: values.customerCode,
      customerName: values.customerName,
      orderNo: values.orderNo,
      deliveryPlanNo: values.deliveryPlanNo,
      productCode: values.productCode,
      productName: values.productName,
      productVersion: values.productVersion,
      orderQty: values.orderQty,
      plannedQty: values.plannedQty,
      packageCount: values.packageCount,
      carrier: values.carrier,
      vehicleNo: values.vehicleNo,
      driver: values.driver,
      driverPhone: values.driverPhone,
      shipDate: values.shipDate ? values.shipDate.format('YYYY-MM-DD') : undefined,
      remark: values.remark,
      lines: values.lines || [],
    };
    setSubmitting(true);
    try {
      if (editing) {
        await mfgService.shipmentUpdate(editing.shipmentNo, payload);
        message.success('更新成功');
      } else {
        await mfgService.shipmentCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MfgShipmentItem) => {
    await mfgService.shipmentRemove(record.shipmentNo);
    message.success('删除成功');
    void loadData();
  };

  const handleCancel = async (record: MfgShipmentItem) => {
    await mfgService.shipmentCancel(record.shipmentNo);
    message.success('已取消出货单');
    void loadData();
  };

  const openScan = (record: MfgShipmentItem) => {
    setScanTarget(record);
    setScanLogs([]);
    scanForm.resetFields();
    scanForm.setFieldsValue({ scanType: 'PACKAGE' });
    setScanOpen(true);
  };

  const handleScan = async () => {
    if (!scanTarget) return;
    const values = await scanForm.validateFields();
    setScanning(true);
    try {
      const res = await mfgService.shipmentScan(scanTarget.shipmentNo, {
        scanCode: values.scanCode,
        scanType: values.scanType,
        qty: values.qty,
        operator: username,
      });
      if (res.log) {
        setScanLogs((prev) => [res.log as MfgShipScanLogItem, ...prev]);
      }
      if (res.scanResult === 'PASS') {
        message.success(`复核通过，已扫数量：${res.scannedQty ?? 0}/${res.plannedQty ?? 0}`);
        scanForm.resetFields();
        scanForm.setFieldsValue({ scanType: 'PACKAGE' });
      } else {
        message.warning(`已阻断：${res.blockReason || '校验未通过'}`);
      }
      void loadData();
    } finally {
      setScanning(false);
    }
  };

  const openRelease = (record: MfgShipmentItem) => {
    setScanTarget(record);
    releaseForm.resetFields();
    releaseForm.setFieldsValue({
      carrier: record.carrier,
      vehicleNo: record.vehicleNo,
      driver: record.driver,
      driverPhone: record.driverPhone,
      shipDate: record.shipDate ? dayjs(record.shipDate) : dayjs(),
      sendAsn: false,
    });
    setReleaseOpen(true);
  };

  const handleRelease = async () => {
    if (!scanTarget) return;
    const values = await releaseForm.validateFields();
    setReleasing(true);
    try {
      await mfgService.shipmentRelease(scanTarget.shipmentNo, {
        carrier: values.carrier,
        vehicleNo: values.vehicleNo,
        driver: values.driver,
        driverPhone: values.driverPhone,
        shipDate: values.shipDate ? values.shipDate.format('YYYY-MM-DD') : undefined,
        sendAsn: values.sendAsn,
        remark: values.remark,
      });
      message.success('发货放行成功');
      setReleaseOpen(false);
      void loadData();
    } finally {
      setReleasing(false);
    }
  };

  const handleCreateAsn = async (record: MfgShipmentItem) => {
    const asnNo = await mfgService.shipmentCreateAsn(record.shipmentNo);
    message.success(`已生成 ASN：${asnNo}`);
    void loadData();
  };

  const handleSendAsn = async (record: MfgShipmentItem) => {
    await mfgService.shipmentSendAsn(record.shipmentNo);
    message.success('ASN 已发送');
    void loadData();
  };

  const handleShip = async (record: MfgShipmentItem) => {
    await mfgService.shipmentShip(record.shipmentNo);
    message.success('已标记发运');
    void loadData();
  };

  const openDetail = async (record: MfgShipmentItem) => {
    const res = await mfgService.shipmentDetail(record.shipmentNo);
    setDetail(res);
    setDetailOpen(true);
  };

  const columns: ColumnsType<MfgShipmentItem> = [
    { title: '出货单号', dataIndex: 'shipmentNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: (v) => v || '-' },
    { title: '客户订单号', dataIndex: 'orderNo', width: 140, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 120, render: (v) => v || '-' },
    { title: '订单数量', dataIndex: 'orderQty', width: 100, render: (v) => (v ?? '-') },
    { title: '计划数量', dataIndex: 'plannedQty', width: 100, render: (v) => (v ?? '-') },
    { title: '已扫码数量', dataIndex: 'scannedQty', width: 110, render: (v) => (v ?? '-') },
    { title: '已发运数量', dataIndex: 'shippedQty', width: 110, render: (v) => (v ?? '-') },
    {
      title: '出货状态',
      dataIndex: 'shipmentStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={MFG_SHIPMENT_STATUS_COLOR[v]}>{MFG_SHIPMENT_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '放行状态',
      dataIndex: 'releaseStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={MFG_RELEASE_STATUS_COLOR[v]}>{MFG_RELEASE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: 'ASN 单号', dataIndex: 'asnNo', width: 160, render: (v) => v || '-' },
    {
      title: '发货日期',
      dataIndex: 'shipDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            明细
          </Button>
          {hasPermission('mfg:shipment:scan') && record.shipmentStatus !== 'CANCELLED' && (
            <Button type="link" size="small" onClick={() => openScan(record)}>
              扫码复核
            </Button>
          )}
          {hasPermission('mfg:shipment:release') && record.shipmentStatus === 'VERIFIED' && (
            <Button type="link" size="small" onClick={() => openRelease(record)}>
              放行
            </Button>
          )}
          {hasPermission('mfg:shipment:release') && record.releaseStatus === 'RELEASED' && !record.asnNo && (
            <Button type="link" size="small" onClick={() => handleCreateAsn(record)}>
              生成 ASN
            </Button>
          )}
          {hasPermission('mfg:shipment:release') && record.asnNo && record.asnStatus !== 'SENT' && (
            <Button type="link" size="small" onClick={() => handleSendAsn(record)}>
              发送 ASN
            </Button>
          )}
          {hasPermission('mfg:shipment:release') && record.shipmentStatus === 'RELEASED' && (
            <Button type="link" size="small" onClick={() => handleShip(record)}>
              发运
            </Button>
          )}
          {hasPermission('mfg:shipment:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('mfg:shipment:save') && record.shipmentStatus !== 'SHIPPED' && (
            <Popconfirm title="确认取消该出货单？" onConfirm={() => handleCancel(record)}>
              <Button type="link" size="small">
                取消
              </Button>
            </Popconfirm>
          )}
          {hasPermission('mfg:shipment:save') && (
            <Popconfirm title="确认删除该出货单？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="shipmentNo" label="出货单号">
            <Input placeholder="请输入出货单号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="orderNo" label="客户订单号">
            <Input placeholder="请输入客户订单号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="shipmentStatus" label="出货状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={MFG_SHIPMENT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="releaseStatus" label="放行状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={MFG_RELEASE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`出货单列表（共 ${total} 条）`}
        extra={
          hasPermission('mfg:shipment:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增出货单
            </Button>
          )
        }
      >
        <Table<MfgShipmentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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

      {/* 新增/编辑出货单 */}
      <Modal
        title={editing ? '编辑出货单' : '新增出货单'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={860}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="shipmentNo" label="出货单号" extra="留空将自动生成">
            <Input placeholder="请输入出货单号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="orderNo" label="客户订单号">
            <Input placeholder="请输入客户订单号" />
          </Form.Item>
          <Form.Item name="deliveryPlanNo" label="交付计划号">
            <Input placeholder="请输入交付计划号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="productVersion" label="产品版本">
            <Input placeholder="请输入产品版本" />
          </Form.Item>
          <Form.Item name="orderQty" label="订单数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入订单数量" />
          </Form.Item>
          <Form.Item name="plannedQty" label="计划发货数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入计划发货数量" />
          </Form.Item>
          <Form.Item name="packageCount" label="包装数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入包装数量" />
          </Form.Item>
          <Form.Item name="carrier" label="承运商">
            <Input placeholder="请输入承运商" />
          </Form.Item>
          <Form.Item name="vehicleNo" label="车牌号">
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="driver" label="司机">
            <Input placeholder="请输入司机" />
          </Form.Item>
          <Form.Item name="driverPhone" label="司机电话">
            <Input placeholder="请输入司机电话" />
          </Form.Item>
          <Form.Item name="shipDate" label="发货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="出货明细" style={{ marginBottom: 0 }}>
            <Form.List name="lines">
              {(fields, { add, remove }) => (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline" wrap>
                      <Form.Item name={[field.name, 'productCode']} noStyle>
                        <Input placeholder="产品编码" style={{ width: 140 }} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'productVersion']} noStyle>
                        <Input placeholder="产品版本" style={{ width: 110 }} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'batchNo']} noStyle>
                        <Input placeholder="生产批次号" style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'packageNo']} noStyle>
                        <Input placeholder="包装编号" style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'qty']} noStyle>
                        <InputNumber placeholder="数量" min={0} style={{ width: 100 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    添加明细行
                  </Button>
                </Space>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item name="remark" label="备注" style={{ marginTop: 16 }}>
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 扫码复核 */}
      <Modal
        title={`扫码复核${scanTarget ? `：${scanTarget.shipmentNo}` : ''}`}
        open={scanOpen}
        onOk={handleScan}
        okText="扫描"
        confirmLoading={scanning}
        onCancel={() => setScanOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={scanForm} layout="vertical" preserve={false}>
          <Form.Item name="scanCode" label="扫描码" rules={[{ required: true, message: '请输入或扫描条码' }]}>
            <Input placeholder="扫描单件码 / 箱码 / 物料批次码" autoFocus />
          </Form.Item>
          <Form.Item name="scanType" label="扫描类型">
            <Select placeholder="请选择" options={MFG_SCAN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="qty" label="数量" extra="按箱扫描时使用">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入数量" />
          </Form.Item>
        </Form>
        {scanLogs.length > 0 && (
          <Table<MfgShipScanLogItem>
            rowKey="id"
            size="small"
            dataSource={scanLogs}
            pagination={false}
            columns={[
              { title: '扫描码', dataIndex: 'scanCode', render: (v) => v || '-' },
              {
                title: '结果',
                dataIndex: 'scanResult',
                width: 80,
                render: (v?: string) =>
                  v ? <Tag color={MFG_SCAN_RESULT_COLOR[v]}>{MFG_SCAN_RESULT_LABEL[v] || v}</Tag> : '-',
              },
              { title: '阻断原因', dataIndex: 'blockReason', render: (v) => v || '-' },
            ]}
          />
        )}
      </Modal>

      {/* 发货放行 */}
      <Modal
        title={`发货放行${scanTarget ? `：${scanTarget.shipmentNo}` : ''}`}
        open={releaseOpen}
        onOk={handleRelease}
        confirmLoading={releasing}
        onCancel={() => setReleaseOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={releaseForm} layout="vertical" preserve={false}>
          <Form.Item name="carrier" label="承运商">
            <Input placeholder="请输入承运商" />
          </Form.Item>
          <Form.Item name="vehicleNo" label="车牌号">
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="driver" label="司机">
            <Input placeholder="请输入司机" />
          </Form.Item>
          <Form.Item name="driverPhone" label="司机电话">
            <Input placeholder="请输入司机电话" />
          </Form.Item>
          <Form.Item name="shipDate" label="发货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sendAsn" label="放行后发送 ASN" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="remark" label="放行意见">
            <Input.TextArea rows={2} placeholder="请输入放行意见" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 出货单明细 */}
      <Modal
        title={`出货单明细${detail?.shipment?.shipmentNo ? `：${detail.shipment.shipmentNo}` : ''}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button type="primary" onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={820}
      >
        {detail?.shipment && (
          <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="客户编码">{detail.shipment.customerCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="客户订单号">{detail.shipment.orderNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="产品编码">{detail.shipment.productCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="订单数量">{detail.shipment.orderQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="已扫码数量">{detail.shipment.scannedQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="ASN 单号">{detail.shipment.asnNo || '-'}</Descriptions.Item>
          </Descriptions>
        )}
        <Table
          rowKey="id"
          size="small"
          dataSource={detail?.lines || []}
          pagination={false}
          columns={[
            { title: '行号', dataIndex: 'lineNo', width: 70, render: (v) => (v ?? '-') },
            { title: '产品编码', dataIndex: 'productCode', render: (v) => v || '-' },
            { title: '生产批次号', dataIndex: 'batchNo', render: (v) => v || '-' },
            { title: '包装编号', dataIndex: 'packageNo', render: (v) => v || '-' },
            { title: '数量', dataIndex: 'qty', width: 80, render: (v) => (v ?? '-') },
            {
              title: '扫码状态',
              dataIndex: 'scanStatus',
              width: 100,
              render: (v?: string) => (v ? MFG_LINE_SCAN_STATUS_LABEL[v] || v : '-'),
            },
            {
              title: '行状态',
              dataIndex: 'lineStatus',
              width: 90,
              render: (v?: string) => (v ? MFG_LINE_STATUS_LABEL[v] || v : '-'),
            },
          ]}
        />
      </Modal>
    </Space>
  );
}

function ScanLogTab() {
  const [data, setData] = useState<MfgShipScanLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{
    shipmentNo?: string;
    scanCode?: string;
    scanType?: string;
    scanResult?: string;
  }>({});

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgShipScanLogQuery = {
          pageNum: page,
          pageSize: size,
          shipmentNo: cond.shipmentNo || undefined,
          scanCode: cond.scanCode || undefined,
          scanType: cond.scanType || undefined,
          scanResult: cond.scanResult || undefined,
        };
        const res = await mfgService.shipScanLogPage(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: typeof search) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const columns: ColumnsType<MfgShipScanLogItem> = [
    { title: '日志编号', dataIndex: 'logNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '出货单号', dataIndex: 'shipmentNo', width: 160, render: (v) => v || '-' },
    { title: '扫描码', dataIndex: 'scanCode', width: 180, render: (v) => v || '-' },
    {
      title: '扫描类型',
      dataIndex: 'scanType',
      width: 110,
      render: (v?: string) => (v ? MFG_SCAN_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '扫描结果',
      dataIndex: 'scanResult',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={MFG_SCAN_RESULT_COLOR[v]}>{MFG_SCAN_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    { title: '阻断原因', dataIndex: 'blockReason', width: 180, render: (v) => v || '-' },
    { title: '生产批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'qty', width: 90, render: (v) => (v ?? '-') },
    { title: '操作人', dataIndex: 'operator', width: 100, render: (v) => v || '-' },
    {
      title: '扫描时间',
      dataIndex: 'scanTime',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="shipmentNo" label="出货单号">
            <Input placeholder="请输入出货单号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="scanCode" label="扫描码">
            <Input placeholder="请输入扫描码" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="scanType" label="扫描类型">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={MFG_SCAN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="scanResult" label="扫描结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              options={[
                { label: '通过', value: 'PASS' },
                { label: '阻断', value: 'BLOCKED' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`扫码日志（共 ${total} 条）`}>
        <Table<MfgShipScanLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
    </Space>
  );
}

export default function MfgShipmentPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        出货与放行
      </Title>
      <Tabs
        items={[
          { key: 'shipment', label: '出货单', children: <ShipmentTab /> },
          { key: 'scanlog', label: '扫码日志', children: <ScanLogTab /> },
        ]}
      />
    </Space>
  );
}
