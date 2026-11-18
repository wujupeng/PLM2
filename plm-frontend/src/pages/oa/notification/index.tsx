import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import UserMultiSelect from '@/pages/oa/UserMultiSelect';
import { oaNotificationService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import {
  NOTIFICATION_CHANNEL_LABEL,
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_SEND_STATUS_COLOR,
  NOTIFICATION_SEND_STATUS_LABEL,
  NOTIFICATION_TYPE_COLOR,
  NOTIFICATION_TYPE_LABEL,
  NOTIFICATION_TYPE_OPTIONS,
  MAIL_PRIORITY_OPTIONS,
  type NotificationBroadcastParams,
  type NotificationItem,
  type NotificationQueryParams,
} from '@/types/oa';

const { Title, Text, Paragraph } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface NotificationSearchState {
  keyword?: string;
  messageType?: string;
  readFlag?: string;
  archivedFlag?: string;
}

interface BroadcastFormValues {
  receiverUserIds: number[];
  messageType?: string;
  title: string;
  content?: string;
  linkUrl?: string;
  priority?: string;
  channel?: string;
  remark?: string;
}

export default function OaNotificationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [searchForm] = Form.useForm<NotificationSearchState>();
  const [broadcastForm] = Form.useForm<BroadcastFormValues>();

  const [data, setData] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<NotificationSearchState>({});
  const [unread, setUnread] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<NotificationItem | null>(null);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  const loadUnread = useCallback(async () => {
    const count = await oaNotificationService.unreadCount();
    setUnread(count || 0);
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: NotificationQueryParams = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          messageType: cond.messageType || undefined,
          readFlag: cond.readFlag === undefined || cond.readFlag === '' ? undefined : Number(cond.readFlag),
          archivedFlag:
            cond.archivedFlag === undefined || cond.archivedFlag === '' ? undefined : Number(cond.archivedFlag),
        };
        const res = await oaNotificationService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadUnread();
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: NotificationSearchState) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const onReset = () => {
    searchForm.resetFields();
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openDetail = async (record: NotificationItem) => {
    const res = await oaNotificationService.detail(record.id);
    setDetail(res);
    setDetailOpen(true);
    if (res.readFlag === 0) {
      await oaNotificationService.markRead(res.id, 1);
      await loadUnread();
      void loadData();
    }
  };

  const handleMarkRead = async (record: NotificationItem) => {
    await oaNotificationService.markRead(record.id, record.readFlag === 1 ? 0 : 1);
    message.success(record.readFlag === 1 ? '已标记为未读' : '已标记为已读');
    await loadUnread();
    void loadData();
  };

  const handleMarkAllRead = async () => {
    const count = await oaNotificationService.markAllRead();
    message.success(`已全部标记为已读（${count || 0} 条）`);
    await loadUnread();
    void loadData();
  };

  const handleArchive = async (record: NotificationItem) => {
    await oaNotificationService.archive(record.id, record.archivedFlag === 1 ? 0 : 1);
    message.success(record.archivedFlag === 1 ? '已取消归档' : '已归档');
    void loadData();
  };

  const handleBroadcast = async () => {
    const values = await broadcastForm.validateFields();
    const payload: NotificationBroadcastParams = {
      receiverUserIds: values.receiverUserIds,
      messageType: values.messageType,
      title: values.title,
      content: values.content,
      linkUrl: values.linkUrl,
      priority: values.priority,
      channel: values.channel,
      remark: values.remark,
    };
    setBroadcasting(true);
    try {
      const count = await oaNotificationService.broadcast(payload);
      message.success(`消息已发送（${count || 0} 人）`);
      setBroadcastOpen(false);
      void loadData();
    } finally {
      setBroadcasting(false);
    }
  };

  const columns: ColumnsType<NotificationItem> = [
    {
      title: '类型',
      dataIndex: 'messageType',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={NOTIFICATION_TYPE_COLOR[v] || 'default'}>{NOTIFICATION_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '标题',
      dataIndex: 'title',
      render: (v?: string, record?: NotificationItem) => (
        <Space direction="vertical" size={0}>
          <Space size={6}>
            {record?.readFlag === 0 && <Badge status="processing" />}
            <Text strong={record?.readFlag === 0}>{v || '-'}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record?.content || ''}
          </Text>
        </Space>
      ),
    },
    {
      title: '业务单号',
      dataIndex: 'bizNo',
      width: 160,
      render: (v?: string) => v || '-',
    },
    {
      title: '渠道',
      dataIndex: 'channel',
      width: 100,
      render: (v?: string) => (v ? NOTIFICATION_CHANNEL_LABEL[v] || v : '-'),
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={NOTIFICATION_SEND_STATUS_COLOR[v] || 'default'}>
            {NOTIFICATION_SEND_STATUS_LABEL[v] || v}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v?: string, record?: NotificationItem) =>
        dayjs(v || record?.sentAt || undefined).isValid()
          ? dayjs(v || record?.sentAt).format(DATETIME_FORMAT)
          : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 210,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" onClick={() => void handleMarkRead(record)}>
            {record.readFlag === 1 ? '标记未读' : '标记已读'}
          </Button>
          <Button type="link" size="small" onClick={() => void handleArchive(record)}>
            {record.archivedFlag === 1 ? '取消归档' : '归档'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space align="center">
        <Title level={4} style={{ margin: 0 }}>
          消息中心
        </Title>
        <Badge count={unread} overflowCount={99} showZero={false} />
      </Space>

      <Card>
        <Form form={searchForm} layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="标题 / 内容" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="messageType" label="消息类型">
            <Select placeholder="不限" allowClear style={{ width: 130 }} options={NOTIFICATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="readFlag" label="已读状态">
            <Select
              placeholder="不限"
              allowClear
              style={{ width: 100 }}
              options={[
                { value: '0', label: '未读' },
                { value: '1', label: '已读' },
              ]}
            />
          </Form.Item>
          <Form.Item name="archivedFlag" label="归档状态">
            <Select
              placeholder="不限"
              allowClear
              style={{ width: 100 }}
              options={[
                { value: '0', label: '未归档' },
                { value: '1', label: '已归档' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
              <Button icon={<CheckOutlined />} onClick={() => void handleMarkAllRead()}>
                全部已读
              </Button>
              {hasPermission('oa:notification:send') && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    broadcastForm.resetFields();
                    broadcastForm.setFieldsValue({ messageType: 'ANNOUNCEMENT', channel: 'STATION', priority: 'NORMAL' });
                    setBroadcastOpen(true);
                  }}
                >
                  发送消息
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`消息列表（共 ${total} 条）`}>
        <Table<NotificationItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1100 }}
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
        title="消息详情"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setDetail(null);
        }}
        footer={null}
        destroyOnClose
        width={640}
      >
        {detail && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="标题">{detail.title || '-'}</Descriptions.Item>
              <Descriptions.Item label="类型">
                {detail.messageType
                  ? NOTIFICATION_TYPE_LABEL[detail.messageType] || detail.messageType
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="渠道">
                {detail.channel ? NOTIFICATION_CHANNEL_LABEL[detail.channel] || detail.channel : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="业务单号">{detail.bizNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="发送状态">
                {detail.sendStatus
                  ? NOTIFICATION_SEND_STATUS_LABEL[detail.sendStatus] || detail.sendStatus
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="时间">
                {dayjs(detail.createdAt || detail.sentAt).isValid()
                  ? dayjs(detail.createdAt || detail.sentAt).format(DATETIME_FORMAT)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
            <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {detail.content || '(无内容)'}
            </Paragraph>
            {detail.remark && <Text type="secondary">备注：{detail.remark}</Text>}
          </Space>
        )}
      </Modal>

      <Modal
        title="发送消息"
        open={broadcastOpen}
        onOk={handleBroadcast}
        confirmLoading={broadcasting}
        onCancel={() => setBroadcastOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={broadcastForm} layout="vertical" preserve={false}>
          <Form.Item
            name="receiverUserIds"
            label="接收人"
            rules={[{ required: true, message: '请选择接收人' }]}
          >
            <UserMultiSelect placeholder="请选择接收人" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="messageType" label="消息类型">
            <Select options={NOTIFICATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="title" label="消息标题" rules={[{ required: true, message: '请输入消息标题' }]}>
            <Input placeholder="请输入消息标题" />
          </Form.Item>
          <Form.Item name="content" label="消息内容">
            <Input.TextArea rows={4} placeholder="请输入消息内容" />
          </Form.Item>
          <Form.Item name="channel" label="通知渠道">
            <Select options={NOTIFICATION_CHANNEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select options={MAIL_PRIORITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="例如 /oa/tasks" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
