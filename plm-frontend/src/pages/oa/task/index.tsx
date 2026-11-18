import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { oaTaskService } from '@/services/oaService';
import InstanceDetailModal from '@/pages/oa/InstanceDetailModal';
import { useAuthStore } from '@/stores/authStore';
import {
  OA_TASK_ACTION_COLOR,
  OA_TASK_ACTION_LABEL,
  OA_TASK_STATUS_COLOR,
  OA_TASK_STATUS_LABEL,
  type OaTaskItem,
  type OaTaskQuery,
} from '@/types/oa';

const { Title } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function OaTodoPanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [data, setData] = useState<OaTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState<string | undefined>(undefined);

  const [currentTask, setCurrentTask] = useState<OaTaskItem | null>(null);
  const [comment, setComment] = useState('');
  const [approveOpen, setApproveOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailId, setDetailId] = useState<number | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword) => {
      setLoading(true);
      try {
        const params: OaTaskQuery = { pageNum: page, pageSize: size, keyword: kw || undefined };
        const res = await oaTaskService.todo(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword],
  );

  useEffect(() => {
    void loadData(1, pageSize, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (value: string) => {
    const kw = value || undefined;
    setKeyword(kw);
    setPageNum(1);
    void loadData(1, pageSize, kw);
  };

  const openApprove = (record: OaTaskItem) => {
    setCurrentTask(record);
    setComment('');
    setApproveOpen(true);
  };

  const handleApprove = async (action: 'APPROVE' | 'REJECT') => {
    if (!currentTask) return;
    setSubmitting(true);
    try {
      await oaTaskService.approve(currentTask.taskId, {
        action,
        commentText: comment || undefined,
      });
      message.success(action === 'APPROVE' ? '已同意' : '已驳回');
      setApproveOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (record: OaTaskItem) => {
    setDetailId(record.instanceId);
    setDetailOpen(true);
  };

  const columns: ColumnsType<OaTaskItem> = [
    { title: '实例编号', dataIndex: 'instanceNo', width: 180, render: (v, r) => v || r.instanceId || '-' },
    { title: '流程名称', dataIndex: 'processName', width: 160, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    { title: '当前节点', dataIndex: 'nodeName', width: 140, render: (v, r) => v || r.nodeCode || '-' },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'taskStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={OA_TASK_STATUS_COLOR[v]}>{OA_TASK_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '到达时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '处理时限',
      dataIndex: 'dueAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:task:approve') && record.taskStatus === 'PENDING' && (
            <Button type="link" size="small" onClick={() => openApprove(record)}>
              处理
            </Button>
          )}
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <Input.Search
          placeholder="实例编号 / 标题 / 流程"
          allowClear
          style={{ width: 260 }}
          onSearch={onSearch}
        />
        <Button onClick={() => void loadData()}>刷新</Button>
      </Space>

      <Table<OaTaskItem>
        rowKey="taskId"
        loading={loading}
        columns={columns}
        dataSource={data}
        scroll={{ x: 1400 }}
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

      <Modal
        title="处理审批任务"
        open={approveOpen}
        onCancel={() => setApproveOpen(false)}
        destroyOnClose
        width={640}
        footer={[
          <Button key="cancel" onClick={() => setApproveOpen(false)}>
            取消
          </Button>,
          <Button
            key="reject"
            danger
            loading={submitting}
            onClick={() => void handleApprove('REJECT')}
          >
            驳回
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={submitting}
            onClick={() => void handleApprove('APPROVE')}
          >
            同意
          </Button>,
        ]}
      >
        {currentTask && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="实例编号">{currentTask.instanceNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="流程名称">{currentTask.processName || '-'}</Descriptions.Item>
              <Descriptions.Item label="标题" span={2}>
                {currentTask.title || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="当前节点">
                {currentTask.nodeName || currentTask.nodeCode || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="申请人">{currentTask.applicantName || '-'}</Descriptions.Item>
              <Descriptions.Item label="到达时间">
                {currentTask.createdAt ? dayjs(currentTask.createdAt).format(DATETIME_FORMAT) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="处理时限">
                {currentTask.dueAt ? dayjs(currentTask.dueAt).format(DATETIME_FORMAT) : '-'}
              </Descriptions.Item>
            </Descriptions>
            <Input.TextArea
              rows={3}
              placeholder="请输入审批意见"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Space>
        )}
      </Modal>

      <InstanceDetailModal
        open={detailOpen}
        instanceId={detailId}
        onClose={() => setDetailOpen(false)}
      />
    </Space>
  );
}

function OaDonePanel() {
  const [data, setData] = useState<OaTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState<string | undefined>(undefined);

  const [detailId, setDetailId] = useState<number | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword) => {
      setLoading(true);
      try {
        const params: OaTaskQuery = { pageNum: page, pageSize: size, keyword: kw || undefined };
        const res = await oaTaskService.done(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword],
  );

  useEffect(() => {
    void loadData(1, pageSize, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (value: string) => {
    const kw = value || undefined;
    setKeyword(kw);
    setPageNum(1);
    void loadData(1, pageSize, kw);
  };

  const openDetail = (record: OaTaskItem) => {
    setDetailId(record.instanceId);
    setDetailOpen(true);
  };

  const columns: ColumnsType<OaTaskItem> = [
    { title: '实例编号', dataIndex: 'instanceNo', width: 180, render: (v, r) => v || r.instanceId || '-' },
    { title: '流程名称', dataIndex: 'processName', width: 160, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    { title: '处理节点', dataIndex: 'nodeName', width: 140, render: (v, r) => v || r.nodeCode || '-' },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: (v) => v || '-' },
    {
      title: '处理动作',
      dataIndex: 'action',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={OA_TASK_ACTION_COLOR[v] || 'default'}>{OA_TASK_ACTION_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={OA_TASK_STATUS_COLOR[v]}>{OA_TASK_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '审批意见', dataIndex: 'commentText', width: 200, render: (v) => v || '-' },
    {
      title: '处理时间',
      dataIndex: 'handledAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <Input.Search placeholder="实例编号 / 标题 / 流程" allowClear style={{ width: 260 }} onSearch={onSearch} />
        <Button onClick={() => void loadData()}>刷新</Button>
      </Space>

      <Table<OaTaskItem>
        rowKey="taskId"
        loading={loading}
        columns={columns}
        dataSource={data}
        scroll={{ x: 1500 }}
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

      <InstanceDetailModal
        open={detailOpen}
        instanceId={detailId}
        onClose={() => setDetailOpen(false)}
      />
    </Space>
  );
}

export default function OaTaskPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        我的待办
      </Title>
      <Card>
        <Tabs
          items={[
            { key: 'todo', label: '待办任务', children: <OaTodoPanel /> },
            { key: 'done', label: '已办任务', children: <OaDonePanel /> },
          ]}
        />
      </Card>
    </Space>
  );
}
