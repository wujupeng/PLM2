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
import { reportExportLogService } from '@/services/reportService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { fileSizeText, statusTag } from '@/pages/platform/report/shared';
import {
  REPORT_EXPORT_RESULT_LABEL,
  REPORT_EXPORT_RESULT_OPTIONS,
  REPORT_EXPORT_TYPE_LABEL,
  REPORT_EXPORT_TYPE_OPTIONS,
  type ReportExportLogItem,
  type ReportExportLogSaveParams,
  type ReportStats,
} from '@/types/report';

const { Title } = Typography;

const EXPORT_LOG_MANAGE = 'platform:report:exportlog:manage';

interface ExportLogFormValues {
  exportNo?: string;
  reportCode?: string;
  reportName?: string;
  exportType?: string;
  exportRows?: number;
  fileSize?: number;
  exportBy?: string;
  exportTime?: string;
  resultStatus?: string;
  ipAddress?: string;
  filterSummary?: string;
  costMs?: number;
  orgName?: string;
  remark?: string;
}

export default function ReportExportLogPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ExportLogFormValues>();
  const [data, setData] = useState<ReportExportLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [exportStatus, setExportStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ReportStats>({});

  const loadStats = useCallback(async () => {
    const res = await reportExportLogService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = exportStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await reportExportLogService.pageExportLogs({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          exportStatus: status,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, exportStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ exportType: 'EXCEL', exportRows: 0, fileSize: 0, resultStatus: 'SUCCESS', costMs: 0 });
    setOpen(true);
  };

  const openEdit = (record: ReportExportLogItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ReportExportLogSaveParams = { ...values, reportCode: values.reportCode! };
      if (editId == null) {
        await reportExportLogService.create(payload);
        message.success('导出记录已登记');
      } else {
        await reportExportLogService.update(editId, payload);
        message.success('导出记录已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await reportExportLogService.remove(id);
    message.success('导出记录已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ReportExportLogItem> = [
    { title: '导出编号', dataIndex: 'exportNo', width: 170, fixed: 'left', render: plain },
    { title: '报表编码', dataIndex: 'reportCode', width: 160, render: plain },
    { title: '报表名称', dataIndex: 'reportName', width: 180, render: plain },
    { title: '导出格式', dataIndex: 'exportType', width: 100, render: (v) => enumText(REPORT_EXPORT_TYPE_LABEL, v) },
    { title: '导出行数', dataIndex: 'exportRows', width: 100, render: plain },
    { title: '文件大小', dataIndex: 'fileSize', width: 110, render: fileSizeText },
    { title: '导出人', dataIndex: 'exportBy', width: 100, render: plain },
    { title: '导出时间', dataIndex: 'exportTime', width: 160, render: formatDateTime },
    {
      title: '导出结果',
      dataIndex: 'resultStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(REPORT_EXPORT_RESULT_LABEL, v),
    },
    { title: '来源 IP', dataIndex: 'ipAddress', width: 130, render: plain },
    { title: '筛选条件摘要', dataIndex: 'filterSummary', width: 200, ellipsis: true, render: plain },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 90, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(EXPORT_LOG_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该导出记录？" onConfirm={() => void remove(record.id)}>
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
        导出审计
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="导出记录总数" value={Number(stats.total ?? 0)} />
          <Statistic title="成功" value={Number(stats.success ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="失败" value={Number(stats.failed ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="导出行数合计" value={Number(stats.totalRows ?? 0)} />
          <Statistic title="文件大小合计" value={fileSizeText(stats.totalFileSize ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="导出结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={exportStatus}
              onChange={(v) => setExportStatus(v)}
              options={[...REPORT_EXPORT_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="导出日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 报表编码 / 名称 / 导出人"
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
                  void loadData(1, pageSize, keyword, exportStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setExportStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(EXPORT_LOG_MANAGE) && <Button onClick={openCreate}>登记导出记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`导出审计（共 ${total} 条）`}>
        <Table<ReportExportLogItem>
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
        title={editId == null ? '登记导出记录' : '编辑导出记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="exportNo" label="导出编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="reportCode" label="报表编码" rules={[{ required: true, message: '请输入报表编码' }]}>
            <Input placeholder="请输入报表编码" />
          </Form.Item>
          <Form.Item name="reportName" label="报表名称">
            <Input placeholder="请输入报表名称" />
          </Form.Item>
          <Form.Item name="exportType" label="导出格式">
            <Select placeholder="请选择" options={[...REPORT_EXPORT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="exportRows" label="导出行数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小(字节)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="exportBy" label="导出人">
            <Input placeholder="请输入导出人" />
          </Form.Item>
          <Form.Item name="exportTime" label="导出时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="resultStatus" label="导出结果">
            <Select placeholder="请选择" options={[...REPORT_EXPORT_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ipAddress" label="来源 IP">
            <Input placeholder="请输入来源 IP" />
          </Form.Item>
          <Form.Item name="filterSummary" label="筛选条件摘要">
            <Input.TextArea rows={2} placeholder="请输入筛选条件摘要" />
          </Form.Item>
          <Form.Item name="costMs" label="耗时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
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
