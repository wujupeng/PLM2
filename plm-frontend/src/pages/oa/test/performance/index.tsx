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
import { oaPerfTestService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_PERF_LOAD_MODEL_LABEL,
  OA_PERF_LOAD_MODEL_OPTIONS,
  OA_PERF_TEST_RESULT_LABEL,
  OA_PERF_TEST_RESULT_OPTIONS,
  type OaPerfTestItem,
  type OaPerfTestSaveParams,
  type OaTestQuery,
} from '@/types/oa';

const { Title } = Typography;

const PERF_MANAGE = 'oa:test:perf:manage';

export default function OaPerfTestPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaPerfTestSaveParams>();
  const [data, setData] = useState<OaPerfTestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaPerfTestItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, testResult = result) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          result: testResult,
        };
        const res = await oaPerfTestService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, result],
  );

  const loadStats = useCallback(async () => {
    const res = await oaPerfTestService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: OaPerfTestItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      testNo: record.testNo,
      sceneName: record.sceneName,
      loadModel: record.loadModel,
      concurrentUsers: record.concurrentUsers,
      flowConcurrency: record.flowConcurrency,
      mailVolume: record.mailVolume,
      docVolume: record.docVolume,
      attachCapacity: record.attachCapacity,
      targetTps: record.targetTps,
      targetRtMs: record.targetRtMs,
      actualTps: record.actualTps,
      actualRtMs: record.actualRtMs,
      errorRate: record.errorRate,
      cpuUsage: record.cpuUsage,
      memUsage: record.memUsage,
      result: record.result,
      tester: record.tester,
      testTime: record.testTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaPerfTestItem) => {
    setDetailOpen(true);
    const res = await oaPerfTestService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaPerfTestSaveParams = { ...values };
      if (editingId !== null) {
        await oaPerfTestService.update(editingId, payload);
        message.success('性能测试记录已更新');
      } else {
        await oaPerfTestService.create(payload);
        message.success('性能测试记录已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const conclude = async (id: number) => {
    await oaPerfTestService.conclude(id);
    message.success('已判定测试结论');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaPerfTestService.remove(id);
    message.success('性能测试记录已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaPerfTestItem> = [
    { title: '测试编号', dataIndex: 'testNo', width: 170, fixed: 'left', render: plain },
    { title: '场景名称', dataIndex: 'sceneName', width: 180, render: plain },
    {
      title: '负载模型',
      dataIndex: 'loadModel',
      width: 110,
      render: (v) => enumText(OA_PERF_LOAD_MODEL_LABEL, v),
    },
    { title: '并发用户', dataIndex: 'concurrentUsers', width: 100, render: plain },
    { title: '流程并发', dataIndex: 'flowConcurrency', width: 100, render: plain },
    { title: '邮件量', dataIndex: 'mailVolume', width: 100, render: plain },
    { title: '文档量', dataIndex: 'docVolume', width: 100, render: plain },
    { title: '附件容量', dataIndex: 'attachCapacity', width: 110, render: plain },
    { title: '目标TPS', dataIndex: 'targetTps', width: 100, render: plain },
    { title: '目标响应(ms)', dataIndex: 'targetRtMs', width: 120, render: plain },
    { title: '实际TPS', dataIndex: 'actualTps', width: 100, render: plain },
    { title: '实际响应(ms)', dataIndex: 'actualRtMs', width: 120, render: plain },
    { title: '错误率', dataIndex: 'errorRate', width: 100, render: plain },
    { title: 'CPU%', dataIndex: 'cpuUsage', width: 90, render: plain },
    { title: '内存%', dataIndex: 'memUsage', width: 90, render: plain },
    {
      title: '结论',
      dataIndex: 'result',
      width: 100,
      render: (v) => enumTag(OA_PERF_TEST_RESULT_LABEL, v),
    },
    { title: '测试人员', dataIndex: 'tester', width: 110, render: plain },
    { title: '测试时间', dataIndex: 'testTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(PERF_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(PERF_MANAGE) && (
            <Button type="link" size="small" onClick={() => void conclude(record.id)}>
              判定结论
            </Button>
          )}
          {hasPermission(PERF_MANAGE) && (
            <Popconfirm title="确认删除该测试记录？" onConfirm={() => void remove(record.id)}>
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
        性能与容量测试
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="测试总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="通过"
            value={Number(stats.pass ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="失败"
            value={Number(stats.fail ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="待判定"
            value={Number(stats.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic title="目标并发用户数" value={Number(stats.targetConcurrentUsers ?? 0)} />
          <Statistic title="目标响应(ms)" value={Number(stats.targetResponseMs ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="结论">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={result}
              onChange={(v) => setResult(v)}
              options={[...OA_PERF_TEST_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="测试编号 / 场景名称"
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
                  void loadData(1, pageSize, keyword, result);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setResult(undefined);
                  setKeyword('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(PERF_MANAGE) && <Button onClick={openCreate}>新增测试</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`性能与容量测试（共 ${total} 条）`}>
        <Table<OaPerfTestItem>
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
        title="性能测试详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="测试编号">{plain(detail.testNo)}</Descriptions.Item>
            <Descriptions.Item label="场景名称">{plain(detail.sceneName)}</Descriptions.Item>
            <Descriptions.Item label="负载模型">
              {enumText(OA_PERF_LOAD_MODEL_LABEL, detail.loadModel)}
            </Descriptions.Item>
            <Descriptions.Item label="结论">
              {enumTag(OA_PERF_TEST_RESULT_LABEL, detail.result)}
            </Descriptions.Item>
            <Descriptions.Item label="并发用户">{plain(detail.concurrentUsers)}</Descriptions.Item>
            <Descriptions.Item label="流程并发">{plain(detail.flowConcurrency)}</Descriptions.Item>
            <Descriptions.Item label="邮件量">{plain(detail.mailVolume)}</Descriptions.Item>
            <Descriptions.Item label="文档量">{plain(detail.docVolume)}</Descriptions.Item>
            <Descriptions.Item label="附件容量">{plain(detail.attachCapacity)}</Descriptions.Item>
            <Descriptions.Item label="目标TPS">{plain(detail.targetTps)}</Descriptions.Item>
            <Descriptions.Item label="目标响应(ms)">{plain(detail.targetRtMs)}</Descriptions.Item>
            <Descriptions.Item label="实际TPS">{plain(detail.actualTps)}</Descriptions.Item>
            <Descriptions.Item label="实际响应(ms)">{plain(detail.actualRtMs)}</Descriptions.Item>
            <Descriptions.Item label="错误率">{plain(detail.errorRate)}</Descriptions.Item>
            <Descriptions.Item label="CPU%">{plain(detail.cpuUsage)}</Descriptions.Item>
            <Descriptions.Item label="内存%">{plain(detail.memUsage)}</Descriptions.Item>
            <Descriptions.Item label="测试人员">{plain(detail.tester)}</Descriptions.Item>
            <Descriptions.Item label="测试时间">{formatDateTime(detail.testTime)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑性能测试' : '新增性能测试'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="testNo" label="测试编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="sceneName"
            label="场景名称"
            rules={[{ required: true, message: '请输入压测场景名称' }]}
          >
            <Input placeholder="如 全量邮件收发压测" />
          </Form.Item>
          <Form.Item name="loadModel" label="负载模型">
            <Select placeholder="请选择" options={[...OA_PERF_LOAD_MODEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="concurrentUsers" label="并发用户">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="flowConcurrency" label="流程并发">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="mailVolume" label="邮件量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="docVolume" label="文档量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="attachCapacity" label="附件容量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetTps" label="目标TPS">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetRtMs" label="目标响应(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="actualTps" label="实际TPS">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="actualRtMs" label="实际响应(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="errorRate" label="错误率">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cpuUsage" label="CPU%">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="memUsage" label="内存%">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="result" label="结论">
            <Select placeholder="请选择" options={[...OA_PERF_TEST_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="tester" label="测试人员">
            <Input />
          </Form.Item>
          <Form.Item name="testTime" label="测试时间">
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
