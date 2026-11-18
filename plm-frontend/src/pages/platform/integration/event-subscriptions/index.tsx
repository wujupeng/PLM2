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
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { platformEventSubscriptionService } from '@/services/platformService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { boolTag, statusTag } from '@/pages/platform/integration/shared';
import {
  PLATFORM_BOOLEAN_OPTIONS,
  PLATFORM_DELIVERY_MODE_LABEL,
  PLATFORM_DELIVERY_MODE_OPTIONS,
  PLATFORM_SUBSCRIPTION_STATUS_LABEL,
  PLATFORM_SUBSCRIPTION_STATUS_OPTIONS,
  PLATFORM_SYSTEM_LABEL,
  PLATFORM_SYSTEM_OPTIONS,
  PLATFORM_TEST_RESULT_LABEL,
  type PlatformEventSubscriptionItem,
  type PlatformEventSubscriptionSaveParams,
  type PlatformStats,
} from '@/types/platform';

const { Title } = Typography;

const SUBSCRIPTION_MANAGE = 'platform:integration:subscription:manage';

interface SubscriptionFormValues {
  subscriptionCode?: string;
  topicCode?: string;
  topicName?: string;
  subscriberSystem?: string;
  endpoint?: string;
  deliveryMode?: string;
  maxRetry?: number;
  retryIntervalSec?: number;
  idempotentEnabled?: number;
  subscriptionStatus?: string;
  lastTestResult?: string;
  lastTestTime?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

export default function PlatformEventSubscriptionsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<SubscriptionFormValues>();
  const [data, setData] = useState<PlatformEventSubscriptionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [subscriberSystem, setSubscriberSystem] = useState<string | undefined>(undefined);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | undefined>(undefined);
  const [deliveryMode, setDeliveryMode] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({});

