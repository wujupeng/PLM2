import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
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
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { oaNotifyTemplateService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import {
  NOTIFICATION_CHANNEL_LABEL,
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_TYPE_COLOR,
  NOTIFICATION_TYPE_LABEL,
  NOTIFICATION_TYPE_OPTIONS,
  OA_ENABLED_STATUS_COLOR,
  OA_ENABLED_STATUS_LABEL,
  OA_ENABLED_STATUS_OPTIONS,
  type NotifyTemplateItem,
  type NotifyTemplateQueryParams,
  type NotifyTemplateSaveParams,
} from '@/types/oa';

const { Title, Text } = Typography;

interface TemplateSearchState {
  keyword?: string;
  messageType?: string;
  channel?: string;
  status?: string;
}

export default function OaNotifyTemplatePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<NotifyTemplateSaveParams>();
  const [searchForm] = Form.useForm<TemplateSearchState>();

  const [data, setData] = useState<NotifyTemplateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<TemplateSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotifyTemplateItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: NotifyTemplateQueryParams = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          messageType: cond.messageType || undefined,
          channel: cond.channel || undefined,
          status: cond.status || undefined,
        };
        const res = await oaNotifyTemplateService.page(params);
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

  const onSearch = (values: TemplateSearchState) => {
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

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ messageType: 'SYSTEM', channel: 'STATION', status: 'enabled' });
    setModalOpen(true);
  };

  const openEdit = (record: NotifyTemplateItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      templateCode: record.templateCode,
      templateName: record.templateName,
      messageType: record.messageType,
      channel: record.channel,
      titleTemplate: record.titleTemplate,
      contentTemplate: record.contentTemplate,
      variableJson: record.variableJson,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        await oaNotifyTemplateService.update(editing.id, values);
        message.success('更新成功');
      } else {
        await oaNotifyTemplateService.create(values);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: NotifyTemplateItem) => {
    await oaNotifyTemplateService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<NotifyTemplateItem> = [
    { title: '模板编码', dataIndex: 'templateCode', width: 200, fixed: 'left' },
    { title: '模板名称', dataIndex: 'templateName', width: 200 },
    {
      title: '消息类型',
      dataIndex: 'messageType',
      width: 120,
      render: (v?: string) =>
        v ? <Tag color={NOTIFICATION_TYPE_COLOR[v] || 'default'}>{NOTIFICATION_TYPE_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '渠道',
      dataIndex: 'channel',
      width: 110,
      render: (v?: string) => (v ? NOTIFICATION_CHANNEL_LABEL[v] || v : '-'),
    },
    { title: '标题模板', dataIndex: 'titleTemplate', width: 240, render: (v?: string) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={OA_ENABLED_STATUS_COLOR[v]}>{OA_ENABLED_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:notify-template:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:notify-template:delete') && (
            <Popconfirm title="确认删除该模板？" onConfirm={() => void handleDelete(record)}>
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
      <Title level={4} style={{ margin: 0 }}>
        通知模板
      </Title>

      <Card>
        <Form form={searchForm} layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="模板编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="messageType" label="消息类型">
            <Select placeholder="不限" allowClear style={{ width: 130 }} options={NOTIFICATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="channel" label="渠道">
            <Select placeholder="不限" allowClear style={{ width: 120 }} options={NOTIFICATION_CHANNEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="不限" allowClear style={{ width: 100 }} options={OA_ENABLED_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit">
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
        title={`模板列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:notify-template:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增模板
            </Button>
          )
        }
      >
        <Table<NotifyTemplateItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1200 }}
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
        title={editing ? '编辑通知模板' : '新增通知模板'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="templateCode"
            label="模板编码"
            rules={[{ required: true, message: '请输入模板编码' }]}
          >
            <Input placeholder="例如 ANNOUNCEMENT_PUBLISH" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="templateName"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="例如 公告发布通知" />
          </Form.Item>
          <Form.Item name="messageType" label="消息类型">
            <Select options={NOTIFICATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="channel" label="通知渠道">
            <Select options={NOTIFICATION_CHANNEL_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="titleTemplate"
            label="标题模板"
            tooltip="支持 ${变量名} 占位符，发送时按变量替换"
          >
            <Input placeholder="例如 流程待办提醒：${processName}" />
          </Form.Item>
          <Form.Item name="contentTemplate" label="正文模板">
            <Input.TextArea rows={4} placeholder="例如 您有一条新的待办任务（单号 ${instanceNo}）" />
          </Form.Item>
          <Form.Item name="variableJson" label="变量清单" tooltip="JSON 数组，便于界面提示与校验">
            <Input.TextArea rows={2} placeholder='例如 ["processName","instanceNo"]' />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={OA_ENABLED_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <Text type="secondary">
            渠道为邮件、移动推送、短信、企业 IM 时，需业务方确认许可与通道配置后方可实际投递（IF-OA-07）。
          </Text>
        </Form>
      </Modal>
    </Space>
  );
}
