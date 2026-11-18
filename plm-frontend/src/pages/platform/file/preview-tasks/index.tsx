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
import { filePreviewTaskService } from '@/services/fileService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/file/shared';
import {
  FILE_CONVERT_MODE_LABEL,
  FILE_CONVERT_MODE_OPTIONS,
  FILE_TARGET_FORMAT_LABEL,
  FILE_TARGET_FORMAT_OPTIONS,
  FILE_TASK_STATUS_LABEL,
  FILE_TASK_STATUS_OPTIONS,
  type FilePreviewTaskItem,
  type FilePreviewTaskSaveParams,
  type FilePreviewTaskStats,
} from '@/types/file';

const { Title } = Typography;

const PREVIEW_MANAGE = 'platform:file:preview:manage';

export default function FilePreviewTaskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FilePreviewTaskSaveParams>();
  const [data, setData] = useState<FilePreviewTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [taskStatus, setTaskStatus] = useState<string | undefined>(undefined);
  const [convertMode, setConvertMode] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<FilePreviewTaskStats>({});

  const loadStats = useCallback(async () => {
    const res = await filePreviewTaskService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, tstatus = taskStatus, mode = convertMode, rg = range) => {
      setLoading(true);
      try {
        const res = await filePreviewTaskService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          taskStatus: tstatus,
          convertMode: mode,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, taskStatus, convertMode, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ convertMode: 'OFFICE', targetFormat: 'PDF', taskStatus: 'PENDING', retryCount: 0 });
    setOpen(true);
  };

  const openEdit = (record: FilePreviewTaskItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: FilePreviewTaskSaveParams = { ...values, fileNo: values.fileNo! };
      if (editId == null) {
        await filePreviewTaskService.create(payload);
        message.success('转换任务已创建');
      } else {
        await filePreviewTaskService.update(editId, payload);
        message.success('转换任务已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await filePreviewTaskService.remove(id);
    message.success('转换任务已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<FilePreviewTaskItem> = [
    { title: '任务编号', dataIndex: 'taskNo', width: 170, fixed: 'left', render: plain },
    { title: '文件编号', dataIndex: 'fileNo', width: 170, render: plain },
    { title: '文件名称', dataIndex: 'fileName', width: 180, render: plain },
    { title: '源扩展名', dataIndex: 'sourceExt', width: 100, render: plain },
    { title: '目标格式', dataIndex: 'targetFormat', width: 100, render: (v) => enumText(FILE_TARGET_FORMAT_LABEL, v) },
    { title: '转换模式', dataIndex: 'convertMode', width: 130, render: (v) => enumText(FILE_CONVERT_MODE_LABEL, v) },
    { title: '转换引擎', dataIndex: 'convertEngine', width: 130, render: plain },
    { title: '预览地址', dataIndex: 'previewUrl', width: 200, ellipsis: true, render: plain },
    { title: '错误信息', dataIndex: 'errorMessage', width: 200, ellipsis: true, render: plain },
    { title: '重试次数', dataIndex: 'retryCount', width: 100, render: plain },
    { title: '开始时间', dataIndex: 'startTime', width: 160, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 160, render: formatDateTime },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 100, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(FILE_TASK_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(PREVIEW_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认开始该转换任务？"
              onConfirm={() => void act(filePreviewTaskService.start, record.id, '任务已开始')}
            >
              <Button type="link" size="small">
                开始
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认将该任务标记为完成？"
              onConfirm={() => void act(filePreviewTaskService.complete, record.id, '任务已完成')}
            >
              <Button type="link" size="small">
                完成
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认将该任务标记为失败？"
              onConfirm={() => void act(filePreviewTaskService.fail, record.id, '任务已标记失败')}
            >
              <Button type="link" size="small">
                失败
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该转换任务？" onConfirm={() => void remove(record.id)}>
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
        预览转换
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="任务总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待处理" value={Number(stats.pending ?? 0)} />
          <Statistic title="处理中" value={Number(stats.processing ?? 0)} valueStyle={{ color: '#1677ff' }} />
          <Statistic title="成功" value={Number(stats.success ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="失败" value={Number(stats.failed ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="耗时合计(ms)" value={Number(stats.totalCostMs ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="任务状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={taskStatus}
              onChange={(v) => setTaskStatus(v)}
              options={[...FILE_TASK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="转换模式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={convertMode}
              onChange={(v) => setConvertMode(v)}
              options={[...FILE_CONVERT_MODE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="任务编号 / 文件编号 / 名称"
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
                  void loadData(1, pageSize, keyword, taskStatus, convertMode, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTaskStatus(undefined);
                  setConvertMode(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(PREVIEW_MANAGE) && <Button onClick={openCreate}>新建任务</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`预览转换任务（共 ${total} 条）`}>
        <Table<FilePreviewTaskItem>
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
        title={editId == null ? '新建转换任务' : '编辑转换任务'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taskNo" label="任务编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="fileNo" label="文件编号" rules={[{ required: true, message: '请输入文件编号' }]}>
            <Input placeholder="请输入文件编号" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名称">
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item name="sourceExt" label="源扩展名">
            <Input placeholder="如 docx、dwg" />
          </Form.Item>
          <Form.Item name="targetFormat" label="目标格式">
            <Select placeholder="请选择" options={[...FILE_TARGET_FORMAT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="convertMode" label="转换模式">
            <Select placeholder="请选择" options={[...FILE_CONVERT_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="convertEngine" label="转换引擎">
            <Input placeholder="请输入转换引擎" />
          </Form.Item>
          <Form.Item name="taskStatus" label="任务状态">
            <Select placeholder="请选择" options={[...FILE_TASK_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="previewUrl" label="预览地址">
            <Input placeholder="请输入预览地址" />
          </Form.Item>
          <Form.Item name="errorMessage" label="错误信息">
            <Input.TextArea rows={2} placeholder="请输入错误信息" />
          </Form.Item>
          <Form.Item name="retryCount" label="重试次数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
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
