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
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { bizRuleLogService } from '@/services/bizRuleService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/biz-rule/shared';
import {
  BIZ_RULE_MODULE_LABEL,
  BIZ_RULE_MODULE_OPTIONS,
  RULE_MATCH_RESULT_LABEL,
  RULE_MATCH_RESULT_OPTIONS,
  type BizRuleLogItem,
  type BizRuleLogSaveParams,
  type BizRuleLogStats,
} from '@/types/bizRule';

const { Title } = Typography;

const LOG_MANAGE = 'platform:bizrule:log:manage';

export default function BizRuleLogPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BizRuleLogSaveParams>();
  const [data, setData] = useState<BizRuleLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [bizModule, setBizModule] = useState<string | undefined>(undefined);
  const [bizKey, setBizKey] = useState('');
  const [matchResult, setMatchResult] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<BizRuleLogStats>({});

  const loadStats = useCallback(async () => {
    const res = await bizRuleLogService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rCode = ruleCode,
      bModule = bizModule,
      bKey = bizKey,
      mResult = matchResult,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await bizRuleLogService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          ruleCode: rCode || undefined,
          bizModule: bModule,
          bizKey: bKey || undefined,
          matchResult: mResult,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, ruleCode, bizModule, bizKey, matchResult, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ matchResult: 'MATCH' });
    setOpen(true);
  };

  const openEdit = (record: BizRuleLogItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: BizRuleLogSaveParams = { ...values };
      if (editId == null) {
        await bizRuleLogService.create(payload);
        message.success('规则执行日志已创建');
      } else {
        await bizRuleLogService.update(editId, payload);
        message.success('规则执行日志已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await bizRuleLogService.remove(id);
    message.success('规则执行日志已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<BizRuleLogItem> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 160, fixed: 'left', render: plain },
    { title: '业务模块', dataIndex: 'bizModule', width: 120, render: (v) => statusTag(BIZ_RULE_MODULE_LABEL, v) },
    { title: '业务键', dataIndex: 'bizKey', width: 160, render: plain },
    { title: '输入数据', dataIndex: 'inputData', width: 200, ellipsis: true, render: plain },
    { title: '输出数据', dataIndex: 'outputData', width: 200, ellipsis: true, render: plain },
    {
      title: '匹配结果',
      dataIndex: 'matchResult',
      width: 110,
      render: (v) => statusTag(RULE_MATCH_RESULT_LABEL, v),
    },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 110, render: plain },
    { title: '执行时间', dataIndex: 'execTime', width: 160, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(LOG_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该规则执行日志？" onConfirm={() => void remove(record.id)}>
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
        规则执行日志
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="日志总数" value={Number(stats.total ?? 0)} />
          <Statistic title="命中" value={Number(stats.matchCount ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="未命中" value={Number(stats.notMatchCount ?? 0)} />
          <Statistic title="异常" value={Number(stats.errorCount ?? 0)} valueStyle={{ color: '#cf1322' }} />
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
          <Form.Item label="业务键">
            <Input
              placeholder="请输入业务键"
              allowClear
              style={{ width: 160 }}
              value={bizKey}
              onChange={(e) => setBizKey(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="匹配结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={matchResult}
              onChange={(v) => setMatchResult(v)}
              options={[...RULE_MATCH_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="执行日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编码 / 业务键"
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
                  void loadData(1, pageSize, keyword, ruleCode, bizModule, bizKey, matchResult, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRuleCode('');
                  setBizModule(undefined);
                  setBizKey('');
                  setMatchResult(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(LOG_MANAGE) && <Button onClick={openCreate}>新建日志</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`规则执行日志（共 ${total} 条）`}>
        <Table<BizRuleLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建日志' : '编辑日志'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleCode" label="规则编码">
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Select placeholder="请选择" options={[...BIZ_RULE_MODULE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizKey" label="业务键">
            <Input placeholder="请输入业务键" />
          </Form.Item>
          <Form.Item name="inputData" label="输入数据">
            <Input.TextArea rows={2} placeholder="请输入输入数据（JSON 字符串）" />
          </Form.Item>
          <Form.Item name="outputData" label="输出数据">
            <Input.TextArea rows={2} placeholder="请输入输出数据（JSON 字符串）" />
          </Form.Item>
          <Form.Item name="matchResult" label="匹配结果">
            <Select placeholder="请选择" options={[...RULE_MATCH_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="costMs" label="耗时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入耗时（毫秒）" />
          </Form.Item>
          <Form.Item name="execTime" label="执行时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="orgId" label="组织ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入组织ID" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
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
