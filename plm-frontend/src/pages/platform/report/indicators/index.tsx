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
import { reportIndicatorService } from '@/services/reportService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/report/shared';
import {
  REPORT_BIZ_DOMAIN_LABEL,
  REPORT_BIZ_DOMAIN_OPTIONS,
  REPORT_INDICATOR_STATUS_LABEL,
  REPORT_INDICATOR_STATUS_OPTIONS,
  REPORT_REFRESH_CYCLE_LABEL,
  REPORT_REFRESH_CYCLE_OPTIONS,
  type ReportIndicatorItem,
  type ReportIndicatorSaveParams,
  type ReportStats,
} from '@/types/report';

const { Title } = Typography;

const INDICATOR_MANAGE = 'platform:report:indicator:manage';

interface IndicatorFormValues {
  indicatorCode?: string;
  indicatorName?: string;
  bizDomain?: string;
  category?: string;
  caliber?: string;
  formula?: string;
  unit?: string;
  decimalScale?: number;
  dataSource?: string;
  refreshCycle?: string;
  ownerName?: string;
  indicatorStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export default function ReportIndicatorPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IndicatorFormValues>();
  const [data, setData] = useState<ReportIndicatorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizDomain, setBizDomain] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [indicatorStatus, setIndicatorStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ReportStats>({});

  const loadStats = useCallback(async () => {
    const res = await reportIndicatorService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      domain = bizDomain,
      cat = category,
      status = indicatorStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await reportIndicatorService.pageIndicators({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizDomain: domain,
          category: cat || undefined,
          indicatorStatus: status,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizDomain, category, indicatorStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ refreshCycle: 'DAILY', decimalScale: 2, indicatorStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ReportIndicatorItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ReportIndicatorSaveParams = { ...values, indicatorName: values.indicatorName! };
      if (editId == null) {
        await reportIndicatorService.create(payload);
        message.success('指标口径已创建');
      } else {
        await reportIndicatorService.update(editId, payload);
        message.success('指标口径已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await reportIndicatorService.remove(id);
    message.success('指标口径已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ReportIndicatorItem> = [
    { title: '指标编码', dataIndex: 'indicatorCode', width: 160, fixed: 'left', render: plain },
    { title: '指标名称', dataIndex: 'indicatorName', width: 180, render: plain },
    { title: '业务域', dataIndex: 'bizDomain', width: 90, render: (v) => enumText(REPORT_BIZ_DOMAIN_LABEL, v) },
    { title: '指标分类', dataIndex: 'category', width: 120, render: plain },
    { title: '统计口径', dataIndex: 'caliber', width: 200, ellipsis: true, render: plain },
    { title: '计算公式', dataIndex: 'formula', width: 180, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'unit', width: 70, render: plain },
    { title: '小数位', dataIndex: 'decimalScale', width: 80, render: plain },
    { title: '数据来源', dataIndex: 'dataSource', width: 150, ellipsis: true, render: plain },
    {
      title: '刷新周期',
      dataIndex: 'refreshCycle',
      width: 100,
      render: (v) => enumText(REPORT_REFRESH_CYCLE_LABEL, v),
    },
    { title: '责任人', dataIndex: 'ownerName', width: 100, render: plain },
    {
      title: '状态',
      dataIndex: 'indicatorStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(REPORT_INDICATOR_STATUS_LABEL, v),
    },
    { title: '说明', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(INDICATOR_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该指标？"
              onConfirm={() => void act(reportIndicatorService.publish, record.id, '指标已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该指标？"
              onConfirm={() => void act(reportIndicatorService.disable, record.id, '指标已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该指标？" onConfirm={() => void remove(record.id)}>
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
        指标口径
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="指标总数" value={Number(stats.total ?? 0)} />
          <Statistic title="草稿" value={Number(stats.draft ?? 0)} />
          <Statistic title="已启用" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="发布前需审核" value={stats.reviewRequired ? '是' : '否'} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="业务域">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={bizDomain}
              onChange={(v) => setBizDomain(v)}
              options={[...REPORT_BIZ_DOMAIN_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="指标状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={indicatorStatus}
              onChange={(v) => setIndicatorStatus(v)}
              options={[...REPORT_INDICATOR_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="指标分类">
            <Input
              placeholder="请输入分类"
              allowClear
              style={{ width: 150 }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编码 / 名称 / 业务域"
              allowClear
              style={{ width: 190 }}
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
                  void loadData(1, pageSize, keyword, bizDomain, category, indicatorStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBizDomain(undefined);
                  setCategory(undefined);
                  setIndicatorStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(INDICATOR_MANAGE) && <Button onClick={openCreate}>新建指标</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`指标口径（共 ${total} 条）`}>
        <Table<ReportIndicatorItem>
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
        title={editId == null ? '新建指标' : '编辑指标'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="indicatorCode" label="指标编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="indicatorName" label="指标名称" rules={[{ required: true, message: '请输入指标名称' }]}>
            <Input placeholder="请输入指标名称" />
          </Form.Item>
          <Form.Item name="bizDomain" label="业务域">
            <Select placeholder="请选择" allowClear options={[...REPORT_BIZ_DOMAIN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="category" label="指标分类">
            <Input placeholder="请输入指标分类" />
          </Form.Item>
          <Form.Item name="caliber" label="口径说明">
            <Input.TextArea rows={3} placeholder="请输入统计口径说明" />
          </Form.Item>
          <Form.Item name="formula" label="计算表达式">
            <Input placeholder="请输入计算表达式" />
          </Form.Item>
          <Form.Item name="unit" label="计量单位">
            <Input placeholder="如 件 / 元 / %" />
          </Form.Item>
          <Form.Item name="decimalScale" label="小数位数">
            <InputNumber min={0} max={6} style={{ width: '100%' }} placeholder="默认 2" />
          </Form.Item>
          <Form.Item name="dataSource" label="数据来源">
            <Input placeholder="请输入数据来源" />
          </Form.Item>
          <Form.Item name="refreshCycle" label="刷新周期">
            <Select placeholder="请选择" options={[...REPORT_REFRESH_CYCLE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerName" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="indicatorStatus" label="指标状态">
            <Select placeholder="请选择" options={[...REPORT_INDICATOR_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="指标说明">
            <Input.TextArea rows={2} placeholder="请输入指标说明" />
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
