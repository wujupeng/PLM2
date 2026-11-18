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
  Tabs,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { oaMigrationBatchService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enableTag, enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_ENABLE_STATUS_OPTIONS,
  OA_MIGRATION_BATCH_STATUS_LABEL,
  OA_MIGRATION_BATCH_STATUS_OPTIONS,
  OA_MIGRATION_BATCH_TYPE_LABEL,
  OA_MIGRATION_BATCH_TYPE_OPTIONS,
  OA_MIGRATION_CLEAN_RESULT_LABEL,
  OA_MIGRATION_CLEAN_RESULT_OPTIONS,
  OA_MIGRATION_CLEAN_RULE_TYPE_LABEL,
  OA_MIGRATION_CLEAN_RULE_TYPE_OPTIONS,
  OA_MIGRATION_METHOD_LABEL,
  OA_MIGRATION_METHOD_OPTIONS,
  type OaMigrationBatchItem,
  type OaMigrationBatchSaveParams,
  type OaMigrationCleanLogItem,
  type OaMigrationCleanLogSaveParams,
  type OaMigrationCleanRuleItem,
  type OaMigrationCleanRuleSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const BATCH_MANAGE = 'oa:migration:batch:manage';

/* ---------------- 1. 迁移批次 ---------------- */

function BatchTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaMigrationBatchSaveParams>();
  const [data, setData] = useState<OaMigrationBatchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [batchType, setBatchType] = useState<string | undefined>(undefined);
  const [batchStatus, setBatchStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaMigrationBatchItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = batchType,
      status = batchStatus,
    ) => {
      setLoading(true);
      try {
        const res = await oaMigrationBatchService.pageBatches({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          batchType: type,
          batchStatus: status,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, batchType, batchStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaMigrationBatchService.batchStats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: OaMigrationBatchItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      batchNo: record.batchNo,
      batchName: record.batchName,
      objectCode: record.objectCode,
      batchType: record.batchType,
      extractMethod: record.extractMethod,
      sourceSnapshot: record.sourceSnapshot,
      snapshotChecksum: record.snapshotChecksum,
      totalCount: record.totalCount,
      successCount: record.successCount,
      failCount: record.failCount,
      skipCount: record.skipCount,
      trialRound: record.trialRound,
      startTime: record.startTime,
      endTime: record.endTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaMigrationBatchItem) => {
    setDetailOpen(true);
    const res = await oaMigrationBatchService.batchDetail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationBatchSaveParams = { ...values };
      if (editId) {
        await oaMigrationBatchService.updateBatch(editId, payload);
        message.success('迁移批次已更新');
      } else {
        await oaMigrationBatchService.createBatch(payload);
        message.success('迁移批次已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const execute = async (id: number) => {
    await oaMigrationBatchService.executeBatch(id);
    message.success('批次已执行');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaMigrationBatchService.removeBatch(id);
    message.success('迁移批次已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaMigrationBatchItem> = [
    { title: '批次编号', dataIndex: 'batchNo', width: 170, fixed: 'left', render: plain },
    { title: '批次名称', dataIndex: 'batchName', width: 180, render: plain },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: plain },
    {
      title: '批次类型',
      dataIndex: 'batchType',
      width: 120,
      render: (v) => enumText(OA_MIGRATION_BATCH_TYPE_LABEL, v),
    },
    {
      title: '抽取方式',
      dataIndex: 'extractMethod',
      width: 120,
      render: (v) => enumText(OA_MIGRATION_METHOD_LABEL, v),
    },
    { title: '试迁轮次', dataIndex: 'trialRound', width: 90, render: plain },
    { title: '总条数', dataIndex: 'totalCount', width: 90, render: plain },
    { title: '成功', dataIndex: 'successCount', width: 80, render: plain },
    { title: '失败', dataIndex: 'failCount', width: 80, render: plain },
    { title: '跳过', dataIndex: 'skipCount', width: 80, render: plain },
    {
      title: '状态',
      dataIndex: 'batchStatus',
      width: 110,
      render: (v) => enumTag(OA_MIGRATION_BATCH_STATUS_LABEL, v),
    },
    { title: '开始时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    { title: '执行人', dataIndex: 'operatorName', width: 110, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(BATCH_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(BATCH_MANAGE) && (
            <Button type="link" size="small" onClick={() => void execute(record.id)}>
              执行
            </Button>
          )}
          {hasPermission(BATCH_MANAGE) && (
            <Popconfirm title="确认删除该批次？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Space size="large" wrap>
          <Statistic title="批次总数" value={Number(stats.batchTotal ?? 0)} />
          <Statistic
            title="执行中"
            value={Number(stats.batchRunning ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="成功"
            value={Number(stats.batchSuccess ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="失败"
            value={Number(stats.batchFail ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic title="清洗规则总数" value={Number(stats.cleanRuleTotal ?? 0)} />
          <Statistic title="清洗日志总数" value={Number(stats.cleanLogTotal ?? 0)} />
          <Statistic title="默认批大小" value={Number(stats.defaultBatchSize ?? 0)} />
          <Statistic title="增量窗口（分钟）" value={Number(stats.incrementWindowMinutes ?? 0)} />
          <Statistic
            title="快照留存"
            value={Number(stats.snapshotEnabled ?? 0) === 1 ? '已开启' : '已关闭'}
          />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="批次类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={batchType}
              onChange={(v) => setBatchType(v)}
              options={[...OA_MIGRATION_BATCH_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="批次状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={batchStatus}
              onChange={(v) => setBatchStatus(v)}
              options={[...OA_MIGRATION_BATCH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="批次编号 / 名称 / 对象编码"
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
                  void loadData(1, pageSize, keyword, batchType, batchStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBatchType(undefined);
                  setBatchStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(BATCH_MANAGE) && <Button onClick={openCreate}>新增批次</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`迁移批次（共 ${total} 条）`}>
        <Table<OaMigrationBatchItem>
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
        title="迁移批次详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="批次编号">{plain(detail.batchNo)}</Descriptions.Item>
            <Descriptions.Item label="批次名称">{plain(detail.batchName)}</Descriptions.Item>
            <Descriptions.Item label="对象编码">{plain(detail.objectCode)}</Descriptions.Item>
            <Descriptions.Item label="批次类型">
              {enumText(OA_MIGRATION_BATCH_TYPE_LABEL, detail.batchType)}
            </Descriptions.Item>
            <Descriptions.Item label="抽取方式">
              {enumText(OA_MIGRATION_METHOD_LABEL, detail.extractMethod)}
            </Descriptions.Item>
            <Descriptions.Item label="试迁轮次">{plain(detail.trialRound)}</Descriptions.Item>
            <Descriptions.Item label="源快照" span={2}>
              {plain(detail.sourceSnapshot)}
            </Descriptions.Item>
            <Descriptions.Item label="快照校验和" span={2}>
              {plain(detail.snapshotChecksum)}
            </Descriptions.Item>
            <Descriptions.Item label="总条数">{plain(detail.totalCount)}</Descriptions.Item>
            <Descriptions.Item label="成功 / 失败 / 跳过">
              {`${plain(detail.successCount)} / ${plain(detail.failCount)} / ${plain(
                detail.skipCount,
              )}`}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_MIGRATION_BATCH_STATUS_LABEL, detail.batchStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="执行人">{plain(detail.operatorName)}</Descriptions.Item>
            <Descriptions.Item label="开始时间">{formatDateTime(detail.startTime)}</Descriptions.Item>
            <Descriptions.Item label="结束时间">{formatDateTime(detail.endTime)}</Descriptions.Item>
            <Descriptions.Item label="归属组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editId ? '编辑迁移批次' : '新增迁移批次'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="批次编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="batchName"
            label="批次名称"
            rules={[{ required: true, message: '请输入批次名称' }]}
          >
            <Input placeholder="如 首批全量试迁" />
          </Form.Item>
          <Form.Item name="objectCode" label="对象编码">
            <Input placeholder="关联迁移对象编码" />
          </Form.Item>
          <Form.Item name="batchType" label="批次类型">
            <Select placeholder="请选择" options={[...OA_MIGRATION_BATCH_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="extractMethod" label="抽取方式">
            <Select placeholder="请选择" options={[...OA_MIGRATION_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceSnapshot" label="源快照">
            <Input placeholder="快照标识 / 路径" />
          </Form.Item>
          <Form.Item name="snapshotChecksum" label="快照校验和">
            <Input placeholder="快照 MD5" />
          </Form.Item>
          <Form.Item name="totalCount" label="总条数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="successCount" label="成功条数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="failCount" label="失败条数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="skipCount" label="跳过条数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="trialRound" label="试迁轮次">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
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

/* ---------------- 2. 清洗规则 ---------------- */

function CleanRuleTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaMigrationCleanRuleSaveParams>();
  const [data, setData] = useState<OaMigrationCleanRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [ruleType, setRuleType] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, type = ruleType) => {
      setLoading(true);
      try {
        const res = await oaMigrationBatchService.pageCleanRules({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          ruleType: type,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, ruleType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setOpen(true);
  };

  const openEdit = (record: OaMigrationCleanRuleItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      ruleNo: record.ruleNo,
      ruleName: record.ruleName,
      objectCode: record.objectCode,
      ruleType: record.ruleType,
      ruleExpr: record.ruleExpr,
      action: record.action,
      priority: record.priority,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationCleanRuleSaveParams = { ...values };
      if (editId) {
        await oaMigrationBatchService.updateCleanRule(editId, payload);
        message.success('清洗规则已更新');
      } else {
        await oaMigrationBatchService.createCleanRule(payload);
        message.success('清洗规则已创建');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationBatchService.removeCleanRule(id);
    message.success('清洗规则已删除');
    void loadData();
  };

  const columns: ColumnsType<OaMigrationCleanRuleItem> = [
    { title: '规则编号', dataIndex: 'ruleNo', width: 170, fixed: 'left', render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 180, render: plain },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: plain },
    {
      title: '规则类型',
      dataIndex: 'ruleType',
      width: 120,
      render: (v) => enumText(OA_MIGRATION_CLEAN_RULE_TYPE_LABEL, v),
    },
    { title: '规则表达式', dataIndex: 'ruleExpr', width: 200, ellipsis: true, render: plain },
    { title: '处理动作', dataIndex: 'action', width: 120, render: plain },
    { title: '优先级', dataIndex: 'priority', width: 90, render: plain },
    { title: '命中条数', dataIndex: 'hitCount', width: 90, render: plain },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission(BATCH_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(BATCH_MANAGE) && (
            <Popconfirm title="确认删除该清洗规则？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Form layout="inline">
          <Form.Item label="规则类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={ruleType}
              onChange={(v) => setRuleType(v)}
              options={[...OA_MIGRATION_CLEAN_RULE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编号 / 名称 / 对象编码"
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
                  void loadData(1, pageSize, keyword, ruleType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRuleType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(BATCH_MANAGE) && <Button onClick={openCreate}>新增规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`清洗规则（共 ${total} 条）`}>
        <Table<OaMigrationCleanRuleItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title={editId ? '编辑清洗规则' : '新增清洗规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleNo" label="规则编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="ruleName"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="如 去重历史用户" />
          </Form.Item>
          <Form.Item name="objectCode" label="对象编码">
            <Input placeholder="适用迁移对象编码" />
          </Form.Item>
          <Form.Item name="ruleType" label="规则类型">
            <Select placeholder="请选择" options={[...OA_MIGRATION_CLEAN_RULE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ruleExpr" label="规则表达式">
            <Input placeholder="如 userCode 为空" />
          </Form.Item>
          <Form.Item name="action" label="处理动作">
            <Input placeholder="如 置为空 / 跳过 / 人工处理" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越小越优先" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 3. 清洗日志 ---------------- */

function CleanLogTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaMigrationCleanLogSaveParams>();
  const [data, setData] = useState<OaMigrationCleanLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectCode, setObjectCode] = useState('');
  const [cleanResult, setCleanResult] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      code = objectCode,
      result = cleanResult,
    ) => {
      setLoading(true);
      try {
        const res = await oaMigrationBatchService.pageCleanLogs({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectCode: code || undefined,
          cleanResult: result,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectCode, cleanResult],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    form.resetFields();
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationCleanLogSaveParams = { ...values };
      await oaMigrationBatchService.recordCleanLog(payload);
      message.success('清洗日志已登记');
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationBatchService.removeCleanLog(id);
    message.success('清洗日志已删除');
    void loadData();
  };

  const columns: ColumnsType<OaMigrationCleanLogItem> = [
    { title: '批次ID', dataIndex: 'batchId', width: 100, fixed: 'left', render: plain },
    { title: '规则编号', dataIndex: 'ruleNo', width: 170, render: plain },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: plain },
    { title: '记录标识', dataIndex: 'recordKey', width: 170, render: plain },
    { title: '源值', dataIndex: 'sourceValue', width: 160, ellipsis: true, render: plain },
    { title: '清洗后值', dataIndex: 'cleanedValue', width: 160, ellipsis: true, render: plain },
    {
      title: '结果',
      dataIndex: 'cleanResult',
      width: 110,
      render: (v) => enumTag(OA_MIGRATION_CLEAN_RESULT_LABEL, v),
    },
    { title: '说明', dataIndex: 'message', width: 200, ellipsis: true, render: plain },
    { title: '清洗时间', dataIndex: 'cleanTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission(BATCH_MANAGE) && (
            <Popconfirm title="确认删除该清洗日志？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Form layout="inline">
          <Form.Item label="对象编码">
            <Input
              placeholder="对象编码"
              allowClear
              style={{ width: 170 }}
              value={objectCode}
              onChange={(e) => setObjectCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="清洗结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={cleanResult}
              onChange={(v) => setCleanResult(v)}
              options={[...OA_MIGRATION_CLEAN_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编号 / 记录标识"
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
                  void loadData(1, pageSize, keyword, objectCode, cleanResult);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectCode('');
                  setCleanResult(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(BATCH_MANAGE) && <Button onClick={openCreate}>登记清洗日志</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`清洗日志（共 ${total} 条）`}>
        <Table<OaMigrationCleanLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title="登记清洗日志"
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchId" label="批次ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="关联迁移批次ID" />
          </Form.Item>
          <Form.Item name="ruleId" label="规则ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="关联清洗规则ID" />
          </Form.Item>
          <Form.Item name="ruleNo" label="规则编号">
            <Input placeholder="清洗规则编号" />
          </Form.Item>
          <Form.Item
            name="objectCode"
            label="对象编码"
            rules={[{ required: true, message: '请输入对象编码' }]}
          >
            <Input placeholder="迁移对象编码" />
          </Form.Item>
          <Form.Item name="recordKey" label="记录标识">
            <Input placeholder="源记录主键 / 唯一标识" />
          </Form.Item>
          <Form.Item name="sourceValue" label="源值">
            <Input placeholder="清洗前的值" />
          </Form.Item>
          <Form.Item name="cleanedValue" label="清洗后值">
            <Input placeholder="清洗后的值" />
          </Form.Item>
          <Form.Item name="cleanResult" label="清洗结果">
            <Select placeholder="请选择" options={[...OA_MIGRATION_CLEAN_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="message" label="说明">
            <Input.TextArea rows={2} placeholder="清洗说明" />
          </Form.Item>
          <Form.Item name="cleanTime" label="清洗时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function OaMigrationBatchPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        迁移批次与数据清洗
      </Title>

      <Tabs
        items={[
          { key: 'batch', label: '迁移批次', children: <BatchTab /> },
          { key: 'rule', label: '清洗规则', children: <CleanRuleTab /> },
          { key: 'log', label: '清洗日志', children: <CleanLogTab /> },
        ]}
      />
    </Space>
  );
}
