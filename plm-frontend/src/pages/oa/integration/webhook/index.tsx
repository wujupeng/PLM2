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
  Tabs,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { oaWebhookService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enableTag, enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_DELIVERY_STATUS_LABEL,
  OA_DELIVERY_STATUS_OPTIONS,
  OA_ENABLE_STATUS_OPTIONS,
  OA_INTEGRATION_SYSTEM_LABEL,
  OA_INTEGRATION_SYSTEM_OPTIONS,
  OA_WEBHOOK_EVENT_TYPE_LABEL,
  OA_WEBHOOK_EVENT_TYPE_OPTIONS,
  type OaWebhookDeliveryItem,
  type OaWebhookDeliverySaveParams,
  type OaWebhookSubscriptionItem,
  type OaWebhookSubscriptionSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const WEBHOOK_MANAGE = 'oa:integration:webhook:manage';

interface SubscriptionFormValues {
  subscriptionNo?: string;
  subscriptionName?: string;
  eventType?: string;
  callbackUrl?: string;
  secret?: string;
  ownerSystem?: string;
  maxRetry?: number;
  status?: number;
  remark?: string;
}

interface DeliveryFormValues {
  subscriptionId?: number;
  eventType?: string;
  eventId?: string;
  payload?: string;
  deliveryStatus?: string;
  responseCode?: number;
  lastError?: string;
  receiptNo?: string;
  remark?: string;
}

/* ---------------- 1. 事件订阅 ---------------- */

function SubscriptionTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<SubscriptionFormValues>();
  const [data, setData] = useState<OaWebhookSubscriptionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, evt = eventType) => {
      setLoading(true);
      try {
        const res = await oaWebhookService.pageSubscriptions({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          eventType: evt,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, eventType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1, maxRetry: 3 });
    setOpen(true);
  };

  const openEdit = (record: OaWebhookSubscriptionItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      subscriptionNo: record.subscriptionNo,
      subscriptionName: record.subscriptionName,
      eventType: record.eventType,
      callbackUrl: record.callbackUrl,
      secret: record.secret,
      ownerSystem: record.ownerSystem,
      maxRetry: record.maxRetry,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaWebhookSubscriptionSaveParams = { ...values };
      if (editId == null) {
        await oaWebhookService.createSubscription(payload);
        message.success('订阅已创建');
      } else {
        await oaWebhookService.updateSubscription(editId, payload);
        message.success('订阅已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaWebhookService.removeSubscription(id);
    message.success('订阅已删除');
    void loadData();
  };

  const test = async (id: number) => {
    await oaWebhookService.testDelivery(id);
    message.success('测试投递已发起');
  };

  const columns: ColumnsType<OaWebhookSubscriptionItem> = [
    { title: '订阅编号', dataIndex: 'subscriptionNo', width: 170, fixed: 'left', render: plain },
    { title: '订阅名称', dataIndex: 'subscriptionName', width: 180, render: plain },
    {
      title: '事件类型',
      dataIndex: 'eventType',
      width: 120,
      render: (v) => enumText(OA_WEBHOOK_EVENT_TYPE_LABEL, v),
    },
    { title: '回调地址', dataIndex: 'callbackUrl', width: 260, ellipsis: true, render: plain },
    {
      title: '归属系统',
      dataIndex: 'ownerSystem',
      width: 110,
      render: (v) => enumText(OA_INTEGRATION_SYSTEM_LABEL, v),
    },
    { title: '最大重试', dataIndex: 'maxRetry', width: 90, render: plain },
    {
      title: '最近投递状态',
      dataIndex: 'lastDeliveryStatus',
      width: 130,
      render: (v) => enumTag(OA_DELIVERY_STATUS_LABEL, v),
    },
    { title: '最近投递时间', dataIndex: 'lastDeliveryTime', width: 160, render: formatDateTime },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(WEBHOOK_MANAGE) && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => void test(record.id)}>
              测试
            </Button>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该订阅？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Form layout="inline">
          <Form.Item label="事件类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={eventType}
              onChange={(v) => setEventType(v)}
              options={[...OA_WEBHOOK_EVENT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 名称 / 回调地址"
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
                  void loadData(1, pageSize, keyword, eventType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setEventType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(WEBHOOK_MANAGE) && <Button onClick={openCreate}>新建订阅</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`事件订阅（共 ${total} 条）`}>
        <Table<OaWebhookSubscriptionItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1700 }}
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
        title={editId == null ? '新建事件订阅' : '编辑事件订阅'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="subscriptionNo" label="订阅编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="subscriptionName" label="订阅名称" rules={[{ required: true, message: '请输入订阅名称' }]}>
            <Input placeholder="请输入订阅名称" />
          </Form.Item>
          <Form.Item name="eventType" label="事件类型" rules={[{ required: true, message: '请选择事件类型' }]}>
            <Select placeholder="请选择" options={[...OA_WEBHOOK_EVENT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="callbackUrl" label="回调地址" rules={[{ required: true, message: '请输入回调地址' }]}>
            <Input placeholder="https://example.com/webhook" />
          </Form.Item>
          <Form.Item name="secret" label="签名密钥">
            <Input.Password placeholder="用于回调签名校验" />
          </Form.Item>
          <Form.Item name="ownerSystem" label="归属系统">
            <Select placeholder="请选择" options={[...OA_INTEGRATION_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="maxRetry" label="最大重试次数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="留空取全局默认" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 2. 投递记录 ---------------- */

function DeliveryTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DeliveryFormValues>();
  const [data, setData] = useState<OaWebhookDeliveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | undefined>(undefined);
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [subscriptions, setSubscriptions] = useState<OaWebhookSubscriptionItem[]>([]);
  const [detail, setDetail] = useState<OaWebhookDeliveryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [recording, setRecording] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = deliveryStatus,
      evt = eventType,
    ) => {
      setLoading(true);
      try {
        const res = await oaWebhookService.pageDeliveries({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          deliveryStatus: status,
          eventType: evt,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, deliveryStatus, eventType],
  );

  const loadStats = useCallback(async () => {
    const res = await oaWebhookService.deliveryStats();
    setStats((res || {}) as Record<string, number>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRecord = async () => {
    const res = await oaWebhookService.listEnabledSubscriptions();
    setSubscriptions(res || []);
    form.resetFields();
    form.setFieldsValue({ deliveryStatus: 'SUCCESS' });
    setRecordOpen(true);
  };

  const openDetail = async (record: OaWebhookDeliveryItem) => {
    setDetailOpen(true);
    const res = await oaWebhookService.deliveryDetail(record.id);
    setDetail(res);
  };

  const submitRecord = async () => {
    const values = await form.validateFields();
    setRecording(true);
    try {
      const payload: OaWebhookDeliverySaveParams = { ...values };
      await oaWebhookService.recordDelivery(payload);
      message.success('投递记录已登记');
      setRecordOpen(false);
      form.resetFields();
      void loadData();
      void loadStats();
    } finally {
      setRecording(false);
    }
  };

  const retry = async (id: number) => {
    await oaWebhookService.retryDelivery(id);
    message.success('重试已完成');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaWebhookDeliveryItem> = [
    { title: '事件ID', dataIndex: 'eventId', width: 170, fixed: 'left', render: plain },
    { title: '订阅编号', dataIndex: 'subscriptionNo', width: 170, render: plain },
    {
      title: '事件类型',
      dataIndex: 'eventType',
      width: 120,
      render: (v) => enumText(OA_WEBHOOK_EVENT_TYPE_LABEL, v),
    },
    {
      title: '投递状态',
      dataIndex: 'deliveryStatus',
      width: 110,
      render: (v) => enumTag(OA_DELIVERY_STATUS_LABEL, v),
    },
    { title: '尝试次数', dataIndex: 'attemptCount', width: 90, render: plain },
    { title: '最大重试', dataIndex: 'maxRetry', width: 90, render: plain },
    { title: '响应码', dataIndex: 'responseCode', width: 90, render: plain },
    { title: '回执号', dataIndex: 'receiptNo', width: 170, render: plain },
    { title: '错误信息', dataIndex: 'lastError', width: 180, ellipsis: true, render: plain },
    { title: '投递时间', dataIndex: 'deliveryTime', width: 160, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(WEBHOOK_MANAGE) &&
            record.deliveryStatus !== 'SUCCESS' &&
            record.deliveryStatus !== 'DEAD' &&
            Number(record.deadFlag) !== 1 && (
              <Button type="link" size="small" onClick={() => void retry(record.id)}>
                重试
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Space size="large" wrap>
          <Statistic title="投递总数" value={stats.total ?? 0} />
          <Statistic title="成功" value={stats.success ?? 0} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="失败" value={stats.failed ?? 0} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="死信" value={stats.dead ?? 0} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="死信阈值" value={stats.deadThreshold ?? 0} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="事件类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={eventType}
              onChange={(v) => setEventType(v)}
              options={[...OA_WEBHOOK_EVENT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="投递状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={deliveryStatus}
              onChange={(v) => setDeliveryStatus(v)}
              options={[...OA_DELIVERY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="事件ID / 订阅编号 / 回执号"
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
                  void loadData(1, pageSize, keyword, deliveryStatus, eventType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDeliveryStatus(undefined);
                  setEventType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(WEBHOOK_MANAGE) && <Button onClick={() => void openRecord()}>登记投递</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`投递记录（共 ${total} 条）`}>
        <Table<OaWebhookDeliveryItem>
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

      <Modal
        title="投递详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={720}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="事件ID">{plain(detail.eventId)}</Descriptions.Item>
            <Descriptions.Item label="订阅编号">{plain(detail.subscriptionNo)}</Descriptions.Item>
            <Descriptions.Item label="事件类型">{enumText(OA_WEBHOOK_EVENT_TYPE_LABEL, detail.eventType)}</Descriptions.Item>
            <Descriptions.Item label="投递状态">{enumTag(OA_DELIVERY_STATUS_LABEL, detail.deliveryStatus)}</Descriptions.Item>
            <Descriptions.Item label="尝试次数">{plain(detail.attemptCount)}</Descriptions.Item>
            <Descriptions.Item label="最大重试">{plain(detail.maxRetry)}</Descriptions.Item>
            <Descriptions.Item label="响应码">{plain(detail.responseCode)}</Descriptions.Item>
            <Descriptions.Item label="回执号">{plain(detail.receiptNo)}</Descriptions.Item>
            <Descriptions.Item label="投递时间">{formatDateTime(detail.deliveryTime)}</Descriptions.Item>
            <Descriptions.Item label="下次重试">{formatDateTime(detail.nextRetryTime)}</Descriptions.Item>
            <Descriptions.Item label="错误信息" span={2}>
              {plain(detail.lastError)}
            </Descriptions.Item>
            <Descriptions.Item label="报文内容" span={2}>
              {plain(detail.payload)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title="登记投递记录"
        open={recordOpen}
        onOk={() => void submitRecord()}
        confirmLoading={recording}
        onCancel={() => setRecordOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="subscriptionId" label="订阅" rules={[{ required: true, message: '请选择订阅' }]}>
            <Select
              placeholder="请选择订阅"
              options={subscriptions.map((s) => ({
                label: `${s.subscriptionName || ''}（${s.subscriptionNo || ''}）`,
                value: s.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="eventType" label="事件类型">
            <Select placeholder="请选择" options={[...OA_WEBHOOK_EVENT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="eventId" label="事件ID">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="deliveryStatus" label="投递状态">
            <Select placeholder="请选择" options={[...OA_DELIVERY_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="responseCode" label="响应码">
            <InputNumber style={{ width: '100%' }} placeholder="如 200" />
          </Form.Item>
          <Form.Item name="receiptNo" label="回执号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="payload" label="报文内容">
            <Input.TextArea rows={3} placeholder="JSON 报文" />
          </Form.Item>
          <Form.Item name="lastError" label="错误信息">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function OaWebhookPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        Webhook 事件订阅
      </Title>

      <Tabs
        items={[
          { key: 'subscription', label: '事件订阅', children: <SubscriptionTab /> },
          { key: 'delivery', label: '投递记录', children: <DeliveryTab /> },
        ]}
      />
    </Space>
  );
}
