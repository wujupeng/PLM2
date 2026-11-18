import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
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
import { srmEdiMessageService as service } from '@/services/srmEdiService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_EDI_DIRECTION_LABEL,
  SRM_EDI_DIRECTION_OPTIONS,
  SRM_EDI_FORMAT_LABEL,
  SRM_EDI_FORMAT_OPTIONS,
  SRM_EDI_MESSAGE_TYPE_LABEL,
  SRM_EDI_MESSAGE_TYPE_OPTIONS,
  SRM_EDI_STATUS_LABEL,
  SRM_EDI_STATUS_OPTIONS,
  type SrmEdiMessage,
  type SrmEdiMessageQuery,
  type SrmEdiMessageSaveRequest,
} from '@/types/srmEdi';

const { Title } = Typography;

const MANAGE = 'srm:edi:message:manage';

/** 日期时间提交格式（后端 LocalDateTime 采用 ISO 形式）。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 表单值：时间字段放宽为 Dayjs。 */
type FormValues = Omit<SrmEdiMessageSaveRequest, 'sendTime' | 'ackTime' | 'lastRetryTime' | 'nextRetryTime'> & {
  sendTime?: Dayjs;
  ackTime?: Dayjs;
  lastRetryTime?: Dayjs;
  nextRetryTime?: Dayjs;
};

export default function SrmEdiMessagePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmEdiMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [direction, setDirection] = useState<string | undefined>(undefined);
  const [messageType, setMessageType] = useState<string | undefined>(undefined);
  const [messageStatus, setMessageStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dir = direction,
      msgType = messageType,
      status = messageStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmEdiMessageQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          direction: dir,
          messageType: msgType,
          messageStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, direction, messageType, messageStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      direction: 'OUTBOUND',
      messageType: 'ORDER',
      messageFormat: 'XML',
      ackStatus: 'DRAFT',
      messageStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: SrmEdiMessage) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      sendTime: record.sendTime ? dayjs(record.sendTime) : undefined,
      ackTime: record.ackTime ? dayjs(record.ackTime) : undefined,
      lastRetryTime: record.lastRetryTime ? dayjs(record.lastRetryTime) : undefined,
      nextRetryTime: record.nextRetryTime ? dayjs(record.nextRetryTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmEdiMessageSaveRequest = {
        ...values,
        sendTime: values.sendTime ? values.sendTime.format(DATETIME_FORMAT) : undefined,
        ackTime: values.ackTime ? values.ackTime.format(DATETIME_FORMAT) : undefined,
        lastRetryTime: values.lastRetryTime ? values.lastRetryTime.format(DATETIME_FORMAT) : undefined,
        nextRetryTime: values.nextRetryTime ? values.nextRetryTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('EDI报文已创建');
      } else {
        await service.update(editId, payload);
        message.success('EDI报文已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('EDI报文已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmEdiMessage> = [
    { title: '报文编号', dataIndex: 'ediNo', width: 170, fixed: 'left', render: plain },
    { title: '合作方编码', dataIndex: 'partnerCode', width: 140, render: plain },
    { title: '合作方名称', dataIndex: 'partnerName', width: 160, render: plain },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 120,
      render: (v) => statusTag(SRM_EDI_DIRECTION_LABEL, v),
    },
    {
      title: '报文类型',
      dataIndex: 'messageType',
      width: 120,
      render: (v) => statusTag(SRM_EDI_MESSAGE_TYPE_LABEL, v),
    },
    { title: '业务单号', dataIndex: 'bizNo', width: 150, render: plain },
    {
      title: '报文格式',
      dataIndex: 'messageFormat',
      width: 110,
      render: (v) => statusTag(SRM_EDI_FORMAT_LABEL, v),
    },
    {
      title: '回执状态',
      dataIndex: 'ackStatus',
      width: 110,
      render: (v) => statusTag(SRM_EDI_STATUS_LABEL, v),
    },
    { title: '重试次数', dataIndex: 'retryCount', width: 90, render: plain },
    { title: '发送时间', dataIndex: 'sendTime', width: 170, render: formatDateTime },
    { title: '回执时间', dataIndex: 'ackTime', width: 170, render: formatDateTime },
    { title: '下次重试', dataIndex: 'nextRetryTime', width: 170, render: formatDateTime },
    {
      title: '报文状态',
      dataIndex: 'messageStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_EDI_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该EDI报文？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        EDI报文
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="EDI方向">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={direction}
              onChange={(v) => setDirection(v)}
              options={[...SRM_EDI_DIRECTION_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="报文类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={messageType}
              onChange={(v) => setMessageType(v)}
              options={[...SRM_EDI_MESSAGE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="报文状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={messageStatus}
              onChange={(v) => setMessageStatus(v)}
              options={[...SRM_EDI_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="报文编号 / 合作方编码 / 合作方名称 / 业务单号"
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
                  void loadData(1, pageSize, keyword, direction, messageType, messageStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDirection(undefined);
                  setMessageType(undefined);
                  setMessageStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建EDI报文</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`EDI报文（共 ${total} 条）`}>
        <Table<SrmEdiMessage>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3000 }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setPageNum(page);
              setPageSize(size);
              void loadData(page, size, keyword, direction, messageType, messageStatus);
            },
          }}
        />
      </Card>

      <Modal
        title={editId == null ? '新建EDI报文' : '编辑EDI报文'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ediNo" label="报文编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="partnerCode"
            label="合作方编码"
            rules={[{ required: true, message: '请输入合作方编码' }]}
          >
            <Input placeholder="请输入合作方编码" />
          </Form.Item>
          <Form.Item name="partnerName" label="合作方名称">
            <Input placeholder="请输入合作方名称" />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="为空默认 OUTBOUND" options={[...SRM_EDI_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="messageType" label="报文类型">
            <Select placeholder="为空默认 ORDER" options={[...SRM_EDI_MESSAGE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizNo" label="业务单号">
            <Input placeholder="请输入业务单号" />
          </Form.Item>
          <Form.Item name="messageFormat" label="报文格式">
            <Select placeholder="为空默认 XML" options={[...SRM_EDI_FORMAT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="payload" label="报文内容">
            <Input.TextArea rows={3} placeholder="请输入报文内容" />
          </Form.Item>
          <Form.Item name="sendTime" label="发送时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ackStatus" label="回执状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_EDI_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ackTime" label="回执时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ackCode" label="回执代码">
            <Input placeholder="请输入回执代码" />
          </Form.Item>
          <Form.Item name="retryCount" label="重试次数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lastRetryTime" label="上次重试时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="nextRetryTime" label="下次重试时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="messageStatus" label="报文状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_EDI_STATUS_OPTIONS]} />
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
