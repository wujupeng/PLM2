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
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { platformEventMessageService } from '@/services/platformService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, statusTag } from '@/pages/platform/integration/shared';
import {
  PLATFORM_BOOLEAN_OPTIONS,
  PLATFORM_MESSAGE_STATUS_LABEL,
  PLATFORM_MESSAGE_STATUS_OPTIONS,
  type PlatformEventMessageItem,
  type PlatformEventMessageSaveParams,
  type PlatformStats,
} from '@/types/platform';

const { Title } = Typography;

const MESSAGE_MANAGE = 'platform:integration:message:manage';

interface MessageFormValues {
  messageKey?: string;
  topicCode?: string;
  subscriptionCode?: string;
  bizType?: string;
  bizId?: string;
  payload?: string;
  messageStatus?: string;
  retryCount?: number;
  maxRetry?: number;
  errorMessage?: string;
  idempotentKey?: string;
  deadLetter?: number;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

export default function PlatformEventMessagesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MessageFormValues>();
  const [data, setData] = useState<PlatformEventMessageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [messageStatus, setMessageStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [current, setCurrent] = useState<PlatformEventMessageItem | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({});

  const loadStats = useCallback(async () => {
    const res = await platformEventMessageService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      st = messageStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await platformEventMessageService.pageMessages({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          messageStatus: st,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, messageStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    setCurrent(null);
    form.resetFields();
    form.setFieldsValue({ messageStatus: 'PENDING', retryCount: 0, maxRetry: 5, deadLetter: 0 });
    setOpen(true);
  };

  const openEdit = (record: PlatformEventMessageItem) => {
    setEditId(record.id);
    setCurrent(record);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformEventMessageSaveParams = { ...values, topicCode: values.topicCode! };
      if (editId == null) {
        await platformEventMessageService.create(payload);
        message.success('消息已创建');
      } else {
        await platformEventMessageService.update(editId, payload);
        message.success('消息已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformEventMessageService.remove(id);
    message.success('消息已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<PlatformEventMessageItem> = [
    { title: '消息标识', dataIndex: 'messageKey', width: 170, fixed: 'left', render: plain },
    { title: '主题编码', dataIndex: 'topicCode', width: 150, render: plain },
    { title: '订阅编号', dataIndex: 'subscriptionCode', width: 160, render: plain },
    { title: '业务类型', dataIndex: 'bizType', width: 120, render: plain },
    { title: '业务ID', dataIndex: 'bizId', width: 130, render: plain },
    { title: '幂等键', dataIndex: 'idempotentKey', width: 160, ellipsis: true, render: plain },
    { title: '重试次数', dataIndex: 'retryCount', width: 90, render: plain },
    { title: '最大重试', dataIndex: 'maxRetry', width: 90, render: plain },
    { title: '发布时间', dataIndex: 'publishedAt', width: 160, render: formatDateTime },
    { title: '投递时间', dataIndex: 'deliveredAt', width: 160, render: formatDateTime },
    { title: '下次重试', dataIndex: 'nextRetryAt', width: 160, render: formatDateTime },
    { title: '死信标记', dataIndex: 'deadLetter', width: 90, render: boolTag },
    {
      title: '消息状态',
      dataIndex: 'messageStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(PLATFORM_MESSAGE_STATUS_LABEL, v),
    },
    { title: '错误信息', dataIndex: 'errorMessage', width: 180, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MESSAGE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认发布该消息？" onConfirm={() => void act(platformEventMessageService.publish, record.id, '消息已发布')}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
            <Popconfirm title="确认重试该消息？" onConfirm={() => void act(platformEventMessageService.retry, record.id, '消息已重试')}>
              <Button type="link" size="small">
                重试
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该消息？" onConfirm={() => void remove(record.id)}>
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
        事件消息
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="消息总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待发送" value={Number(stats.pending ?? 0)} />
          <Statistic title="已发送" value={Number(stats.sent ?? 0)} />
          <Statistic title="发送失败" value={Number(stats.failed ?? 0)} />
          <Statistic title="已入死信" value={Number(stats.deadLetterCount ?? 0)} />
          <Statistic title="重试总数" value={Number(stats.retryTotal ?? 0)} />
          <Statistic title="死信标记数" value={Number(stats.deadLetterFlagCount ?? 0)} />
          <Statistic title="默认最大重试" value={Number(stats.retryMaxTimes ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="消息状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={messageStatus}
              onChange={(v) => setMessageStatus(v)}
              options={[...PLATFORM_MESSAGE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker
              value={range}
              onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="消息标识 / 主题 / 业务 / 幂等键"
              allowClear
              style={{ width: 230 }}
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
                  void loadData(1, pageSize, keyword, messageStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMessageStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(MESSAGE_MANAGE) && <Button onClick={openCreate}>新建消息</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`事件消息（共 ${total} 条）`}>
        <Table<PlatformEventMessageItem>
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
        title={editId == null ? '新建事件消息' : '编辑事件消息'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        {editId != null && current ? (
          <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="发布时间">{formatDateTime(current.publishedAt)}</Descriptions.Item>
            <Descriptions.Item label="投递时间">{formatDateTime(current.deliveredAt)}</Descriptions.Item>
            <Descriptions.Item label="下次重试">{formatDateTime(current.nextRetryAt)}</Descriptions.Item>
            <Descriptions.Item label="重试次数">{plain(current.retryCount)}</Descriptions.Item>
          </Descriptions>
        ) : null}
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="messageKey" label="消息标识">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="topicCode" label="事件主题编码" rules={[{ required: true, message: '请输入事件主题编码' }]}>
            <Input placeholder="请输入事件主题编码" />
          </Form.Item>
          <Form.Item name="subscriptionCode" label="订阅编号">
            <Input placeholder="请输入订阅编号" />
          </Form.Item>
          <Form.Item name="bizType" label="业务类型">
            <Input placeholder="请输入业务类型" />
          </Form.Item>
          <Form.Item name="bizId" label="业务ID">
            <Input placeholder="请输入业务ID" />
          </Form.Item>
          <Form.Item name="payload" label="事件载荷">
            <Input.TextArea rows={4} placeholder="请输入事件载荷（JSON 文本）" />
          </Form.Item>
          <Form.Item name="messageStatus" label="消息状态">
            <Select placeholder="请选择" options={[...PLATFORM_MESSAGE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="retryCount" label="已重试次数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxRetry" label="最大重试次数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="idempotentKey" label="幂等键">
            <Input placeholder="请输入幂等键" />
          </Form.Item>
          <Form.Item name="deadLetter" label="是否死信">
            <Select placeholder="请选择" options={[...PLATFORM_BOOLEAN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="errorMessage" label="错误信息">
            <Input.TextArea rows={2} placeholder="请输入错误信息" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
