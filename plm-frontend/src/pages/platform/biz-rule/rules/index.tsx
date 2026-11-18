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
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { ExperimentOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { bizRuleService } from '@/services/bizRuleService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/biz-rule/shared';
import {
  BIZ_RULE_MODULE_LABEL,
  BIZ_RULE_MODULE_OPTIONS,
  BIZ_RULE_TYPE_LABEL,
  BIZ_RULE_TYPE_OPTIONS,
  RULE_STATUS_LABEL,
  RULE_STATUS_OPTIONS,
  RULE_MATCH_RESULT_LABEL,
  type BizRuleEvaluateResult,
  type BizRuleItem,
  type BizRuleSaveParams,
  type BizRuleStats,
} from '@/types/bizRule';

const { Title } = Typography;

const RULE_MANAGE = 'platform:bizrule:rule:manage';

/** 规则试算表单字段。 */
interface EvaluateFormValues {
  ruleType: string;
  bizModule?: string;
  bizKey?: string;
  inputData?: string;
}

export default function BizRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BizRuleSaveParams>();
  const [evalForm] = Form.useForm<EvaluateFormValues>();
  const [data, setData] = useState<BizRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<string | undefined>(undefined);
  const [bizModule, setBizModule] = useState<string | undefined>(undefined);
  const [ruleStatus, setRuleStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<BizRuleStats>({});
  const [evalOpen, setEvalOpen] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<BizRuleEvaluateResult | null>(null);

  const loadStats = useCallback(async () => {
    const res = await bizRuleService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rCode = ruleCode,
      rName = ruleName,
      rType = ruleType,
      bModule = bizModule,
      rStatus = ruleStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await bizRuleService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          ruleCode: rCode || undefined,
          ruleName: rName || undefined,
          ruleType: rType,
          bizModule: bModule,
          ruleStatus: rStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, ruleCode, ruleName, ruleType, bizModule, ruleStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ ruleType: 'LEAD_TIME', ruleStatus: 'ACTIVE', priority: 100 });
    setOpen(true);
  };

  const openEdit = (record: BizRuleItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: BizRuleSaveParams = { ...values };
      if (editId == null) {
        await bizRuleService.create(payload);
        message.success('业务规则已创建');
      } else {
        await bizRuleService.update(editId, payload);
        message.success('业务规则已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await bizRuleService.remove(id);
    message.success('业务规则已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const openEvaluate = () => {
    evalForm.resetFields();
    evalForm.setFieldsValue({ ruleType: 'LEAD_TIME', inputData: '{}' });
    setEvalResult(null);
    setEvalOpen(true);
  };

  const submitEvaluate = async () => {
    const values = await evalForm.validateFields();
    let inputData: Record<string, unknown> = {};
    if (values.inputData) {
      try {
        const parsed: unknown = JSON.parse(values.inputData);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          inputData = parsed as Record<string, unknown>;
        } else {
          message.error('输入数据需为 JSON 对象');
          return;
        }
      } catch {
        message.error('输入数据不是合法的 JSON');
        return;
      }
    }
    setEvalLoading(true);
    try {
      const res = await bizRuleService.evaluate({
        ruleType: values.ruleType,
        bizModule: values.bizModule || undefined,
        bizKey: values.bizKey || undefined,
        inputData,
      });
      setEvalResult(res || null);
    } finally {
      setEvalLoading(false);
    }
  };

  const columns: ColumnsType<BizRuleItem> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 160, fixed: 'left', render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 180, render: plain },
    { title: '规则类型', dataIndex: 'ruleType', width: 120, render: (v) => statusTag(BIZ_RULE_TYPE_LABEL, v) },
    { title: '业务模块', dataIndex: 'bizModule', width: 120, render: (v) => statusTag(BIZ_RULE_MODULE_LABEL, v) },
    { title: '规则表达式', dataIndex: 'ruleExpr', width: 200, ellipsis: true, render: plain },
    { title: '优先级', dataIndex: 'priority', width: 100, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'ruleStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(RULE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(RULE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该业务规则？"
              onConfirm={() => void act(bizRuleService.enable, record.id, '业务规则已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该业务规则？"
              onConfirm={() => void act(bizRuleService.disable, record.id, '业务规则已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该业务规则？" onConfirm={() => void remove(record.id)}>
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
        业务规则
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="规则总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="规则编码">
            <Input
              placeholder="请输入规则编码"
              allowClear
              style={{ width: 160 }}
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="规则名称">
            <Input
              placeholder="请输入规则名称"
              allowClear
              style={{ width: 160 }}
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="规则类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={ruleType}
              onChange={(v) => setRuleType(v)}
              options={[...BIZ_RULE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务模块">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={bizModule}
              onChange={(v) => setBizModule(v)}
              options={[...BIZ_RULE_MODULE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={ruleStatus}
              onChange={(v) => setRuleStatus(v)}
              options={[...RULE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编码 / 名称"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(1, pageSize, keyword, ruleCode, ruleName, ruleType, bizModule, ruleStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRuleCode('');
                  setRuleName('');
                  setRuleType(undefined);
                  setBizModule(undefined);
                  setRuleStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              <Button
                icon={<ExperimentOutlined />}
                onClick={openEvaluate}
                disabled={!hasPermission(RULE_MANAGE)}
              >
                规则试算
              </Button>
              {hasPermission(RULE_MANAGE) && <Button onClick={openCreate}>新建业务规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`业务规则（共 ${total} 条）`}>
        <Table<BizRuleItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建业务规则' : '编辑业务规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleCode" label="规则编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="ruleType" label="规则类型" rules={[{ required: true, message: '请选择规则类型' }]}>
            <Select placeholder="请选择" options={[...BIZ_RULE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Select placeholder="请选择" options={[...BIZ_RULE_MODULE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ruleExpr" label="规则表达式">
            <Input.TextArea rows={2} placeholder="请输入规则表达式" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入优先级" />
          </Form.Item>
          <Form.Item name="ruleStatus" label="状态">
            <Select placeholder="请选择" options={[...RULE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="规则试算"
        open={evalOpen}
        onOk={() => void submitEvaluate()}
        confirmLoading={evalLoading}
        onCancel={() => setEvalOpen(false)}
        okText="试算"
        destroyOnClose
        width={640}
      >
        <Form form={evalForm} layout="vertical" preserve={false}>
          <Form.Item name="ruleType" label="规则类型" rules={[{ required: true, message: '请选择规则类型' }]}>
            <Select placeholder="请选择" options={[...BIZ_RULE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Select placeholder="请选择" options={[...BIZ_RULE_MODULE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizKey" label="业务键">
            <Input placeholder="请输入业务键（如物料编码 / 客户编号）" />
          </Form.Item>
          <Form.Item name="inputData" label="输入数据（JSON）">
            <Input.TextArea rows={4} placeholder='请输入 JSON 对象，例如 {"qty": 100}' />
          </Form.Item>
        </Form>
        {evalResult && (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              匹配结果：
              <Tag color={evalResult.matched ? 'green' : 'default'}>
                {evalResult.matched ? '命中' : '未命中'}
              </Tag>
              {evalResult.matchResult ? statusTag(RULE_MATCH_RESULT_LABEL, evalResult.matchResult) : null}
            </div>
            <div>命中规则：{plain(evalResult.ruleCode)}</div>
            <div>规则名称：{plain(evalResult.ruleName)}</div>
            <div>
              命中参数：
              <Input.TextArea
                rows={4}
                readOnly
                value={evalResult.params ? JSON.stringify(evalResult.params, null, 2) : '-'}
              />
            </div>
          </Space>
        )}
      </Modal>
    </Space>
  );
}
