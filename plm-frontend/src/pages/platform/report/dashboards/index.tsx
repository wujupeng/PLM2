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
import { reportDashboardService } from '@/services/reportService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/report/shared';
import {
  REPORT_BIZ_DOMAIN_LABEL,
  REPORT_BIZ_DOMAIN_OPTIONS,
  REPORT_DASHBOARD_STATUS_LABEL,
  REPORT_DASHBOARD_STATUS_OPTIONS,
  REPORT_LAYOUT_MODE_LABEL,
  REPORT_LAYOUT_MODE_OPTIONS,
  type ReportDashboardItem,
  type ReportDashboardSaveParams,
  type ReportStats,
} from '@/types/report';

const { Title } = Typography;

const DASHBOARD_MANAGE = 'platform:report:dashboard:manage';

interface DashboardFormValues {
  dashboardCode?: string;
  dashboardName?: string;
  bizDomain?: string;
  audience?: string;
  layoutMode?: string;
  widgetSchema?: string;
  refreshIntervalSec?: number;
  ownerName?: string;
  dashboardStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export default function ReportDashboardPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DashboardFormValues>();
  const [data, setData] = useState<ReportDashboardItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizDomain, setBizDomain] = useState<string | undefined>(undefined);
  const [dashboardStatus, setDashboardStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ReportStats>({});

  const loadStats = useCallback(async () => {
    const res = await reportDashboardService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      domain = bizDomain,
      status = dashboardStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await reportDashboardService.pageDashboards({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizDomain: domain,
          dashboardStatus: status,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizDomain, dashboardStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ layoutMode: 'GRID', dashboardStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ReportDashboardItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ReportDashboardSaveParams = { ...values, dashboardName: values.dashboardName! };
      if (editId == null) {
        await reportDashboardService.create(payload);
        message.success('经营驾驶舱已创建');
      } else {
        await reportDashboardService.update(editId, payload);
        message.success('经营驾驶舱已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await reportDashboardService.remove(id);
    message.success('经营驾驶舱已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ReportDashboardItem> = [
    { title: '看板编码', dataIndex: 'dashboardCode', width: 160, fixed: 'left', render: plain },
    { title: '看板名称', dataIndex: 'dashboardName', width: 180, render: plain },
    { title: '业务域', dataIndex: 'bizDomain', width: 90, render: (v) => enumText(REPORT_BIZ_DOMAIN_LABEL, v) },
    { title: '受众', dataIndex: 'audience', width: 140, ellipsis: true, render: plain },
    {
      title: '布局方式',
      dataIndex: 'layoutMode',
      width: 110,
      render: (v) => enumText(REPORT_LAYOUT_MODE_LABEL, v),
    },
    { title: '组件布局', dataIndex: 'widgetSchema', width: 220, ellipsis: true, render: plain },
    { title: '刷新间隔(秒)', dataIndex: 'refreshIntervalSec', width: 120, render: plain },
    { title: '责任人', dataIndex: 'ownerName', width: 100, render: plain },
    {
      title: '状态',
      dataIndex: 'dashboardStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(REPORT_DASHBOARD_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DASHBOARD_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认发布该驾驶舱？"
              onConfirm={() => void act(reportDashboardService.publish, record.id, '驾驶舱已发布')}
            >
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该驾驶舱？"
              onConfirm={() => void act(reportDashboardService.disable, record.id, '驾驶舱已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该驾驶舱？" onConfirm={() => void remove(record.id)}>
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
        经营驾驶舱
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="看板总数" value={Number(stats.total ?? 0)} />
          <Statistic title="草稿" value={Number(stats.draft ?? 0)} />
          <Statistic title="已发布" value={Number(stats.published ?? 0)} valueStyle={{ color: '#1677ff' }} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="栅格布局" value={Number(stats.gridCount ?? 0)} />
          <Statistic title="自由布局" value={Number(stats.freeCount ?? 0)} />
          <Statistic title="默认刷新间隔" value={Number(stats.defaultRefreshSec ?? 0)} suffix="秒" />
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
          <Form.Item label="看板状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={dashboardStatus}
              onChange={(v) => setDashboardStatus(v)}
              options={[...REPORT_DASHBOARD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编码 / 名称 / 受众"
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
                  void loadData(1, pageSize, keyword, bizDomain, dashboardStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBizDomain(undefined);
                  setDashboardStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(DASHBOARD_MANAGE) && <Button onClick={openCreate}>新建驾驶舱</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`经营驾驶舱（共 ${total} 条）`}>
        <Table<ReportDashboardItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建驾驶舱' : '编辑驾驶舱'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="dashboardCode" label="看板编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="dashboardName" label="看板名称" rules={[{ required: true, message: '请输入看板名称' }]}>
            <Input placeholder="请输入看板名称" />
          </Form.Item>
          <Form.Item name="bizDomain" label="业务域">
            <Select placeholder="请选择" allowClear options={[...REPORT_BIZ_DOMAIN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="audience" label="受众">
            <Input placeholder="如 总经理 / 销售部" />
          </Form.Item>
          <Form.Item name="layoutMode" label="布局方式">
            <Select placeholder="请选择" options={[...REPORT_LAYOUT_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="widgetSchema" label="组件布局(JSON)">
            <Input.TextArea rows={4} placeholder='如 [{"widget":"salesCard","x":0,"y":0,"w":6,"h":4}]' />
          </Form.Item>
          <Form.Item name="refreshIntervalSec" label="刷新间隔(秒)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 60" />
          </Form.Item>
          <Form.Item name="ownerName" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="dashboardStatus" label="看板状态">
            <Select placeholder="请选择" options={[...REPORT_DASHBOARD_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="看板说明">
            <Input.TextArea rows={2} placeholder="请输入看板说明" />
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
