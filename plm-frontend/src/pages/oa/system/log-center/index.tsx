import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { type Dayjs } from 'dayjs';
import { oaLogCenterService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import UserSelect from '@/pages/oa/UserSelect';
import {
  DATE_FORMAT,
  formatDateTime,
  plain as flowPlain,
} from '@/pages/oa/biz/BizFlowTab';
import {
  OA_LOG_LEVEL_COLOR,
  OA_LOG_LEVEL_LABEL,
  OA_LOG_LEVEL_OPTIONS,
  OA_LOG_TYPE_LABEL,
  OA_LOG_TYPE_OPTIONS,
  OA_MOBILE_SESSION_STATUS_COLOR,
  OA_MOBILE_SESSION_STATUS_LABEL,
  OA_MOBILE_SESSION_STATUS_OPTIONS,
  type OaBizFlowItem,
  type OaSysLogSaveParams,
} from '@/types/oa';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const LOG_LIST = 'oa:log:list';
const LOG_MANAGE = 'oa:log:manage';

const ALERT_STATUS_OPTIONS = [
  { label: '无告警', value: 'NONE' },
  { label: '待处理', value: 'PENDING' },
  { label: '已处理', value: 'HANDLED' },
] as const;

const ALERT_STATUS_LABEL: Record<string, string> = {
  NONE: '无告警',
  PENDING: '待处理',
  HANDLED: '已处理',
};

const ALERT_STATUS_COLOR: Record<string, string> = {
  NONE: 'default',
  PENDING: 'red',
  HANDLED: 'green',
};

const plain = (v: unknown): string => (v === null || v === undefined || v === '' ? '-' : String(v));

const enumText = (map: Record<string, string>, v: unknown): string => {
  const key = v === null || v === undefined ? '' : String(v);
  return key ? map[key] || key : '-';
};

const alertStatusTag = (v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={ALERT_STATUS_COLOR[key]}>{ALERT_STATUS_LABEL[key] || key}</Tag>;
};

const logLevelTag = (v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={OA_LOG_LEVEL_COLOR[key]}>{OA_LOG_LEVEL_LABEL[key] || key}</Tag>;
};

const sessionStatusTag = (v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={OA_MOBILE_SESSION_STATUS_COLOR[key]}>{OA_MOBILE_SESSION_STATUS_LABEL[key] || key}</Tag>;
};

interface LogSearchValues {
  keyword?: string;
  logType?: string;
  alertStatus?: string;
  range?: [Dayjs, Dayjs];
}

interface RecordLogFormValues {
  logType?: string;
  logLevel?: string;
  logModule?: string;
  logTitle?: string;
  logContent?: string;
  bizType?: string;
  bizId?: string;
  alertFlag?: boolean;
  remark?: string;
}

/* ---------------- 1. 日志中心 ---------------- */

function LogTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [data, setData] = useState<OaBizFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<LogSearchValues>({});

  const [stats, setStats] = useState<Record<string, number>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OaBizFlowItem | null>(null);

  const [handleTarget, setHandleTarget] = useState<OaBizFlowItem | null>(null);
  const [handleOpen, setHandleOpen] = useState(false);
  const [handleOpinion, setHandleOpinion] = useState('');
  const [handling, setHandling] = useState(false);

  const [recordOpen, setRecordOpen] = useState(false);
  const [recordForm] = Form.useForm<RecordLogFormValues>();
  const [recording, setRecording] = useState(false);

  const loadStats = useCallback(async (cond?: LogSearchValues) => {
    const res = await oaLogCenterService.logStats({
      startDate: cond?.range?.[0]?.format(DATE_FORMAT),
      endDate: cond?.range?.[1]?.format(DATE_FORMAT),
    });
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond: LogSearchValues = search) => {
      setLoading(true);
      try {
        const res = await oaLogCenterService.pageLogs({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          typeCode: cond.logType || undefined,
          flowStatus: cond.alertStatus || undefined,
          startDate: cond.range?.[0]?.format(DATE_FORMAT),
          endDate: cond.range?.[1]?.format(DATE_FORMAT),
        });
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
    void loadStats({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: LogSearchValues) => {
    setSearch({ ...values });
    setPageNum(1);
    void loadData(1, pageSize, values);
    void loadStats(values);
  };

  const openDetail = async (record: OaBizFlowItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await oaLogCenterService.logDetail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openHandle = (record: OaBizFlowItem) => {
    setHandleTarget(record);
    setHandleOpinion('');
    setHandleOpen(true);
  };

  const submitHandle = async () => {
    if (!handleTarget) return;
    setHandling(true);
    try {
      await oaLogCenterService.handleAlert(handleTarget.id, handleOpinion || undefined);
      message.success('告警已处理');
      setHandleOpen(false);
      void loadData();
      void loadStats(search);
    } finally {
      setHandling(false);
    }
  };

  const handleCleanup = async () => {
    const count = await oaLogCenterService.cleanupLogs();
    message.success(`已清理 ${count ?? 0} 条过期日志`);
    void loadData();
    void loadStats(search);
  };

  const submitRecord = async () => {
    const values = await recordForm.validateFields();
    setRecording(true);
    try {
      const payload: OaSysLogSaveParams = {
        logType: values.logType,
        logLevel: values.logLevel,
        logModule: values.logModule,
        logTitle: values.logTitle,
        logContent: values.logContent,
        bizType: values.bizType,
        bizId: values.bizId,
        alertFlag: values.alertFlag,
        remark: values.remark,
      };
      await oaLogCenterService.recordLog(payload);
      message.success('日志已登记');
      setRecordOpen(false);
      recordForm.resetFields();
      void loadData();
      void loadStats(search);
    } finally {
      setRecording(false);
    }
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '日志时间', dataIndex: 'logTime', width: 160, fixed: 'left', render: formatDateTime },
    {
      title: '类型',
      dataIndex: 'logType',
      width: 100,
      render: (v) => enumText(OA_LOG_TYPE_LABEL, v),
    },
    { title: '级别', dataIndex: 'logLevel', width: 90, render: logLevelTag },
    { title: '模块', dataIndex: 'logModule', width: 130, render: plain },
    { title: '标题', dataIndex: 'logTitle', width: 220, ellipsis: true, render: plain },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
    { title: 'IP', dataIndex: 'ipAddress', width: 130, render: plain },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 90, render: plain },
    { title: '告警状态', dataIndex: 'alertStatus', width: 100, render: alertStatusTag },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission(LOG_LIST) && (
            <Button type="link" size="small" onClick={() => void openDetail(record)}>
              详情
            </Button>
          )}
          {hasPermission(LOG_MANAGE) && Number(record.alertFlag) === 1 && record.alertStatus === 'PENDING' && (
            <Button type="link" size="small" onClick={() => openHandle(record)}>
              处理告警
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="logType" label="日志类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={[...OA_LOG_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="alertStatus" label="告警状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={[...ALERT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="range" label="日志时间">
            <RangePicker />
          </Form.Item>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="标题 / 内容 / 模块 / 操作人" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch({});
                  setPageNum(1);
                  void loadData(1, pageSize, {});
                  void loadStats({});
                }}
              >
                重置
              </Button>
              {hasPermission(LOG_MANAGE) && (
                <>
                  <Button onClick={() => setRecordOpen(true)}>登记日志</Button>
                  <Popconfirm title="确认清理过期日志？" onConfirm={() => void handleCleanup()}>
                    <Button danger>清理过期日志</Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Space size="large" wrap>
          <Statistic title="日志总数" value={stats.total ?? 0} />
          <Statistic title="错误日志" value={stats.error ?? 0} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="警告日志" value={stats.warn ?? 0} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="待处理告警" value={stats.alertPending ?? 0} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="已处理告警" value={stats.alertHandled ?? 0} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="保留天数" value={stats.retentionDays ?? 0} />
        </Space>
      </Card>

      <Card title={`日志列表（共 ${total} 条）`}>
        <Table<OaBizFlowItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1500 }}
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
        title="日志详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          {detail ? (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="日志时间">{formatDateTime(detail.logTime)}</Descriptions.Item>
              <Descriptions.Item label="类型">{enumText(OA_LOG_TYPE_LABEL, detail.logType)}</Descriptions.Item>
              <Descriptions.Item label="级别">{plain(detail.logLevel)}</Descriptions.Item>
              <Descriptions.Item label="模块">{plain(detail.logModule)}</Descriptions.Item>
              <Descriptions.Item label="标题" span={2}>
                {flowPlain(detail.logTitle)}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">{plain(detail.operatorName)}</Descriptions.Item>
              <Descriptions.Item label="IP">{plain(detail.ipAddress)}</Descriptions.Item>
              <Descriptions.Item label="请求URI" span={2}>
                {plain(detail.requestUri)}
              </Descriptions.Item>
              <Descriptions.Item label="业务类型">{plain(detail.bizType)}</Descriptions.Item>
              <Descriptions.Item label="业务ID">{plain(detail.bizId)}</Descriptions.Item>
              <Descriptions.Item label="告警状态">{alertStatusTag(detail.alertStatus)}</Descriptions.Item>
              <Descriptions.Item label="处理备注">{plain(detail.handleRemark)}</Descriptions.Item>
              <Descriptions.Item label="内容" span={2}>
                <Text style={{ whiteSpace: 'pre-wrap' }}>{flowPlain(detail.logContent)}</Text>
              </Descriptions.Item>
              {detail.errorStack ? (
                <Descriptions.Item label="错误堆栈" span={2}>
                  <Text type="danger" style={{ whiteSpace: 'pre-wrap' }}>
                    {detail.errorStack}
                  </Text>
                </Descriptions.Item>
              ) : null}
            </Descriptions>
          ) : null}
        </Spin>
      </Modal>

      <Modal
        title="处理告警"
        open={handleOpen}
        onOk={() => void submitHandle()}
        confirmLoading={handling}
        onCancel={() => setHandleOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="告警标题">
            <Input value={handleTarget?.logTitle} disabled />
          </Form.Item>
          <Form.Item label="处理备注">
            <Input.TextArea
              rows={3}
              value={handleOpinion}
              onChange={(e) => setHandleOpinion(e.target.value)}
              placeholder="请输入处理备注"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="登记日志"
        open={recordOpen}
        onOk={() => void submitRecord()}
        confirmLoading={recording}
        onCancel={() => setRecordOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={recordForm} layout="vertical" preserve={false} initialValues={{ logType: 'OPERATION', logLevel: 'INFO' }}>
          <Form.Item name="logType" label="日志类型">
            <Select placeholder="请选择" options={[...OA_LOG_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="logLevel" label="日志级别">
            <Select placeholder="请选择" options={[...OA_LOG_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="logModule" label="模块">
            <Input placeholder="请输入模块" />
          </Form.Item>
          <Form.Item name="logTitle" label="日志标题" rules={[{ required: true, message: '请输入日志标题' }]}>
            <Input placeholder="请输入日志标题" />
          </Form.Item>
          <Form.Item name="logContent" label="日志内容">
            <Input.TextArea rows={3} placeholder="请输入日志内容" />
          </Form.Item>
          <Form.Item name="bizType" label="业务类型">
            <Input placeholder="请输入业务类型" />
          </Form.Item>
          <Form.Item name="bizId" label="业务ID">
            <Input placeholder="请输入业务ID" />
          </Form.Item>
          <Form.Item name="alertFlag" label="告警">
            <Select options={[{ label: '触发告警', value: true }, { label: '不触发告警', value: false }]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 2. 移动后台会话 ---------------- */

interface SessionSearchValues {
  keyword?: string;
  sessionStatus?: string;
}

function SessionTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [data, setData] = useState<OaBizFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SessionSearchValues>({});

  const [revokeTarget, setRevokeTarget] = useState<OaBizFlowItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  const [activeOpen, setActiveOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState<number | undefined>(undefined);
  const [activeList, setActiveList] = useState<OaBizFlowItem[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond: SessionSearchValues = search) => {
      setLoading(true);
      try {
        const res = await oaLogCenterService.pageSessions({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          flowStatus: cond.sessionStatus || undefined,
        });
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

  const openRevoke = (record: OaBizFlowItem) => {
    setRevokeTarget(record);
    setRevokeReason('');
    setActiveOpen(false);
  };

  const submitRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await oaLogCenterService.revokeSession(revokeTarget.id, revokeReason || undefined);
      message.success('会话已注销');
      setRevokeTarget(null);
      void loadData();
    } finally {
      setRevoking(false);
    }
  };

  const handleExpire = async () => {
    const count = await oaLogCenterService.expireSessions();
    message.success(`已清理 ${count ?? 0} 条过期会话`);
    void loadData();
  };

  const queryActive = async () => {
    if (!activeUserId) {
      message.warning('请选择用户');
      return;
    }
    setActiveLoading(true);
    try {
      const res = await oaLogCenterService.activeSessions(activeUserId);
      setActiveList(res || []);
    } finally {
      setActiveLoading(false);
    }
  };

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '会话编号', dataIndex: 'sessionNo', width: 170, fixed: 'left', render: plain },
    { title: '用户', dataIndex: 'userName', width: 110, render: plain },
    { title: '设备ID', dataIndex: 'deviceId', width: 150, render: plain },
    { title: '设备型号', dataIndex: 'deviceModel', width: 140, render: plain },
    { title: '客户端', dataIndex: 'clientType', width: 100, render: plain },
    { title: '登录IP', dataIndex: 'loginIp', width: 130, render: plain },
    { title: '登录时间', dataIndex: 'loginTime', width: 160, render: formatDateTime },
    { title: '最后活跃', dataIndex: 'lastActiveTime', width: 160, render: formatDateTime },
    { title: '过期时间', dataIndex: 'expireTime', width: 160, render: formatDateTime },
    { title: '状态', dataIndex: 'sessionStatus', width: 100, render: sessionStatusTag },
    { title: '注销原因', dataIndex: 'revokeReason', width: 140, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(LOG_MANAGE) &&
        record.sessionStatus === 'ACTIVE' && (
          <Button type="link" size="small" danger onClick={() => openRevoke(record)}>
            注销
          </Button>
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form
          layout="inline"
          onFinish={(values: SessionSearchValues) => {
            setSearch({ ...values });
            setPageNum(1);
            void loadData(1, pageSize, values);
          }}
        >
          <Form.Item name="sessionStatus" label="会话状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={[...OA_MOBILE_SESSION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="会话编号 / 用户 / 设备ID" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch({});
                  setPageNum(1);
                  void loadData(1, pageSize, {});
                }}
              >
                重置
              </Button>
              {hasPermission(LOG_MANAGE) && (
                <>
                  <Button onClick={() => setActiveOpen(true)}>查询在线会话</Button>
                  <Popconfirm title="确认清理过期会话？" onConfirm={() => void handleExpire()}>
                    <Button danger>清理过期会话</Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`移动设备会话（共 ${total} 条）`}>
        <Table<OaBizFlowItem>
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
        title="注销会话"
        open={!!revokeTarget}
        onOk={() => void submitRevoke()}
        confirmLoading={revoking}
        onCancel={() => setRevokeTarget(null)}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="会话编号">
            <Input value={revokeTarget?.sessionNo} disabled />
          </Form.Item>
          <Form.Item label="注销原因">
            <Input.TextArea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="请输入注销原因"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="查询用户在线会话"
        open={activeOpen}
        onCancel={() => {
          setActiveOpen(false);
          setActiveList([]);
          setActiveUserId(undefined);
        }}
        footer={<Button onClick={() => setActiveOpen(false)}>关闭</Button>}
        width={720}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <UserSelect
              style={{ width: 260 }}
              value={activeUserId}
              onChange={(v) => setActiveUserId(v)}
              placeholder="请选择用户"
            />
            <Button type="primary" loading={activeLoading} onClick={() => void queryActive()}>
              查询
            </Button>
          </Space>
          <Table<OaBizFlowItem>
            rowKey="id"
            size="small"
            loading={activeLoading}
            dataSource={activeList}
            pagination={false}
            columns={[
              { title: '会话编号', dataIndex: 'sessionNo', render: (v) => plain(v) },
              { title: '设备型号', dataIndex: 'deviceModel', render: (v) => plain(v) },
              { title: '登录时间', dataIndex: 'loginTime', render: (v) => formatDateTime(v) },
              { title: '最后活跃', dataIndex: 'lastActiveTime', render: (v) => formatDateTime(v) },
            ]}
          />
        </Space>
      </Modal>
    </Space>
  );
}

export default function OaLogCenterPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        日志中心与移动后台
      </Title>

      <Tabs
        items={[
          { key: 'logs', label: '日志中心', children: <LogTab /> },
          { key: 'sessions', label: '移动设备会话', children: <SessionTab /> },
        ]}
      />
    </Space>
  );
}
