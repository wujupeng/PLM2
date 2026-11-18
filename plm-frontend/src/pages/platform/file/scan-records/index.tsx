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
import { fileScanRecordService } from '@/services/fileService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/file/shared';
import {
  FILE_ACTION_TAKEN_LABEL,
  FILE_ACTION_TAKEN_OPTIONS,
  FILE_SCAN_RESULT_LABEL,
  FILE_SCAN_RESULT_OPTIONS,
  type FileScanRecordItem,
  type FileScanRecordSaveParams,
  type FileScanRecordStats,
} from '@/types/file';

const { Title } = Typography;

const SCAN_MANAGE = 'platform:file:scan:manage';

export default function FileScanRecordPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FileScanRecordSaveParams>();
  const [data, setData] = useState<FileScanRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [scanResult, setScanResult] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FileScanRecordStats>({});

  const loadStats = useCallback(async () => {
    const res = await fileScanRecordService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, result = scanResult, rg = range) => {
      setLoading(true);
      try {
        const res = await fileScanRecordService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          scanResult: result,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, scanResult, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ scanResult: 'CLEAN', actionTaken: 'PASS', costMs: 0 });
    setOpen(true);
  };

  const openEdit = (record: FileScanRecordItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FileScanRecordSaveParams = { ...values, fileNo: values.fileNo! };
      if (editId == null) {
        await fileScanRecordService.create(payload);
        message.success('扫描记录已登记');
      } else {
        await fileScanRecordService.update(editId, payload);
        message.success('扫描记录已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await fileScanRecordService.remove(id);
    message.success('扫描记录已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FileScanRecordItem> = [
    { title: '扫描编号', dataIndex: 'scanNo', width: 170, fixed: 'left', render: plain },
    { title: '文件编号', dataIndex: 'fileNo', width: 170, render: plain },
    { title: '文件名称', dataIndex: 'fileName', width: 180, render: plain },
    { title: '扫描引擎', dataIndex: 'scanEngine', width: 140, render: plain },
    { title: '引擎版本', dataIndex: 'engineVersion', width: 110, render: plain },
    { title: '病毒名称', dataIndex: 'virusName', width: 180, ellipsis: true, render: plain },
    { title: '处置动作', dataIndex: 'actionTaken', width: 110, render: (v) => enumText(FILE_ACTION_TAKEN_LABEL, v) },
    { title: '扫描时间', dataIndex: 'scanTime', width: 160, render: formatDateTime },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 100, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '扫描结果',
      dataIndex: 'scanResult',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(FILE_SCAN_RESULT_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(SCAN_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该扫描记录？" onConfirm={() => void remove(record.id)}>
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
        病毒扫描
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="扫描记录总数" value={Number(stats.total ?? 0)} />
          <Statistic title="安全" value={Number(stats.clean ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已感染" value={Number(stats.infected ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="扫描异常" value={Number(stats.error ?? 0)} />
          <Statistic title="耗时合计(ms)" value={Number(stats.totalCostMs ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="扫描结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={scanResult}
              onChange={(v) => setScanResult(v)}
              options={[...FILE_SCAN_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="扫描日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 文件编号 / 名称 / 病毒名称"
              allowClear
              style={{ width: 260 }}
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
                  void loadData(1, pageSize, keyword, scanResult, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setScanResult(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(SCAN_MANAGE) && <Button onClick={openCreate}>登记扫描记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`病毒扫描记录（共 ${total} 条）`}>
        <Table<FileScanRecordItem>
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
        title={editId == null ? '登记扫描记录' : '编辑扫描记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="scanNo" label="扫描编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="fileNo" label="文件编号" rules={[{ required: true, message: '请输入文件编号' }]}>
            <Input placeholder="请输入文件编号" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名称">
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item name="scanEngine" label="扫描引擎">
            <Input placeholder="请输入扫描引擎" />
          </Form.Item>
          <Form.Item name="engineVersion" label="引擎版本">
            <Input placeholder="请输入引擎版本" />
          </Form.Item>
          <Form.Item name="virusName" label="病毒名称">
            <Input placeholder="请输入病毒名称" />
          </Form.Item>
          <Form.Item name="scanResult" label="扫描结果">
            <Select placeholder="请选择" options={[...FILE_SCAN_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="actionTaken" label="处置动作">
            <Select placeholder="请选择" options={[...FILE_ACTION_TAKEN_OPTIONS]} />
          </Form.Item>
          <Form.Item name="scanTime" label="扫描时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空取当前时间" />
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
