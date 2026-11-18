import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Menu,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  FolderAddOutlined,
  InboxOutlined,
  MailOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReloadOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import UserMultiSelect from '@/pages/oa/UserMultiSelect';
import {
  oaMailAttachmentService,
  oaMailFolderService,
  oaMailService,
} from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import {
  MAIL_PRIORITY_COLOR,
  MAIL_PRIORITY_LABEL,
  MAIL_PRIORITY_OPTIONS,
  MAIL_SCAN_STATUS_COLOR,
  MAIL_SCAN_STATUS_LABEL,
  MAIL_SEND_TYPE_LABEL,
  type MailAttachmentItem,
  type MailDetail,
  type MailFolderItem,
  type MailFolderSaveParams,
  type MailItem,
  type MailQuery,
  type MailSendParams,
} from '@/types/oa';

const { Title, Text, Paragraph } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface MailSearchState {
  keyword?: string;
  senderKeyword?: string;
  priority?: string;
  readFlag?: string;
  hasAttachment?: string;
  dateRange?: [Dayjs, Dayjs];
}

interface MailFormValues {
  subject?: string;
  priority?: string;
  content?: string;
  recipientUserIds?: number[];
  ccUserIds?: number[];
  bccUserIds?: number[];
}

export default function OaMailPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MailFormValues>();
  const [searchForm] = Form.useForm<MailSearchState>();
  const [folderForm] = Form.useForm<MailFolderSaveParams>();

  const [folders, setFolders] = useState<MailFolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [unread, setUnread] = useState(0);

  const [data, setData] = useState<MailItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<MailSearchState>({});

  const [composeOpen, setComposeOpen] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<number | undefined>(undefined);
  const [sendType, setSendType] = useState('NEW');
  const [parentMessageId, setParentMessageId] = useState<number | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [sending, setSending] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<MailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderSubmitting, setFolderSubmitting] = useState(false);

  const loadFolders = useCallback(async () => {
    const res = await oaMailFolderService.list();
    setFolders(res || []);
  }, []);

  const loadUnread = useCallback(async () => {
    const count = await oaMailService.unreadCount();
    setUnread(count || 0);
  }, []);

  const loadData = useCallback(
    async (folder = currentFolder, page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MailQuery = {
          pageNum: page,
          pageSize: size,
          folderCode: folder,
          keyword: cond.keyword || undefined,
          senderKeyword: cond.senderKeyword || undefined,
          priority: cond.priority || undefined,
          readFlag: cond.readFlag === undefined || cond.readFlag === '' ? undefined : Number(cond.readFlag),
          hasAttachment:
            cond.hasAttachment === undefined || cond.hasAttachment === '' ? undefined : Number(cond.hasAttachment),
          startDate: cond.dateRange?.[0] ? cond.dateRange[0].format('YYYY-MM-DD') : undefined,
          endDate: cond.dateRange?.[1] ? cond.dateRange[1].format('YYYY-MM-DD') : undefined,
        };
        const res = await oaMailService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [currentFolder, pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadFolders();
    void loadUnread();
    void loadData('INBOX', 1, 10, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectFolder = (folderCode: string) => {
    setCurrentFolder(folderCode);
    setPageNum(1);
    void loadData(folderCode, 1, pageSize, search);
  };

  const onSearch = (values: MailSearchState) => {
    setSearch(values);
    setPageNum(1);
    void loadData(currentFolder, 1, pageSize, values);
  };

  const onResetSearch = () => {
    searchForm.resetFields();
    setSearch({});
    setPageNum(1);
    void loadData(currentFolder, 1, pageSize, {});
  };

  const openCompose = () => {
    setEditingDraftId(undefined);
    setSendType('NEW');
    setParentMessageId(undefined);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({ priority: 'NORMAL' });
    setComposeOpen(true);
  };

  const openReply = (record: MailItem | MailDetail) => {
    const message = 'message' in record ? record.message : undefined;
    const base: MailItem = message
      ? {
          messageId: message.id,
          subject: message.subject,
          senderName: message.senderName,
        }
      : (record as MailItem);
    setEditingDraftId(undefined);
    setSendType('REPLY');
    setParentMessageId(base.messageId);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      priority: 'NORMAL',
      subject: base.subject ? `Re: ${base.subject}` : undefined,
      content: `\n\n------------------ 原邮件 ------------------\n${base.senderName || ''}`,
    });
    setComposeOpen(true);
  };

  const openDraft = async (record: MailItem) => {
    const res = await oaMailService.detail(record.messageId);
    const recipientsOf = (type: string) =>
      (res.recipients || [])
        .filter((r) => r.recipientType === type)
        .map((r) => r.recipientUserId)
        .filter((v): v is number => typeof v === 'number');
    setEditingDraftId(res.message.id);
    setSendType(res.message.sendType || 'NEW');
    setParentMessageId(res.message.parentMessageId);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      subject: res.message.subject,
      content: res.message.content,
      priority: res.message.priority || 'NORMAL',
      recipientUserIds: recipientsOf('TO'),
      ccUserIds: recipientsOf('CC'),
      bccUserIds: recipientsOf('BCC'),
    });
    setComposeOpen(true);
  };

  const openForward = (record: MailItem | MailDetail) => {
    const message = 'message' in record ? record.message : undefined;
    const base: MailItem = message
      ? { messageId: message.id, subject: message.subject }
      : (record as MailItem);
    setEditingDraftId(undefined);
    setSendType('FORWARD');
    setParentMessageId(base.messageId);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      priority: 'NORMAL',
      subject: base.subject ? `Fwd: ${base.subject}` : undefined,
    });
    setComposeOpen(true);
  };

  const submitMail = async (draftFlag: boolean) => {
    const values = await form.validateFields();
    if (!draftFlag && (!values.recipientUserIds || values.recipientUserIds.length === 0)) {
      message.warning('请至少选择一个收件人');
      return;
    }
    const attachmentIds = fileList
      .map((f) => (f.response as MailAttachmentItem | undefined)?.attachmentId)
      .filter((v): v is number => typeof v === 'number');
    const payload: MailSendParams = {
      subject: values.subject,
      content: values.content,
      priority: values.priority,
      recipientUserIds: values.recipientUserIds,
      ccUserIds: values.ccUserIds,
      bccUserIds: values.bccUserIds,
      attachmentIds: attachmentIds.length ? attachmentIds : undefined,
      draftFlag,
      draftId: editingDraftId,
      parentMessageId,
      sendType,
    };
    setSending(true);
    try {
      await oaMailService.send(payload);
      message.success(draftFlag ? '已保存草稿' : '发送成功');
      setComposeOpen(false);
      await loadUnread();
      void loadData(currentFolder);
    } finally {
      setSending(false);
    }
  };

  const openDetail = async (record: MailItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await oaMailService.detail(record.messageId);
      setDetail(res);
      if (record.readFlag === 0) {
        await oaMailService.markRead(record.messageId, 1);
        await loadUnread();
        void loadData(currentFolder);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleStar = async (record: MailItem) => {
    await oaMailService.markStar(record.messageId, record.starFlag === 1 ? 0 : 1);
    message.success(record.starFlag === 1 ? '已取消星标' : '已加星标');
    void loadData(currentFolder);
  };

  const handleDelete = async (record: MailItem) => {
    await oaMailService.remove(record.messageId);
    message.success('已删除');
    await loadUnread();
    void loadData(currentFolder);
  };

  const handleDownload = async (attachment: MailAttachmentItem) => {
    const blob = await oaMailAttachmentService.download(attachment.attachmentId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.fileName || 'attachment';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await oaMailAttachmentService.upload(file as File);
      onSuccess?.(res);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const handleCreateFolder = async () => {
    const values = await folderForm.validateFields();
    setFolderSubmitting(true);
    try {
      await oaMailFolderService.create(values);
      message.success('文件夹创建成功');
      setFolderModalOpen(false);
      await loadFolders();
    } finally {
      setFolderSubmitting(false);
    }
  };

  const handleDeleteFolder = async (folder: MailFolderItem) => {
    await oaMailFolderService.remove(folder.id);
    message.success('文件夹已删除');
    if (currentFolder === folder.folderCode) {
      selectFolder('INBOX');
    }
    await loadFolders();
  };

  const columns: ColumnsType<MailItem> = [
    {
      title: '状态',
      key: 'status',
      width: 60,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={record.starFlag === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={() => void toggleStar(record)}
          />
          {record.readFlag === 0 && <Badge status="processing" />}
        </Space>
      ),
    },
    {
      title: '主题',
      dataIndex: 'subject',
      render: (v?: string, record?: MailItem) => (
        <Space direction="vertical" size={0}>
          <Space size={6}>
            <Text strong={record?.readFlag === 0}>{v || '(无主题)'}</Text>
            {record?.hasAttachment === 1 && <PaperClipOutlined />}
            {record?.priority === 'HIGH' && <Tag color="red">紧急</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record?.preview || ''}
          </Text>
        </Space>
      ),
    },
    {
      title: '发件人',
      dataIndex: 'senderName',
      width: 160,
      render: (v?: string, record?: MailItem) =>
        record?.folderCode === 'SENT' || record?.folderCode === 'DRAFT'
          ? record?.recipientSummary || '-'
          : [v, record?.senderDept].filter(Boolean).join(' / ') || '-',
    },
    {
      title: '时间',
      dataIndex: 'sentAt',
      width: 170,
      render: (v?: string, record?: MailItem) =>
        dayjs(v || record?.createdAt || undefined).isValid()
          ? dayjs(v || record?.createdAt).format(DATETIME_FORMAT)
          : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            onClick={() => (record.messageStatus === 'DRAFT' ? void openDraft(record) : void openDetail(record))}
          >
            {record.messageStatus === 'DRAFT' ? '编辑' : '查看'}
          </Button>
          <Button type="link" size="small" onClick={() => openReply(record)}>
            回复
          </Button>
          {hasPermission('oa:mail:delete') && (
            <Popconfirm title="确认删除该邮件？" onConfirm={() => void handleDelete(record)}>
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
      <Space align="center">
        <Title level={4} style={{ margin: 0 }}>
          内部邮件
        </Title>
        <Badge count={unread} overflowCount={99} showZero={false} />
      </Space>

      <Row gutter={16}>
        <Col span={5}>
          <Card
            size="small"
            title="文件夹"
            extra={
              hasPermission('oa:mail:folder') && (
                <Button
                  type="link"
                  size="small"
                  icon={<FolderAddOutlined />}
                  onClick={() => {
                    folderForm.resetFields();
                    setFolderModalOpen(true);
                  }}
                >
                  新建
                </Button>
              )
            }
          >
            <Menu
              mode="inline"
              selectedKeys={[currentFolder]}
              onClick={({ key }) => selectFolder(key)}
              style={{ borderInlineEnd: 'none' }}
              items={folders.map((folder) => ({
                key: folder.folderCode,
                icon: <InboxOutlined />,
                label: folder.folderName,
              }))}
            />
            {hasPermission('oa:mail:folder') && (
              <List
                size="small"
                header={<Text type="secondary">自定义文件夹</Text>}
                dataSource={folders.filter((f) => f.folderType === 'CUSTOM')}
                locale={{ emptyText: '暂无自定义文件夹' }}
                renderItem={(folder) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="del"
                        title="确认删除该文件夹？"
                        onConfirm={() => void handleDeleteFolder(folder)}
                      >
                        <DeleteOutlined />
                      </Popconfirm>,
                    ]}
                  >
                    <Text>{folder.folderName}</Text>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col span={19}>
          <Card>
            <Form form={searchForm} layout="inline" onFinish={onSearch}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="主题 / 正文" allowClear style={{ width: 170 }} />
              </Form.Item>
              <Form.Item name="senderKeyword" label="发件人">
                <Input placeholder="姓名 / 部门" allowClear style={{ width: 140 }} />
              </Form.Item>
              <Form.Item name="priority" label="紧急程度">
                <Select placeholder="不限" allowClear style={{ width: 110 }} options={MAIL_PRIORITY_OPTIONS} />
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
              <Form.Item name="hasAttachment" label="附件">
                <Select
                  placeholder="不限"
                  allowClear
                  style={{ width: 100 }}
                  options={[
                    { value: '1', label: '含附件' },
                    { value: '0', label: '无附件' },
                  ]}
                />
              </Form.Item>
              <Form.Item>
                <Space wrap>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={onResetSearch}>
                    重置
                  </Button>
                  {hasPermission('oa:mail:send') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCompose}>
                      写信
                    </Button>
                  )}
                  <Button icon={<MailOutlined />} onClick={() => void loadData(currentFolder)}>
                    刷新
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card style={{ marginTop: 16 }} title={`邮件列表（共 ${total} 条）`}>
            <Table<MailItem>
              rowKey="messageId"
              loading={loading}
              columns={columns}
              dataSource={data}
              scroll={{ x: 900 }}
              pagination={{
                current: pageNum,
                pageSize,
                total,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (page, size) => {
                  setPageNum(page);
                  setPageSize(size);
                  void loadData(currentFolder, page, size);
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingDraftId ? '编辑草稿' : `写信（${MAIL_SEND_TYPE_LABEL[sendType] || '新建'}）`}
        open={composeOpen}
        onCancel={() => setComposeOpen(false)}
        destroyOnClose
        width={720}
        footer={[
          <Button key="cancel" onClick={() => setComposeOpen(false)}>
            取消
          </Button>,
          <Button key="draft" loading={sending} onClick={() => void submitMail(true)}>
            保存草稿
          </Button>,
          <Button key="send" type="primary" loading={sending} onClick={() => void submitMail(false)}>
            发送
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="recipientUserIds"
            label="收件人"
            rules={[{ required: true, message: '请选择收件人' }]}
          >
            <UserMultiSelect placeholder="请选择收件人" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ccUserIds" label="抄送">
            <UserMultiSelect placeholder="请选择抄送人" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="bccUserIds" label="密送">
            <UserMultiSelect placeholder="请选择密送人" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="subject" label="主题">
            <Input placeholder="请输入邮件主题" />
          </Form.Item>
          <Form.Item name="priority" label="紧急程度">
            <Select options={MAIL_PRIORITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="content" label="正文">
            <Input.TextArea rows={6} placeholder="请输入邮件正文" />
          </Form.Item>
          <Form.Item label="附件" tooltip="附件先上传取得标识，发送时随邮件一起关联">
            <Upload
              multiple
              fileList={fileList}
              customRequest={handleUpload}
              onChange={({ fileList: list }) => setFileList(list)}
            >
              <Button icon={<PaperClipOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="邮件详情"
        open={detailOpen}
        width={640}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
        }}
        extra={
          detail && (
            <Space>
              <Button size="small" onClick={() => openReply(detail)}>
                回复
              </Button>
              <Button size="small" onClick={() => openForward(detail)}>
                转发
              </Button>
            </Space>
          )
        }
      >
        {detail ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Title level={5} style={{ margin: 0 }}>
                {detail.message.subject || '(无主题)'}
              </Title>
              <Space size={8} wrap>
                {detail.message.priority && (
                  <Tag color={MAIL_PRIORITY_COLOR[detail.message.priority]}>
                    {MAIL_PRIORITY_LABEL[detail.message.priority] || detail.message.priority}
                  </Tag>
                )}
                <Text type="secondary">
                  {detail.message.senderName}
                  {detail.message.senderDept ? ` / ${detail.message.senderDept}` : ''}
                </Text>
                <Text type="secondary">
                  {detail.message.sentAt
                    ? dayjs(detail.message.sentAt).format(DATETIME_FORMAT)
                    : detail.message.createdAt
                      ? dayjs(detail.message.createdAt).format(DATETIME_FORMAT)
                      : ''}
                </Text>
              </Space>
            </Space>
            <Divider style={{ margin: '4px 0' }} />
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {(detail.recipients || []).map((recipient) => (
                <Text key={recipient.recipientId} type="secondary">
                  {recipient.recipientType === 'TO'
                    ? '收件人'
                    : recipient.recipientType === 'CC'
                      ? '抄送'
                      : '密送'}
                  ：{recipient.recipientName}
                  {recipient.readFlag === 1 ? '（已读）' : '（未读）'}
                </Text>
              ))}
            </Space>
            <Divider style={{ margin: '4px 0' }} />
            <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {detail.message.content || '(无正文)'}
            </Paragraph>
            {detail.attachments && detail.attachments.length > 0 && (
              <>
                <Divider style={{ margin: '4px 0' }}>附件</Divider>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  {detail.attachments.map((attachment) => (
                    <Space key={attachment.attachmentId} wrap>
                      <PaperClipOutlined />
                      <Text>{attachment.fileName}</Text>
                      <Text type="secondary">
                        {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : ''}
                      </Text>
                      <Tag color={MAIL_SCAN_STATUS_COLOR[attachment.scanStatus || 'PENDING']}>
                        {MAIL_SCAN_STATUS_LABEL[attachment.scanStatus || 'PENDING']}
                      </Tag>
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        disabled={attachment.scanStatus === 'INFECTED'}
                        onClick={() => void handleDownload(attachment)}
                      >
                        下载
                      </Button>
                    </Space>
                  ))}
                </Space>
              </>
            )}
          </Space>
        ) : (
          <Empty description="请选择邮件" />
        )}
      </Drawer>

      <Modal
        title="新建自定义文件夹"
        open={folderModalOpen}
        onOk={handleCreateFolder}
        confirmLoading={folderSubmitting}
        onCancel={() => setFolderModalOpen(false)}
        destroyOnClose
      >
        <Form form={folderForm} layout="vertical" preserve={false}>
          <Form.Item
            name="folderCode"
            label="文件夹编码"
            rules={[{ required: true, message: '请输入文件夹编码' }]}
          >
            <Input placeholder="例如 PROJECT-A" />
          </Form.Item>
          <Form.Item
            name="folderName"
            label="文件夹名称"
            rules={[{ required: true, message: '请输入文件夹名称' }]}
          >
            <Input placeholder="例如 项目 A 往来" />
          </Form.Item>
          <Form.Item name="sortNo" label="排序号">
            <InputNumber style={{ width: '100%' }} placeholder="数值越小越靠前" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
