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
import { approvalFlowService } from '@/services/approvalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  APPROVAL_FLOW_STATUS_LABEL,
  APPROVAL_FLOW_STATUS_OPTIONS,
  type ApprovalFlowItem,
  type ApprovalFlowSaveParams,
  type ApprovalFlowStats,
} from '@/types/approval';

const { Title } = Typography;

const FLOW_MANAGE = 'platform:approval:flow:manage';

export default function ApprovalFlowPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ApprovalFlowSaveParams>();
  const [data, setData] = useState<ApprovalFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [flowCode, setFlowCode] = useState('');
  const [flowName, setFlowName] = useState('');
  const [docType, setDocType] = useState('');
  const [bizModule, setBizModule] = useState('');
  const [flowStatus, setFlowStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ApprovalFlowStats>({});

  const loadStats = useCallback(async () => {
    const res = await approvalFlowService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      fCode = flowCode,
      fName = flowName,
      dType = docType,
      bModule = bizModule,
      fStatus = flowStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await approvalFlowService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          flowCode: fCode || undefined,
          flowName: fName || undefined,
          docType: dType || undefined,
          bizModule: bModule || undefined,
          flowStatus: fStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, flowCode, flowName, docType, bizModule, flowStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', '', undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ flowStatus: 'ACTIVE', priority: 100 });
    setOpen(true);
  };

  const openEdit = (record: ApprovalFlowItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ApprovalFlowSaveParams = { ...values };
      if (editId == null) {
        await approvalFlowService.create(payload);
        message.success('审批流定义已创建');
      } else {
        await approvalFlowService.update(editId, payload);
        message.success('审批流定义已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await approvalFlowService.remove(id);
    message.success('审批流定义已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ApprovalFlowItem> = [
    { title: '流程编码', dataIndex: 'flowCode', width: 160, fixed: 'left', render: plain },
    { title: '流程名称', dataIndex: 'flowName', width: 180, render: plain },
    { title: '单据类型', dataIndex: 'docType', width: 140, render: plain },
    { title: '业务模块', dataIndex: 'bizModule', width: 140, render: plain },
    { title: '条件表达式', dataIndex: 'conditionExpr', width: 200, ellipsis: true, render: plain },
    { title: '优先级', dataIndex: 'priority', width: 100, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'flowStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(APPROVAL_FLOW_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(FLOW_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该审批流定义？"
              onConfirm={() => void act(approvalFlowService.enable, record.id, '审批流定义已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该审批流定义？"
              onConfirm={() => void act(approvalFlowService.disable, record.id, '审批流定义已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该审批流定义？" onConfirm={() => void remove(record.id)}>
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
        审批流定义
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="流程总数" value={Number(stats.total ?? 0)} />
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
          <Form.Item label="流程名称">
            <Input
              placeholder="请输入流程名称"
              allowClear
              style={{ width: 160 }}
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="单据类型">
            <Input
              placeholder="请输入单据类型"
              allowClear
              style={{ width: 140 }}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="业务模块">
            <Input
              placeholder="请输入业务模块"
              allowClear
              style={{ width: 140 }}
              value={bizModule}
              onChange={(e) => setBizModule(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={flowStatus}
              onChange={(v) => setFlowStatus(v)}
              options={[...APPROVAL_FLOW_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="流程编码 / 名称"
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
                  void loadData(1, pageSize, keyword, flowCode, flowName, docType, bizModule, flowStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFlowCode('');
                  setFlowName('');
                  setDocType('');
                  setBizModule('');
                  setFlowStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', '', undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(FLOW_MANAGE) && <Button onClick={openCreate}>新建审批流</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`审批流定义（共 ${total} 条）`}>
        <Table<ApprovalFlowItem>
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
        title={editId == null ? '新建审批流' : '编辑审批流'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="flowCode" label="流程编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="flowName" label="流程名称" rules={[{ required: true, message: '请输入流程名称' }]}>
            <Input placeholder="请输入流程名称" />
          </Form.Item>
          <Form.Item name="docType" label="单据类型" rules={[{ required: true, message: '请输入单据类型' }]}>
            <Input placeholder="请输入单据类型" />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Input placeholder="请输入业务模块" />
          </Form.Item>
          <Form.Item name="conditionExpr" label="条件表达式">
            <Input.TextArea rows={2} placeholder="请输入条件表达式" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入优先级" />
          </Form.Item>
          <Form.Item name="flowStatus" label="状态">
            <Select placeholder="请选择" options={[...APPROVAL_FLOW_STATUS_OPTIONS]} />
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
