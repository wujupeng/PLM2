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
import { approvalInstanceService } from '@/services/approvalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  APPROVAL_INSTANCE_STATUS_LABEL,
  APPROVAL_INSTANCE_STATUS_OPTIONS,
  type ApprovalInstanceItem,
  type ApprovalInstanceSaveParams,
  type ApprovalInstanceStats,
} from '@/types/approval';

const { Title } = Typography;

const INSTANCE_MANAGE = 'platform:approval:instance:manage';

export default function ApprovalInstancePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ApprovalInstanceSaveParams>();
  const [data, setData] = useState<ApprovalInstanceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [flowCode, setFlowCode] = useState('');
  const [docType, setDocType] = useState('');
  const [docNo, setDocNo] = useState('');
  const [instanceStatus, setInstanceStatus] = useState<string | undefined>(undefined);
  const [submitterName, setSubmitterName] = useState('');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ApprovalInstanceStats>({});

  const loadStats = useCallback(async () => {
    const res = await approvalInstanceService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      fCode = flowCode,
      dType = docType,
      dNo = docNo,
      iStatus = instanceStatus,
      sName = submitterName,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await approvalInstanceService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          flowCode: fCode || undefined,
          docType: dType || undefined,
          docNo: dNo || undefined,
          instanceStatus: iStatus,
          submitterName: sName || undefined,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, flowCode, docType, docNo, instanceStatus, submitterName, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', undefined, '', null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ instanceStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: ApprovalInstanceItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ApprovalInstanceSaveParams = { ...values };
      if (editId == null) {
        await approvalInstanceService.create(payload);
        message.success('审批实例已创建');
      } else {
        await approvalInstanceService.update(editId, payload);
        message.success('审批实例已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await approvalInstanceService.remove(id);
    message.success('审批实例已删除');
    void loadData();
    void loadStats();
  };

  const cancel = async (id: number) => {
    await approvalInstanceService.cancel(id);
    message.success('审批实例已取消');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ApprovalInstanceItem> = [
    { title: '流程编码', dataIndex: 'flowCode', width: 160, fixed: 'left', render: plain },
    { title: '单据类型', dataIndex: 'docType', width: 140, render: plain },
    { title: '单据号', dataIndex: 'docNo', width: 160, render: plain },
    { title: '单据标题', dataIndex: 'bizTitle', width: 180, ellipsis: true, render: plain },
    { title: '提交人', dataIndex: 'submitterName', width: 120, render: plain },
    { title: '提交时间', dataIndex: 'submitTime', width: 160, render: formatDateTime },
    { title: '当前节点', dataIndex: 'currentNode', width: 140, render: plain },
    { title: '完成时间', dataIndex: 'finishedTime', width: 160, render: formatDateTime },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'instanceStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(APPROVAL_INSTANCE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(INSTANCE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认取消该审批实例？" onConfirm={() => void cancel(record.id)}>
              <Button type="link" size="small">
                取消
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该审批实例？" onConfirm={() => void remove(record.id)}>
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
        审批实例
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="实例总数" value={Number(stats.total ?? 0)} />
          <Statistic title="审批中" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d48806' }} />
          <Statistic title="已通过" value={Number(stats.approved ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已驳回" value={Number(stats.rejected ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="已取消" value={Number(stats.canceled ?? 0)} />
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
          <Form.Item label="单据类型">
            <Input
              placeholder="请输入单据类型"
              allowClear
              style={{ width: 140 }}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="单据号">
            <Input
              placeholder="请输入单据号"
              allowClear
              style={{ width: 160 }}
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={instanceStatus}
              onChange={(v) => setInstanceStatus(v)}
              options={[...APPROVAL_INSTANCE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="提交人">
            <Input
              placeholder="请输入提交人姓名"
              allowClear
              style={{ width: 140 }}
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="提交日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="单据号 / 标题"
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
                    docType,
                    docNo,
                    instanceStatus,
                    submitterName,
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
                  setDocType('');
                  setDocNo('');
                  setInstanceStatus(undefined);
                  setSubmitterName('');
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', undefined, '', null);
                }}
              >
                重置
              </Button>
              {hasPermission(INSTANCE_MANAGE) && <Button onClick={openCreate}>新建审批实例</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`审批实例（共 ${total} 条）`}>
        <Table<ApprovalInstanceItem>
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
        title={editId == null ? '新建审批实例' : '编辑审批实例'}
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
          <Form.Item name="docType" label="单据类型" rules={[{ required: true, message: '请输入单据类型' }]}>
            <Input placeholder="请输入单据类型" />
          </Form.Item>
          <Form.Item name="docNo" label="单据号" rules={[{ required: true, message: '请输入单据号' }]}>
            <Input placeholder="请输入单据号" />
          </Form.Item>
          <Form.Item name="bizTitle" label="单据标题">
            <Input placeholder="请输入单据标题" />
          </Form.Item>
          <Form.Item name="submitterId" label="提交人ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入提交人ID" />
          </Form.Item>
          <Form.Item name="submitterName" label="提交人姓名">
            <Input placeholder="请输入提交人姓名" />
          </Form.Item>
          <Form.Item name="submitTime" label="提交时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="currentNode" label="当前节点">
            <Input placeholder="请输入当前节点" />
          </Form.Item>
          <Form.Item name="instanceStatus" label="状态">
            <Select placeholder="请选择" options={[...APPROVAL_INSTANCE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="finishedTime" label="完成时间">
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
    </Space>
  );
}
