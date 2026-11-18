import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { srmPortalMessageService as service } from '@/services/srmPortalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_PORTAL_MESSAGE_STATUS_LABEL,
  SRM_PORTAL_MESSAGE_STATUS_OPTIONS,
  SRM_PORTAL_MESSAGE_TYPE_LABEL,
  SRM_PORTAL_MESSAGE_TYPE_OPTIONS,
  type SrmPortalMessage,
  type SrmPortalMessageQuery,
  type SrmPortalMessageSaveRequest,
} from '@/types/srmPortal';

const { Title } = Typography;

const MANAGE = 'srm:portal:message:manage';

type FormValues = Omit<SrmPortalMessageSaveRequest, 'sendDate'> & {
  sendDate?: Dayjs;
};

export default function SrmPortalMessagePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmPortalMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [messageType, setMessageType] = useState<string | undefined>(undefined);
  const [messageStatus, setMessageStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, type = messageType, status = messageStatus) => {
      setLoading(true);
      try {
        const params: SrmPortalMessageQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          messageType: type,
          messageStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, messageType, messageStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ messageType: 'SYSTEM', messageStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmPortalMessage) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      sendDate: record.sendDate ? dayjs(record.sendDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmPortalMessageSaveRequest = {
        ...values,
        sendDate: values.sendDate ? values.sendDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('门户消息已创建');
      } else {
        await service.update(editId, payload);
        message.success('门户消息已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('门户消息已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmPortalMessage> = [
    { title: '消息编号', dataIndex: 'messageNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    {
      title: '消息类型',
      dataIndex: 'messageType',
      width: 120,
      render: (v) => statusTag(SRM_PORTAL_MESSAGE_TYPE_LABEL, v),
    },
    { title: '标题', dataIndex: 'title', width: 220, render: plain },
    { title: '关联单号', dataIndex: 'bizNo', width: 150, render: plain },
    { title: '已读标志', dataIndex: 'readFlag', width: 100, render: (v) => (v ? '已读' : '未读') },
    { title: '发送人', dataIndex: 'sender', width: 100, render: plain },
    { title: '发送日期', dataIndex: 'sendDate', width: 120, render: formatDate },
    {
      title: '消息状态',
      dataIndex: 'messageStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_PORTAL_MESSAGE_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该门户消息？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        门户消息
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="消息类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={messageType}
              onChange={(v) => setMessageType(v)}
              options={[...SRM_PORTAL_MESSAGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="消息状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={messageStatus}
              onChange={(v) => setMessageStatus(v)}
              options={[...SRM_PORTAL_MESSAGE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="消息编号 / 供应商编码 / 供应商名称 / 标题 / 关联单号"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, messageType, messageStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMessageType(undefined);
                  setMessageStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建门户消息</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`门户消息（共 ${total} 条）`}>
        <Table<SrmPortalMessage>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建门户消息' : '编辑门户消息'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="messageNo" label="消息编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="messageType" label="消息类型">
            <Select placeholder="为空默认 SYSTEM" options={[...SRM_PORTAL_MESSAGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="title" label="标题">
            <Input placeholder="请输入消息标题" />
          </Form.Item>
          <Form.Item name="bizNo" label="关联单号">
            <Input placeholder="请输入关联单号" />
          </Form.Item>
          <Form.Item name="content" label="消息内容">
            <Input.TextArea rows={3} placeholder="请输入消息内容" />
          </Form.Item>
          <Form.Item name="sender" label="发送人">
            <Input placeholder="请输入发送人" />
          </Form.Item>
          <Form.Item name="sendDate" label="发送日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="messageStatus" label="消息状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_PORTAL_MESSAGE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
