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
import { oaMigrationHistoryFlowService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { BOOLEAN_FORM_OPTIONS, enumTag, flagText } from '@/pages/oa/integration/shared';
import {
  type OaMigrationHistoryFlowItem,
  type OaMigrationHistoryFlowSaveParams,
  type OaMigrationQuery,
} from '@/types/oa';

const { Title } = Typography;

const HISTORY_MANAGE = 'oa:migration:history:manage';

const INSTANCE_STATUS_OPTIONS = [
  { label: '审批中', value: 'RUNNING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已终止', value: 'CANCELLED' },
] as const;

const INSTANCE_STATUS_LABEL: Record<string, string> = {
  RUNNING: '审批中',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELLED: '已终止',
};

interface HistoryFlowFormValues {
  archiveNo?: string;
  sourceInstanceNo?: string;
  processCode?: string;
  processName?: string;
  title?: string;
  formSnapshot?: string;
  applicantName?: string;
  applicantOrg?: string;
  startTime?: string;
  endTime?: string;
  instanceStatus?: string;
  approvalJson?: string;
  timelineJson?: string;
  attachmentCount?: number;
  migratedFlag?: boolean;
  queryUserName?: string;
  remark?: string;
}

export default function OaMigrationHistoryFlowPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<HistoryFlowFormValues>();
  const [data, setData] = useState<OaMigrationHistoryFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [instanceStatus, setInstanceStatus] = useState<string | undefined>(undefined);
  const [sourceNoQuery, setSourceNoQuery] = useState('');
  const [sourceMode, setSourceMode] = useState(false);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaMigrationHistoryFlowItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      status = instanceStatus,
      kw = keyword,
    ) => {
      setLoading(true);
      try {
        const params: OaMigrationQuery = {
          pageNum: page,
          pageSize: size,
          instanceStatus: status,
          keyword: kw || undefined,
        };
        const res = await oaMigrationHistoryFlowService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
        setSourceMode(false);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, instanceStatus, keyword],
  );

  const loadStats = useCallback(async () => {
    const res = await oaMigrationHistoryFlowService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, undefined, '');
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queryBySourceNo = async () => {
    if (!sourceNoQuery.trim()) {
      message.warning('请输入原单号');
      return;
    }
    setLoading(true);
    try {
      const list = await oaMigrationHistoryFlowService.bySourceNo(sourceNoQuery.trim());
      setData(list || []);
      setTotal((list || []).length);
      setSourceMode(true);
    } finally {
      setLoading(false);
    }
  };

  const resetSourceNo = () => {
    setSourceNoQuery('');
    setPageNum(1);
    void loadData(1, pageSize, instanceStatus, keyword);
  };

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ instanceStatus: 'RUNNING' });
    setOpen(true);
  };

  const openEdit = (record: OaMigrationHistoryFlowItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      archiveNo: record.archiveNo,
      sourceInstanceNo: record.sourceInstanceNo,
      processCode: record.processCode,
      processName: record.processName,
      title: record.title,
      formSnapshot: record.formSnapshot,
      applicantName: record.applicantName,
      applicantOrg: record.applicantOrg,
      startTime: record.startTime,
      endTime: record.endTime,
      instanceStatus: record.instanceStatus,
      approvalJson: record.approvalJson,
      timelineJson: record.timelineJson,
      attachmentCount: record.attachmentCount,
      migratedFlag:
        record.migratedFlag === undefined ? undefined : Number(record.migratedFlag) === 1,
      queryUserName: record.queryUserName,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaMigrationHistoryFlowItem) => {
    setDetailOpen(true);
    const res = await oaMigrationHistoryFlowService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationHistoryFlowSaveParams = { ...values };
      if (editingId !== null) {
        await oaMigrationHistoryFlowService.update(editingId, payload);
        message.success('历史流程档案已更新');
      } else {
        await oaMigrationHistoryFlowService.create(payload);
        message.success('历史流程档案已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationHistoryFlowService.remove(id);
    message.success('历史流程档案已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaMigrationHistoryFlowItem> = [
    { title: '档案编号', dataIndex: 'archiveNo', width: 170, fixed: 'left', render: plain },
    { title: '源单号', dataIndex: 'sourceInstanceNo', width: 160, render: plain },
    { title: '流程名称', dataIndex: 'processName', width: 160, render: plain },
    { title: '标题', dataIndex: 'title', width: 200, ellipsis: true, render: plain },
    { title: '发起人', dataIndex: 'applicantName', width: 110, render: plain },
    { title: '发起人组织', dataIndex: 'applicantOrg', width: 160, render: plain },
    { title: '发起时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    {
      title: '实例状态',
      dataIndex: 'instanceStatus',
      width: 110,
      render: (v) => enumTag(INSTANCE_STATUS_LABEL, v),
    },
    { title: '附件数', dataIndex: 'attachmentCount', width: 90, render: plain },
    { title: '是否已迁移', dataIndex: 'migratedFlag', width: 110, render: flagText },
    {
      title: '操作',
      key: 'action',
      width: 190,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(HISTORY_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(HISTORY_MANAGE) && (
            <Popconfirm title="确认删除该档案？" onConfirm={() => void remove(record.id)}>
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
        历史流程档案
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="档案总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="审批中"
            value={Number(stats.running ?? 0)}
            valueStyle={{ color: '#096dd9' }}
          />
          <Statistic
            title="已通过"
            value={Number(stats.approved ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="已驳回"
            value={Number(stats.rejected ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="已终止"
            value={Number(stats.cancelled ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic title="保留年限" value={Number(stats.retentionYears ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="原单号">
            <Input
              placeholder="请输入原单号"
              allowClear
              style={{ width: 200 }}
              value={sourceNoQuery}
              onChange={(e) => setSourceNoQuery(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => void queryBySourceNo()}>
                按原单号查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetSourceNo}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="实例状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={instanceStatus}
              onChange={(v) => setInstanceStatus(v)}
              options={[...INSTANCE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="档案编号 / 源单号 / 标题 / 发起人"
              allowClear
              style={{ width: 260 }}
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
                  void loadData(1, pageSize, instanceStatus, keyword);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setInstanceStatus(undefined);
                  setKeyword('');
                  setPageNum(1);
                  void loadData(1, pageSize, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(HISTORY_MANAGE) && <Button onClick={openCreate}>新增档案</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`历史流程档案（共 ${total} 条）`}>
        <Table<OaMigrationHistoryFlowItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            disabled: sourceMode,
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
        title="历史流程档案详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={900}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="档案编号">{plain(detail.archiveNo)}</Descriptions.Item>
            <Descriptions.Item label="源单号">{plain(detail.sourceInstanceNo)}</Descriptions.Item>
            <Descriptions.Item label="流程编码">{plain(detail.processCode)}</Descriptions.Item>
            <Descriptions.Item label="流程名称">{plain(detail.processName)}</Descriptions.Item>
            <Descriptions.Item label="标题" span={2}>
              {plain(detail.title)}
            </Descriptions.Item>
            <Descriptions.Item label="发起人">{plain(detail.applicantName)}</Descriptions.Item>
            <Descriptions.Item label="发起人组织">{plain(detail.applicantOrg)}</Descriptions.Item>
            <Descriptions.Item label="发起时间">{formatDateTime(detail.startTime)}</Descriptions.Item>
            <Descriptions.Item label="结束时间">{formatDateTime(detail.endTime)}</Descriptions.Item>
            <Descriptions.Item label="实例状态">
              {enumTag(INSTANCE_STATUS_LABEL, detail.instanceStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="附件数">{plain(detail.attachmentCount)}</Descriptions.Item>
            <Descriptions.Item label="是否已迁移">{flagText(detail.migratedFlag)}</Descriptions.Item>
            <Descriptions.Item label="查询人">{plain(detail.queryUserName)}</Descriptions.Item>
            <Descriptions.Item label="表单快照" span={2}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {plain(detail.formSnapshot)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="审批记录" span={2}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {plain(detail.approvalJson)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="时间线" span={2}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {plain(detail.timelineJson)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑历史流程档案' : '新增历史流程档案'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="archiveNo" label="档案编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="sourceInstanceNo"
            label="源单号"
            rules={[{ required: true, message: '请输入源单号' }]}
          >
            <Input placeholder="源流程实例编号" />
          </Form.Item>
          <Form.Item name="processCode" label="流程编码">
            <Input />
          </Form.Item>
          <Form.Item name="processName" label="流程名称">
            <Input />
          </Form.Item>
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="formSnapshot" label="表单快照">
            <Input.TextArea rows={3} placeholder="表单快照 JSON" />
          </Form.Item>
          <Form.Item name="applicantName" label="发起人">
            <Input />
          </Form.Item>
          <Form.Item name="applicantOrg" label="发起人组织">
            <Input />
          </Form.Item>
          <Form.Item name="startTime" label="发起时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="instanceStatus" label="实例状态">
            <Select placeholder="请选择" options={[...INSTANCE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="approvalJson" label="审批记录">
            <Input.TextArea rows={3} placeholder="审批记录 JSON" />
          </Form.Item>
          <Form.Item name="timelineJson" label="时间线">
            <Input.TextArea rows={3} placeholder="时间线 JSON" />
          </Form.Item>
          <Form.Item name="attachmentCount" label="附件数">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="migratedFlag" label="是否已迁移">
            <Select placeholder="请选择" options={[...BOOLEAN_FORM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="queryUserName" label="查询人">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
