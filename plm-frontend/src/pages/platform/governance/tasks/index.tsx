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
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { govTaskService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_PRIORITY_LABEL,
  GOV_PRIORITY_OPTIONS,
  GOV_TASK_STATUS_LABEL,
  GOV_TASK_STATUS_OPTIONS,
  type GovTaskItem,
  type GovTaskSaveParams,
} from '@/types/governance';

const { Title } = Typography;

/** 后端 LocalDateTime 仅接受 ISO-8601 格式（yyyy-MM-ddTHH:mm:ss）。 */
const DATETIME_SUBMIT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DATETIME_PICKER_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const MANAGE = 'platform:gov:task:manage';

/** 表单值类型：日期字段使用 Dayjs，提交时格式化为 ISO 字符串。 */
type FormValues = Omit<GovTaskSaveParams, 'planStart' | 'planEnd' | 'actualEnd'> & {
  planStart?: Dayjs;
  planEnd?: Dayjs;
  actualEnd?: Dayjs;
};

export default function GovTaskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<GovTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [taskStatus, setTaskStatus] = useState<string | undefined>(undefined);
  const [taskPriority, setTaskPriority] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pCode = projectCode,
      tStatus = taskStatus,
      tPriority = taskPriority,
    ) => {
      setLoading(true);
      try {
        const res = await govTaskService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          projectCode: pCode || undefined,
          taskStatus: tStatus,
          taskPriority: tPriority,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, projectCode, taskStatus, taskPriority],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ taskStatus: 'TODO', taskPriority: 'P1', progress: 0 });
    setOpen(true);
  };

  const openEdit = (record: GovTaskItem) => {
    setEditId(record.id);
    const values = {
      ...record,
      planStart: record.planStart ? dayjs(record.planStart) : undefined,
      planEnd: record.planEnd ? dayjs(record.planEnd) : undefined,
      actualEnd: record.actualEnd ? dayjs(record.actualEnd) : undefined,
    };
    form.setFieldsValue(values);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovTaskSaveParams = {
        ...values,
        planStart: values.planStart ? values.planStart.format(DATETIME_SUBMIT_FORMAT) : undefined,
        planEnd: values.planEnd ? values.planEnd.format(DATETIME_SUBMIT_FORMAT) : undefined,
        actualEnd: values.actualEnd ? values.actualEnd.format(DATETIME_SUBMIT_FORMAT) : undefined,
      };
      if (editId == null) {
        await govTaskService.create(payload);
        message.success('治理任务已创建');
      } else {
        await govTaskService.update(editId, payload);
        message.success('治理任务已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govTaskService.remove(id);
    message.success('治理任务已删除');
    void loadData();
  };

  const columns: ColumnsType<GovTaskItem> = [
    { title: '任务编号', dataIndex: 'taskNo', width: 160, fixed: 'left', render: plain },
    { title: '所属项目编码', dataIndex: 'projectCode', width: 150, render: plain },
    { title: '里程碑编码', dataIndex: 'milestoneCode', width: 140, render: plain },
    { title: '任务名称', dataIndex: 'taskName', width: 200, render: plain },
    { title: '任务类型', dataIndex: 'taskType', width: 120, render: plain },
    { title: '负责人', dataIndex: 'assignee', width: 120, render: plain },
    { title: '计划开始', dataIndex: 'planStart', width: 170, render: formatDateTime },
    { title: '计划结束', dataIndex: 'planEnd', width: 170, render: formatDateTime },
    { title: '实际结束', dataIndex: 'actualEnd', width: 170, render: formatDateTime },
    { title: '进度(%)', dataIndex: 'progress', width: 90, render: (v) => (v == null ? '-' : String(v)) },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '优先级',
      dataIndex: 'taskPriority',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_PRIORITY_LABEL, v),
    },
    {
      title: '状态',
      dataIndex: 'taskStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_TASK_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该治理任务？" onConfirm={() => void remove(record.id)}>
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
        治理任务
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="所属项目编码">
            <Input
              placeholder="请输入项目编码"
              allowClear
              style={{ width: 180 }}
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="任务状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={taskStatus}
              onChange={(v) => setTaskStatus(v)}
              options={[...GOV_TASK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="任务优先级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={taskPriority}
              onChange={(v) => setTaskPriority(v)}
              options={[...GOV_PRIORITY_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="任务编号 / 名称 / 负责人"
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
                  void loadData(1, pageSize, keyword, projectCode, taskStatus, taskPriority);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setProjectCode('');
                  setTaskStatus(undefined);
                  setTaskPriority(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建治理任务</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`治理任务（共 ${total} 条）`}>
        <Table<GovTaskItem>
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
        title={editId == null ? '新建治理任务' : '编辑治理任务'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="taskNo" label="任务编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="projectCode"
            label="所属项目编码"
            rules={[{ required: true, message: '请输入所属项目编码' }]}
          >
            <Input placeholder="请输入所属项目编码" />
          </Form.Item>
          <Form.Item name="milestoneCode" label="所属里程碑编码">
            <Input placeholder="请输入所属里程碑编码" />
          </Form.Item>
          <Form.Item name="taskName" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="taskType" label="任务类型">
            <Input placeholder="为空默认 DELIVERY" />
          </Form.Item>
          <Form.Item name="assignee" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="planStart" label="计划开始时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="planEnd" label="计划结束时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="actualEnd" label="实际结束时间">
            <DatePicker showTime style={{ width: '100%' }} format={DATETIME_PICKER_FORMAT} />
          </Form.Item>
          <Form.Item name="progress" label="进度百分比">
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
          </Form.Item>
          <Form.Item name="taskStatus" label="任务状态">
            <Select placeholder="请选择" options={[...GOV_TASK_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="taskPriority" label="任务优先级">
            <Select placeholder="请选择" options={[...GOV_PRIORITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