  const loadStats = useCallback(async () => {
    const res = await platformEventSubscriptionService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sys = subscriberSystem,
      st = subscriptionStatus,
      mode = deliveryMode,
    ) => {
      setLoading(true);
      try {
        const res = await platformEventSubscriptionService.pageSubscriptions({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          systemCode: sys,
          subscriptionStatus: st,
          deliveryMode: mode,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, subscriberSystem, subscriptionStatus, deliveryMode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ deliveryMode: 'PUSH', subscriptionStatus: 'ENABLED', idempotentEnabled: 1, maxRetry: 5, retryIntervalSec: 30 });
    setOpen(true);
  };

  const openEdit = (record: PlatformEventSubscriptionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformEventSubscriptionSaveParams = {
        ...values,
        topicCode: values.topicCode!,
        subscriberSystem: values.subscriberSystem!,
      };
      if (editId == null) {
        await platformEventSubscriptionService.create(payload);
        message.success('订阅已创建');
      } else {
        await platformEventSubscriptionService.update(editId, payload);
        message.success('订阅已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformEventSubscriptionService.remove(id);
    message.success('订阅已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<PlatformEventSubscriptionItem> = [
    { title: '订阅编号', dataIndex: 'subscriptionCode', width: 170, fixed: 'left', render: plain },
    { title: '主题编码', dataIndex: 'topicCode', width: 160, render: plain },
    { title: '订阅方系统', dataIndex: 'subscriberSystem', width: 100, render: (v) => enumText(PLATFORM_SYSTEM_LABEL, v) },
    { title: '投递端点', dataIndex: 'endpoint', width: 200, ellipsis: true, render: plain },
    { title: '投递方式', dataIndex: 'deliveryMode', width: 90, render: (v) => enumText(PLATFORM_DELIVERY_MODE_LABEL, v) },
    { title: '最大重试', dataIndex: 'maxRetry', width: 90, render: plain },
    { title: '重试间隔(s)', dataIndex: 'retryIntervalSec', width: 110, render: plain },
    { title: '幂等', dataIndex: 'idempotentEnabled', width: 70, render: boolTag },
    { title: '最近测试', dataIndex: 'lastTestResult', width: 110, render: (v) => statusTag(PLATFORM_TEST_RESULT_LABEL, v) },
    { title: '测试时间', dataIndex: 'lastTestTime', width: 160, render: formatDateTime },
    {
      title: '订阅状态',
      dataIndex: 'subscriptionStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(PLATFORM_SUBSCRIPTION_STATUS_LABEL, v),
    },
    { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(SUBSCRIPTION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认启用该订阅？" onConfirm={() => void act(platformEventSubscriptionService.enable, record.id, '订阅已启用')}>
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认停用该订阅？" onConfirm={() => void act(platformEventSubscriptionService.disable, record.id, '订阅已停用')}>
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认执行联通测试？" onConfirm={() => void act(platformEventSubscriptionService.test, record.id, '联通测试完成')}>
              <Button type="link" size="small">
                联通测试
              </Button>
            </Popconfirm>
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
      <Title level={4} style={{ margin: 0 }}>
        事件订阅
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="订阅总数" value={Number(stats.total ?? 0)} />
          <Statistic title="已启用" value={Number(stats.enabled ?? 0)} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="推送(PUSH)" value={Number(stats.pushCount ?? 0)} />
          <Statistic title="拉取(PULL)" value={Number(stats.pullCount ?? 0)} />
          <Statistic title="开启幂等" value={Number(stats.idempotentCount ?? 0)} />
          <Statistic title="默认最大重试" value={Number(stats.retryMaxTimes ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="订阅方系统">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={subscriberSystem}
              onChange={(v) => setSubscriberSystem(v)}
              options={[...PLATFORM_SYSTEM_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="投递方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={deliveryMode}
              onChange={(v) => setDeliveryMode(v)}
              options={[...PLATFORM_DELIVERY_MODE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订阅状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={subscriptionStatus}
              onChange={(v) => setSubscriptionStatus(v)}
              options={[...PLATFORM_SUBSCRIPTION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 主题 / 端点"
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
                  void loadData(1, pageSize, keyword, subscriberSystem, subscriptionStatus, deliveryMode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSubscriberSystem(undefined);
                  setDeliveryMode(undefined);
                  setSubscriptionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(SUBSCRIPTION_MANAGE) && <Button onClick={openCreate}>新建订阅</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`事件订阅（共 ${total} 条）`}>
        <Table<PlatformEventSubscriptionItem>
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
        title={editId == null ? '新建事件订阅' : '编辑事件订阅'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="subscriptionCode" label="订阅编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="topicCode" label="事件主题编码" rules={[{ required: true, message: '请输入事件主题编码' }]}>
            <Input placeholder="请输入事件主题编码" />
          </Form.Item>
          <Form.Item name="topicName" label="主题名称">
            <Input placeholder="请输入主题名称" />
          </Form.Item>
          <Form.Item name="subscriberSystem" label="订阅方系统" rules={[{ required: true, message: '请选择订阅方系统' }]}>
            <Select placeholder="请选择" options={[...PLATFORM_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="endpoint" label="投递端点">
            <Input placeholder="如 https://erp.example.com/callback" />
          </Form.Item>
          <Form.Item name="deliveryMode" label="投递方式">
            <Select placeholder="请选择" options={[...PLATFORM_DELIVERY_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="maxRetry" label="最大重试次数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 5" />
          </Form.Item>
          <Form.Item name="retryIntervalSec" label="重试间隔(秒)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 30" />
          </Form.Item>
          <Form.Item name="idempotentEnabled" label="开启幂等">
            <Select placeholder="请选择" options={[...PLATFORM_BOOLEAN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="subscriptionStatus" label="订阅状态">
            <Select placeholder="请选择" options={[...PLATFORM_SUBSCRIPTION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="lastTestResult" label="最近测试结果">
            <Input placeholder="如 TEST_OK" />
          </Form.Item>
          <Form.Item name="lastTestTime" label="最近测试时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
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
