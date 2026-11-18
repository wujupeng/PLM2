import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
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
import { oaEdiNoticeService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_EDI_NOTICE_STATUS_LABEL,
  OA_EDI_NOTICE_STATUS_OPTIONS,
  OA_EDI_NOTICE_TYPE_LABEL,
  OA_EDI_NOTICE_TYPE_OPTIONS,
  type OaEdiNoticeItem,
  type OaEdiNoticeSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const EDI_MANAGE = 'oa:integration:edi:manage';

const ALERT_OPTIONS = [
  { label: '全部', value: 2 },
  { label: '告警', value: 1 },
  { label: '非告警', value: 0 },
];

interface EdiFormValues {
  noticeNo?: string;
  messageId?: string;
  partnerCode?: string;
  partnerName?: string;
  orderNo?: string;
  noticeType?: string;
  noticeStatus?: string;
  alertFlag?: boolean;
  todoFlag?: boolean;
  receivedTime?: string;
  remark?: string;
}

export default function OaEdiNoticePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<EdiFormValues>();
  const [handleForm] = Form.useForm<{ handleRemark?: string }>();
  const [data, setData] = useState<OaEdiNoticeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [noticeType, setNoticeType] = useState<string | undefined>(undefined);
  const [handleStatus, setHandleStatus] = useState<string | undefined>(undefined);
  const [alertFlag, setAlertFlag] = useState<number>(2);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaEdiNoticeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [handleTarget, setHandleTarget] = useState<OaEdiNoticeItem | null>(null);
  const [handleOpen, setHandleOpen] = useState(false);
  const [handling, setHandling] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = noticeType,
      status = handleStatus,
      alert = alertFlag,
    ) => {
      setLoading(true);
      try {
        const res = await oaEdiNoticeService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          noticeType: type,
          handleStatus: status,
          alertFlag: alert === 2 ? undefined : alert,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, noticeType, handleStatus, alertFlag],
  );

  const loadStats = useCallback(async () => {
    const res = await oaEdiNoticeService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, 2);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ noticeType: 'STATUS', noticeStatus: 'CREATED', alertFlag: false });
    setOpen(true);
  };

  const openDetail = async (record: OaEdiNoticeItem) => {
    setDetailOpen(true);
    const res = await oaEdiNoticeService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaEdiNoticeSaveParams = { ...values };
      await oaEdiNoticeService.create(payload);
      message.success('EDI 通知已登记');
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaEdiNoticeService.remove(id);
    message.success('EDI 通知已删除');
    void loadData();
    void loadStats();
  };

  const openHandle = (record: OaEdiNoticeItem) => {
    setHandleTarget(record);
    handleForm.resetFields();
    setHandleOpen(true);
  };

  const submitHandle = async () => {
    if (!handleTarget) return;
    const values = await handleForm.validateFields();
    setHandling(true);
    try {
      await oaEdiNoticeService.handle(handleTarget.id, values.handleRemark);
      message.success('EDI 通知已处理');
      setHandleOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setHandling(false);
    }
  };

  const columns: ColumnsType<OaEdiNoticeItem> = [
    { title: '通知编号', dataIndex: 'noticeNo', width: 170, fixed: 'left', render: plain },
    { title: '报文ID', dataIndex: 'messageId', width: 160, render: plain },
    { title: '合作方编码', dataIndex: 'partnerCode', width: 130, render: plain },
    { title: '合作方名称', dataIndex: 'partnerName', width: 160, render: plain },
    { title: '关联订单', dataIndex: 'orderNo', width: 150, render: plain },
    {
      title: '通知类型',
      dataIndex: 'noticeType',
      width: 120,
      render: (v) => enumText(OA_EDI_NOTICE_TYPE_LABEL, v),
    },
    { title: '通知状态', dataIndex: 'noticeStatus', width: 120, render: plain },
    { title: '告警', dataIndex: 'alertFlag', width: 70, render: flagText },
    { title: '待办', dataIndex: 'todoFlag', width: 70, render: flagText },
    { title: '接收时间', dataIndex: 'receivedTime', width: 160, render: formatDateTime },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      width: 110,
      render: (v) => enumTag(OA_EDI_NOTICE_STATUS_LABEL, v),
    },
    { title: '处理人', dataIndex: 'handleUserName', width: 110, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 170,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(EDI_MANAGE) && record.handleStatus !== 'HANDLED' && (
            <Button type="link" size="small" onClick={() => openHandle(record)}>
              处理
            </Button>
          )}
          {hasPermission(EDI_MANAGE) && (
            <Popconfirm title="确认删除该通知？" onConfirm={() => void remove(record.id)}>
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
        EDI 状态通知
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="通知总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="待处理"
            value={Number(stats.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="已处理"
            value={Number(stats.handled ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="告警"
            value={Number(stats.alert ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="待办提醒"
            value={Number(stats.todoEnabled ?? 0) === 1 ? '已开启' : '已关闭'}
          />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="通知类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={noticeType}
              onChange={(v) => setNoticeType(v)}
              options={[...OA_EDI_NOTICE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="处理状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={handleStatus}
              onChange={(v) => setHandleStatus(v)}
              options={[...OA_EDI_NOTICE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="告警">
            <Select
              style={{ width: 110 }}
              value={alertFlag ?? ''}
              onChange={(v) => setAlertFlag(v)}
              options={ALERT_OPTIONS}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="通知编号 / 报文ID / 合作方 / 订单号"
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
                  void loadData(1, pageSize, keyword, noticeType, handleStatus, alertFlag);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setNoticeType(undefined);
                  setHandleStatus(undefined);
                  setAlertFlag(2);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, 2);
                }}
              >
                重置
              </Button>
              {hasPermission(EDI_MANAGE) && <Button onClick={openCreate}>登记通知</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`EDI 通知（共 ${total} 条）`}>
        <Table<OaEdiNoticeItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title="EDI 通知详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="通知编号">{plain(detail.noticeNo)}</Descriptions.Item>
            <Descriptions.Item label="报文ID">{plain(detail.messageId)}</Descriptions.Item>
            <Descriptions.Item label="合作方编码">{plain(detail.partnerCode)}</Descriptions.Item>
            <Descriptions.Item label="合作方名称">{plain(detail.partnerName)}</Descriptions.Item>
            <Descriptions.Item label="关联订单">{plain(detail.orderNo)}</Descriptions.Item>
            <Descriptions.Item label="通知类型">
              {enumText(OA_EDI_NOTICE_TYPE_LABEL, detail.noticeType)}
            </Descriptions.Item>
            <Descriptions.Item label="通知状态">{plain(detail.noticeStatus)}</Descriptions.Item>
            <Descriptions.Item label="接收时间">{formatDateTime(detail.receivedTime)}</Descriptions.Item>
            <Descriptions.Item label="告警">{flagText(detail.alertFlag)}</Descriptions.Item>
            <Descriptions.Item label="待办">{flagText(detail.todoFlag)}</Descriptions.Item>
            <Descriptions.Item label="处理状态">
              {enumTag(OA_EDI_NOTICE_STATUS_LABEL, detail.handleStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="处理人">{plain(detail.handleUserName)}</Descriptions.Item>
            <Descriptions.Item label="处理备注" span={2}>
              {plain(detail.handleRemark)}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title="登记 EDI 通知"
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="noticeNo" label="通知编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="messageId" label="报文ID" rules={[{ required: true, message: '请输入报文ID' }]}>
            <Input placeholder="EDI 报文唯一标识" />
          </Form.Item>
          <Form.Item name="partnerCode" label="合作方编码">
            <Input />
          </Form.Item>
          <Form.Item name="partnerName" label="合作方名称">
            <Input />
          </Form.Item>
          <Form.Item name="orderNo" label="关联订单号">
            <Input />
          </Form.Item>
          <Form.Item name="noticeType" label="通知类型" rules={[{ required: true, message: '请选择通知类型' }]}>
            <Select placeholder="请选择" options={[...OA_EDI_NOTICE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="noticeStatus" label="通知状态">
            <Input placeholder="如 CREATED / SHIPPED" />
          </Form.Item>
          <Form.Item name="receivedTime" label="接收时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="alertFlag" label="异常告警">
            <Select
              options={[
                { label: '否', value: false },
                { label: '是', value: true },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="处理 EDI 通知"
        open={handleOpen}
        onOk={() => void submitHandle()}
        confirmLoading={handling}
        onCancel={() => setHandleOpen(false)}
        destroyOnClose
        width={520}
      >
        <Descriptions column={1} size="small" style={{ marginBottom: 12 }}>
          <Descriptions.Item label="通知编号">{plain(handleTarget?.noticeNo)}</Descriptions.Item>
          <Descriptions.Item label="报文ID">{plain(handleTarget?.messageId)}</Descriptions.Item>
        </Descriptions>
        <Form form={handleForm} layout="vertical" preserve={false}>
          <Form.Item name="handleRemark" label="处理说明">
            <Input.TextArea rows={3} placeholder="填写处理结果说明" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
