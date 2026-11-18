import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { wmsService } from '@/services/wmsService';
import {
  WMS_STOCK_STATUS_COLOR,
  WMS_STOCK_STATUS_LABEL,
  WMS_STOCK_STATUS_OPTIONS,
  WMS_TXN_TYPE_COLOR,
  WMS_TXN_TYPE_LABEL,
  WMS_TXN_TYPE_OPTIONS,
  type WmsInventoryTxnItem,
  type WmsInventoryTxnQuery,
  type WmsLineSideStockItem,
  type WmsLineStockQuery,
  type WmsLineStockSaveParams,
  type WmsLineStockTxnParams,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface LineStockFormValues {
  lineCode: string;
  workStation?: string;
  materialCode: string;
  materialName?: string;
  batchNo?: string;
  containerCode?: string;
  unit?: string;
  qtyOnHand?: number;
  safetyStock?: number;
  stockStatus?: string;
  remark?: string;
}

interface LineStockSearchState {
  lineCode?: string;
  workStation?: string;
  materialCode?: string;
  batchNo?: string;
  stockStatus?: string;
}

interface TxnFormValues {
  qty: number;
  workOrderNo?: string;
  refNo?: string;
  operatorName?: string;
  remark?: string;
}

type TxnAction = 'consume' | 'return' | 'scrap' | 'adjust';

const TXN_ACTION_META: Record<
  TxnAction,
  { title: string; run: (id: number, data: WmsLineStockTxnParams) => Promise<WmsLineSideStockItem> }
> = {
  consume: { title: '消耗', run: wmsService.lineStockConsume },
  return: { title: '退料', run: wmsService.lineStockReturn },
  scrap: { title: '报废', run: wmsService.lineStockScrap },
  adjust: { title: '盘点调整', run: wmsService.lineStockAdjust },
};

/* ==================== 线边库存 ==================== */

function LineStockTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<LineStockFormValues>();
  const [txnForm] = Form.useForm<TxnFormValues>();

  const [data, setData] = useState<WmsLineSideStockItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<LineStockSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WmsLineSideStockItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [txnOpen, setTxnOpen] = useState(false);
  const [txnAction, setTxnAction] = useState<TxnAction | null>(null);
  const [txnRecord, setTxnRecord] = useState<WmsLineSideStockItem | null>(null);
  const [txnSubmitting, setTxnSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsLineStockQuery = {
          pageNum: page,
          pageSize: size,
          lineCode: cond.lineCode || undefined,
          workStation: cond.workStation || undefined,
          materialCode: cond.materialCode || undefined,
          batchNo: cond.batchNo || undefined,
          stockStatus: cond.stockStatus || undefined,
        };
        const res = await wmsService.lineStockPage(params);
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

  const onSearch = (values: LineStockSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ stockStatus: 'NORMAL' });
    setModalOpen(true);
  };

  const openEdit = (record: WmsLineSideStockItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      lineCode: record.lineCode,
      workStation: record.workStation,
      materialCode: record.materialCode,
      materialName: record.materialName,
      batchNo: record.batchNo,
      containerCode: record.containerCode,
      unit: record.unit,
      qtyOnHand: record.qtyOnHand,
      safetyStock: record.safetyStock,
      stockStatus: record.stockStatus,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsLineStockSaveParams = {
      lineCode: values.lineCode,
      workStation: values.workStation,
      materialCode: values.materialCode,
      materialName: values.materialName,
      batchNo: values.batchNo,
      containerCode: values.containerCode,
      unit: values.unit,
      qtyOnHand: values.qtyOnHand,
      safetyStock: values.safetyStock,
      stockStatus: values.stockStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await wmsService.lineStockUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await wmsService.lineStockCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: WmsLineSideStockItem) => {
    await wmsService.lineStockRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const openTxn = (record: WmsLineSideStockItem, action: TxnAction) => {
    setTxnRecord(record);
    setTxnAction(action);
    txnForm.resetFields();
    setTxnOpen(true);
  };

  const handleSubmitTxn = async () => {
    if (!txnAction || !txnRecord) return;
    const values = await txnForm.validateFields();
    const payload: WmsLineStockTxnParams = {
      qty: values.qty,
      workOrderNo: values.workOrderNo,
      refNo: values.refNo,
      operatorName: values.operatorName,
      remark: values.remark,
    };
    setTxnSubmitting(true);
    try {
      await TXN_ACTION_META[txnAction].run(txnRecord.id, payload);
      message.success(`${TXN_ACTION_META[txnAction].title}成功`);
      setTxnOpen(false);
      void loadData();
    } finally {
      setTxnSubmitting(false);
    }
  };

  const columns: ColumnsType<WmsLineSideStockItem> = [
    { title: '产线', dataIndex: 'lineCode', width: 120, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'workStation', width: 110, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: (v) => v || '-' },
    { title: '容器号', dataIndex: 'containerCode', width: 120, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '在库数量', dataIndex: 'qtyOnHand', width: 100, render: (v) => v ?? '-' },
    { title: '已发料', dataIndex: 'qtyIssued', width: 100, render: (v) => v ?? '-' },
    { title: '已消耗', dataIndex: 'qtyConsumed', width: 100, render: (v) => v ?? '-' },
    { title: '已退料', dataIndex: 'qtyReturned', width: 100, render: (v) => v ?? '-' },
    { title: '已报废', dataIndex: 'qtyScrapped', width: 100, render: (v) => v ?? '-' },
    { title: '安全库存', dataIndex: 'safetyStock', width: 100, render: (v) => v ?? '-' },
    {
      title: '库存状态',
      dataIndex: 'stockStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_STOCK_STATUS_COLOR[v]}>{WMS_STOCK_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) =>
        hasPermission('wms:linestock:operate') ? (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => openTxn(record, 'consume')}>
              消耗
            </Button>
            <Button type="link" size="small" onClick={() => openTxn(record, 'return')}>
              退料
            </Button>
            <Button type="link" size="small" onClick={() => openTxn(record, 'scrap')}>
              报废
            </Button>
            <Button type="link" size="small" onClick={() => openTxn(record, 'adjust')}>
              盘点调整
            </Button>
            <Popconfirm title="确认删除该线边库存？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="stockStatus" label="库存状态">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={WMS_STOCK_STATUS_OPTIONS} />
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
        title={`线边库存（共 ${total} 条）`}
        extra={
          hasPermission('wms:linestock:operate') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增线边库存
            </Button>
          )
        }
      >
        <Table<WmsLineSideStockItem>
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

      {/* 新增/编辑线边库存 */}
      <Modal
        title={editing ? '编辑线边库存' : '新增线边库存'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="lineCode" label="产线" rules={[{ required: true, message: '请输入产线编码' }]}>
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="containerCode" label="容器号">
            <Input placeholder="请输入容器号" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="qtyOnHand" label="在库数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入在库数量" />
          </Form.Item>
          <Form.Item name="safetyStock" label="安全库存">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入安全库存" />
          </Form.Item>
          <Form.Item name="stockStatus" label="库存状态">
            <Select placeholder="请选择" allowClear options={WMS_STOCK_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 库存操作：消耗 / 退料 / 报废 / 盘点调整 */}
      <Modal
        title={txnAction ? TXN_ACTION_META[txnAction].title : '库存操作'}
        open={txnOpen}
        onOk={handleSubmitTxn}
        confirmLoading={txnSubmitting}
        onCancel={() => setTxnOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={txnForm} layout="vertical" preserve={false}>
          <Form.Item name="qty" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="refNo" label="关联单号">
            <Input placeholder="请输入关联单号" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ==================== 库存流水 ==================== */

interface TxnSearchState {
  txnType?: string;
  materialCode?: string;
  batchNo?: string;
  lineCode?: string;
  workOrderNo?: string;
  refNo?: string;
}

function TxnTab() {
  const [data, setData] = useState<WmsInventoryTxnItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<TxnSearchState>({});

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsInventoryTxnQuery = {
          pageNum: page,
          pageSize: size,
          txnType: cond.txnType || undefined,
          materialCode: cond.materialCode || undefined,
          batchNo: cond.batchNo || undefined,
          lineCode: cond.lineCode || undefined,
          workOrderNo: cond.workOrderNo || undefined,
          refNo: cond.refNo || undefined,
        };
        const res = await wmsService.txnPage(params);
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

  const onSearch = (values: TxnSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const columns: ColumnsType<WmsInventoryTxnItem> = [
    { title: '流水号', dataIndex: 'txnNo', width: 180, render: (v) => v || '-' },
    {
      title: '流水类型',
      dataIndex: 'txnType',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_TXN_TYPE_COLOR[v]}>{WMS_TXN_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: (v) => v || '-' },
    { title: '来源库位', dataIndex: 'fromLocationCode', width: 140, render: (v) => v || '-' },
    { title: '目标库位', dataIndex: 'toLocationCode', width: 140, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'qty', width: 90, render: (v) => v ?? '-' },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '工单号', dataIndex: 'workOrderNo', width: 140, render: (v) => v || '-' },
    { title: '产线', dataIndex: 'lineCode', width: 120, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'workStation', width: 110, render: (v) => v || '-' },
    { title: '关联单号', dataIndex: 'refNo', width: 140, render: (v) => v || '-' },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: (v) => v || '-' },
    {
      title: '发生时间',
      dataIndex: 'txnAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="txnType" label="流水类型">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={WMS_TXN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="refNo" label="关联单号">
            <Input placeholder="请输入关联单号" allowClear style={{ width: 150 }} />
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

      <Card title={`库存流水（共 ${total} 条）`}>
        <Table<WmsInventoryTxnItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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

/* ==================== 线边库存与库存流水 ==================== */

export default function WmsLineStockPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        线边库存与库存流水
      </Title>

      <Tabs
        defaultActiveKey="stock"
        items={[
          { key: 'stock', label: '线边库存', children: <LineStockTab /> },
          { key: 'txn', label: '库存流水', children: <TxnTab /> },
        ]}
      />
    </Space>
  );
}
