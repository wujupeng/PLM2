import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import type { Dayjs } from 'dayjs';
import { reportDefinitionService } from '@/services/reportService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { boolTag, statusTag } from '@/pages/platform/report/shared';
import {
  REPORT_BIZ_DOMAIN_LABEL,
  REPORT_BIZ_DOMAIN_OPTIONS,
  REPORT_BOOLEAN_OPTIONS,
  REPORT_CHART_TYPE_LABEL,
  REPORT_CHART_TYPE_OPTIONS,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_OPTIONS,
  type ReportDefinitionItem,
  type ReportDefinitionSaveParams,
  type ReportStats,
} from '@/types/report';

const { Title } = Typography;

const DEFINITION_MANAGE = 'platform:report:definition:manage';

interface DefinitionFormValues {
  reportCode?: string;
  reportName?: string;
  bizDomain?: string;
  category?: string;
  datasetCode?: string;
  chartType?: string;
  indicatorCodes?: string;
  permissionCode?: string;
  rowFilter?: string;
  exportEnabled?: number;
  exportAuditFlag?: number;
  reportStatus?: string;
  ownerName?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export default function ReportDefinitionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DefinitionFormValues>();
  const [data, setData] = useState<ReportDefinitionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizDomain, setBizDomain] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [chartType, setChartType] = useState<string | undefined>(undefined);
  const [reportStatus, setReportStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ReportStats>({});

  const loadStats = useCallback(async () => {
    const res = await reportDefinitionService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      domain = bizDomain,
      cat = category,
      chart = chartType,
      status = reportStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await reportDefinitionService.pageDefinitions({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizDomain: domain,
          category: cat || undefined,
          chartType: chart,
          reportStatus: status,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizDomain, category, chartType, reportStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      chartType: 'TABLE',
      exportEnabled: 1,
      exportAuditFlag: 1,
      reportStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ReportDefinitionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ReportDefinitionSaveParams = { ...values, reportName: values.reportName! };
      if (editId == null) {
        await reportDefinitionService.create(payload);
        message.success('报表定义已创建');
      } else {
        await reportDefinitionService.update(editId, payload);
        message.success('报表定义已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await reportDefinitionService.remove(id);
    message.success('报表定义已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ReportDefinitionItem> = [
    { title: '报表编码', dataIndex: 'reportCode', width: 160, fixed: 'left', render: plain },
    { title: '报表名称', dataIndex: 'reportName', width: 180, render: plain },
    { title: '业务域', dataIndex: 'bizDomain', width: 90, render: (v) => enumText(REPORT_BIZ_DOMAIN_LABEL, v) },
    { title: '报表分类', dataIndex: 'category', width: 120, render: plain },
    { title: '数据集编码', dataIndex: 'datasetCode', width: 150, render: plain },
    {
      title: '图表类型',
      dataIndex: 'chartType',
      width: 110,
      render: (v) => enumText(REPORT_CHART_TYPE_LABEL, v),
    },
    { title: '引用指标', dataIndex: 'indicatorCodes', width: 180, ellipsis: true, render: plain },
    { title: '查看权限码', dataIndex: 'permissionCode', width: 170, ellipsis: true, render: plain },
    { title: '数据权限过滤', dataIndex: 'rowFilter', width: 180, ellipsis: true, render: plain },
    { title: '允许导出', dataIndex: 'exportEnabled', width: 90, render: boolTag },
    { title: '导出审计', dataIndex: 'exportAuditFlag', width: 90, render: boolTag },
    { title: '责任人', dataIndex: 'ownerName', width: 100, render: plain },
    {
      title: '状态',
      dataIndex: 'reportStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(REPORT_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DEFINITION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认发布该报表？"
              onConfirm={() => void act(reportDefinitionService.publish, record.id, '报表已发布')}
            >
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该报表？"
              onConfirm={() => void act(reportDefinitionService.disable, record.id, '报表已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该报表？" onConfirm={() => void remove(record.id)}>
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
        报表定义
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="报表总数" value={Number(stats.total ?? 0)} />
          <Statistic title="草稿" value={Number(stats.draft ?? 0)} />
          <Statistic title="已发布" value={Number(stats.published ?? 0)} valueStyle={{ color: '#1677ff' }} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="允许导出" value={Number(stats.exportEnabled ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="导出审计" value={Number(stats.auditEnabled ?? 0)} />
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
          <Form.Item label="图表类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={chartType}
              onChange={(v) => setChartType(v)}
              options={[...REPORT_CHART_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="报表状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reportStatus}
              onChange={(v) => setReportStatus(v)}
              options={[...REPORT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="报表分类">
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
              placeholder="编码 / 名称 / 数据集编码"
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
                  void loadData(1, pageSize, keyword, bizDomain, category, chartType, reportStatus, range);
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
                  setChartType(undefined);
                  setReportStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(DEFINITION_MANAGE) && <Button onClick={openCreate}>新建报表</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`报表定义（共 ${total} 条）`}>
        <Table<ReportDefinitionItem>
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
        title={editId == null ? '新建报表' : '编辑报表'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reportCode" label="报表编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="reportName" label="报表名称" rules={[{ required: true, message: '请输入报表名称' }]}>
            <Input placeholder="请输入报表名称" />
          </Form.Item>
          <Form.Item name="bizDomain" label="业务域">
            <Select placeholder="请选择" allowClear options={[...REPORT_BIZ_DOMAIN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="category" label="报表分类">
            <Input placeholder="请输入报表分类" />
          </Form.Item>
          <Form.Item name="datasetCode" label="引用数据集编码">
            <Input placeholder="请输入引用的数据集编码" />
          </Form.Item>
          <Form.Item name="chartType" label="图表类型">
            <Select placeholder="请选择" options={[...REPORT_CHART_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="indicatorCodes" label="引用指标编码">
            <Input placeholder="多个指标编码以逗号分隔" />
          </Form.Item>
          <Form.Item name="permissionCode" label="查看权限码">
            <Input placeholder="如 report:sales:view" />
          </Form.Item>
          <Form.Item name="rowFilter" label="数据权限过滤">
            <Input.TextArea rows={2} placeholder="行级过滤条件，如 org_id = ${orgId}" />
          </Form.Item>
          <Form.Item name="exportEnabled" label="允许导出">
            <Select placeholder="请选择" options={[...REPORT_BOOLEAN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="exportAuditFlag" label="导出审计">
            <Select placeholder="请选择" options={[...REPORT_BOOLEAN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reportStatus" label="报表状态">
            <Select placeholder="请选择" options={[...REPORT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerName" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="description" label="报表说明">
            <Input.TextArea rows={2} placeholder="请输入报表说明" />
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
