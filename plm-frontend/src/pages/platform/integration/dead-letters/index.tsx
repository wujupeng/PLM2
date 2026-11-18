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
import { platformDeadLetterService } from '@/services/platformService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/integration/shared';
import {
  PLATFORM_DEAD_STATUS_LABEL,
  PLATFORM_DEAD_STATUS_OPTIONS,
  PLATFORM_SYSTEM_LABEL,
  PLATFORM_SYSTEM_OPTIONS,
  type PlatformDeadLetterItem,
  type PlatformDeadLetterSaveParams,
  type PlatformStats,
} from '@/types/platform';

const { Title } = Typography;

const DEADLETTER_MANAGE = 'platform:integration:deadletter:manage';

interface DeadLetterFormValues {
  letterNo?: string;
  messageKey?: string;
  topicCode?: string;
  subscriberSystem?: string;
  payload?: string;
  failReason?: string;
  retryCount?: number;
  deadStatus?: string;
  handlerName?: string;
  handledAt?: string;
  handleResult?: string;
  orgName?: string;
  remark?: string;
}

interface HandleFormValues {
  handleResult?: string;
  handlerName?: string;
}

export default function PlatformDeadLettersPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DeadLetterFormValues>();
  const [handleForm] = Form.useForm<HandleFormValues>();
  const [data, setData] = useState<PlatformDeadLetterItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [deadStatus, setDeadStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [handleOpen, setHandleOpen] = useState(false);
  const [handleId, setHandleId] = useState<number | null>(null);
  const [handling, setHandling] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({});

  const loadStats = useCallback(async () => {
    const res = await platformDeadLetterService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, st = deadStatus) => {
      setLoading(true);
      try {
        const res = await platformDeadLetterService.pageDeadLetters({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          deadStatus: st,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, deadStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ deadStatus: 'PENDING', retryCount: 0 });
    setOpen(true);
  };

  const openEdit = (record: PlatformDeadLetterItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformDeadLetterSaveParams = { ...values, messageKey: values.messageKey! };
      if (editId == null) {
        await platformDeadLetterService.create(payload);
        message.success('死信记录已创建');
      } else {
        await platformDeadLetterService.update(editId, payload);
        message.success('死信记录已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformDeadLetterService.remove(id);
    message.success('死信记录已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const openHandle = (record: PlatformDeadLetterItem) => {
    setHandleId(record.id);
    handleForm.resetFields();
    handleForm.setFieldsValue({ handlerName: record.handlerName, handleResult: record.handleResult });
    setHandleOpen(true);
  };

  const submitHandle = async () => {
    if (handleId == null) return;
    const values = await handleForm.validateFields();
    setHandling(true);
    try {
      await platformDeadLetterService.handle(handleId, {
        handleResult: values.handleResult,
        handlerName: values.handlerName,
      });
      message.success('死信已处理');
      setHandleOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setHandling(false);
    }
  };

  const columns: ColumnsType<PlatformDeadLetterItem> = [
    { title: '死信编号', dataIndex: 'letterNo', width: 170, fixed: 'left', render: plain },
    { title: '消息标识', dataIndex: 'messageKey', width: 170, render: plain },
    { title: '主题编码', dataIndex: 'topicCode', width: 150, render: plain },
    { title: '订阅方系统', dataIndex: 'subscriberSystem', width: 100, render: (v) => enumText(PLATFORM_SYSTEM_LABEL, v) },
    { title: '失败原因', dataIndex: 'failReason', width: 200, ellipsis: true, render: plain },
    { title: '重试次数', dataIndex: 'retryCount', width: 90, render: plain },
    { title: '处理人', dataIndex: 'handlerName', width: 100, render: plain },
    { title: '处理时间', dataIndex: 'handledAt', width: 160, render: formatDateTime },
    { title: '处理结果', dataIndex: 'handleResult', width: 160, ellipsis: true, render: plain },
    {
      title: '死信状态',
      dataIndex: 'deadStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(PLATFORM_DEAD_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DEADLETTER_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => openHandle(record)}>
              处理
            </Button>
            <Popconfirm title="确认忽略该死信？" onConfirm={() => void act(platformDeadLetterService.ignore, record.id, '死信已忽略')}>
              <Button type="link" size="small">
                忽略
              </Button>
            </Popconfirm>
            <Popconfirm title="确认重投该死信？" onConfirm={() => void act(platformDeadLetterService.retry, record.id, '死信已重投')}>
              <Button type="link" size="small">
                重投
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该死信？" onConfirm={() => void remove(record.id)}>
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
        死信处理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="死信总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待处理" value={Number(stats.pending ?? 0)} />
          <Statistic title="已处理" value={Number(stats.handled ?? 0)} />
          <Statistic title="已忽略" value={Number(stats.ignored ?? 0)} />
          <Statistic title="重试总数" value={Number(stats.retryTotal ?? 0)} />
          <Statistic title="自动处理" value={Number(stats.autoHandleEnabled ?? 0) === 1 ? '已开启' : '未开启'} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="死信状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={deadStatus}
              onChange={(v) => setDeadStatus(v)}
              options={[...PLATFORM_DEAD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 消息 / 主题 / 系统"
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
                  void loadData(1, pageSize, keyword, deadStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDeadStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(DEADLETTER_MANAGE) && <Button onClick={openCreate}>新建死信</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`死信队列（共 ${total} 条）`}>
        <Table<PlatformDeadLetterItem>
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
        title={editId == null ? '新建死信' : '编辑死信'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="letterNo" label="死信编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="messageKey" label="消息标识" rules={[{ required: true, message: '请输入消息标识' }]}>
            <Input placeholder="请输入消息标识" />
          </Form.Item>
          <Form.Item name="topicCode" label="事件主题编码">
            <Input placeholder="请输入事件主题编码" />
          </Form.Item>
          <Form.Item name="subscriberSystem" label="订阅方系统">
            <Select placeholder="请选择" allowClear options={[...PLATFORM_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="payload" label="事件载荷">
            <Input.TextArea rows={3} placeholder="请输入事件载荷（JSON 文本）" />
          </Form.Item>
          <Form.Item name="failReason" label="失败原因">
            <Input.TextArea rows={2} placeholder="请输入失败原因" />
          </Form.Item>
          <Form.Item name="retryCount" label="已重试次数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deadStatus" label="死信状态">
            <Select placeholder="请选择" options={[...PLATFORM_DEAD_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="handlerName" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handledAt" label="处理时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="handleResult" label="处理结果">
            <Input.TextArea rows={2} placeholder="请输入处理结果" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="处理死信"
        open={handleOpen}
        onOk={() => void submitHandle()}
        confirmLoading={handling}
        onCancel={() => setHandleOpen(false)}
        destroyOnClose
        width={520}
      >
        <Form form={handleForm} layout="vertical" preserve={false}>
          <Form.Item name="handleResult" label="处理结果">
            <Input.TextArea rows={3} placeholder="留空默认填「人工处理完成」" />
          </Form.Item>
          <Form.Item name="handlerName" label="处理人">
            <Input placeholder="留空取当前用户" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
