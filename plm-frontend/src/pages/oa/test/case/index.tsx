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
import { oaTestCaseService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enableTag, enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_ENABLE_STATUS_OPTIONS,
  OA_TEST_CASE_TYPE_LABEL,
  OA_TEST_CASE_TYPE_OPTIONS,
  OA_TEST_EXEC_STATUS_LABEL,
  OA_TEST_EXEC_STATUS_OPTIONS,
  OA_TEST_PRIORITY_LABEL,
  OA_TEST_PRIORITY_OPTIONS,
  type OaTestCaseItem,
  type OaTestCaseSaveParams,
  type OaTestQuery,
} from '@/types/oa';

const { Title } = Typography;

const CASE_MANAGE = 'oa:test:case:manage';

export default function OaTestCasePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaTestCaseSaveParams>();
  const [data, setData] = useState<OaTestCaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [caseType, setCaseType] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [execStatus, setExecStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaTestCaseItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = caseType,
      pri = priority,
      es = execStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          caseType: type,
          priority: pri,
          execStatus: es,
        };
        const res = await oaTestCaseService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, caseType, priority, execStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaTestCaseService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setOpen(true);
  };

  const openEdit = (record: OaTestCaseItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      caseNo: record.caseNo,
      caseName: record.caseName,
      module: record.module,
      requirementRef: record.requirementRef,
      pageRef: record.pageRef,
      apiRef: record.apiRef,
      tableRef: record.tableRef,
      caseType: record.caseType,
      priority: record.priority,
      precondition: record.precondition,
      steps: record.steps,
      expected: record.expected,
      execStatus: record.execStatus,
      testResult: record.testResult,
      tester: record.tester,
      lastRunTime: record.lastRunTime,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaTestCaseItem) => {
    setDetailOpen(true);
    const res = await oaTestCaseService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaTestCaseSaveParams = { ...values };
      if (editingId !== null) {
        await oaTestCaseService.update(editingId, payload);
        message.success('用例已更新');
      } else {
        await oaTestCaseService.create(payload);
        message.success('用例已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const execute = async (id: number) => {
    await oaTestCaseService.execute(id, 'PASS');
    message.success('用例已执行为通过');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaTestCaseService.remove(id);
    message.success('用例已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaTestCaseItem> = [
    { title: '用例编码', dataIndex: 'caseNo', width: 160, fixed: 'left', render: plain },
    { title: '用例名称', dataIndex: 'caseName', width: 200, render: plain },
    { title: '功能模块', dataIndex: 'module', width: 130, render: plain },
    {
      title: '用例类型',
      dataIndex: 'caseType',
      width: 110,
      render: (v) => enumText(OA_TEST_CASE_TYPE_LABEL, v),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (v) => enumTag(OA_TEST_PRIORITY_LABEL, v),
    },
    {
      title: '执行状态',
      dataIndex: 'execStatus',
      width: 100,
      render: (v) => enumTag(OA_TEST_EXEC_STATUS_LABEL, v),
    },
    { title: '关联需求', dataIndex: 'requirementRef', width: 150, render: plain },
    { title: '关联页面', dataIndex: 'pageRef', width: 150, render: plain },
    { title: '关联接口', dataIndex: 'apiRef', width: 150, render: plain },
    { title: '关联数据表', dataIndex: 'tableRef', width: 150, render: plain },
    { title: '执行人', dataIndex: 'tester', width: 110, render: plain },
    { title: '最近执行时间', dataIndex: 'lastRunTime', width: 170, render: formatDateTime },
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true, render: plain },
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
          {hasPermission(CASE_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(CASE_MANAGE) && (
            <Button type="link" size="small" onClick={() => void execute(record.id)}>
              执行
            </Button>
          )}
          {hasPermission(CASE_MANAGE) && (
            <Popconfirm title="确认删除该用例？" onConfirm={() => void remove(record.id)}>
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
        功能与回归测试用例
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="用例总数" value={Number(stats.total ?? 0)} />
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
            title="阻塞"
            value={Number(stats.blocked ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic title="未执行" value={Number(stats.notRun ?? 0)} />
          <Statistic title="P0 用例" value={Number(stats.p0Case ?? 0)} />
          <Statistic title="P1 用例" value={Number(stats.p1Case ?? 0)} />
          <Statistic title="回归用例" value={Number(stats.regressionCase ?? 0)} />
          <Statistic title="阻断阈值" value={Number(stats.blockerThreshold ?? 0)} />
          <Statistic
            title="回归开关"
            value={Number(stats.regressionEnabled ?? 0) === 1 ? '已开启' : '已关闭'}
          />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="用例类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={caseType}
              onChange={(v) => setCaseType(v)}
              options={[...OA_TEST_CASE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="优先级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={priority}
              onChange={(v) => setPriority(v)}
              options={[...OA_TEST_PRIORITY_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="执行状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={execStatus}
              onChange={(v) => setExecStatus(v)}
              options={[...OA_TEST_EXEC_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="用例编码 / 名称"
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
                  void loadData(1, pageSize, keyword, caseType, priority, execStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCaseType(undefined);
                  setPriority(undefined);
                  setExecStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(CASE_MANAGE) && <Button onClick={openCreate}>新增用例</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`测试用例（共 ${total} 条）`}>
        <Table<OaTestCaseItem>
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
        title="测试用例详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="用例编码">{plain(detail.caseNo)}</Descriptions.Item>
            <Descriptions.Item label="用例名称">{plain(detail.caseName)}</Descriptions.Item>
            <Descriptions.Item label="功能模块">{plain(detail.module)}</Descriptions.Item>
            <Descriptions.Item label="用例类型">
              {enumText(OA_TEST_CASE_TYPE_LABEL, detail.caseType)}
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              {enumTag(OA_TEST_PRIORITY_LABEL, detail.priority)}
            </Descriptions.Item>
            <Descriptions.Item label="执行状态">
              {enumTag(OA_TEST_EXEC_STATUS_LABEL, detail.execStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="关联需求">{plain(detail.requirementRef)}</Descriptions.Item>
            <Descriptions.Item label="关联页面">{plain(detail.pageRef)}</Descriptions.Item>
            <Descriptions.Item label="关联接口">{plain(detail.apiRef)}</Descriptions.Item>
            <Descriptions.Item label="关联数据表">{plain(detail.tableRef)}</Descriptions.Item>
            <Descriptions.Item label="前置条件" span={2}>
              {plain(detail.precondition)}
            </Descriptions.Item>
            <Descriptions.Item label="执行步骤" span={2}>
              {plain(detail.steps)}
            </Descriptions.Item>
            <Descriptions.Item label="预期结果" span={2}>
              {plain(detail.expected)}
            </Descriptions.Item>
            <Descriptions.Item label="实际结果" span={2}>
              {plain(detail.testResult)}
            </Descriptions.Item>
            <Descriptions.Item label="执行人">{plain(detail.tester)}</Descriptions.Item>
            <Descriptions.Item label="最近执行时间">
              {formatDateTime(detail.lastRunTime)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">{enableTag(detail.status)}</Descriptions.Item>
            <Descriptions.Item label="归属组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑测试用例' : '新增测试用例'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="caseNo" label="用例编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="caseName"
            label="用例名称"
            rules={[{ required: true, message: '请输入用例名称' }]}
          >
            <Input placeholder="请输入用例名称" />
          </Form.Item>
          <Form.Item name="module" label="功能模块">
            <Input placeholder="如 用户权限" />
          </Form.Item>
          <Form.Item name="requirementRef" label="关联需求">
            <Input placeholder="需求编号" />
          </Form.Item>
          <Form.Item name="pageRef" label="关联页面">
            <Input placeholder="页面路径 / 名称" />
          </Form.Item>
          <Form.Item name="apiRef" label="关联接口">
            <Input placeholder="接口路径" />
          </Form.Item>
          <Form.Item name="tableRef" label="关联数据表">
            <Input placeholder="数据表名" />
          </Form.Item>
          <Form.Item name="caseType" label="用例类型">
            <Select placeholder="请选择" options={[...OA_TEST_CASE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="请选择" options={[...OA_TEST_PRIORITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="precondition" label="前置条件">
            <Input.TextArea rows={2} placeholder="执行前置条件" />
          </Form.Item>
          <Form.Item name="steps" label="执行步骤">
            <Input.TextArea rows={3} placeholder="用例执行步骤" />
          </Form.Item>
          <Form.Item name="expected" label="预期结果">
            <Input.TextArea rows={2} placeholder="预期结果" />
          </Form.Item>
          <Form.Item name="execStatus" label="执行状态">
            <Select placeholder="请选择" options={[...OA_TEST_EXEC_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="testResult" label="实际结果">
            <Input.TextArea rows={2} placeholder="实际执行结果" />
          </Form.Item>
          <Form.Item name="tester" label="执行人">
            <Input placeholder="执行人" />
          </Form.Item>
          <Form.Item name="lastRunTime" label="最近执行时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
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
