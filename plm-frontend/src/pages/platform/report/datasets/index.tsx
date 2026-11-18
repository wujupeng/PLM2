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
import { reportDatasetService } from '@/services/reportService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/report/shared';
import {
  REPORT_BIZ_DOMAIN_LABEL,
  REPORT_BIZ_DOMAIN_OPTIONS,
  REPORT_DATASET_STATUS_LABEL,
  REPORT_DATASET_STATUS_OPTIONS,
  REPORT_REFRESH_MODE_LABEL,
  REPORT_REFRESH_MODE_OPTIONS,
  REPORT_SOURCE_TYPE_LABEL,
  REPORT_SOURCE_TYPE_OPTIONS,
  type ReportDatasetItem,
  type ReportDatasetSaveParams,
  type ReportStats,
} from '@/types/report';

const { Title } = Typography;

const DATASET_MANAGE = 'platform:report:dataset:manage';

interface DatasetFormValues {
  datasetCode?: string;
  datasetName?: string;
  bizDomain?: string;
  sourceType?: string;
  sourceRef?: string;
  filterCondition?: string;
  fieldSchema?: string;
  refreshMode?: string;
  refreshCron?: string;
  ownerName?: string;
  datasetStatus?: string;
  description?: string;
  orgName?: string;
  remark?: string;
}

export default function ReportDatasetPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DatasetFormValues>();
  const [data, setData] = useState<ReportDatasetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizDomain, setBizDomain] = useState<string | undefined>(undefined);
  const [sourceType, setSourceType] = useState<string | undefined>(undefined);
  const [refreshMode, setRefreshMode] = useState<string | undefined>(undefined);
  const [datasetStatus, setDatasetStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ReportStats>({});

  const loadStats = useCallback(async () => {
    const res = await reportDatasetService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      domain = bizDomain,
      src = sourceType,
      mode = refreshMode,
      status = datasetStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await reportDatasetService.pageDatasets({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizDomain: domain,
          sourceType: src,
          refreshMode: mode,
          datasetStatus: status,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizDomain, sourceType, refreshMode, datasetStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ sourceType: 'TABLE', refreshMode: 'MANUAL', datasetStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ReportDatasetItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ReportDatasetSaveParams = { ...values, datasetName: values.datasetName! };
      if (editId == null) {
        await reportDatasetService.create(payload);
        message.success('数据集已创建');
      } else {
        await reportDatasetService.update(editId, payload);
        message.success('数据集已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await reportDatasetService.remove(id);
    message.success('数据集已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ReportDatasetItem> = [
    { title: '数据集编码', dataIndex: 'datasetCode', width: 160, fixed: 'left', render: plain },
    { title: '数据集名称', dataIndex: 'datasetName', width: 180, render: plain },
    { title: '业务域', dataIndex: 'bizDomain', width: 90, render: (v) => enumText(REPORT_BIZ_DOMAIN_LABEL, v) },
    {
      title: '来源类型',
      dataIndex: 'sourceType',
      width: 120,
      render: (v) => enumText(REPORT_SOURCE_TYPE_LABEL, v),
    },
    { title: '来源引用', dataIndex: 'sourceRef', width: 200, ellipsis: true, render: plain },
    { title: '过滤条件', dataIndex: 'filterCondition', width: 180, ellipsis: true, render: plain },
    {
      title: '刷新方式',
      dataIndex: 'refreshMode',
      width: 120,
      render: (v) => enumText(REPORT_REFRESH_MODE_LABEL, v),
    },
    { title: '刷新周期(Cron)', dataIndex: 'refreshCron', width: 140, ellipsis: true, render: plain },
    { title: '最近刷新时间', dataIndex: 'lastRefreshAt', width: 160, render: formatDateTime },
    { title: '数据行数', dataIndex: 'rowCount', width: 100, render: plain },
    { title: '责任人', dataIndex: 'ownerName', width: 100, render: plain },
    {
      title: '状态',
      dataIndex: 'datasetStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(REPORT_DATASET_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DATASET_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认刷新该数据集？将回填刷新时间并按需激活草稿。"
              onConfirm={() => void act(reportDatasetService.refresh, record.id, '数据集已刷新')}
            >
              <Button type="link" size="small">
                刷新
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该数据集？"
              onConfirm={() => void act(reportDatasetService.disable, record.id, '数据集已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该数据集？" onConfirm={() => void remove(record.id)}>
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
        数据集市
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="数据集总数" value={Number(stats.total ?? 0)} />
          <Statistic title="草稿" value={Number(stats.draft ?? 0)} />
          <Statistic title="已启用" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="手动刷新" value={Number(stats.manualCount ?? 0)} />
          <Statistic title="定时刷新" value={Number(stats.scheduledCount ?? 0)} />
          <Statistic title="实时刷新" value={Number(stats.realtimeCount ?? 0)} />
          <Statistic title="数据总行数" value={Number(stats.totalRows ?? 0)} />
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
          <Form.Item label="来源类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={sourceType}
              onChange={(v) => setSourceType(v)}
              options={[...REPORT_SOURCE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="刷新方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={refreshMode}
              onChange={(v) => setRefreshMode(v)}
              options={[...REPORT_REFRESH_MODE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="数据集状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={datasetStatus}
              onChange={(v) => setDatasetStatus(v)}
              options={[...REPORT_DATASET_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编码 / 名称 / 来源引用"
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
                  void loadData(1, pageSize, keyword, bizDomain, sourceType, refreshMode, datasetStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBizDomain(undefined);
                  setSourceType(undefined);
                  setRefreshMode(undefined);
                  setDatasetStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(DATASET_MANAGE) && <Button onClick={openCreate}>新建数据集</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`数据集市（共 ${total} 条）`}>
        <Table<ReportDatasetItem>
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
        title={editId == null ? '新建数据集' : '编辑数据集'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="datasetCode" label="数据集编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="datasetName" label="数据集名称" rules={[{ required: true, message: '请输入数据集名称' }]}>
            <Input placeholder="请输入数据集名称" />
          </Form.Item>
          <Form.Item name="bizDomain" label="业务域">
            <Select placeholder="请选择" allowClear options={[...REPORT_BIZ_DOMAIN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="请选择" options={[...REPORT_SOURCE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceRef" label="来源引用">
            <Input placeholder="表名 / 视图名 / 接口地址 / 自定义 SQL" />
          </Form.Item>
          <Form.Item name="filterCondition" label="过滤条件">
            <Input.TextArea rows={2} placeholder="请输入过滤条件" />
          </Form.Item>
          <Form.Item name="fieldSchema" label="字段结构(JSON)">
            <Input.TextArea rows={4} placeholder='如 [{"name":"id","type":"number"}]' />
          </Form.Item>
          <Form.Item name="refreshMode" label="刷新方式">
            <Select placeholder="请选择" options={[...REPORT_REFRESH_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="refreshCron" label="刷新周期(Cron)">
            <Input placeholder="定时刷新时填写，如 0 0 * * * ?" />
          </Form.Item>
          <Form.Item name="ownerName" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="datasetStatus" label="数据集状态">
            <Select placeholder="请选择" options={[...REPORT_DATASET_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="description" label="数据集说明">
            <Input.TextArea rows={2} placeholder="请输入数据集说明" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="刷新时间与数据行数由刷新操作回填" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
