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
import { financeExchangeRateService } from '@/services/financeService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/finance/shared';
import {
  FIN_RATE_STATUS_LABEL,
  FIN_RATE_STATUS_OPTIONS,
  FIN_RATE_TYPE_LABEL,
  FIN_RATE_TYPE_OPTIONS,
  type FinanceExchangeRateItem,
  type FinanceExchangeRateSaveParams,
  type FinanceExchangeRateStats,
} from '@/types/finance';

const { Title } = Typography;

const EXCHANGE_RATE_MANAGE = 'platform:finance:exchangerate:manage';

export default function FinanceExchangeRatePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FinanceExchangeRateSaveParams>();
  const [data, setData] = useState<FinanceExchangeRateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [rateType, setRateType] = useState<string | undefined>(undefined);
  const [rateStatus, setRateStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FinanceExchangeRateStats>({});

  const loadStats = useCallback(async () => {
    const res = await financeExchangeRateService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      fcur = fromCurrency,
      tcur = toCurrency,
      rtype = rateType,
      rstatus = rateStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await financeExchangeRateService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          fromCurrency: fcur || undefined,
          toCurrency: tcur || undefined,
          rateType: rtype,
          rateStatus: rstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, fromCurrency, toCurrency, rateType, rateStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ rateType: 'SPOT', rateStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: FinanceExchangeRateItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FinanceExchangeRateSaveParams = { ...values };
      if (editId == null) {
        await financeExchangeRateService.create(payload);
        message.success('汇率已创建');
      } else {
        await financeExchangeRateService.update(editId, payload);
        message.success('汇率已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await financeExchangeRateService.remove(id);
    message.success('汇率已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FinanceExchangeRateItem> = [
    { title: '汇率编号', dataIndex: 'rateNo', width: 170, fixed: 'left', render: plain },
    { title: '源币种', dataIndex: 'fromCurrency', width: 110, render: plain },
    { title: '目标币种', dataIndex: 'toCurrency', width: 110, render: plain },
    { title: '汇率类型', dataIndex: 'rateType', width: 120, render: (v) => enumText(FIN_RATE_TYPE_LABEL, v) },
    { title: '汇率值', dataIndex: 'rateValue', width: 140, render: plain },
    { title: '生效时间', dataIndex: 'effectiveDate', width: 160, render: formatDateTime },
    { title: '失效时间', dataIndex: 'expireDate', width: 160, render: formatDateTime },
    { title: '汇率来源', dataIndex: 'rateSource', width: 150, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'rateStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(FIN_RATE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(EXCHANGE_RATE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该汇率？"
              onConfirm={() => void act(financeExchangeRateService.enable, record.id, '汇率已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该汇率？"
              onConfirm={() => void act(financeExchangeRateService.disable, record.id, '汇率已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认将该汇率标记为过期？"
              onConfirm={() => void act(financeExchangeRateService.expire, record.id, '汇率已过期')}
            >
              <Button type="link" size="small">
                过期
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该汇率？" onConfirm={() => void remove(record.id)}>
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
        汇率管理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="汇率总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已过期" value={Number(stats.expired ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="源币种">
            <Input
              placeholder="如 CNY"
              allowClear
              style={{ width: 110 }}
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="目标币种">
            <Input
              placeholder="如 USD"
              allowClear
              style={{ width: 110 }}
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="汇率类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={rateType}
              onChange={(v) => setRateType(v)}
              options={[...FIN_RATE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={rateStatus}
              onChange={(v) => setRateStatus(v)}
              options={[...FIN_RATE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="汇率编号 / 来源"
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
                  void loadData(1, pageSize, keyword, fromCurrency, toCurrency, rateType, rateStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFromCurrency('');
                  setToCurrency('');
                  setRateType(undefined);
                  setRateStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(EXCHANGE_RATE_MANAGE) && <Button onClick={openCreate}>新建汇率</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`汇率管理（共 ${total} 条）`}>
        <Table<FinanceExchangeRateItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2300 }}
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
        title={editId == null ? '新建汇率' : '编辑汇率'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="rateNo" label="汇率编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="fromCurrency" label="源币种" rules={[{ required: true, message: '请输入源币种' }]}>
            <Input placeholder="如 CNY" />
          </Form.Item>
          <Form.Item name="toCurrency" label="目标币种" rules={[{ required: true, message: '请输入目标币种' }]}>
            <Input placeholder="如 USD" />
          </Form.Item>
          <Form.Item name="rateType" label="汇率类型">
            <Select placeholder="请选择" options={[...FIN_RATE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="rateValue" label="汇率值">
            <InputNumber style={{ width: '100%' }} placeholder="请输入汇率值" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="expireDate" label="失效时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="rateSource" label="汇率来源">
            <Input placeholder="请输入汇率来源" />
          </Form.Item>
          <Form.Item name="rateStatus" label="状态">
            <Select placeholder="请选择" options={[...FIN_RATE_STATUS_OPTIONS]} />
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
