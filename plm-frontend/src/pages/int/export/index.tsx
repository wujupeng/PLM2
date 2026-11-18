import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { intService } from '@/services/intService';
import {
  INT_ENABLED_COLOR,
  INT_ENABLED_LABEL,
  INT_ENABLED_OPTIONS,
  INT_EXPORT_FORMAT_LABEL,
  INT_EXPORT_FORMAT_OPTIONS,
  INT_EXPORT_SCOPE_LABEL,
  INT_EXPORT_SCOPE_OPTIONS,
  INT_TASK_STATUS_COLOR,
  INT_TASK_STATUS_LABEL,
  INT_TASK_STATUS_OPTIONS,
  type IntExportTaskItem,
  type IntExportTaskQuery,
  type IntExportTaskSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface ExportTaskFormValues {
  taskNo?: string;
  scope: string;
  exportFormat?: string;
  includeAttachment?: number;
  remark?: string;
}

interface ExportSearchState {
  taskNo?: string;
  scope?: string;
  exportFormat?: string;
  taskStatus?: string;
}

export default function IntExportPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ExportTaskFormValues>();

  const [data, setData] = useState<IntExportTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<ExportSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntExportTaskItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntExportTaskQuery = {
          pageNum: page,
          pageSize: size,
          taskNo: cond.taskNo || undefined,
          scope: cond.scope || undefined,
          exportFormat: cond.exportFormat || undefined,
          taskStatus: cond.taskStatus || undefined,
        };
        const res = await intService.exportPage(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: ExportSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ exportFormat: 'EXCEL', includeAttachment: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: IntExportTaskItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntExportTaskSaveParams = {
      taskNo: values.taskNo,
      scope: values.scope,
      exportFormat: values.exportFormat,
      includeAttachment: values.includeAttachment,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.exportUpdate(editing.taskNo, payload);
        message.success('更新成功');
      } else {
        await intService.exportCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntExportTaskItem) => {
    await intService.exportRemove(record.taskNo);
    message.success('删除成功');
    void loadData();
  };

  const handleRun = async (record: IntExportTaskItem) => {
    const res = await intService.exportRun(record.taskNo);
    if (res.taskStatus === 'SUCCESS') {
      message.success(`导出完成，文件：${res.filePath || '-'}`);
    } else if (res.taskStatus === 'FAILED') {
      message.error(`导出失败：${res.errorMessage || '未知原因'}`);
    } else {
      message.success('导出任务已提交');
    }
    void loadData();
  };

  const columns: ColumnsType<IntExportTaskItem> = [
    { title: '任务编号', dataIndex: 'taskNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    {
      title: '导出范围',
      dataIndex: 'scope',
      width: 110,
      render: (v?: string) => (v ? INT_EXPORT_SCOPE_LABEL[v] || v : '-'),
    },
    {
      title: '导出格式',
      dataIndex: 'exportFormat',
      width: 100,
      render: (v?: string) => (v ? INT_EXPORT_FORMAT_LABEL[v] || v : '-'),
    },
    {
      title: '包含附件',
      dataIndex: 'includeAttachment',
      width: 110,
      render: (v?: number) =>
        v !== undefined && v !== null ? (
          <Tag color={INT_ENABLED_COLOR[String(v)]}>{INT_ENABLED_LABEL[String(v)] || '-'}</Tag>
        ) : (
          '-'
        ),
    },
    { title: '导出记录数', dataIndex: 'recordCount', width: 110, render: (v) => (v ?? '-') },
    { title: '文件路径', dataIndex: 'filePath', width: 200, render: (v) => v || '-' },
    { title: '文件大小(字节)', dataIndex: 'fileSize', width: 130, render: (v) => (v ?? '-') },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_TASK_STATUS_COLOR[v]}>{INT_TASK_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '申请人', dataIndex: 'requestedBy', width: 100, render: (v) => v || '-' },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'finishedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '错误信息', dataIndex: 'errorMessage', width: 200, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:export:run') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:export:run') && (
            <Popconfirm title="确认执行该导出任务？" onConfirm={() => handleRun(record)}>
              <Button type="link" size="small">
                执行导出
              </Button>
            </Popconfirm>
          )}
          {hasPermission('int:export:run') && (
            <Popconfirm title="确认删除该导出任务？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        数据导出
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="taskNo" label="任务编号">
            <Input placeholder="请输入任务编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="scope" label="导出范围">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_EXPORT_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="exportFormat" label="导出格式">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_EXPORT_FORMAT_OPTIONS} />
          </Form.Item>
          <Form.Item name="taskStatus" label="任务状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={INT_TASK_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`导出任务列表（共 ${total} 条）`}
        extra={
          hasPermission('int:export:run') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增导出任务
            </Button>
          )
        }
      >
        <Table<IntExportTaskItem>
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
        title={editing ? '编辑导出任务' : '新增导出任务'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taskNo" label="任务编号" extra="留空将自动生成">
            <Input placeholder="请输入任务编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="scope" label="导出范围" rules={[{ required: true, message: '请选择导出范围' }]}>
            <Select placeholder="请选择" options={INT_EXPORT_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="exportFormat" label="导出格式">
            <Select placeholder="请选择" options={INT_EXPORT_FORMAT_OPTIONS} />
          </Form.Item>
          <Form.Item name="includeAttachment" label="包含附件">
            <Select placeholder="请选择" options={INT_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
