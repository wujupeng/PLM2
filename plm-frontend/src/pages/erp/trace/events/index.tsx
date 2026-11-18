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
import { erpDocTrackEventService } from '@/services/erpTraceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_DOC_EVENT_STATUS_LABEL,
  ERP_DOC_EVENT_STATUS_OPTIONS,
  ERP_DOC_EVENT_TYPE_LABEL,
  ERP_DOC_EVENT_TYPE_OPTIONS,
  type ErpDocTrackEvent,
  type ErpDocTrackEventQuery,
  type ErpDocTrackEventSaveRequest,
} from '@/types/erpTrace';

const { Title } = Typography;

const MANAGE = 'erp:trace:event:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpDocTrackEventSaveRequest, 'eventTime'> & {
  eventTime?: Dayjs;
};

export default function ErpDocTrackEventPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpDocTrackEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [traceNo, setTraceNo] = useState('');
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [eventStatus, setEventStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      no = traceNo,
      type = eventType,
      status = eventStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpDocTrackEventQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          traceNo: no || undefined,
          eventType: type,
          eventStatus: status,
        };
        const res = await erpDocTrackEventService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, traceNo, eventType, eventStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ eventType: 'STATUS_CHANGE', eventStatus: 'DONE' });
    setOpen(true);
  };

  const openEdit = (record: ErpDocTrackEvent) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      eventTime: record.eventTime ? dayjs(record.eventTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpDocTrackEventSaveRequest = {
        ...values,
        eventTime: values.eventTime ? values.eventTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpDocTrackEventService.create(payload);
        message.success('业务事件已创建');
      } else {
        await erpDocTrackEventService.update(editId, payload);
        message.success('业务事件已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpDocTrackEventService.remove(id);
    message.success('业务事件已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpDocTrackEvent> = [
    { title: '追溯号', dataIndex: 'traceNo', width: 160, fixed: 'left', render: plain },
    { title: '行号', dataIndex: 'lineNo', width: 90, render: plain },
    {
      title: '事件类型',
      dataIndex: 'eventType',
      width: 120,
      render: (v) => statusTag(ERP_DOC_EVENT_TYPE_LABEL, v),
    },
    { title: '事件名称', dataIndex: 'eventName', width: 160, render: plain },
    { title: '发生时间', dataIndex: 'eventTime', width: 170, render: formatDateTime },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: plain },
    { title: '事件明细', dataIndex: 'eventDetail', width: 220, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '事件状态',
      dataIndex: 'eventStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_DOC_EVENT_STATUS_LABEL, v),
    },
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
            <Popconfirm title="确认删除该业务事件？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        业务事件
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="追溯号">
            <Input
              placeholder="追溯号"
              allowClear
              style={{ width: 160 }}
              value={traceNo}
              onChange={(e) => setTraceNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="事件类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={eventType}
              onChange={(v) => setEventType(v)}
              options={[...ERP_DOC_EVENT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="事件状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={eventStatus}
              onChange={(v) => setEventStatus(v)}
              options={[...ERP_DOC_EVENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="追溯号 / 事件名称 / 操作人"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, keyword, traceNo, eventType, eventStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTraceNo('');
                  setEventType(undefined);
                  setEventStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建业务事件</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`业务事件（共 ${total} 条）`}>
        <Table<ErpDocTrackEvent>
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
        title={editId == null ? '新建业务事件' : '编辑业务事件'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="traceNo" label="追溯号">
            <Input placeholder="请输入追溯号" />
          </Form.Item>
          <Form.Item name="lineNo" label="行号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入行号" />
          </Form.Item>
          <Form.Item name="eventType" label="事件类型">
            <Select placeholder="为空默认 STATUS_CHANGE" options={[...ERP_DOC_EVENT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="eventName" label="事件名称">
            <Input placeholder="请输入事件名称" />
          </Form.Item>
          <Form.Item name="eventTime" label="事件发生时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择事件发生时间" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="eventStatus" label="事件状态">
            <Select placeholder="为空默认 DONE" options={[...ERP_DOC_EVENT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="eventDetail" label="事件明细">
            <Input.TextArea rows={2} placeholder="请输入事件明细" />
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
