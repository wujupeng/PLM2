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
import { erpProductionOrderService } from '@/services/erpProductionService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PRODUCTION_LINE_STATUS_LABEL,
  ERP_PRODUCTION_LINE_STATUS_OPTIONS,
  ERP_PRODUCTION_ORDER_STATUS_LABEL,
  ERP_PRODUCTION_ORDER_STATUS_OPTIONS,
  ERP_PRODUCTION_ORDER_TYPE_LABEL,
  ERP_PRODUCTION_ORDER_TYPE_OPTIONS,
  type ErpProductionOrder,
  type ErpProductionOrderDetail,
  type ErpProductionOrderLine,
  type ErpProductionOrderLineSaveRequest,
  type ErpProductionOrderQuery,
  type ErpProductionOrderSaveRequest,
} from '@/types/erpProduction';

const { Title } = Typography;

const MANAGE = 'erp:production:order:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type ProductionOrderHeaderForm = Omit<
  ErpProductionOrderSaveRequest,
  'planStartDate' | 'planEndDate' | 'actualStartDate' | 'actualEndDate'
> & {
  planStartDate?: Dayjs;
  planEndDate?: Dayjs;
  actualStartDate?: Dayjs;
  actualEndDate?: Dayjs;
};

/** 明细行表单。 */
type ProductionOrderLineForm = ErpProductionOrderLineSaveRequest;

