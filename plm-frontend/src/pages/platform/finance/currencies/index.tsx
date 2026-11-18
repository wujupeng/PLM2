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
import { financeCurrencyService } from '@/services/financeService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, statusTag } from '@/pages/platform/finance/shared';
import {
  FIN_CURRENCY_STATUS_LABEL,
  FIN_CURRENCY_STATUS_OPTIONS,
  type FinanceCurrencyItem,
  type FinanceCurrencySaveParams,
  type FinanceCurrencyStats,
} from '@/types/finance';

const { Title } = Typography;

const CURRENCY_MANAGE = 'platform:finance:currency:manage';

export default function FinanceCurrencyPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FinanceCurrencySaveParams>();
  const [data, setData] = useState<FinanceCurrencyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [currencyStatus, setCurrencyStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FinanceCurrencyStats>({});

  const loadStats = useCallback(async () => {
    const res = await financeCurrencyService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, cstatus = currencyStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await financeCurrencyService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          currencyStatus: cstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, currencyStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ currencyStatus: 'ACTIVE', baseFlag: 0 });
    setOpen(true);
  };

  const openEdit = (record: FinanceCurrencyItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FinanceCurrencySaveParams = { ...values };
      if (editId == null) {
        await financeCurrencyService.create(payload);
        message.success('币种已创建');
      } else {
        await financeCurrencyService.update(editId, payload);
        message.success('币种已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await financeCurrencyService.remove(id);
    message.success('币种已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FinanceCurrencyItem> = [
    { title: '币种编码', dataIndex: 'currencyCode', width: 140, fixed: 'left', render: plain },
    { title: '币种名称', dataIndex: 'currencyName', width: 180, render: plain },
    { title: '币种符号', dataIndex: 'currencySymbol', width: 110, render: plain },
    { title: '小数精度', dataIndex: 'currencyPrecision', width: 110, render: plain },
    { title: '本位币', dataIndex: 'baseFlag', width: 100, render: (v) => boolTag(v) },
    { title: '国家', dataIndex: 'country', width: 120, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'currencyStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(FIN_CURRENCY_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(CURRENCY_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该币种？"
              onConfirm={() => void act(financeCurrencyService.enable, record.id, '币种已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该币种？"
              onConfirm={() => void act(financeCurrencyService.disable, record.id, '币种已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该币种？" onConfirm={() => void remove(record.id)}>
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
        币种管理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="币种总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="本位币数" value={Number(stats.baseCount ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={currencyStatus}
              onChange={(v) => setCurrencyStatus(v)}
              options={[...FIN_CURRENCY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="币种编码 / 名称"
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
                  void loadData(1, pageSize, keyword, currencyStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCurrencyStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(CURRENCY_MANAGE) && <Button onClick={openCreate}>新建币种</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`币种管理（共 ${total} 条）`}>
        <Table<FinanceCurrencyItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建币种' : '编辑币种'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="currencyCode" label="币种编码" rules={[{ required: true, message: '请输入币种编码' }]}>
            <Input placeholder="如 CNY" />
          </Form.Item>
          <Form.Item name="currencyName" label="币种名称" rules={[{ required: true, message: '请输入币种名称' }]}>
            <Input placeholder="请输入币种名称" />
          </Form.Item>
          <Form.Item name="currencySymbol" label="币种符号">
            <Input placeholder="如 ¥" />
          </Form.Item>
          <Form.Item name="currencyPrecision" label="小数精度">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入小数精度" />
          </Form.Item>
          <Form.Item name="baseFlag" label="本位币">
            <InputNumber min={0} max={1} style={{ width: '100%' }} placeholder="1=是，0=否" />
          </Form.Item>
          <Form.Item name="country" label="国家">
            <Input placeholder="请输入国家" />
          </Form.Item>
          <Form.Item name="currencyStatus" label="状态">
            <Select placeholder="请选择" options={[...FIN_CURRENCY_STATUS_OPTIONS]} />
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
