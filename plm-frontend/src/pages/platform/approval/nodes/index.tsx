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
import { approvalNodeService } from '@/services/approvalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { boolTag, statusTag } from '@/pages/platform/approval/shared';
import {
  APPROVAL_ALLOW_TRANSFER_OPTIONS,
  APPROVAL_NODE_STATUS_LABEL,
  APPROVAL_NODE_STATUS_OPTIONS,
  APPROVE_MODE_LABEL,
  APPROVE_MODE_OPTIONS,
  APPROVER_TYPE_LABEL,
  APPROVER_TYPE_OPTIONS,
  type ApprovalNodeItem,
  type ApprovalNodeSaveParams,
  type ApprovalNodeStats,
} from '@/types/approval';

const { Title } = Typography;

const NODE_MANAGE = 'platform:approval:node:manage';

export default function ApprovalNodePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ApprovalNodeSaveParams>();
  const [data, setData] = useState<ApprovalNodeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [flowCode, setFlowCode] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [approverType, setApproverType] = useState<string | undefined>(undefined);
  const [approveMode, setApproveMode] = useState<string | undefined>(undefined);
  const [nodeStatus, setNodeStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ApprovalNodeStats>({});

  const loadStats = useCallback(async () => {
    const res = await approvalNodeService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      fCode = flowCode,
      nName = nodeName,
      aType = approverType,
      aMode = approveMode,
      nStatus = nodeStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await approvalNodeService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          flowCode: fCode || undefined,
          nodeName: nName || undefined,
          approverType: aType,
          approveMode: aMode,
          nodeStatus: nStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, flowCode, nodeName, approverType, approveMode, nodeStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ nodeStatus: 'ACTIVE', approverType: 'ROLE', approveMode: 'ANY', allowTransfer: 0 });
    setOpen(true);
  };

  const openEdit = (record: ApprovalNodeItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ApprovalNodeSaveParams = { ...values };
      if (editId == null) {
        await approvalNodeService.create(payload);
        message.success('审批节点已创建');
      } else {
        await approvalNodeService.update(editId, payload);
        message.success('审批节点已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await approvalNodeService.remove(id);
    message.success('审批节点已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ApprovalNodeItem> = [
    { title: '流程编码', dataIndex: 'flowCode', width: 160, fixed: 'left', render: plain },
    { title: '节点顺序', dataIndex: 'nodeOrder', width: 110, render: plain },
    { title: '节点名称', dataIndex: 'nodeName', width: 160, render: plain },
    {
      title: '审批人类型',
      dataIndex: 'approverType',
      width: 130,
      render: (v) => enumText(APPROVER_TYPE_LABEL, v),
    },
    { title: '审批人值', dataIndex: 'approverValue', width: 160, ellipsis: true, render: plain },
    {
      title: '审批方式',
      dataIndex: 'approveMode',
      width: 110,
      render: (v) => enumText(APPROVE_MODE_LABEL, v),
    },
    { title: '允许转办', dataIndex: 'allowTransfer', width: 100, render: (v) => boolTag(v) },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'nodeStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(APPROVAL_NODE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(NODE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该审批节点？"
              onConfirm={() => void act(approvalNodeService.enable, record.id, '审批节点已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该审批节点？"
              onConfirm={() => void act(approvalNodeService.disable, record.id, '审批节点已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该审批节点？" onConfirm={() => void remove(record.id)}>
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
        审批节点
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="节点总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="流程编码">
            <Input
              placeholder="请输入流程编码"
              allowClear
              style={{ width: 160 }}
              value={flowCode}
              onChange={(e) => setFlowCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="节点名称">
            <Input
              placeholder="请输入节点名称"
              allowClear
              style={{ width: 160 }}
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="审批人类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={approverType}
              onChange={(v) => setApproverType(v)}
              options={[...APPROVER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="审批方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              value={approveMode}
              onChange={(v) => setApproveMode(v)}
              options={[...APPROVE_MODE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={nodeStatus}
              onChange={(v) => setNodeStatus(v)}
              options={[...APPROVAL_NODE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="流程编码 / 节点名称"
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
                  void loadData(
                    1,
                    pageSize,
                    keyword,
                    flowCode,
                    nodeName,
                    approverType,
                    approveMode,
                    nodeStatus,
                    range,
                  );
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFlowCode('');
                  setNodeName('');
                  setApproverType(undefined);
                  setApproveMode(undefined);
                  setNodeStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(NODE_MANAGE) && <Button onClick={openCreate}>新建审批节点</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`审批节点（共 ${total} 条）`}>
        <Table<ApprovalNodeItem>
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
        title={editId == null ? '新建审批节点' : '编辑审批节点'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="flowCode" label="流程编码" rules={[{ required: true, message: '请输入流程编码' }]}>
            <Input placeholder="请输入流程编码" />
          </Form.Item>
          <Form.Item name="nodeOrder" label="节点顺序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入节点顺序" />
          </Form.Item>
          <Form.Item name="nodeName" label="节点名称" rules={[{ required: true, message: '请输入节点名称' }]}>
            <Input placeholder="请输入节点名称" />
          </Form.Item>
          <Form.Item name="approverType" label="审批人类型">
            <Select placeholder="请选择" options={[...APPROVER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="approverValue" label="审批人值">
            <Input placeholder="请输入审批人值" />
          </Form.Item>
          <Form.Item name="approveMode" label="审批方式">
            <Select placeholder="请选择" options={[...APPROVE_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="allowTransfer" label="允许转办">
            <Select placeholder="请选择" options={[...APPROVAL_ALLOW_TRANSFER_OPTIONS]} />
          </Form.Item>
          <Form.Item name="nodeStatus" label="状态">
            <Select placeholder="请选择" options={[...APPROVAL_NODE_STATUS_OPTIONS]} />
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
    </Space>
  );
}
