import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
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
import { oaGoliveWatchService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_DUTY_ROLE_LABEL,
  OA_GOLIVE_DUTY_ROLE_OPTIONS,
  OA_GOLIVE_WATCH_STATUS_LABEL,
  OA_GOLIVE_WATCH_STATUS_OPTIONS,
  type OaGoliveQuery,
  type OaGoliveWatchItem,
  type OaGoliveWatchSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const WATCH_MANAGE = 'oa:golive:watch:manage';

const WATCH_SHIFT_OPTIONS = [
  { label: '全天值守', value: 'FULL' },
  { label: '白班', value: 'DAY' },
  { label: '夜班', value: 'NIGHT' },
];

export default function OaGoliveWatchPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaGoliveWatchSaveParams>();
  const [data, setData] = useState<OaGoliveWatchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [dutyRole, setDutyRole] = useState<string | undefined>(undefined);
  const [watchStatus, setWatchStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaGoliveWatchItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      role = dutyRole,
      status = watchStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          dutyRole: role,
          watchStatus: status,
        };
        const res = await oaGoliveWatchService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, dutyRole, watchStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaGoliveWatchService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: OaGoliveWatchItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      watchNo: record.watchNo,
      watchName: record.watchName,
      watchShift: record.watchShift,
      dutyRole: record.dutyRole,
      dutyPerson: record.dutyPerson,
      monitorScope: record.monitorScope,
      loginCount: record.loginCount,
      flowCount: record.flowCount,
      mailCount: record.mailCount,
      docCount: record.docCount,
      apiCount: record.apiCount,
      issueCount: record.issueCount,
      criticalIssueCount: record.criticalIssueCount,
      closedIssueCount: record.closedIssueCount,
      watchStatus: record.watchStatus,
      reportSummary: record.reportSummary,
      watchTime: record.watchTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaGoliveWatchItem) => {
    setDetailOpen(true);
    const res = await oaGoliveWatchService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaGoliveWatchSaveParams = { ...values };
      if (editingId !== null) {
        await oaGoliveWatchService.update(editingId, payload);
        message.success('上线值守已更新');
      } else {
        await oaGoliveWatchService.create(payload);
        message.success('上线值守已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const close = async (record: OaGoliveWatchItem) => {
    await oaGoliveWatchService.close(record.id, record.reportSummary);
    message.success('值守已结束');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaGoliveWatchService.remove(id);
    message.success('上线值守已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaGoliveWatchItem> = [
    { title: '值守编号', dataIndex: 'watchNo', width: 170, fixed: 'left', render: plain },
    { title: '值守名称', dataIndex: 'watchName', width: 200, render: plain },
    { title: '值守班次', dataIndex: 'watchShift', width: 110, render: plain },
    {
      title: '值守角色',
      dataIndex: 'dutyRole',
      width: 120,
      render: (v) => enumText(OA_GOLIVE_DUTY_ROLE_LABEL, v),
    },
    { title: '值守人员', dataIndex: 'dutyPerson', width: 120, render: plain },
    { title: '问题总数', dataIndex: 'issueCount', width: 100, render: (v) => plain(v) },
    { title: '严重问题', dataIndex: 'criticalIssueCount', width: 100, render: (v) => plain(v) },
    { title: '已闭环', dataIndex: 'closedIssueCount', width: 100, render: (v) => plain(v) },
    {
      title: '状态',
      dataIndex: 'watchStatus',
      width: 100,
      render: (v) => enumTag(OA_GOLIVE_WATCH_STATUS_LABEL, v),
    },
    { title: '值守时间', dataIndex: 'watchTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(WATCH_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(WATCH_MANAGE) && record.watchStatus !== 'CLOSED' && (
            <Popconfirm title="确认结束该值守？" onConfirm={() => void close(record)}>
              <Button type="link" size="small">
                结束
              </Button>
            </Popconfirm>
          )}
          {hasPermission(WATCH_MANAGE) && (
            <Popconfirm title="确认删除该上线值守？" onConfirm={() => void remove(record.id)}>
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
        正式切换与现有OA退役 · 上线值守
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="值守总数" value={Number(stats.total ?? 0)} />
          <Statistic title="值守中" value={Number(stats.open ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已归档" value={Number(stats.closed ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="问题总数" value={Number(stats.issueTotal ?? 0)} />
          <Statistic title="严重问题数" value={Number(stats.criticalIssueTotal ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="已闭环问题" value={Number(stats.closedIssueTotal ?? 0)} />
          <Statistic title="严重问题阈值" value={Number(stats.criticalThreshold ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="值守编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="值守角色">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={dutyRole}
              onChange={(v) => setDutyRole(v)}
              options={[...OA_GOLIVE_DUTY_ROLE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={watchStatus}
              onChange={(v) => setWatchStatus(v)}
              options={[...OA_GOLIVE_WATCH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, dutyRole, watchStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDutyRole(undefined);
                  setWatchStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(WATCH_MANAGE) && <Button onClick={openCreate}>新增值守</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`上线值守（共 ${total} 条）`}>
        <Table<OaGoliveWatchItem>
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
        title="上线值守详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="值守编号">{plain(detail.watchNo)}</Descriptions.Item>
            <Descriptions.Item label="值守名称">{plain(detail.watchName)}</Descriptions.Item>
            <Descriptions.Item label="值守班次">{plain(detail.watchShift)}</Descriptions.Item>
            <Descriptions.Item label="值守角色">
              {enumText(OA_GOLIVE_DUTY_ROLE_LABEL, detail.dutyRole)}
            </Descriptions.Item>
            <Descriptions.Item label="值守人员">{plain(detail.dutyPerson)}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_GOLIVE_WATCH_STATUS_LABEL, detail.watchStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="监控范围" span={2}>
              {plain(detail.monitorScope)}
            </Descriptions.Item>
            <Descriptions.Item label="登录量">{plain(detail.loginCount)}</Descriptions.Item>
            <Descriptions.Item label="流程量">{plain(detail.flowCount)}</Descriptions.Item>
            <Descriptions.Item label="邮件量">{plain(detail.mailCount)}</Descriptions.Item>
            <Descriptions.Item label="文档量">{plain(detail.docCount)}</Descriptions.Item>
            <Descriptions.Item label="接口调用量">{plain(detail.apiCount)}</Descriptions.Item>
            <Descriptions.Item label="问题总数">{plain(detail.issueCount)}</Descriptions.Item>
            <Descriptions.Item label="严重问题数">{plain(detail.criticalIssueCount)}</Descriptions.Item>
            <Descriptions.Item label="已闭环问题数">{plain(detail.closedIssueCount)}</Descriptions.Item>
            <Descriptions.Item label="值守时间">{formatDateTime(detail.watchTime)}</Descriptions.Item>
            <Descriptions.Item label="值守小结" span={2}>
              {plain(detail.reportSummary)}
            </Descriptions.Item>
            <Descriptions.Item label="组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑上线值守' : '新增上线值守'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="watchNo" label="值守编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="watchName"
            label="值守名称"
            rules={[{ required: true, message: '请输入值守名称' }]}
          >
            <Input placeholder="请输入值守名称" />
          </Form.Item>
          <Form.Item name="watchShift" label="值守班次">
            <Select placeholder="请选择" options={WATCH_SHIFT_OPTIONS} />
          </Form.Item>
          <Form.Item name="dutyRole" label="值守角色">
            <Select placeholder="请选择" options={[...OA_GOLIVE_DUTY_ROLE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="dutyPerson" label="值守人员">
            <Input placeholder="请输入值守人员" />
          </Form.Item>
          <Form.Item name="monitorScope" label="监控范围">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="loginCount" label="登录量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="flowCount" label="流程量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="mailCount" label="邮件量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="docCount" label="文档量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="apiCount" label="接口调用量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="issueCount" label="问题总数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="criticalIssueCount" label="严重问题数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="closedIssueCount" label="已闭环问题数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="watchStatus" label="状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_WATCH_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reportSummary" label="值守小结">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="watchTime" label="值守时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
