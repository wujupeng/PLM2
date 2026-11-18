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
import { financeTaxRateService } from '@/services/financeService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/finance/shared';
import {
  FIN_TAX_STATUS_LABEL,
  FIN_TAX_STATUS_OPTIONS,
  FIN_TAX_TYPE_LABEL,
  FIN_TAX_TYPE_OPTIONS,
  type FinanceTaxRateItem,
  type FinanceTaxRateSaveParams,
  type FinanceTaxRateStats,
} from '@/types/finance';

const { Title } = Typography;

const TAX_RATE_MANAGE = 'platform:finance:taxrate:manage';

export default function FinanceTaxRatePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FinanceTaxRateSaveParams>();
  const [data, setData] = useState<FinanceTaxRateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [taxType, setTaxType] = useState<string | undefined>(undefined);
  const [taxStatus, setTaxStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FinanceTaxRateStats>({});

  const loadStats = useCallback(async () => {
    const res = await financeTaxRateService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      ttype = taxType,
      tstatus = taxStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await financeTaxRateService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          taxType: ttype,
          taxStatus: tstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, taxType, taxStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ taxType: 'VAT', taxStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: FinanceTaxRateItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FinanceTaxRateSaveParams = { ...values };
      if (editId == null) {
        await financeTaxRateService.create(payload);
        message.success('税率已创建');
      } else {
        await financeTaxRateService.update(editId, payload);
        message.success('税率已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await financeTaxRateService.remove(id);
    message.success('税率已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FinanceTaxRateItem> = [
    { title: '税率编号', dataIndex: 'taxNo', width: 170, fixed: 'left', render: plain },
    { title: '税码', dataIndex: 'taxCode', width: 130, render: plain },
    { title: '税率名称', dataIndex: 'taxName', width: 180, render: plain },
    { title: '税率类型', dataIndex: 'taxType', width: 120, render: (v) => enumText(FIN_TAX_TYPE_LABEL, v) },
    { title: '税率', dataIndex: 'taxRate', width: 110, render: plain },
    { title: '国家', dataIndex: 'country', width: 120, render: plain },
    { title: '生效时间', dataIndex: 'effectiveDate', width: 160, render: formatDateTime },
    { title: '失效时间', dataIndex: 'expireDate', width: 160, render: formatDateTime },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'taxStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(FIN_TAX_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(TAX_RATE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该税率？"
              onConfirm={() => void act(financeTaxRateService.enable, record.id, '税率已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该税率？"
              onConfirm={() => void act(financeTaxRateService.disable, record.id, '税率已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认将该税率标记为过期？"
              onConfirm={() => void act(financeTaxRateService.expire, record.id, '税率已过期')}
            >
              <Button type="link" size="small">
                过期
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该税率？" onConfirm={() => void remove(record.id)}>
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
        税率管理
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="税率总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已过期" value={Number(stats.expired ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="税率类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={taxType}
              onChange={(v) => setTaxType(v)}
              options={[...FIN_TAX_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={taxStatus}
              onChange={(v) => setTaxStatus(v)}
              options={[...FIN_TAX_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="税率编号 / 税码 / 名称"
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
                  void loadData(1, pageSize, keyword, taxType, taxStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTaxType(undefined);
                  setTaxStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(TAX_RATE_MANAGE) && <Button onClick={openCreate}>新建税率</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`税率管理（共 ${total} 条）`}>
        <Table<FinanceTaxRateItem>
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
        title={editId == null ? '新建税率' : '编辑税率'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taxNo" label="税率编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="taxCode" label="税码">
            <Input placeholder="请输入税码" />
          </Form.Item>
          <Form.Item name="taxName" label="税率名称" rules={[{ required: true, message: '请输入税率名称' }]}>
            <Input placeholder="请输入税率名称" />
          </Form.Item>
          <Form.Item name="taxType" label="税率类型">
            <Select placeholder="请选择" options={[...FIN_TAX_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="taxRate" label="税率">
            <InputNumber style={{ width: '100%' }} placeholder="请输入税率" />
          </Form.Item>
          <Form.Item name="country" label="国家">
            <Input placeholder="请输入国家" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="expireDate" label="失效时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="taxStatus" label="状态">
            <Select placeholder="请选择" options={[...FIN_TAX_STATUS_OPTIONS]} />
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
