import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { oaMessageTaskService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_MESSAGE_TASK_STATUS_LABEL,
  OA_MESSAGE_TASK_STATUS_OPTIONS,
  OA_MESSAGE_TASK_TYPE_LABEL,
  OA_MESSAGE_TASK_TYPE_OPTIONS,
  type OaMessageTaskItem,
  type OaMessageTaskSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const TASK_MANAGE = 'oa:integration:task:manage';

interface TaskFormValues {
  taskNo?: string;
  taskType?: string;
  bizKey?: string;
  idempotentKey?: string;
  payload?: string;
  priority?: number;
  maxRetry?: number;
  remark?: string;
}

export default function OaMessageTaskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<TaskFormValues>();
  const [data, setData] = useState<OaMessageTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [taskType, setTaskType] = useState<string | undefined>(undefined);
  const [taskStatus, setTaskStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [detail, setDetail] = useState<OaMessageTaskItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = taskType,
      status = taskStatus,
    ) => {
      setLoading(true);
      try {
        const res = await oaMessageTaskService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          taskType: type,
          taskStatus: status,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, taskType, taskStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaMessageTaskService.stats();
    setStats((res || {}) as Record<string, number>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ taskType: 'NOTIFY', priority: 5 });
    setOpen(true);
  };

  const openEdit = (record: OaMessageTaskItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      taskNo: record.taskNo,
      taskType: record.taskType,
      bizKey: record.bizKey,
      idempotentKey: record.idempotentKey,
      payload: record.payload,
      priority: record.priority,
      maxRetry: record.maxRetry,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaMessageTaskItem) => {
    setDetailOpen(true);
    const res = await oaMessageTaskService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMessageTaskSaveParams = { ...values };
      if (editId == null) {
        await oaMessageTaskService.create(payload);
        message.success('任务已创建');
      } else {
        await oaMessageTaskService.update(editId, payload);
        message.success('任务已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMessageTaskService.remove(id);
    message.success('任务已删除');
    void loadData();
    void loadStats();
  };

  const execute = async (id: number, success: boolean) => {
    await oaMessageTaskService.execute(id, success);
    message.success(success ? '任务执行成功' : '任务执行失败');
    void loadData();
    void loadStats();
  };

  const retry = async (id: number) => {
    await oaMessageTaskService.retry(id);
    message.success('任务已重新入队');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaMessageTaskItem> = [
    { title: '任务编号', dataIndex: 'taskNo', width: 170, fixed: 'left', render: plain },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      width: 120,
      render: (v) => enumText(OA_MESSAGE_TASK_TYPE_LABEL, v),
    },
    { title: '业务标识', dataIndex: 'bizKey', width: 160, render: plain },
    { title: '幂等键', dataIndex: 'idempotentKey', width: 160, render: plain },
    {
      title: '状态',
      dataIndex: 'taskStatus',
      width: 110,
      render: (v) => enumTag(OA_MESSAGE_TASK_STATUS_LABEL, v),
    },
    { title: '优先级', dataIndex: 'priority', width: 80, render: plain },
    { title: '尝试次数', dataIndex: 'attemptCount', width: 90, render: plain },
    { title: '最大重试', dataIndex: 'maxRetry', width: 90, render: plain },
    { title: '死信', dataIndex: 'deadFlag', width: 70, render: flagText },
    { title: '下次执行', dataIndex: 'nextExecuteTime', width: 160, render: formatDateTime },
    { title: '完成时间', dataIndex: 'finishTime', width: 160, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(TASK_MANAGE) && (
            <>
              <Button type="link" size="small" onClick={() => openEdit(record)}>
                编辑
              </Button>
              <Button type="link" size="small" onClick={() => void execute(record.id, true)}>
                执行成功
              </Button>
              <Button type="link" size="small" onClick={() => void execute(record.id, false)}>
                执行失败
              </Button>
              <Button type="link" size="small" onClick={() => void retry(record.id)}>
                重新入队
              </Button>
              <Popconfirm title="确认删除该任务？" onConfirm={() => void remove(record.id)}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        消息总线与任务队列
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="任务总数" value={stats.total ?? 0} />
          <Statistic title="待执行" value={stats.pending ?? 0} />
          <Statistic title="执行中" value={stats.running ?? 0} />
          <Statistic title="成功" value={stats.success ?? 0} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="失败" value={stats.failed ?? 0} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="死信" value={stats.dead ?? 0} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="最大重试" value={stats.maxRetry ?? 0} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="任务类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={taskType}
              onChange={(v) => setTaskType(v)}
              options={[...OA_MESSAGE_TASK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="任务状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={taskStatus}
              onChange={(v) => setTaskStatus(v)}
              options={[...OA_MESSAGE_TASK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="任务编号 / 业务标识 / 幂等键"
              allowClear
              style={{ width: 220 }}
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
                  void loadData(1, pageSize, keyword, taskType, taskStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTaskType(undefined);
                  setTaskStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(TASK_MANAGE) && <Button onClick={openCreate}>新建任务</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`消息任务（共 ${total} 条）`}>
        <Table<OaMessageTaskItem>
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
        title="任务详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={720}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="任务编号">{plain(detail.taskNo)}</Descriptions.Item>
            <Descriptions.Item label="任务类型">{enumText(OA_MESSAGE_TASK_TYPE_LABEL, detail.taskType)}</Descriptions.Item>
            <Descriptions.Item label="状态">{enumTag(OA_MESSAGE_TASK_STATUS_LABEL, detail.taskStatus)}</Descriptions.Item>
            <Descriptions.Item label="优先级">{plain(detail.priority)}</Descriptions.Item>
            <Descriptions.Item label="业务标识">{plain(detail.bizKey)}</Descriptions.Item>
            <Descriptions.Item label="幂等键">{plain(detail.idempotentKey)}</Descriptions.Item>
            <Descriptions.Item label="尝试次数">{plain(detail.attemptCount)}</Descriptions.Item>
            <Descriptions.Item label="最大重试">{plain(detail.maxRetry)}</Descriptions.Item>
            <Descriptions.Item label="下次执行">{formatDateTime(detail.nextExecuteTime)}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{formatDateTime(detail.finishTime)}</Descriptions.Item>
            <Descriptions.Item label="错误信息" span={2}>
              {plain(detail.lastError)}
            </Descriptions.Item>
            <Descriptions.Item label="任务载荷" span={2}>
              {plain(detail.payload)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editId == null ? '新建消息任务' : '编辑消息任务'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taskNo" label="任务编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="taskType" label="任务类型" rules={[{ required: true, message: '请选择任务类型' }]}>
            <Select placeholder="请选择" options={[...OA_MESSAGE_TASK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizKey" label="业务标识">
            <Input placeholder="如 FLOW:12345" />
          </Form.Item>
          <Form.Item
            name="idempotentKey"
            label="幂等键"
            tooltip="同一幂等键的任务只允许登记一次"
          >
            <Input placeholder="留空则不校验重复" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={1} max={9} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxRetry" label="最大重试次数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="留空取全局默认" />
          </Form.Item>
          <Form.Item name="payload" label="任务载荷">
            <Input.TextArea rows={3} placeholder="JSON 载荷" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
