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
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined, SortAscendingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { wmsService } from '@/services/wmsService';
import {
  WMS_BATCH_STATUS_COLOR,
  WMS_BATCH_STATUS_LABEL,
  WMS_BATCH_STATUS_OPTIONS,
  WMS_ENABLED_COLOR,
  WMS_ENABLED_LABEL,
  WMS_ENABLED_OPTIONS,
  WMS_INSPECTION_STATUS_COLOR,
  WMS_INSPECTION_STATUS_LABEL,
  WMS_INSPECTION_STATUS_OPTIONS,
  WMS_LOCATION_TYPE_LABEL,
  WMS_LOCATION_TYPE_OPTIONS,
  type WmsBatchQuery,
  type WmsBatchSaveParams,
  type WmsLocationQuery,
  type WmsLocationSaveParams,
  type WmsMaterialBatchItem,
  type WmsStorageLocationItem,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ==================== 库位货架 ==================== */

interface LocationSearchState {
  locationCode?: string;
  locationName?: string;
  warehouseCode?: string;
  locationType?: string;
  lineCode?: string;
  status?: string;
}

interface LocationFormValues {
  locationCode: string;
  locationName?: string;
  warehouseCode?: string;
  areaCode?: string;
  rackCode?: string;
  levelCode?: string;
  binCode?: string;
  locationType?: string;
  lineCode?: string;
  capacity?: number;
  status?: string;
  remark?: string;
}

function LocationTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<LocationFormValues>();

  const [data, setData] = useState<WmsStorageLocationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<LocationSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WmsStorageLocationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsLocationQuery = {
          pageNum: page,
          pageSize: size,
          locationCode: cond.locationCode || undefined,
          locationName: cond.locationName || undefined,
          warehouseCode: cond.warehouseCode || undefined,
          locationType: cond.locationType || undefined,
          lineCode: cond.lineCode || undefined,
          status: cond.status || undefined,
        };
        const res = await wmsService.locationPage(params);
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

  const onSearch = (values: LocationSearchState) => {
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
    form.setFieldsValue({ locationType: 'RACK', status: 'enabled' });
    setModalOpen(true);
  };

  const openEdit = (record: WmsStorageLocationItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      locationCode: record.locationCode,
      locationName: record.locationName,
      warehouseCode: record.warehouseCode,
      areaCode: record.areaCode,
      rackCode: record.rackCode,
      levelCode: record.levelCode,
      binCode: record.binCode,
      locationType: record.locationType,
      lineCode: record.lineCode,
      capacity: record.capacity,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsLocationSaveParams = {
      locationCode: values.locationCode,
      locationName: values.locationName,
      warehouseCode: values.warehouseCode,
      areaCode: values.areaCode,
      rackCode: values.rackCode,
      levelCode: values.levelCode,
      binCode: values.binCode,
      locationType: values.locationType,
      lineCode: values.lineCode,
      capacity: values.capacity,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await wmsService.locationUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await wmsService.locationCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: WmsStorageLocationItem) => {
    await wmsService.locationRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<WmsStorageLocationItem> = [
    { title: '库位编码', dataIndex: 'locationCode', width: 140, render: (v) => v || '-' },
    { title: '库位名称', dataIndex: 'locationName', width: 150, render: (v) => v || '-' },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: (v) => v || '-' },
    { title: '库区编码', dataIndex: 'areaCode', width: 110, render: (v) => v || '-' },
    { title: '货架编码', dataIndex: 'rackCode', width: 110, render: (v) => v || '-' },
    {
      title: '库位类型',
      dataIndex: 'locationType',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color="blue">{WMS_LOCATION_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    { title: '产线编码', dataIndex: 'lineCode', width: 110, render: (v) => v || '-' },
    { title: '容量', dataIndex: 'capacity', width: 90, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={WMS_ENABLED_COLOR[v]}>{WMS_ENABLED_LABEL[v] || v}</Tag> : '-',
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
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('wms:location:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('wms:location:delete') && (
            <Popconfirm title="确认删除该库位？" onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="locationCode" label="库位编码">
            <Input placeholder="请输入库位编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="locationName" label="库位名称">
            <Input placeholder="请输入库位名称" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="locationType" label="库位类型">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={WMS_LOCATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={WMS_ENABLED_OPTIONS} />
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
        title={`库位货架列表（共 ${total} 条）`}
        extra={
          hasPermission('wms:location:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增库位
            </Button>
          )
        }
      >
        <Table<WmsStorageLocationItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title={editing ? '编辑库位' : '新增库位'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="locationCode" label="库位编码" rules={[{ required: true, message: '请输入库位编码' }]}>
            <Input placeholder="请输入库位编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="locationName" label="库位名称">
            <Input placeholder="请输入库位名称" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="areaCode" label="库区编码">
            <Input placeholder="请输入库区编码" />
          </Form.Item>
          <Form.Item name="rackCode" label="货架编码">
            <Input placeholder="请输入货架编码" />
          </Form.Item>
          <Form.Item name="levelCode" label="层编码">
            <Input placeholder="请输入层编码" />
          </Form.Item>
          <Form.Item name="binCode" label="格口编码">
            <Input placeholder="请输入格口编码" />
          </Form.Item>
          <Form.Item name="locationType" label="库位类型">
            <Select placeholder="请选择" options={WMS_LOCATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="capacity" label="容量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入容量" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={WMS_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ==================== 物料批次 ==================== */

interface BatchSearchState {
  materialCode?: string;
  batchNo?: string;
  locationCode?: string;
  containerCode?: string;
  supplierCode?: string;
  inspectionStatus?: string;
  batchStatus?: string;
}

interface BatchFormValues {
  batchNo: string;
  materialCode: string;
  materialName?: string;
  locationCode?: string;
  containerCode?: string;
  supplierCode?: string;
  qtyOnHand?: number;
  unit?: string;
  inboundDate?: Dayjs;
  expiryDate?: Dayjs;
  inspectionStatus?: string;
  batchStatus?: string;
  remark?: string;
}

function BatchTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BatchFormValues>();

  const [data, setData] = useState<WmsMaterialBatchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<BatchSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WmsMaterialBatchItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fifoOpen, setFifoOpen] = useState(false);
  const [fifoLoading, setFifoLoading] = useState(false);
  const [fifoList, setFifoList] = useState<WmsMaterialBatchItem[]>([]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsBatchQuery = {
          pageNum: page,
          pageSize: size,
          materialCode: cond.materialCode || undefined,
          batchNo: cond.batchNo || undefined,
          locationCode: cond.locationCode || undefined,
          containerCode: cond.containerCode || undefined,
          supplierCode: cond.supplierCode || undefined,
          inspectionStatus: cond.inspectionStatus || undefined,
          batchStatus: cond.batchStatus || undefined,
        };
        const res = await wmsService.batchPage(params);
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

  const onSearch = (values: BatchSearchState) => {
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
    form.setFieldsValue({ inspectionStatus: 'PENDING', batchStatus: 'IN_STOCK' });
    setModalOpen(true);
  };

  const openEdit = (record: WmsMaterialBatchItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      batchNo: record.batchNo,
      materialCode: record.materialCode,
      materialName: record.materialName,
      locationCode: record.locationCode,
      containerCode: record.containerCode,
      supplierCode: record.supplierCode,
      qtyOnHand: record.qtyOnHand,
      unit: record.unit,
      inboundDate: record.inboundDate ? dayjs(record.inboundDate) : undefined,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : undefined,
      inspectionStatus: record.inspectionStatus,
      batchStatus: record.batchStatus,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsBatchSaveParams = {
      batchNo: values.batchNo,
      materialCode: values.materialCode,
      materialName: values.materialName,
      locationCode: values.locationCode,
      containerCode: values.containerCode,
      supplierCode: values.supplierCode,
      qtyOnHand: values.qtyOnHand,
      unit: values.unit,
      inboundDate: values.inboundDate ? values.inboundDate.format('YYYY-MM-DD') : undefined,
      expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
      inspectionStatus: values.inspectionStatus,
      batchStatus: values.batchStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await wmsService.batchUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await wmsService.batchCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: WmsMaterialBatchItem) => {
    await wmsService.batchRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleFifo = async () => {
    if (!search.materialCode) {
      message.warning('请先在查询条件中填写物料编码');
      return;
    }
    setFifoOpen(true);
    setFifoLoading(true);
    try {
      const list = await wmsService.batchFifo(search.materialCode, search.locationCode || undefined);
      setFifoList(list || []);
    } finally {
      setFifoLoading(false);
    }
  };

  const columns: ColumnsType<WmsMaterialBatchItem> = [
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 150, render: (v) => v || '-' },
    { title: '库位编码', dataIndex: 'locationCode', width: 120, render: (v) => v || '-' },
    { title: '容器编码', dataIndex: 'containerCode', width: 120, render: (v) => v || '-' },
    { title: '现有数量', dataIndex: 'qtyOnHand', width: 100, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '入库日期', dataIndex: 'inboundDate', width: 120, render: (v) => v || '-' },
    { title: '到期日期', dataIndex: 'expiryDate', width: 120, render: (v) => v || '-' },
    {
      title: '检验状态',
      dataIndex: 'inspectionStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_INSPECTION_STATUS_COLOR[v]}>{WMS_INSPECTION_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '批次状态',
      dataIndex: 'batchStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_BATCH_STATUS_COLOR[v]}>{WMS_BATCH_STATUS_LABEL[v] || v}</Tag> : '-',
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
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('wms:batch:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('wms:batch:save') && (
            <Popconfirm title="确认删除该批次？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const fifoColumns: ColumnsType<WmsMaterialBatchItem> = [
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '入库日期', dataIndex: 'inboundDate', width: 120, render: (v) => v || '-' },
    { title: '放行日期', dataIndex: 'releaseDate', width: 120, render: (v) => v || '-' },
    { title: '现有数量', dataIndex: 'qtyOnHand', width: 100, render: (v) => (v ?? '-') },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="locationCode" label="库位编码">
            <Input placeholder="请输入库位编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="containerCode" label="容器编码">
            <Input placeholder="请输入容器编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="inspectionStatus" label="检验状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_INSPECTION_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="batchStatus" label="批次状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_BATCH_STATUS_OPTIONS} />
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
        title={`物料批次列表（共 ${total} 条）`}
        extra={
          <Space>
            <Button icon={<SortAscendingOutlined />} onClick={handleFifo}>
              FIFO 排序查看
            </Button>
            {hasPermission('wms:batch:save') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                新增批次
              </Button>
            )}
          </Space>
        }
      >
        <Table<WmsMaterialBatchItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1650 }}
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
        title={editing ? '编辑批次' : '新增批次'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="批次号" rules={[{ required: true, message: '请输入批次号' }]}>
            <Input placeholder="请输入批次号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="locationCode" label="库位编码">
            <Input placeholder="请输入库位编码" />
          </Form.Item>
          <Form.Item name="containerCode" label="容器编码">
            <Input placeholder="请输入容器编码" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="qtyOnHand" label="现有数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入现有数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="inboundDate" label="入库日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择入库日期" />
          </Form.Item>
          <Form.Item name="expiryDate" label="到期日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择到期日期" />
          </Form.Item>
          <Form.Item name="inspectionStatus" label="检验状态">
            <Select placeholder="请选择" options={WMS_INSPECTION_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="batchStatus" label="批次状态">
            <Select placeholder="请选择" options={WMS_BATCH_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`FIFO 排序结果${search.materialCode ? `（物料：${search.materialCode}）` : ''}`}
        open={fifoOpen}
        onCancel={() => setFifoOpen(false)}
        footer={null}
        width={720}
      >
        <Table<WmsMaterialBatchItem>
          rowKey="id"
          size="small"
          loading={fifoLoading}
          columns={fifoColumns}
          dataSource={fifoList}
          pagination={false}
          scroll={{ x: 520 }}
        />
      </Modal>
    </Space>
  );
}

export default function WmsLocationPage() {
  const items = [
    { key: 'location', label: '库位货架', children: <LocationTab /> },
    { key: 'batch', label: '物料批次', children: <BatchTab /> },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        库位与物料标识
      </Title>
      <Card>
        <Tabs items={items} />
      </Card>
    </Space>
  );
}
