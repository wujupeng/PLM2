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
import { platformEventTopicService } from '@/services/platformService';
import { useAuthStore } from '@/stores/authStore';
import { plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, statusTag } from '@/pages/platform/integration/shared';
import {
  PLATFORM_BOOLEAN_OPTIONS,
  PLATFORM_TOPIC_STATUS_LABEL,
  PLATFORM_TOPIC_STATUS_OPTIONS,
  type PlatformEventTopicItem,
  type PlatformEventTopicSaveParams,
  type PlatformStats,
} from '@/types/platform';

const { Title } = Typography;

const TOPIC_MANAGE = 'platform:integration:topic:manage';

interface TopicFormValues {
  topicCode?: string;
  topicName?: string;
  domain?: string;
  payloadSchema?: string;
  persistent?: number;
  retentionDays?: number;
  topicStatus?: string;
  ownerName?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export default function PlatformEventTopicsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<TopicFormValues>();
  const [data, setData] = useState<PlatformEventTopicItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [topicStatus, setTopicStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({});

  const loadStats = useCallback(async () => {
    const res = await platformEventTopicService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, dm = domain, st = topicStatus) => {
      setLoading(true);
      try {
        const res = await platformEventTopicService.pageTopics({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          domain: dm || undefined,
          topicStatus: st,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, domain, topicStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ topicStatus: 'DRAFT', persistent: 1, retentionDays: 30 });
    setOpen(true);
  };

  const openEdit = (record: PlatformEventTopicItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformEventTopicSaveParams = { ...values, topicName: values.topicName! };
      if (editId == null) {
        await platformEventTopicService.create(payload);
        message.success('主题已创建');
      } else {
        await platformEventTopicService.update(editId, payload);
        message.success('主题已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformEventTopicService.remove(id);
    message.success('主题已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<PlatformEventTopicItem> = [
    { title: '主题编码', dataIndex: 'topicCode', width: 170, fixed: 'left', render: plain },
    { title: '主题名称', dataIndex: 'topicName', width: 180, render: plain },
    { title: '所属领域', dataIndex: 'domain', width: 140, render: plain },
    { title: '持久化', dataIndex: 'persistent', width: 90, render: boolTag },
    { title: '保留天数', dataIndex: 'retentionDays', width: 100, render: plain },
    { title: '责任人', dataIndex: 'ownerName', width: 100, render: plain },
    {
      title: '主题状态',
      dataIndex: 'topicStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(PLATFORM_TOPIC_STATUS_LABEL, v),
    },
    { title: '备注', dataIndex: 'remark', width: 140, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(TOPIC_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认启用该主题？" onConfirm={() => void act(platformEventTopicService.publish, record.id, '主题已启用')}>
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认停用该主题？" onConfirm={() => void act(platformEventTopicService.disable, record.id, '主题已停用')}>
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该主题？" onConfirm={() => void remove(record.id)}>
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
        事件主题
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="主题总数" value={Number(stats.total ?? 0)} />
          <Statistic title="草稿" value={Number(stats.draft ?? 0)} />
          <Statistic title="已启用" value={Number(stats.active ?? 0)} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="持久化" value={Number(stats.persistentCount ?? 0)} />
          <Statistic title="非持久化" value={Number(stats.transientCount ?? 0)} />
          <Statistic title="默认保留天数" value={Number(stats.retentionDays ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="所属领域">
            <Input
              placeholder="请输入领域"
              allowClear
              style={{ width: 160 }}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="主题状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={topicStatus}
              onChange={(v) => setTopicStatus(v)}
              options={[...PLATFORM_TOPIC_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编码 / 名称 / 领域"
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
                  void loadData(1, pageSize, keyword, domain, topicStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDomain('');
                  setTopicStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(TOPIC_MANAGE) && <Button onClick={openCreate}>新建主题</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`事件主题（共 ${total} 条）`}>
        <Table<PlatformEventTopicItem>
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
        title={editId == null ? '新建事件主题' : '编辑事件主题'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="topicCode" label="主题编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="topicName" label="主题名称" rules={[{ required: true, message: '请输入主题名称' }]}>
            <Input placeholder="请输入主题名称" />
          </Form.Item>
          <Form.Item name="domain" label="所属领域">
            <Input placeholder="如 销售/采购/生产" />
          </Form.Item>
          <Form.Item name="payloadSchema" label="载荷规范">
            <Input.TextArea rows={3} placeholder="JSON Schema 文本" />
          </Form.Item>
          <Form.Item name="persistent" label="是否持久化">
            <Select placeholder="请选择" options={[...PLATFORM_BOOLEAN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="retentionDays" label="消息保留天数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 30" />
          </Form.Item>
          <Form.Item name="topicStatus" label="主题状态">
            <Select placeholder="请选择" options={[...PLATFORM_TOPIC_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerName" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="description" label="主题说明">
            <Input.TextArea rows={2} placeholder="请输入主题说明" />
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
