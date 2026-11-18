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
import { financePriceRuleService } from '@/services/financeService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/finance/shared';
import {
  FIN_PRICE_MODE_LABEL,
  FIN_PRICE_MODE_OPTIONS,
  FIN_ROUNDING_MODE_LABEL,
  FIN_ROUNDING_MODE_OPTIONS,
  FIN_RULE_STATUS_LABEL,
  FIN_RULE_STATUS_OPTIONS,
  type FinancePriceRuleItem,
  type FinancePriceRuleSaveParams,
  type FinancePriceRuleStats,
} from '@/types/finance';

const { Title } = Typography;

const PRICE_RULE_MANAGE = 'platform:finance:pricerule:manage';

export default function FinancePriceRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FinancePriceRuleSaveParams>();
  const [data, setData] = useState<FinancePriceRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizModule, setBizModule] = useState('');
  const [priceMode, setPriceMode] = useState<string | undefined>(undefined);
  const [ruleStatus, setRuleStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FinancePriceRuleStats>({});

  const loadStats = useCallback(async () => {
    const res = await financePriceRuleService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      bmodule = bizModule,
      pmode = priceMode,
      rstatus = ruleStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await financePriceRuleService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizModule: bmodule || undefined,
          priceMode: pmode,
          ruleStatus: rstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizModule, priceMode, ruleStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ priceMode: 'TAX_INCLUSIVE', roundingMode: 'HALF_UP', ruleStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: FinancePriceRuleItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FinancePriceRuleSaveParams = { ...values };
      if (editId == null) {
        await financePriceRuleService.create(payload);
        message.success('价格规则已创建');
      } else {
        await financePriceRuleService.update(editId, payload);
        message.success('价格规则已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await financePriceRuleService.remove(id);
    message.success('价格规则已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FinancePriceRuleItem> = [
    { title: '规则编号', dataIndex: 'ruleNo', width: 170, fixed: 'left', render: plain },
    { title: '规则编码', dataIndex: 'ruleCode', width: 140, render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 180, render: plain },
    { title: '业务模块', dataIndex: 'bizModule', width: 140, render: plain },
    { title: '价格口径', dataIndex: 'priceMode', width: 120, render: (v) => enumText(FIN_PRICE_MODE_LABEL, v) },
    { title: '税码', dataIndex: 'taxCode', width: 130, render: plain },
    {
      title: '舍入方式',
      dataIndex: 'roundingMode',
      width: 130,
      render: (v) => enumText(FIN_ROUNDING_MODE_LABEL, v),
    },
    { title: '精度位数', dataIndex: 'precisionDigits', width: 110, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'ruleStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(FIN_RULE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(PRICE_RULE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该价格规则？"
              onConfirm={() => void act(financePriceRuleService.enable, record.id, '价格规则已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该价格规则？"
              onConfirm={() => void act(financePriceRuleService.disable, record.id, '价格规则已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该价格规则？" onConfirm={() => void remove(record.id)}>
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
        价格规则
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
          <Form.Item label="业务模块">
            <Input
              placeholder="如 SALES / PURCHASE"
              allowClear
              style={{ width: 180 }}
              value={bizModule}
              onChange={(e) => setBizModule(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="价格口径">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={priceMode}
              onChange={(v) => setPriceMode(v)}
              options={[...FIN_PRICE_MODE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={ruleStatus}
              onChange={(v) => setRuleStatus(v)}
              options={[...FIN_RULE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编号 / 编码 / 名称"
              allowClear
              style={{ width: 220 }}
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
                  void loadData(1, pageSize, keyword, bizModule, priceMode, ruleStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBizModule('');
                  setPriceMode(undefined);
                  setRuleStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(PRICE_RULE_MANAGE) && <Button onClick={openCreate}>新建价格规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`价格规则（共 ${total} 条）`}>
        <Table<FinancePriceRuleItem>
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
        title={editId == null ? '新建价格规则' : '编辑价格规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleNo" label="规则编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="ruleCode" label="规则编码">
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Input placeholder="如 SALES / PURCHASE" />
          </Form.Item>
          <Form.Item name="priceMode" label="价格口径">
            <Select placeholder="请选择" options={[...FIN_PRICE_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="taxCode" label="税码">
            <Input placeholder="请输入税码" />
          </Form.Item>
          <Form.Item name="roundingMode" label="舍入方式">
            <Select placeholder="请选择" options={[...FIN_ROUNDING_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="precisionDigits" label="精度位数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入精度位数" />
          </Form.Item>
          <Form.Item name="ruleStatus" label="状态">
            <Select placeholder="请选择" options={[...FIN_RULE_STATUS_OPTIONS]} />
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
    </Space>
  );
}
