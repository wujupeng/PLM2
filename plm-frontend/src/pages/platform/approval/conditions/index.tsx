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
import { approvalConditionService } from '@/services/approvalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  APPROVAL_CONDITION_STATUS_LABEL,
  APPROVAL_CONDITION_STATUS_OPTIONS,
  APPROVAL_LOGIC_TYPE_LABEL,
  APPROVAL_LOGIC_TYPE_OPTIONS,
  APPROVAL_OPERATOR_LABEL,
  APPROVAL_OPERATOR_OPTIONS,
  type ApprovalConditionItem,
  type ApprovalConditionSaveParams,
  type ApprovalConditionStats,
} from '@/types/approval';

const { Title } = Typography;

const CONDITION_MANAGE = 'platform:approval:condition:manage';

export default function ApprovalConditionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ApprovalConditionSaveParams>();
  const [data, setData] = useState<ApprovalConditionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [flowCode, setFlowCode] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [compareOperator, setCompareOperator] = useState<string | undefined>(undefined);
  const [logicType, setLogicType] = useState<string | undefined>(undefined);
  const [conditionStatus, setConditionStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ApprovalConditionStats>({});

  const loadStats = useCallback(async () => {
    const res = await approvalConditionService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      fCode = flowCode,
      fKey = fieldKey,
      cOperator = compareOperator,
      lType = logicType,
      cStatus = conditionStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await approvalConditionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          flowCode: fCode || undefined,
          fieldKey: fKey || undefined,
          compareOperator: cOperator,
          logicType: lType,
          conditionStatus: cStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, flowCode, fieldKey, compareOperator, logicType, conditionStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ conditionStatus: 'ACTIVE', logicType: 'AND', compareOperator: 'EQ' });
    setOpen(true);
  };

  const openEdit = (record: ApprovalConditionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ApprovalConditionSaveParams = { ...values };
      if (editId == null) {
        await approvalConditionService.create(payload);
        message.success('审批条件已创建');
      } else {
        await approvalConditionService.update(editId, payload);
        message.success('审批条件已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await approvalConditionService.remove(id);
    message.success('审批条件已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<ApprovalConditionItem> = [
    { title: '流程编码', dataIndex: 'flowCode', width: 160, fixed: 'left', render: plain },
    { title: '序号', dataIndex: 'seqNo', width: 100, render: plain },
    { title: '条件字段', dataIndex: 'fieldKey', width: 160, render: plain },
    {
      title: '比较运算符',
      dataIndex: 'compareOperator',
      width: 130,
      render: (v) => enumText(APPROVAL_OPERATOR_LABEL, v),
    },
    { title: '比较值', dataIndex: 'compareValue', width: 160, ellipsis: true, render: plain },
    {
      title: '逻辑类型',
      dataIndex: 'logicType',
      width: 110,
      render: (v) => enumText(APPROVAL_LOGIC_TYPE_LABEL, v),
    },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'conditionStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(APPROVAL_CONDITION_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(CONDITION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该审批条件？"
              onConfirm={() => void act(approvalConditionService.enable, record.id, '审批条件已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该审批条件？"
              onConfirm={() => void act(approvalConditionService.disable, record.id, '审批条件已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该审批条件？" onConfirm={() => void remove(record.id)}>
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
        审批条件
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="条件总数" value={Number(stats.total ?? 0)} />
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
          <Form.Item label="条件字段">
            <Input
              placeholder="请输入条件字段"
              allowClear
              style={{ width: 160 }}
              value={fieldKey}
              onChange={(e) => setFieldKey(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="比较运算符">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={compareOperator}
              onChange={(v) => setCompareOperator(v)}
              options={[...APPROVAL_OPERATOR_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="逻辑类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              value={logicType}
              onChange={(v) => setLogicType(v)}
              options={[...APPROVAL_LOGIC_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={conditionStatus}
              onChange={(v) => setConditionStatus(v)}
              options={[...APPROVAL_CONDITION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="流程编码 / 条件字段"
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
                    fieldKey,
                    compareOperator,
                    logicType,
                    conditionStatus,
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
                  setFieldKey('');
                  setCompareOperator(undefined);
                  setLogicType(undefined);
                  setConditionStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(CONDITION_MANAGE) && <Button onClick={openCreate}>新建审批条件</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`审批条件（共 ${total} 条）`}>
        <Table<ApprovalConditionItem>
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
        title={editId == null ? '新建审批条件' : '编辑审批条件'}
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
          <Form.Item name="seqNo" label="序号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入序号" />
          </Form.Item>
          <Form.Item name="fieldKey" label="条件字段" rules={[{ required: true, message: '请输入条件字段' }]}>
            <Input placeholder="请输入条件字段" />
          </Form.Item>
          <Form.Item name="compareOperator" label="比较运算符">
            <Select placeholder="请选择" options={[...APPROVAL_OPERATOR_OPTIONS]} />
          </Form.Item>
          <Form.Item name="compareValue" label="比较值">
            <Input placeholder="请输入比较值" />
          </Form.Item>
          <Form.Item name="logicType" label="逻辑类型">
            <Select placeholder="请选择" options={[...APPROVAL_LOGIC_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="conditionStatus" label="状态">
            <Select placeholder="请选择" options={[...APPROVAL_CONDITION_STATUS_OPTIONS]} />
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
