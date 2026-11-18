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
import { approvalTaskService } from '@/services/approvalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  APPROVAL_TASK_STATUS_LABEL,
  APPROVAL_TASK_STATUS_OPTIONS,
  type ApprovalTaskActionParams,
  type ApprovalTaskItem,
  type ApprovalTaskSaveParams,
  type ApprovalTaskStats,
} from '@/types/approval';

const { Title } = Typography;

const TASK_MANAGE = 'platform:approval:task:manage';

/** 审批任务处理动作（通过 / 驳回 / 转办 / 重置）。 */
type TaskAction = (id: number, data: ApprovalTaskActionParams) => Promise<void>;

export default function ApprovalTaskPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ApprovalTaskSaveParams>();
  const [commentForm] = Form.useForm<ApprovalTaskActionParams>();
  const [data, setData] = useState<ApprovalTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [instanceNo, setInstanceNo] = useState('');
  const [nodeNo, setNodeNo] = useState('');
  const [approverName, setApproverName] = useState('');
  const [taskStatus, setTaskStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ApprovalTaskStats>({});
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTitle, setCommentTitle] = useState('');
  const [commentAction, setCommentAction] = useState<TaskAction | null>(null);
  const [commentId, setCommentId] = useState<number | null>(null);
  const [commentSaving, setCommentSaving] = useState(false);

  const loadStats = useCallback(async () => {
    const res = await approvalTaskService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      iNo = instanceNo,
      nNo = nodeNo,
      aName = approverName,
      tStatus = taskStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await approvalTaskService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          instanceNo: iNo || undefined,
          nodeNo: nNo || undefined,
          approverName: aName || undefined,
          taskStatus: tStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, instanceNo, nodeNo, approverName, taskStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ taskStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: ApprovalTaskItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ApprovalTaskSaveParams = { ...values };
      if (editId == null) {
        await approvalTaskService.create(payload);
        message.success('审批任务已创建');
      } else {
        await approvalTaskService.update(editId, payload);
        message.success('审批任务已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await approvalTaskService.remove(id);
    message.success('审批任务已删除');
    void loadData();
    void loadStats();
  };

  const quickAct = async (fn: TaskAction, id: number, tip: string) => {
    await fn(id, {});
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const openComment = (title: string, action: TaskAction, id: number) => {
    setCommentTitle(title);
    setCommentAction(() => action);
    setCommentId(id);
    commentForm.resetFields();
    setCommentOpen(true);
  };

  const submitComment = async () => {
    const values = await commentForm.validateFields();
    if (commentId == null || !commentAction) return;
    setCommentSaving(true);
    try {
      await commentAction(commentId, { handleComment: values.handleComment });
      message.success(`${commentTitle}成功`);
      setCommentOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setCommentSaving(false);
    }
  };

  const columns: ColumnsType<ApprovalTaskItem> = [
    { title: '实例编号', dataIndex: 'instanceNo', width: 170, fixed: 'left', render: plain },
    { title: '节点编号', dataIndex: 'nodeNo', width: 150, render: plain },
    { title: '审批人', dataIndex: 'approverName', width: 120, render: plain },
    { title: '处理意见', dataIndex: 'handleComment', width: 200, ellipsis: true, render: plain },
    { title: '处理时间', dataIndex: 'handledTime', width: 160, render: formatDateTime },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'taskStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(APPROVAL_TASK_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(TASK_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => openComment('通过', approvalTaskService.approve, record.id)}>
              通过
            </Button>
            <Button type="link" size="small" onClick={() => openComment('驳回', approvalTaskService.reject, record.id)}>
              驳回
            </Button>
            <Popconfirm
              title="确认转办该审批任务？"
              onConfirm={() => void quickAct(approvalTaskService.transfer, record.id, '审批任务已转办')}
            >
              <Button type="link" size="small">
                转办
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认重置该审批任务？"
              onConfirm={() => void quickAct(approvalTaskService.reset, record.id, '审批任务已重置')}
            >
              <Button type="link" size="small">
                重置
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该审批任务？" onConfirm={() => void remove(record.id)}>
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
        审批任务
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="任务总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待处理" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d48806' }} />
          <Statistic title="已通过" value={Number(stats.approved ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已驳回" value={Number(stats.rejected ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="已转办" value={Number(stats.transferred ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="实例编号">
            <Input
              placeholder="请输入实例编号"
              allowClear
              style={{ width: 170 }}
              value={instanceNo}
              onChange={(e) => setInstanceNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="节点编号">
            <Input
              placeholder="请输入节点编号"
              allowClear
              style={{ width: 150 }}
              value={nodeNo}
              onChange={(e) => setNodeNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="审批人">
            <Input
              placeholder="请输入审批人姓名"
              allowClear
              style={{ width: 140 }}
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={taskStatus}
              onChange={(v) => setTaskStatus(v)}
              options={[...APPROVAL_TASK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="实例编号 / 节点编号"
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
                  void loadData(1, pageSize, keyword, instanceNo, nodeNo, approverName, taskStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInstanceNo('');
                  setNodeNo('');
                  setApproverName('');
                  setTaskStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(TASK_MANAGE) && <Button onClick={openCreate}>新建审批任务</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`审批任务（共 ${total} 条）`}>
        <Table<ApprovalTaskItem>
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
        title={editId == null ? '新建审批任务' : '编辑审批任务'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="instanceNo" label="实例编号" rules={[{ required: true, message: '请输入实例编号' }]}>
            <Input placeholder="请输入实例编号" />
          </Form.Item>
          <Form.Item name="nodeNo" label="节点编号" rules={[{ required: true, message: '请输入节点编号' }]}>
            <Input placeholder="请输入节点编号" />
          </Form.Item>
          <Form.Item name="approverId" label="审批人ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入审批人ID" />
          </Form.Item>
          <Form.Item name="approverName" label="审批人姓名">
            <Input placeholder="请输入审批人姓名" />
          </Form.Item>
          <Form.Item name="taskStatus" label="状态">
            <Select placeholder="请选择" options={[...APPROVAL_TASK_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="handleComment" label="处理意见">
            <Input.TextArea rows={2} placeholder="请输入处理意见" />
          </Form.Item>
          <Form.Item name="handledTime" label="处理时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
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

      <Modal
        title={`${commentTitle}审批任务`}
        open={commentOpen}
        onOk={() => void submitComment()}
        confirmLoading={commentSaving}
        onCancel={() => setCommentOpen(false)}
        destroyOnClose
        width={480}
      >
        <Form form={commentForm} layout="vertical" preserve={false}>
          <Form.Item name="handleComment" label="处理意见">
            <Input.TextArea rows={3} placeholder="请输入处理意见" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
