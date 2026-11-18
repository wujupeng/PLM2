import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  oaAlbumService,
  oaAnnouncementService,
  oaCollabCommentService,
  oaCollabTaskService,
  oaVoteService,
  oaWorkReportService,
} from '@/services/oaService';
import UserSelect from '@/pages/oa/UserSelect';
import {
  OA_ALBUM_STATUS_LABEL,
  OA_ALBUM_STATUS_OPTIONS,
  OA_ANNOUNCEMENT_CATEGORY_LABEL,
  OA_ANNOUNCEMENT_CATEGORY_OPTIONS,
  OA_COLLAB_TASK_PRIORITY_LABEL,
  OA_COLLAB_TASK_PRIORITY_OPTIONS,
  OA_COLLAB_TASK_STATUS_LABEL,
  OA_COLLAB_TASK_STATUS_OPTIONS,
  OA_PUBLISH_SCOPE_LABEL,
  OA_PUBLISH_SCOPE_OPTIONS,
  OA_PUBLISH_STATUS_LABEL,
  OA_PUBLISH_STATUS_OPTIONS,
  OA_REPORT_TYPE_LABEL,
  OA_REPORT_TYPE_OPTIONS,
  OA_VOTE_STATUS_LABEL,
  OA_VOTE_STATUS_OPTIONS,
  OA_VOTE_TYPE_LABEL,
  OA_VOTE_TYPE_OPTIONS,
  type OaAlbumItem,
  type OaAlbumPhotoItem,
  type OaAlbumPhotoSaveParams,
  type OaAlbumQuery,
  type OaAlbumSaveParams,
  type OaAnnouncementItem,
  type OaAnnouncementQuery,
  type OaAnnouncementSaveParams,
  type OaCollabCommentItem,
  type OaCollabTaskItem,
  type OaCollabTaskQuery,
  type OaCollabTaskSaveParams,
  type OaVoteItem,
  type OaVoteOptionItem,
  type OaVoteQuery,
  type OaVoteSaveParams,
  type OaWorkReportItem,
  type OaWorkReportQuery,
  type OaWorkReportSaveParams,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;
const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/* ---------------- 公告新闻 ---------------- */

interface AnnouncementSearchState {
  keyword?: string;
  category?: string;
  publishStatus?: string;
}

interface AnnouncementFormValues {
  title: string;
  category?: string;
  content?: string;
  publishScope?: string;
  publishStatus?: string;
  publishAt?: Dayjs;
  expireAt?: Dayjs;
  remark?: string;
}

function AnnouncementPanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<AnnouncementFormValues>();

  const [data, setData] = useState<OaAnnouncementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<AnnouncementSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaAnnouncementItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaAnnouncementQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          category: cond.category || undefined,
          publishStatus: cond.publishStatus || undefined,
        };
        const res = await oaAnnouncementService.page(params);
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

  const onSearch = (values: AnnouncementSearchState) => {
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
    form.setFieldsValue({ category: 'ANNOUNCEMENT', publishScope: 'ALL', publishStatus: 'DRAFT' });
    setModalOpen(true);
  };

  const openEdit = (record: OaAnnouncementItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      title: record.title,
      category: record.category,
      content: record.content,
      publishScope: record.publishScope,
      publishStatus: record.publishStatus,
      publishAt: record.publishAt ? dayjs(record.publishAt) : undefined,
      expireAt: record.expireAt ? dayjs(record.expireAt) : undefined,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaAnnouncementSaveParams = {
      title: values.title,
      category: values.category,
      content: values.content,
      publishScope: values.publishScope,
      publishStatus: values.publishStatus,
      publishAt: values.publishAt ? values.publishAt.format(DATETIME_SUBMIT_FORMAT) : undefined,
      expireAt: values.expireAt ? values.expireAt.format(DATETIME_SUBMIT_FORMAT) : undefined,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaAnnouncementService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaAnnouncementService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaAnnouncementItem) => {
    await oaAnnouncementService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handlePublish = async (record: OaAnnouncementItem) => {
    await oaAnnouncementService.publish(record.id);
    message.success('发布成功');
    void loadData();
  };

  const handleOffline = async (record: OaAnnouncementItem) => {
    await oaAnnouncementService.offline(record.id);
    message.success('已下线');
    void loadData();
  };

  const handleMarkRead = async (record: OaAnnouncementItem) => {
    await oaAnnouncementService.markRead(record.id);
    message.success('已登记阅读');
    void loadData();
  };

  const columns: ColumnsType<OaAnnouncementItem> = [
    { title: '标题', dataIndex: 'title', width: 220, fixed: 'left', render: (v) => v || '-' },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      render: (v?: string) => (v ? OA_ANNOUNCEMENT_CATEGORY_LABEL[v] || v : '-'),
    },
    {
      title: '发布范围',
      dataIndex: 'publishScope',
      width: 110,
      render: (v?: string) => (v ? OA_PUBLISH_SCOPE_LABEL[v] || v : '-'),
    },
    {
      title: '状态',
      dataIndex: 'publishStatus',
      width: 100,
      render: (v?: string) => (v ? <Tag>{OA_PUBLISH_STATUS_LABEL[v] || v}</Tag> : '-'),
    },
    {
      title: '发布时间',
      dataIndex: 'publishAt',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:collab:publish') && (
            <>
              <Button type="link" size="small" onClick={() => openEdit(record)}>
                编辑
              </Button>
              {record.publishStatus !== 'PUBLISHED' && (
                <Button type="link" size="small" onClick={() => handlePublish(record)}>
                  发布
                </Button>
              )}
              {record.publishStatus === 'PUBLISHED' && (
                <Button type="link" size="small" onClick={() => handleOffline(record)}>
                  下线
                </Button>
              )}
              <Popconfirm title="确认删除该公告？" onConfirm={() => handleDelete(record)}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
          <Button type="link" size="small" onClick={() => handleMarkRead(record)}>
            登记已读
          </Button>
        </Space>
      ),
    },
  ];

  if (!hasPermission('oa:collab:list')) {
    return <Empty description="暂无公告新闻查看权限" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="标题关键字" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_ANNOUNCEMENT_CATEGORY_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="publishStatus" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_PUBLISH_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
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
        title={`公告新闻列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:collab:publish') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建公告
            </Button>
          )
        }
      >
        <Table<OaAnnouncementItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1000 }}
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
        title={editing ? '编辑公告' : '新建公告'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select
              placeholder="请选择"
              options={OA_ANNOUNCEMENT_CATEGORY_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="publishScope" label="发布范围">
            <Select
              placeholder="请选择"
              options={OA_PUBLISH_SCOPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="publishStatus" label="状态">
            <Select
              placeholder="请选择"
              options={OA_PUBLISH_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="publishAt" label="发布时间">
            <DatePicker style={{ width: '100%' }} showTime format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="expireAt" label="失效时间">
            <DatePicker style={{ width: '100%' }} showTime format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="content" label="正文">
            <Input.TextArea rows={5} placeholder="请输入正文内容" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 投票调查 ---------------- */

interface VoteSearchState {
  keyword?: string;
  voteStatus?: string;
  voteType?: string;
}

interface VoteFormValues {
  title: string;
  description?: string;
  voteType?: string;
  voteStatus?: string;
  startAt?: Dayjs;
  endAt?: Dayjs;
  maxChoice?: number;
  optionsText?: string;
  remark?: string;
}

function VotePanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<VoteFormValues>();

  const [data, setData] = useState<OaVoteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<VoteSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaVoteItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [voteOpen, setVoteOpen] = useState(false);
  const [voteDetail, setVoteDetail] = useState<{ vote: OaVoteItem; options: OaVoteOptionItem[] } | null>(
    null,
  );
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [voteSubmitting, setVoteSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaVoteQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          voteStatus: cond.voteStatus || undefined,
        };
        const res = await oaVoteService.page(params);
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

  const onSearch = (values: VoteSearchState) => {
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
    form.setFieldsValue({ voteType: 'SINGLE', voteStatus: 'DRAFT' });
    setModalOpen(true);
  };

  const openEdit = async (record: OaVoteItem) => {
    const res = await oaVoteService.detail(record.id);
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      title: res.vote.title,
      description: res.vote.description,
      voteType: res.vote.voteType,
      voteStatus: res.vote.voteStatus,
      startAt: res.vote.startAt ? dayjs(res.vote.startAt) : undefined,
      endAt: res.vote.endAt ? dayjs(res.vote.endAt) : undefined,
      maxChoice: res.vote.maxChoice,
      optionsText: (res.options || []).map((o) => o.optionText).join('\n'),
      remark: res.vote.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const options = (values.optionsText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (options.length === 0) {
      message.warning('请至少填写一个选项');
      return;
    }
    const payload: OaVoteSaveParams = {
      title: values.title,
      description: values.description,
      voteType: values.voteType,
      voteStatus: values.voteStatus,
      startAt: values.startAt ? values.startAt.format(DATETIME_SUBMIT_FORMAT) : undefined,
      endAt: values.endAt ? values.endAt.format(DATETIME_SUBMIT_FORMAT) : undefined,
      maxChoice: values.maxChoice,
      options,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaVoteService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaVoteService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaVoteItem) => {
    await oaVoteService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handlePublish = async (record: OaVoteItem) => {
    await oaVoteService.publish(record.id);
    message.success('发布成功');
    void loadData();
  };

  const handleClose = async (record: OaVoteItem) => {
    await oaVoteService.close(record.id);
    message.success('已关闭');
    void loadData();
  };

  const openVote = async (record: OaVoteItem) => {
    const res = await oaVoteService.detail(record.id);
    setVoteDetail(res);
    setSelectedOptions([]);
    setVoteOpen(true);
  };

  const submitVote = async () => {
    if (!voteDetail) return;
    if (selectedOptions.length === 0) {
      message.warning('请选择投票选项');
      return;
    }
    setVoteSubmitting(true);
    try {
      await oaVoteService.castVote(voteDetail.vote.id, selectedOptions);
      message.success('投票成功');
      setVoteOpen(false);
      void loadData();
    } finally {
      setVoteSubmitting(false);
    }
  };

  const columns: ColumnsType<OaVoteItem> = [
    { title: '标题', dataIndex: 'title', width: 220, fixed: 'left', render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'voteType',
      width: 100,
      render: (v?: string) => (v ? OA_VOTE_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '状态',
      dataIndex: 'voteStatus',
      width: 100,
      render: (v?: string) => (v ? <Tag>{OA_VOTE_STATUS_LABEL[v] || v}</Tag> : '-'),
    },
    {
      title: '开始时间',
      dataIndex: 'startAt',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endAt',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '是否匿名',
      dataIndex: 'anonymousFlag',
      width: 100,
      render: (v?: number) => (v ? <Tag color="blue">匿名</Tag> : <Tag>实名</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:collab:vote') && (
            <Button type="link" size="small" onClick={() => openVote(record)}>
              参与投票
            </Button>
          )}
          {hasPermission('oa:collab:publish') && (
            <>
              <Button type="link" size="small" onClick={() => openEdit(record)}>
                编辑
              </Button>
              {record.voteStatus !== 'RUNNING' && (
                <Button type="link" size="small" onClick={() => handlePublish(record)}>
                  发布
                </Button>
              )}
              {record.voteStatus === 'RUNNING' && (
                <Button type="link" size="small" onClick={() => handleClose(record)}>
                  关闭
                </Button>
              )}
              <Popconfirm title="确认删除该投票？" onConfirm={() => handleDelete(record)}>
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

  if (!hasPermission('oa:collab:list')) {
    return <Empty description="暂无投票调查查看权限" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="标题关键字" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="voteStatus" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_VOTE_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
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
        title={`投票调查列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:collab:publish') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建投票
            </Button>
          )
        }
      >
        <Table<OaVoteItem>
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
        title={editing ? '编辑投票' : '新建投票'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={2} placeholder="请输入投票说明" />
          </Form.Item>
          <Form.Item name="voteType" label="投票类型">
            <Select
              placeholder="请选择"
              options={OA_VOTE_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="voteStatus" label="状态">
            <Select
              placeholder="请选择"
              options={OA_VOTE_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="startAt" label="开始时间">
            <DatePicker style={{ width: '100%' }} showTime format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="endAt" label="结束时间">
            <DatePicker style={{ width: '100%' }} showTime format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="maxChoice" label="最多可选数">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="多选投票时有效" />
          </Form.Item>
          <Form.Item
            name="optionsText"
            label="投票选项"
            extra="每行填写一个选项"
            rules={[{ required: true, message: '请填写投票选项' }]}
          >
            <Input.TextArea rows={4} placeholder="每行一个选项" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={voteDetail ? `参与投票：${voteDetail.vote.title}` : '参与投票'}
        open={voteOpen}
        onOk={submitVote}
        confirmLoading={voteSubmitting}
        onCancel={() => setVoteOpen(false)}
        okText="提交投票"
        destroyOnClose
      >
        {voteDetail && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {voteDetail.vote.description && <Text type="secondary">{voteDetail.vote.description}</Text>}
            {voteDetail.vote.voteType === 'MULTI' ? (
              <Checkbox.Group
                value={selectedOptions}
                onChange={(vals) => setSelectedOptions(vals as number[])}
              >
                <Space direction="vertical">
                  {voteDetail.options.map((o) => (
                    <Checkbox key={o.id} value={o.id}>
                      {o.optionText}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            ) : (
              <Radio.Group
                value={selectedOptions[0]}
                onChange={(e) => setSelectedOptions([e.target.value as number])}
              >
                <Space direction="vertical">
                  {voteDetail.options.map((o) => (
                    <Radio key={o.id} value={o.id}>
                      {o.optionText}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
          </Space>
        )}
      </Modal>
    </Space>
  );
}

/* ---------------- 相册 ---------------- */

interface AlbumSearchState {
  keyword?: string;
  albumStatus?: string;
}

interface AlbumFormValues {
  albumName: string;
  category?: string;
  description?: string;
  publishScope?: string;
  albumStatus?: string;
  remark?: string;
}

interface AlbumPhotoFormValues {
  fileName?: string;
  filePath?: string;
  description?: string;
  sortNo?: number;
}

function AlbumPanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<AlbumFormValues>();
  const [photoForm] = Form.useForm<AlbumPhotoFormValues>();

  const [data, setData] = useState<OaAlbumItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<AlbumSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaAlbumItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentAlbum, setCurrentAlbum] = useState<OaAlbumItem | null>(null);
  const [photos, setPhotos] = useState<OaAlbumPhotoItem[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaAlbumQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          albumStatus: cond.albumStatus || undefined,
        };
        const res = await oaAlbumService.page(params);
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

  const loadPhotos = useCallback(async (albumId: number) => {
    setPhotoLoading(true);
    try {
      const res = await oaAlbumService.photos(albumId);
      setPhotos(res || []);
    } finally {
      setPhotoLoading(false);
    }
  }, []);

  const onSearch = (values: AlbumSearchState) => {
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
    form.setFieldsValue({ publishScope: 'ALL', albumStatus: 'DRAFT' });
    setModalOpen(true);
  };

  const openEdit = (record: OaAlbumItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      albumName: record.albumName,
      category: record.category,
      description: record.description,
      publishScope: record.publishScope,
      albumStatus: record.albumStatus,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaAlbumSaveParams = {
      albumName: values.albumName,
      category: values.category,
      description: values.description,
      publishScope: values.publishScope,
      albumStatus: values.albumStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaAlbumService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaAlbumService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaAlbumItem) => {
    await oaAlbumService.remove(record.id);
    message.success('删除成功');
    if (currentAlbum?.id === record.id) {
      setCurrentAlbum(null);
      setPhotos([]);
    }
    void loadData();
  };

  const openAlbum = (record: OaAlbumItem) => {
    setCurrentAlbum(record);
    void loadPhotos(record.id);
  };

  const openAddPhoto = () => {
    photoForm.resetFields();
    setPhotoModalOpen(true);
  };

  const handleAddPhoto = async () => {
    if (!currentAlbum) return;
    const values = await photoForm.validateFields();
    const payload: OaAlbumPhotoSaveParams = {
      fileName: values.fileName,
      filePath: values.filePath,
      description: values.description,
      sortNo: values.sortNo,
    };
    setPhotoSubmitting(true);
    try {
      await oaAlbumService.addPhoto(currentAlbum.id, payload);
      message.success('添加成功');
      setPhotoModalOpen(false);
      void loadPhotos(currentAlbum.id);
    } finally {
      setPhotoSubmitting(false);
    }
  };

  const handleRemovePhoto = async (photoId: number) => {
    await oaAlbumService.removePhoto(photoId);
    message.success('删除成功');
    if (currentAlbum) {
      void loadPhotos(currentAlbum.id);
    }
  };

  const columns: ColumnsType<OaAlbumItem> = [
    { title: '相册编号', dataIndex: 'albumNo', width: 150, render: (v) => v || '-' },
    { title: '相册名称', dataIndex: 'albumName', width: 180, render: (v) => v || '-' },
    { title: '分类', dataIndex: 'category', width: 120, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'albumStatus',
      width: 100,
      render: (v?: string) => (v ? <Tag>{OA_ALBUM_STATUS_LABEL[v] || v}</Tag> : '-'),
    },
    { title: '照片数', dataIndex: 'photoCount', width: 90, render: (v?: number) => v ?? 0 },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openAlbum(record)}>
            查看照片
          </Button>
          {hasPermission('oa:collab:album') && (
            <>
              <Button type="link" size="small" onClick={() => openEdit(record)}>
                编辑
              </Button>
              <Popconfirm title="确认删除该相册？" onConfirm={() => handleDelete(record)}>
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

  if (!hasPermission('oa:collab:list')) {
    return <Empty description="暂无相册查看权限" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="相册名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="albumStatus" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_ALBUM_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
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
        title={`相册列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:collab:album') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建相册
            </Button>
          )
        }
      >
        <Table<OaAlbumItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1000 }}
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

      {currentAlbum && (
        <Card
          title={`照片管理：${currentAlbum.albumName}（共 ${photos.length} 张）`}
          loading={photoLoading}
          extra={
            hasPermission('oa:collab:album') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openAddPhoto}>
                添加照片
              </Button>
            )
          }
        >
          {photos.length === 0 ? (
            <Empty description="暂无照片" />
          ) : (
            <Space size="middle" wrap>
              {photos.map((p) => (
                <Card
                  key={p.id}
                  style={{ width: 200 }}
                  cover={
                    p.filePath ? (
                      <img
                        alt={p.fileName || '照片'}
                        src={p.filePath}
                        style={{ height: 140, objectFit: 'cover' }}
                      />
                    ) : undefined
                  }
                  actions={
                    hasPermission('oa:collab:album')
                      ? [
                          <Popconfirm
                            key="remove"
                            title="确认删除该照片？"
                            onConfirm={() => handleRemovePhoto(p.id)}
                          >
                            <Button type="link" size="small" danger>
                              删除
                            </Button>
                          </Popconfirm>,
                        ]
                      : undefined
                  }
                >
                  <Card.Meta title={p.fileName || `照片 ${p.id}`} description={p.description || '-'} />
                </Card>
              ))}
            </Space>
          )}
        </Card>
      )}

      <Modal
        title={editing ? '编辑相册' : '新建相册'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="albumName"
            label="相册名称"
            rules={[{ required: true, message: '请输入相册名称' }]}
          >
            <Input placeholder="请输入相册名称" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" />
          </Form.Item>
          <Form.Item name="publishScope" label="发布范围">
            <Select
              placeholder="请选择"
              options={OA_PUBLISH_SCOPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="albumStatus" label="状态">
            <Select
              placeholder="请选择"
              options={OA_ALBUM_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加照片"
        open={photoModalOpen}
        onOk={handleAddPhoto}
        confirmLoading={photoSubmitting}
        onCancel={() => setPhotoModalOpen(false)}
        destroyOnClose
      >
        <Form form={photoForm} layout="vertical" preserve={false}>
          <Form.Item
            name="fileName"
            label="文件名"
            rules={[{ required: true, message: '请输入文件名' }]}
          >
            <Input placeholder="请输入文件名" />
          </Form.Item>
          <Form.Item name="filePath" label="文件地址">
            <Input placeholder="请输入文件地址（URL）" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="sortNo" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序号" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 协作任务 ---------------- */

interface CollabTaskSearchState {
  keyword?: string;
  taskStatus?: string;
}

interface CollabTaskFormValues {
  title: string;
  content?: string;
  ownerUserId?: number;
  participantJson?: string;
  dueAt?: Dayjs;
  progress?: number;
  taskStatus?: string;
  priority?: string;
  parentId?: number;
  remark?: string;
}

function CollabTaskPanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<CollabTaskFormValues>();

  const [data, setData] = useState<OaCollabTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<CollabTaskSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaCollabTaskItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTask, setCommentTask] = useState<OaCollabTaskItem | null>(null);
  const [comments, setComments] = useState<OaCollabCommentItem[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaCollabTaskQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          taskStatus: cond.taskStatus || undefined,
        };
        const res = await oaCollabTaskService.page(params);
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

  const onSearch = (values: CollabTaskSearchState) => {
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
    form.setFieldsValue({ taskStatus: 'TODO', priority: 'NORMAL', progress: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: OaCollabTaskItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      ownerUserId: record.ownerUserId,
      participantJson: record.participantJson,
      dueAt: record.dueAt ? dayjs(record.dueAt) : undefined,
      progress: record.progress,
      taskStatus: record.taskStatus,
      priority: record.priority,
      parentId: record.parentId,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaCollabTaskSaveParams = {
      title: values.title,
      content: values.content,
      ownerUserId: values.ownerUserId,
      participantJson: values.participantJson,
      dueAt: values.dueAt ? values.dueAt.format(DATETIME_SUBMIT_FORMAT) : undefined,
      progress: values.progress,
      taskStatus: values.taskStatus,
      priority: values.priority,
      parentId: values.parentId,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaCollabTaskService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaCollabTaskService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaCollabTaskItem) => {
    await oaCollabTaskService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const loadComments = useCallback(async (taskId: number) => {
    setCommentLoading(true);
    try {
      const res = await oaCollabCommentService.list('COLLAB_TASK', taskId);
      setComments(res || []);
    } finally {
      setCommentLoading(false);
    }
  }, []);

  const openComments = (record: OaCollabTaskItem) => {
    setCommentTask(record);
    setCommentText('');
    setCommentOpen(true);
    void loadComments(record.id);
  };

  const submitComment = async () => {
    if (!commentTask) return;
    if (!commentText.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    setCommentSubmitting(true);
    try {
      await oaCollabCommentService.create({
        bizType: 'COLLAB_TASK',
        bizId: commentTask.id,
        content: commentText.trim(),
      });
      message.success('评论成功');
      setCommentText('');
      void loadComments(commentTask.id);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    await oaCollabCommentService.remove(commentId);
    message.success('删除成功');
    if (commentTask) {
      void loadComments(commentTask.id);
    }
  };

  const columns: ColumnsType<OaCollabTaskItem> = [
    { title: '任务编号', dataIndex: 'taskNo', width: 150, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    { title: '负责人', dataIndex: 'ownerName', width: 120, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'taskStatus',
      width: 100,
      render: (v?: string) => (v ? <Tag>{OA_COLLAB_TASK_STATUS_LABEL[v] || v}</Tag> : '-'),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (v?: string) => (v ? OA_COLLAB_TASK_PRIORITY_LABEL[v] || v : '-'),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 90,
      render: (v?: number) => (v !== undefined && v !== null ? `${v}%` : '-'),
    },
    {
      title: '截止时间',
      dataIndex: 'dueAt',
      width: 160,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openComments(record)}>
            评论
          </Button>
          {hasPermission('oa:collab:task') && (
            <>
              <Button type="link" size="small" onClick={() => openEdit(record)}>
                编辑
              </Button>
              <Popconfirm title="确认删除该协作任务？" onConfirm={() => handleDelete(record)}>
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

  if (!hasPermission('oa:collab:task')) {
    return <Empty description="暂无协作任务查看权限" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="任务标题 / 编号" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="taskStatus" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_COLLAB_TASK_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
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
        title={`协作任务列表（共 ${total} 条）`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建协作任务
          </Button>
        }
      >
        <Table<OaCollabTaskItem>
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
        title={editing ? '编辑协作任务' : '新建协作任务'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="content" label="任务内容">
            <Input.TextArea rows={3} placeholder="请输入任务内容" />
          </Form.Item>
          <Form.Item name="ownerUserId" label="负责人">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.ownerName} />
          </Form.Item>
          <Form.Item name="participantJson" label="参与人">
            <Input.TextArea rows={2} placeholder="参与人（JSON 字符串）" />
          </Form.Item>
          <Form.Item name="dueAt" label="截止时间">
            <DatePicker style={{ width: '100%' }} showTime format={DATETIME_FORMAT} />
          </Form.Item>
          <Form.Item name="progress" label="进度（%）">
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="请输入进度" />
          </Form.Item>
          <Form.Item name="taskStatus" label="状态">
            <Select
              placeholder="请选择"
              options={OA_COLLAB_TASK_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select
              placeholder="请选择"
              options={OA_COLLAB_TASK_PRIORITY_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="parentId" label="父任务ID">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入父任务ID" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={commentTask ? `任务评论：${commentTask.title}` : '任务评论'}
        open={commentOpen}
        onOk={submitComment}
        confirmLoading={commentSubmitting}
        onCancel={() => setCommentOpen(false)}
        okText="发表评论"
        destroyOnClose
        width={640}
      >
        <List
          loading={commentLoading}
          dataSource={comments}
          locale={{ emptyText: '暂无评论' }}
          renderItem={(item) => (
            <List.Item
              actions={
                hasPermission('oa:collab:task')
                  ? [
                      <Popconfirm
                        key="remove"
                        title="确认删除该评论？"
                        onConfirm={() => handleDeleteComment(item.id)}
                      >
                        <Button type="link" size="small" danger>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              <List.Item.Meta
                title={item.authorName || `用户 ${item.authorUserId ?? ''}`}
                description={item.createdAt ? dayjs(item.createdAt).format(DATETIME_FORMAT) : ''}
              />
              <div>{item.content}</div>
            </List.Item>
          )}
        />
        <Input.TextArea
          rows={3}
          style={{ marginTop: 12 }}
          placeholder="请输入评论内容"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
      </Modal>
    </Space>
  );
}

/* ---------------- 工作汇报 ---------------- */

interface WorkReportSearchState {
  keyword?: string;
  reportType?: string;
}

interface WorkReportFormValues {
  reportType?: string;
  title: string;
  content?: string;
  reportDate?: Dayjs;
  remark?: string;
}

function WorkReportPanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<WorkReportFormValues>();

  const [data, setData] = useState<OaWorkReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<WorkReportSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaWorkReportItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaWorkReportQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          reportType: cond.reportType || undefined,
        };
        const res = await oaWorkReportService.page(params);
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

  const onSearch = (values: WorkReportSearchState) => {
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
    form.setFieldsValue({ reportType: 'DAILY', reportDate: dayjs() });
    setModalOpen(true);
  };

  const openEdit = (record: OaWorkReportItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      reportType: record.reportType,
      title: record.title,
      content: record.content,
      reportDate: record.reportDate ? dayjs(record.reportDate) : undefined,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaWorkReportSaveParams = {
      reportType: values.reportType,
      title: values.title,
      content: values.content,
      reportDate: values.reportDate ? values.reportDate.format(DATE_FORMAT) : undefined,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaWorkReportService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaWorkReportService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaWorkReportItem) => {
    await oaWorkReportService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleMarkRead = async (record: OaWorkReportItem) => {
    await oaWorkReportService.markRead(record.id);
    message.success('已标记已读');
    void loadData();
  };

  const columns: ColumnsType<OaWorkReportItem> = [
    { title: '汇报编号', dataIndex: 'reportNo', width: 150, render: (v) => v || '-' },
    { title: '汇报人', dataIndex: 'reporterName', width: 120, render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'reportType',
      width: 90,
      render: (v?: string) => (v ? OA_REPORT_TYPE_LABEL[v] || v : '-'),
    },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    {
      title: '汇报日期',
      dataIndex: 'reportDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format(DATE_FORMAT) : '-'),
    },
    {
      title: '内容摘要',
      dataIndex: 'content',
      width: 260,
      render: (v?: string) => (v ? <Text ellipsis={{ tooltip: v }}>{v}</Text> : '-'),
    },
    {
      title: '已读',
      dataIndex: 'readFlag',
      width: 90,
      render: (v?: number) => (v ? <Tag color="green">已读</Tag> : <Tag>未读</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => handleMarkRead(record)}>
            标记已读
          </Button>
          {hasPermission('oa:collab:report') && (
            <>
              <Button type="link" size="small" onClick={() => openEdit(record)}>
                编辑
              </Button>
              <Popconfirm title="确认删除该工作汇报？" onConfirm={() => handleDelete(record)}>
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

  if (!hasPermission('oa:collab:report')) {
    return <Empty description="暂无工作汇报查看权限" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="标题关键字" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="reportType" label="类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_REPORT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
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
        title={`工作汇报列表（共 ${total} 条）`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建工作汇报
          </Button>
        }
      >
        <Table<OaWorkReportItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1300 }}
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
        title={editing ? '编辑工作汇报' : '新建工作汇报'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reportType" label="汇报类型">
            <Select
              placeholder="请选择"
              options={OA_REPORT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="reportDate" label="汇报日期">
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="content" label="汇报内容">
            <Input.TextArea rows={5} placeholder="请输入汇报内容" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function OaCollabPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        协同办公
      </Title>
      <Card>
        <Tabs
          items={[
            { key: 'announcement', label: '公告新闻', children: <AnnouncementPanel /> },
            { key: 'vote', label: '投票调查', children: <VotePanel /> },
            { key: 'album', label: '相册', children: <AlbumPanel /> },
            { key: 'task', label: '协作任务', children: <CollabTaskPanel /> },
            { key: 'report', label: '工作汇报', children: <WorkReportPanel /> },
          ]}
        />
      </Card>
    </Space>
  );
}
