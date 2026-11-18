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
  WMS_DELIVERY_STATUS_COLOR,
  WMS_DELIVERY_STATUS_LABEL,
  WMS_DELIVERY_STATUS_OPTIONS,
  WMS_TASK_TYPE_LABEL,
  WMS_TASK_TYPE_OPTIONS,
  type WmsDeliveryCreateParams,
  type WmsDeliveryQuery,
  type WmsDeliveryTaskItem,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface DeliveryFormValues {
  kanbanNo?: string;
  taskType?: string;
  materialCode: string;
  materialName?: string;
  qty?: number;
  unit?: string;
  fromLocationCode?: string;
  toLocationCode?: string;
  lineCode?: string;
  workStation?: string;
  batchNo?: string;
  priority?: number;
  remark?: string;
}

interface ExecuteFormValues {
  assignee?: string;
  signBy?: string;
}

interface SearchState {
  taskNo?: string;
  kanbanNo?: string;
  materialCode?: string;
  lineCode?: string;
  taskType?: string;
  taskStatus?: string;
  assignee?: string;
}

const formatTime = (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-');

export default function WmsDeliveryPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const username = useAuthStore((state) => state.userInfo?.username);
  const [form] = Form.useForm<DeliveryFormValues>();
  const [execForm] = Form.useForm<ExecuteFormValues>();

  const [data, setData] = useState<WmsDeliveryTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [execOpen, setExecOpen] = useState(false);
  const [execAction, setExecAction] = useState<'accept' | 'sign'>('accept');
  const [execTarget, setExecTarget] = useState<WmsDeliveryTaskItem | null>(null);
  const [executing, setExecuting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsDeliveryQuery = {
          pageNum: page,
          pageSize: size,
          taskNo: cond.taskNo || undefined,
          kanbanNo: cond.kanbanNo || undefined,
          materialCode: cond.materialCode || undefined,
          lineCode: cond.lineCode || undefined,
          taskType: cond.taskType || undefined,
          taskStatus: cond.taskStatus || undefined,
          assignee: cond.assignee || undefined,
        };
        const res = await wmsService.deliveryPage(params);
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
    form.resetFields();
    form.setFieldsValue({ taskType: 'REPLENISH' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsDeliveryCreateParams = {
      kanbanNo: values.kanbanNo,
      taskType: values.taskType,
      materialCode: values.materialCode,
      materialName: values.materialName,
      qty: values.qty,
      unit: values.unit,
      fromLocationCode: values.fromLocationCode,
      toLocationCode: values.toLocationCode,
      lineCode: values.lineCode,
      workStation: values.workStation,
      batchNo: values.batchNo,
      priority: values.priority,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      await wmsService.deliveryCreate(payload);
      message.success('创建成功');
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const openExec = (record: WmsDeliveryTaskItem, action: 'accept' | 'sign') => {
    setExecTarget(record);
    setExecAction(action);
    execForm.resetFields();
    if (action === 'accept') {
      execForm.setFieldsValue({ assignee: record.assignee || username });
    } else {
      execForm.setFieldsValue({ signBy: record.signBy || username });
    }
    setExecOpen(true);
  };

  const handleExec = async () => {
    if (!execTarget) return;
    const values = await execForm.validateFields();
    setExecuting(true);
    try {
      if (execAction === 'accept') {
        await wmsService.deliveryAccept(execTarget.taskNo, { assignee: values.assignee });
        message.success('接单成功');
      } else {
        await wmsService.deliverySign(execTarget.taskNo, { signBy: values.signBy });
        message.success('签收成功');
      }
      setExecOpen(false);
      void loadData();
    } finally {
      setExecuting(false);
    }
  };

  const handleDeliver = async (record: WmsDeliveryTaskItem) => {
    await wmsService.deliveryDeliver(record.taskNo, {});
    message.success('发运成功');
    void loadData();
  };

  const handleCancel = async (record: WmsDeliveryTaskItem) => {
    await wmsService.deliveryCancel(record.taskNo, {});
    message.success('已取消');
    void loadData();
  };

  const columns: ColumnsType<WmsDeliveryTaskItem> = [
    { title: '任务号', dataIndex: 'taskNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '看板编号', dataIndex: 'kanbanNo', width: 140, render: (v) => v || '-' },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      width: 100,
      render: (v?: string) => (v ? WMS_TASK_TYPE_LABEL[v] || v : '-'),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'qty', width: 90, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '来源库位', dataIndex: 'fromLocationCode', width: 120, render: (v) => v || '-' },
    { title: '目标库位', dataIndex: 'toLocationCode', width: 120, render: (v) => v || '-' },
    { title: '产线', dataIndex: 'lineCode', width: 100, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'workStation', width: 100, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: (v) => v || '-' },
    { title: '优先级', dataIndex: 'priority', width: 90, render: (v) => (v ?? '-') },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_DELIVERY_STATUS_COLOR[v]}>{WMS_DELIVERY_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '执行人', dataIndex: 'assignee', width: 110, render: (v) => v || '-' },
    { title: '派发时间', dataIndex: 'dispatchAt', width: 170, render: (v?: string) => formatTime(v) },
    { title: '接单时间', dataIndex: 'acceptAt', width: 170, render: (v?: string) => formatTime(v) },
    { title: '发运时间', dataIndex: 'deliverAt', width: 170, render: (v?: string) => formatTime(v) },
    { title: '签收时间', dataIndex: 'signAt', width: 170, render: (v?: string) => formatTime(v) },
    { title: '签收人', dataIndex: 'signBy', width: 110, render: (v) => v || '-' },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170, render: (v?: string) => formatTime(v) },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const st = record.taskStatus;
        const canCancel = st !== 'SIGNED' && st !== 'CANCELLED';
        return (
          <Space size="small" wrap>
            {hasPermission('wms:delivery:execute') && st === 'CREATED' && (
              <Button type="link" size="small" onClick={() => openExec(record, 'accept')}>
                接单
              </Button>
            )}
            {hasPermission('wms:delivery:execute') && st === 'ACCEPTED' && (
              <Popconfirm title="确认发运该配送任务？" onConfirm={() => handleDeliver(record)}>
                <Button type="link" size="small">
                  发运
                </Button>
              </Popconfirm>
            )}
            {hasPermission('wms:delivery:execute') && (st === 'ACCEPTED' || st === 'DELIVERING') && (
              <Button type="link" size="small" onClick={() => openExec(record, 'sign')}>
                签收
              </Button>
            )}
            {hasPermission('wms:delivery:execute') && canCancel && (
              <Popconfirm title="确认取消该配送任务？" onConfirm={() => handleCancel(record)}>
                <Button type="link" size="small" danger>
                  取消
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        物料配送
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="taskNo" label="任务号">
            <Input placeholder="请输入任务号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="kanbanNo" label="看板编号">
            <Input placeholder="请输入看板编号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" allowClear style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="taskType" label="任务类型">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={WMS_TASK_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="taskStatus" label="任务状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_DELIVERY_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="assignee" label="执行人">
            <Input placeholder="请输入执行人" allowClear style={{ width: 130 }} />
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
        title={`配送任务列表（共 ${total} 条）`}
        extra={
          hasPermission('wms:delivery:execute') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建配送任务
            </Button>
          )
        }
      >
        <Table<WmsDeliveryTaskItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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

      {/* 新建配送任务 */}
      <Modal
        title="新建配送任务"
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="kanbanNo" label="关联看板编号">
            <Input placeholder="请输入关联看板编号" />
          </Form.Item>
          <Form.Item name="taskType" label="任务类型">
            <Select placeholder="请选择" options={WMS_TASK_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="qty" label="数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="fromLocationCode" label="来源库位">
            <Input placeholder="请输入来源库位" />
          </Form.Item>
          <Form.Item name="toLocationCode" label="目标库位">
            <Input placeholder="请输入目标库位" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入优先级" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 接单 / 签收 */}
      <Modal
        title={execAction === 'accept' ? '接单' : '签收'}
        open={execOpen}
        onOk={handleExec}
        confirmLoading={executing}
        onCancel={() => setExecOpen(false)}
        destroyOnClose
        width={480}
      >
        <Form form={execForm} layout="vertical" preserve={false}>
          {execAction === 'accept' ? (
            <Form.Item name="assignee" label="执行人">
              <Input placeholder="请输入执行人（可留空）" />
            </Form.Item>
          ) : (
            <Form.Item name="signBy" label="签收人">
              <Input placeholder="请输入签收人（可留空）" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Space>
  );
}
