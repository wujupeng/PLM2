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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { wmsService } from '@/services/wmsService';
import {
  WMS_DELIVERY_STATUS_LABEL,
  WMS_ENABLED_COLOR,
  WMS_ENABLED_LABEL,
  WMS_ENABLED_OPTIONS,
  WMS_KANBAN_STATUS_COLOR,
  WMS_KANBAN_STATUS_LABEL,
  WMS_KANBAN_STATUS_OPTIONS,
  WMS_KANBAN_TYPE_LABEL,
  WMS_KANBAN_TYPE_OPTIONS,
  WMS_PULL_SIGNAL_OPTIONS,
  type WmsDeliveryTaskItem,
  type WmsKanbanItem,
  type WmsKanbanQuery,
  type WmsKanbanSaveParams,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface KanbanFormValues {
  kanbanNo?: string;
  kanbanType?: string;
  materialCode: string;
  materialName?: string;
  fromLocationCode?: string;
  lineCode?: string;
  workStation?: string;
  containerQty?: number;
  replenishPoint?: number;
  minQty?: number;
  maxQty?: number;
  currentQty?: number;
  kanbanStatus?: string;
  pullSignal?: string;
  supplierCode?: string;
  leadTimeDays?: number;
  status?: string;
  remark?: string;
}

interface PullFormValues {
  triggeredBy: string;
  qty?: number;
  remark?: string;
}

interface SearchState {
  kanbanType?: string;
  materialCode?: string;
  lineCode?: string;
  kanbanStatus?: string;
  status?: string;
}

const pullSignalLabel = (v?: string) =>
  WMS_PULL_SIGNAL_OPTIONS.find((o) => o.value === v)?.label || v || '-';

export default function WmsKanbanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const username = useAuthStore((state) => state.userInfo?.username);
  const [form] = Form.useForm<KanbanFormValues>();
  const [pullForm] = Form.useForm<PullFormValues>();

  const [data, setData] = useState<WmsKanbanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WmsKanbanItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [pullOpen, setPullOpen] = useState(false);
  const [pullTarget, setPullTarget] = useState<WmsKanbanItem | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<WmsDeliveryTaskItem | null>(null);
  const [pullResultOpen, setPullResultOpen] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsKanbanQuery = {
          pageNum: page,
          pageSize: size,
          kanbanType: cond.kanbanType || undefined,
          materialCode: cond.materialCode || undefined,
          lineCode: cond.lineCode || undefined,
          kanbanStatus: cond.kanbanStatus || undefined,
          status: cond.status || undefined,
        };
        const res = await wmsService.kanbanPage(params);
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

  const onSearch = (values: SearchState) => {
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
    form.setFieldsValue({ kanbanType: 'PRODUCTION', kanbanStatus: 'FULL', status: 'enabled' });
    setModalOpen(true);
  };

  const openEdit = (record: WmsKanbanItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      kanbanNo: record.kanbanNo,
      kanbanType: record.kanbanType,
      materialCode: record.materialCode,
      materialName: record.materialName,
      fromLocationCode: record.fromLocationCode,
      lineCode: record.lineCode,
      workStation: record.workStation,
      containerQty: record.containerQty,
      replenishPoint: record.replenishPoint,
      minQty: record.minQty,
      maxQty: record.maxQty,
      currentQty: record.currentQty,
      kanbanStatus: record.kanbanStatus,
      pullSignal: record.pullSignal,
      supplierCode: record.supplierCode,
      leadTimeDays: record.leadTimeDays,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsKanbanSaveParams = {
      kanbanNo: values.kanbanNo,
      kanbanType: values.kanbanType,
      materialCode: values.materialCode,
      materialName: values.materialName,
      fromLocationCode: values.fromLocationCode,
      lineCode: values.lineCode,
      workStation: values.workStation,
      containerQty: values.containerQty,
      replenishPoint: values.replenishPoint,
      minQty: values.minQty,
      maxQty: values.maxQty,
      currentQty: values.currentQty,
      kanbanStatus: values.kanbanStatus,
      pullSignal: values.pullSignal,
      supplierCode: values.supplierCode,
      leadTimeDays: values.leadTimeDays,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await wmsService.kanbanUpdate(editing.kanbanNo, payload);
        message.success('更新成功');
      } else {
        await wmsService.kanbanCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: WmsKanbanItem) => {
    await wmsService.kanbanRemove(record.kanbanNo);
    message.success('删除成功');
    void loadData();
  };

  const openPull = (record: WmsKanbanItem) => {
    setPullTarget(record);
    pullForm.resetFields();
    pullForm.setFieldsValue({ triggeredBy: username });
    setPullOpen(true);
  };

  const handlePull = async () => {
    if (!pullTarget) return;
    const values = await pullForm.validateFields();
    setPulling(true);
    try {
      const res = await wmsService.kanbanPull(pullTarget.kanbanNo, {
        triggeredBy: values.triggeredBy,
        qty: values.qty,
        remark: values.remark,
      });
      message.success('拉动补货成功');
      setPullOpen(false);
      setPullResult(res);
      setPullResultOpen(true);
      void loadData();
    } finally {
      setPulling(false);
    }
  };

  const columns: ColumnsType<WmsKanbanItem> = [
    { title: '看板编号', dataIndex: 'kanbanNo', width: 150, fixed: 'left', render: (v) => v || '-' },
    {
      title: '看板类型',
      dataIndex: 'kanbanType',
      width: 110,
      render: (v?: string) => (v ? WMS_KANBAN_TYPE_LABEL[v] || v : '-'),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: (v) => v || '-' },
    { title: '来源库位', dataIndex: 'fromLocationCode', width: 120, render: (v) => v || '-' },
    { title: '产线', dataIndex: 'lineCode', width: 100, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'workStation', width: 100, render: (v) => v || '-' },
    { title: '容器数量', dataIndex: 'containerQty', width: 100, render: (v) => (v ?? '-') },
    { title: '补货点', dataIndex: 'replenishPoint', width: 90, render: (v) => (v ?? '-') },
    { title: '上限数量', dataIndex: 'maxQty', width: 90, render: (v) => (v ?? '-') },
    { title: '当前数量', dataIndex: 'currentQty', width: 90, render: (v) => (v ?? '-') },
    {
      title: '看板状态',
      dataIndex: 'kanbanStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_KANBAN_STATUS_COLOR[v]}>{WMS_KANBAN_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '拉动信号',
      dataIndex: 'pullSignal',
      width: 110,
      render: (v?: string) => pullSignalLabel(v),
    },
    { title: '供应商', dataIndex: 'supplierCode', width: 120, render: (v) => v || '-' },
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('wms:kanban:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('wms:kanban:save') && (
            <Popconfirm title="确认删除该看板？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
          {hasPermission('wms:kanban:pull') && (
            <Button type="link" size="small" onClick={() => openPull(record)}>
              拉动补货
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        电子看板
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="kanbanType" label="看板类型">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={WMS_KANBAN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="kanbanStatus" label="看板状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_KANBAN_STATUS_OPTIONS} />
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
        title={`电子看板列表（共 ${total} 条）`}
        extra={
          hasPermission('wms:kanban:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增看板
            </Button>
          )
        }
      >
        <Table<WmsKanbanItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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

      {/* 新增/编辑看板 */}
      <Modal
        title={editing ? '编辑看板' : '新增看板'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="kanbanNo" label="看板编号" rules={[{ required: true, message: '请输入看板编号' }]}>
            <Input placeholder="请输入看板编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="kanbanType" label="看板类型">
            <Select placeholder="请选择" options={WMS_KANBAN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="fromLocationCode" label="来源库位">
            <Input placeholder="请输入来源库位" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="containerQty" label="容器数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入容器数量" />
          </Form.Item>
          <Form.Item name="replenishPoint" label="补货点">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入补货点" />
          </Form.Item>
          <Form.Item name="minQty" label="下限数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入下限数量" />
          </Form.Item>
          <Form.Item name="maxQty" label="上限数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入上限数量" />
          </Form.Item>
          <Form.Item name="currentQty" label="当前数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入当前数量" />
          </Form.Item>
          <Form.Item name="kanbanStatus" label="看板状态">
            <Select placeholder="请选择" options={WMS_KANBAN_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="pullSignal" label="拉动信号">
            <Select placeholder="请选择" options={WMS_PULL_SIGNAL_OPTIONS} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="leadTimeDays" label="提前期（天）">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入提前期" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={WMS_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 拉动补货 */}
      <Modal
        title={`拉动补货${pullTarget ? `：${pullTarget.kanbanNo}` : ''}`}
        open={pullOpen}
        onOk={handlePull}
        confirmLoading={pulling}
        onCancel={() => setPullOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={pullForm} layout="vertical" preserve={false}>
          <Form.Item name="triggeredBy" label="触发人" rules={[{ required: true, message: '请输入触发人' }]}>
            <Input placeholder="请输入触发人" />
          </Form.Item>
          <Form.Item name="qty" label="补货数量" extra="留空表示按补货规则（上限 - 当前）自动计算">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入补货数量" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 拉动补货结果 */}
      <Modal
        title="拉动补货结果"
        open={pullResultOpen}
        onOk={() => setPullResultOpen(false)}
        onCancel={() => setPullResultOpen(false)}
        footer={<Button type="primary" onClick={() => setPullResultOpen(false)}>关闭</Button>}
        width={480}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>已生成配送任务，请到物料配送页面执行。</div>
          <div>任务号：{pullResult?.taskNo || '-'}</div>
          <div>数量：{pullResult?.qty ?? '-'}</div>
          <div>
            状态：
            {pullResult?.taskStatus
              ? WMS_DELIVERY_STATUS_LABEL[pullResult.taskStatus] || pullResult.taskStatus
              : '-'}
          </div>
        </Space>
      </Modal>
    </Space>
  );
}
