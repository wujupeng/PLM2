import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { intService } from '@/services/intService';
import {
  INT_CASE_TYPE_LABEL,
  INT_CASE_TYPE_OPTIONS,
  INT_PERF_RESULT_COLOR,
  INT_PERF_RESULT_LABEL,
  INT_PERF_RESULT_OPTIONS,
  INT_PERF_SCENARIO_LABEL,
  INT_PERF_SCENARIO_OPTIONS,
  INT_PRIORITY_COLOR,
  INT_PRIORITY_LABEL,
  INT_PRIORITY_OPTIONS,
  INT_RUN_STATUS_COLOR,
  INT_RUN_STATUS_LABEL,
  INT_RUN_STATUS_OPTIONS,
  type IntPerfTestItem,
  type IntPerfTestQuery,
  type IntPerfTestSaveParams,
  type IntTestCaseItem,
  type IntTestCaseQuery,
  type IntTestCaseRunParams,
  type IntTestCaseSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 测试用例 ================= */

interface TestCaseFormValues {
  caseNo?: string;
  caseType: string;
  relatedNode?: string;
  title: string;
  precondition?: string;
  steps?: string;
  expected?: string;
  priority?: string;
  remark?: string;
}

interface TestCaseRunFormValues {
  runStatus: string;
  runResult?: string;
  defectNo?: string;
}

interface TestCaseSearchState {
  caseNo?: string;
  caseType?: string;
  relatedNode?: string;
  priority?: string;
  runStatus?: string;
}

function TestCaseTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<TestCaseFormValues>();
  const [runForm] = Form.useForm<TestCaseRunFormValues>();

  const [data, setData] = useState<IntTestCaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<TestCaseSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntTestCaseItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [runOpen, setRunOpen] = useState(false);
  const [running, setRunning] = useState<IntTestCaseItem | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntTestCaseQuery = {
          pageNum: page,
          pageSize: size,
          caseNo: cond.caseNo || undefined,
          caseType: cond.caseType || undefined,
          relatedNode: cond.relatedNode || undefined,
          priority: cond.priority || undefined,
          runStatus: cond.runStatus || undefined,
        };
        const res = await intService.testCasePage(params);
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

  const onSearch = (values: TestCaseSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ relatedNode: 'N9', priority: 'P1' });
    setModalOpen(true);
  };

  const openEdit = (record: IntTestCaseItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntTestCaseSaveParams = {
      caseNo: values.caseNo,
      caseType: values.caseType,
      relatedNode: values.relatedNode,
      title: values.title,
      precondition: values.precondition,
      steps: values.steps,
      expected: values.expected,
      priority: values.priority,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.testCaseUpdate(editing.caseNo, payload);
        message.success('更新成功');
      } else {
        await intService.testCaseCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntTestCaseItem) => {
    await intService.testCaseRemove(record.caseNo);
    message.success('删除成功');
    void loadData();
  };

  const openRun = (record: IntTestCaseItem) => {
    setRunning(record);
    runForm.resetFields();
    runForm.setFieldsValue({ runStatus: 'PASS' });
    setRunOpen(true);
  };

  const handleRun = async () => {
    if (!running) {
      return;
    }
    const values = await runForm.validateFields();
    const payload: IntTestCaseRunParams = {
      runStatus: values.runStatus,
      runResult: values.runResult,
      defectNo: values.defectNo,
    };
    setSubmitting(true);
    try {
      await intService.testCaseRun(running.caseNo, payload);
      message.success('执行结果已记录');
      setRunOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<IntTestCaseItem> = [
    { title: '用例编号', dataIndex: 'caseNo', width: 150, fixed: 'left', render: (v) => v || '-' },
    {
      title: '用例类型',
      dataIndex: 'caseType',
      width: 110,
      render: (v?: string) => (v ? INT_CASE_TYPE_LABEL[v] || v : '-'),
    },
    { title: '关联节点', dataIndex: 'relatedNode', width: 110, render: (v) => v || '-' },
    { title: '用例标题', dataIndex: 'title', width: 220, render: (v) => v || '-' },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={INT_PRIORITY_COLOR[v]}>{INT_PRIORITY_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '执行状态',
      dataIndex: 'runStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_RUN_STATUS_COLOR[v]}>{INT_RUN_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '执行人', dataIndex: 'runner', width: 100, render: (v) => v || '-' },
    {
      title: '执行时间',
      dataIndex: 'runAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '关联缺陷', dataIndex: 'defectNo', width: 130, render: (v) => v || '-' },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:test:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:test:run') && (
            <Button type="link" size="small" onClick={() => openRun(record)}>
              执行
            </Button>
          )}
          {hasPermission('int:test:save') && (
            <Popconfirm title="确认删除该测试用例？" onConfirm={() => handleDelete(record)}>
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
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="caseNo" label="用例编号">
            <Input placeholder="请输入用例编号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="caseType" label="用例类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_CASE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="relatedNode" label="关联节点">
            <Input placeholder="请输入关联节点" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_PRIORITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="runStatus" label="执行状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_RUN_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`测试用例列表（共 ${total} 条）`}
        extra={
          hasPermission('int:test:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增用例
            </Button>
          )
        }
      >
        <Table<IntTestCaseItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1750 }}
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
        title={editing ? '编辑测试用例' : '新增测试用例'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="caseNo" label="用例编号" extra="留空将自动生成">
            <Input placeholder="请输入用例编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="caseType" label="用例类型" rules={[{ required: true, message: '请选择用例类型' }]}>
            <Select placeholder="请选择" options={INT_CASE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="relatedNode" label="关联节点">
            <Input placeholder="如 N9" />
          </Form.Item>
          <Form.Item name="title" label="用例标题" rules={[{ required: true, message: '请输入用例标题' }]}>
            <Input placeholder="请输入用例标题" />
          </Form.Item>
          <Form.Item name="precondition" label="前置条件">
            <Input.TextArea rows={2} placeholder="请输入前置条件" />
          </Form.Item>
          <Form.Item name="steps" label="执行步骤">
            <Input.TextArea rows={3} placeholder="请输入执行步骤" />
          </Form.Item>
          <Form.Item name="expected" label="预期结果">
            <Input.TextArea rows={2} placeholder="请输入预期结果" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="请选择" options={INT_PRIORITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`执行测试用例${running?.caseNo ? `：${running.caseNo}` : ''}`}
        open={runOpen}
        onOk={handleRun}
        confirmLoading={submitting}
        onCancel={() => setRunOpen(false)}
        destroyOnClose
        width={520}
      >
        <Form form={runForm} layout="vertical" preserve={false}>
          <Form.Item name="runStatus" label="执行状态" rules={[{ required: true, message: '请选择执行状态' }]}>
            <Select placeholder="请选择" options={INT_RUN_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="runResult" label="执行结果">
            <Input.TextArea rows={3} placeholder="请输入执行结果" />
          </Form.Item>
          <Form.Item name="defectNo" label="关联缺陷编号">
            <Input placeholder="请输入缺陷编号" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 性能测试 ================= */

interface PerfTestFormValues {
  testNo?: string;
  scenario: string;
  targetRps?: number;
  targetP95Ms?: number;
  actualRps?: number;
  actualP95Ms?: number;
  concurrency?: number;
  durationSec?: number;
  reportPath?: string;
  remark?: string;
}

interface PerfTestSearchState {
  testNo?: string;
  scenario?: string;
  result?: string;
}

function PerfTestTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<PerfTestFormValues>();

  const [data, setData] = useState<IntPerfTestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<PerfTestSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntPerfTestItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntPerfTestQuery = {
          pageNum: page,
          pageSize: size,
          testNo: cond.testNo || undefined,
          scenario: cond.scenario || undefined,
          result: cond.result || undefined,
        };
        const res = await intService.perfPage(params);
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

  const onSearch = (values: PerfTestSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: IntPerfTestItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntPerfTestSaveParams = {
      testNo: values.testNo,
      scenario: values.scenario,
      targetRps: values.targetRps,
      targetP95Ms: values.targetP95Ms,
      actualRps: values.actualRps,
      actualP95Ms: values.actualP95Ms,
      concurrency: values.concurrency,
      durationSec: values.durationSec,
      reportPath: values.reportPath,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.perfUpdate(editing.testNo, payload);
        message.success('更新成功');
      } else {
        await intService.perfCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntPerfTestItem) => {
    await intService.perfRemove(record.testNo);
    message.success('删除成功');
    void loadData();
  };

  const handleEvaluate = async (record: IntPerfTestItem) => {
    const res = await intService.perfEvaluate(record.testNo);
    if (res.result) {
      const label = INT_PERF_RESULT_LABEL[res.result] || res.result;
      if (res.result === 'PASS') {
        message.success(`评估结果：${label}`);
      } else {
        message.warning(`评估结果：${label}`);
      }
    } else {
      message.success('评估完成');
    }
    void loadData();
  };

  const columns: ColumnsType<IntPerfTestItem> = [
    { title: '测试编号', dataIndex: 'testNo', width: 150, fixed: 'left', render: (v) => v || '-' },
    {
      title: '场景',
      dataIndex: 'scenario',
      width: 140,
      render: (v?: string) => (v ? INT_PERF_SCENARIO_LABEL[v] || v : '-'),
    },
    { title: '目标吞吐(RPS)', dataIndex: 'targetRps', width: 130, render: (v) => (v ?? '-') },
    { title: '目标 P95(ms)', dataIndex: 'targetP95Ms', width: 130, render: (v) => (v ?? '-') },
    { title: '实测吞吐(RPS)', dataIndex: 'actualRps', width: 130, render: (v) => (v ?? '-') },
    { title: '实测 P95(ms)', dataIndex: 'actualP95Ms', width: 130, render: (v) => (v ?? '-') },
    { title: '并发数', dataIndex: 'concurrency', width: 100, render: (v) => (v ?? '-') },
    { title: '持续(秒)', dataIndex: 'durationSec', width: 110, render: (v) => (v ?? '-') },
    {
      title: '结果',
      dataIndex: 'result',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={INT_PERF_RESULT_COLOR[v]}>{INT_PERF_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '测试时间',
      dataIndex: 'testAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '报告路径', dataIndex: 'reportPath', width: 200, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:perf:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:perf:save') && (
            <Button type="link" size="small" onClick={() => handleEvaluate(record)}>
              评估
            </Button>
          )}
          {hasPermission('int:perf:save') && (
            <Popconfirm title="确认删除该性能测试？" onConfirm={() => handleDelete(record)}>
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
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="testNo" label="测试编号">
            <Input placeholder="请输入测试编号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="scenario" label="场景">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={INT_PERF_SCENARIO_OPTIONS} />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_PERF_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`性能测试列表（共 ${total} 条）`}
        extra={
          hasPermission('int:perf:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增性能测试
            </Button>
          )
        }
      >
        <Table<IntPerfTestItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1850 }}
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
        title={editing ? '编辑性能测试' : '新增性能测试'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="testNo" label="测试编号" extra="留空将自动生成">
            <Input placeholder="请输入测试编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="scenario" label="场景" rules={[{ required: true, message: '请选择场景' }]}>
            <Select placeholder="请选择" options={INT_PERF_SCENARIO_OPTIONS} />
          </Form.Item>
          <Form.Item name="targetRps" label="目标吞吐(RPS)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入目标吞吐" />
          </Form.Item>
          <Form.Item name="targetP95Ms" label="目标 P95(ms)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入目标 P95" />
          </Form.Item>
          <Form.Item name="actualRps" label="实测吞吐(RPS)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入实测吞吐" />
          </Form.Item>
          <Form.Item name="actualP95Ms" label="实测 P95(ms)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入实测 P95" />
          </Form.Item>
          <Form.Item name="concurrency" label="并发数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入并发数" />
          </Form.Item>
          <Form.Item name="durationSec" label="持续(秒)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入持续时间" />
          </Form.Item>
          <Form.Item name="reportPath" label="报告路径">
            <Input placeholder="请输入报告路径" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function IntTestPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        测试与性能
      </Title>
      <Tabs
        items={[
          { key: 'case', label: '测试用例', children: <TestCaseTab /> },
          { key: 'perf', label: '性能测试', children: <PerfTestTab /> },
        ]}
      />
    </Space>
  );
}