export default function ErpProductionOrderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ProductionOrderHeaderForm>();
  const [lineForm] = Form.useForm<ProductionOrderLineForm>();

  const [data, setData] = useState<ErpProductionOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | undefined>(undefined);
  const [orderType, setOrderType] = useState<string | undefined>(undefined);
  const [materialCode, setMaterialCode] = useState('');
  const [planNo, setPlanNo] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpProductionOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpProductionOrderLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = orderStatus,
      type = orderType,
      material = materialCode,
      plan = planNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpProductionOrderQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          orderStatus: status,
          orderType: type,
          materialCode: material || undefined,
          planNo: plan || undefined,
        };
        const res = await erpProductionOrderService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, orderStatus, orderType, materialCode, planNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpProductionOrderService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpProductionOrder) => {
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
      uom: 'PCS',
      orderStatus: 'DRAFT',
      sourceType: 'MANUAL',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpProductionOrder) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      planStartDate: record.planStartDate ? dayjs(record.planStartDate) : undefined,
      planEndDate: record.planEndDate ? dayjs(record.planEndDate) : undefined,
      actualStartDate: record.actualStartDate ? dayjs(record.actualStartDate) : undefined,
      actualEndDate: record.actualEndDate ? dayjs(record.actualEndDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { planStartDate, planEndDate, actualStartDate, actualEndDate, ...rest } = values;
    const payload: ErpProductionOrderSaveRequest = {
      ...rest,
      planStartDate: planStartDate ? planStartDate.format(DATETIME_FORMAT) : undefined,
      planEndDate: planEndDate ? planEndDate.format(DATETIME_FORMAT) : undefined,
      actualStartDate: actualStartDate ? actualStartDate.format(DATETIME_FORMAT) : undefined,
      actualEndDate: actualEndDate ? actualEndDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpProductionOrderService.create(payload);
        message.success('生产订单已创建');
      } else {
        await erpProductionOrderService.update(editId, payload);
        message.success('生产订单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProductionOrderService.remove(id);
    message.success('生产订单已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ lineStatus: 'OPEN', uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpProductionOrderLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const payload: ErpProductionOrderLineSaveRequest = { ...values };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpProductionOrderService.updateLine(lineEditing.id, payload);
        message.success('生产订单行已更新');
      } else if (headerId != null) {
        await erpProductionOrderService.addLine(headerId, payload);
        message.success('生产订单行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpProductionOrderLine) => {
    if (line.id == null) return;
    await erpProductionOrderService.removeLine(line.id);
    message.success('生产订单行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpProductionOrder> = [
    { title: '订单单号', dataIndex: 'orderNo', width: 170, fixed: 'left', render: plain },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 110,
      render: (v) => statusTag(ERP_PRODUCTION_ORDER_TYPE_LABEL, v),
    },
    { title: '生产物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 100, render: plain },
    { title: '完工数量', dataIndex: 'completedQty', width: 100, render: plain },
    { title: '报废数量', dataIndex: 'scrapQty', width: 100, render: plain },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      width: 110,
      render: (v) => statusTag(ERP_PRODUCTION_ORDER_STATUS_LABEL, v),
    },
    { title: '计划开始日期', dataIndex: 'planStartDate', width: 170, render: formatDateTime },
    { title: '计划结束日期', dataIndex: 'planEndDate', width: 170, render: formatDateTime },
    { title: '实际开始日期', dataIndex: 'actualStartDate', width: 170, render: formatDateTime },
    { title: '实际结束日期', dataIndex: 'actualEndDate', width: 170, render: formatDateTime },
    { title: '车间', dataIndex: 'workshop', width: 120, render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 130, render: plain },
    { title: 'BOM 版本', dataIndex: 'bomVersion', width: 110, render: plain },
    { title: '工艺路线版本', dataIndex: 'routingVersion', width: 120, render: plain },
    { title: '来源类型', dataIndex: 'sourceType', width: 110, render: plain },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '计划单号', dataIndex: 'planNo', width: 150, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
              title="确认删除该生产订单？"
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

  const lineColumns: ColumnsType<ErpProductionOrderLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    {
      title: '行状态',
      dataIndex: 'lineStatus',
      width: 100,
      render: (v) => statusTag(ERP_PRODUCTION_LINE_STATUS_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '需求数量', dataIndex: 'requiredQty', width: 100, render: plain },
    { title: '已发数量', dataIndex: 'issuedQty', width: 100, render: plain },
    { title: '已领数量', dataIndex: 'pickedQty', width: 100, render: plain },
    { title: '剩余数量', dataIndex: 'remainingQty', width: 100, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true, render: plain },
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
            <Popconfirm title="确认删除该生产订单行？" onConfirm={() => void removeLine(record)}>
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
        生产订单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="订单状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={orderStatus}
              onChange={(v) => setOrderStatus(v)}
              options={[...ERP_PRODUCTION_ORDER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={orderType}
              onChange={(v) => setOrderType(v)}
              options={[...ERP_PRODUCTION_ORDER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="生产物料编码">
            <Input
              placeholder="请输入生产物料编码"
              allowClear
              style={{ width: 180 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="计划单号">
            <Input
              placeholder="请输入计划单号"
              allowClear
              style={{ width: 160 }}
              value={planNo}
              onChange={(e) => setPlanNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="订单单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, orderStatus, orderType, materialCode, planNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setOrderStatus(undefined);
                  setOrderType(undefined);
                  setMaterialCode('');
                  setPlanNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建生产订单
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`生产订单（共 ${total} 条）`}>
        <Table<ErpProductionOrder>
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
        title={editId == null ? '新建生产订单' : '编辑生产订单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="订单单号">
            <Input disabled placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderType" label="订单类型">
            <Select placeholder="为空默认 STANDARD" options={[...ERP_PRODUCTION_ORDER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="生产物料编码"
            rules={[{ required: true, message: '请输入生产物料编码' }]}
          >
            <Input placeholder="请输入生产物料编码" />
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
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入计划数量" />
          </Form.Item>
          <Form.Item name="completedQty" label="完工数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入完工数量" />
          </Form.Item>
          <Form.Item name="scrapQty" label="报废数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入报废数量" />
          </Form.Item>
          <Form.Item name="orderStatus" label="订单状态">
            <Select
              placeholder="为空默认 DRAFT"
              options={[...ERP_PRODUCTION_ORDER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="planStartDate" label="计划开始日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择计划开始日期" />
          </Form.Item>
          <Form.Item name="planEndDate" label="计划结束日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择计划结束日期" />
          </Form.Item>
          <Form.Item name="actualStartDate" label="实际开始日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择实际开始日期" />
          </Form.Item>
          <Form.Item name="actualEndDate" label="实际结束日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择实际结束日期" />
          </Form.Item>
          <Form.Item name="workshop" label="车间">
            <Input placeholder="请输入车间" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="bomVersion" label="BOM 版本">
            <Input placeholder="请输入 BOM 版本" />
          </Form.Item>
          <Form.Item name="routingVersion" label="工艺路线版本">
            <Input placeholder="请输入工艺路线版本" />
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Input placeholder="为空默认 MANUAL" />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="planNo" label="计划单号">
            <Input placeholder="请输入计划单号" />
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
        title={`生产订单明细${detail?.header?.orderNo ? `：${detail.header.orderNo}` : ''}`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="订单单号">{plain(detail?.header?.orderNo)}</Descriptions.Item>
          <Descriptions.Item label="订单类型">
            {statusTag(ERP_PRODUCTION_ORDER_TYPE_LABEL, detail?.header?.orderType)}
          </Descriptions.Item>
          <Descriptions.Item label="生产物料编码">
            {plain(detail?.header?.materialCode)}
          </Descriptions.Item>
          <Descriptions.Item label="物料名称">{plain(detail?.header?.materialName)}</Descriptions.Item>
          <Descriptions.Item label="规格型号">{plain(detail?.header?.spec)}</Descriptions.Item>
          <Descriptions.Item label="单位">{plain(detail?.header?.uom)}</Descriptions.Item>
          <Descriptions.Item label="计划数量">{plain(detail?.header?.planQty)}</Descriptions.Item>
          <Descriptions.Item label="完工数量">{plain(detail?.header?.completedQty)}</Descriptions.Item>
          <Descriptions.Item label="报废数量">{plain(detail?.header?.scrapQty)}</Descriptions.Item>
          <Descriptions.Item label="订单状态">
            {statusTag(ERP_PRODUCTION_ORDER_STATUS_LABEL, detail?.header?.orderStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="计划开始日期">
            {formatDateTime(detail?.header?.planStartDate)}
          </Descriptions.Item>
          <Descriptions.Item label="计划结束日期">
            {formatDateTime(detail?.header?.planEndDate)}
          </Descriptions.Item>
          <Descriptions.Item label="实际开始日期">
            {formatDateTime(detail?.header?.actualStartDate)}
          </Descriptions.Item>
          <Descriptions.Item label="实际结束日期">
            {formatDateTime(detail?.header?.actualEndDate)}
          </Descriptions.Item>
          <Descriptions.Item label="车间">{plain(detail?.header?.workshop)}</Descriptions.Item>
          <Descriptions.Item label="产线编码">{plain(detail?.header?.lineCode)}</Descriptions.Item>
          <Descriptions.Item label="BOM 版本">{plain(detail?.header?.bomVersion)}</Descriptions.Item>
          <Descriptions.Item label="工艺路线版本">
            {plain(detail?.header?.routingVersion)}
          </Descriptions.Item>
          <Descriptions.Item label="来源类型">{plain(detail?.header?.sourceType)}</Descriptions.Item>
          <Descriptions.Item label="来源单号">{plain(detail?.header?.sourceNo)}</Descriptions.Item>
          <Descriptions.Item label="计划单号">{plain(detail?.header?.planNo)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDateTime(detail?.header?.createdAt)}
          </Descriptions.Item>
        </Descriptions>

        {hasPermission(MANAGE) && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            style={{ marginBottom: 12 }}
            onClick={openLineCreate}
          >
            新增明细行
          </Button>
        )}

        <Table<ErpProductionOrderLine>
          rowKey="id"
          size="small"
          loading={detailLoading}
          columns={lineColumns}
          dataSource={detail?.lines || []}
          scroll={{ x: 1800 }}
          pagination={false}
        />
      </Drawer>

      <Modal
        title={lineEditing ? '编辑生产订单行' : '新增生产订单行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="lineNo" label="行号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入行号" />
          </Form.Item>
          <Form.Item name="lineStatus" label="行状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_PRODUCTION_LINE_STATUS_OPTIONS]} />
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
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="uom" label="单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="requiredQty" label="需求数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入需求数量" />
          </Form.Item>
          <Form.Item name="issuedQty" label="已发数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已发数量" />
          </Form.Item>
          <Form.Item name="pickedQty" label="已领数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已领数量" />
          </Form.Item>
          <Form.Item name="remainingQty" label="剩余数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入剩余数量" />
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
