import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { mesCollectRuleService as service } from '@/services/mesCollectService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_COLLECT_RULE_ACTION_LABEL,
  MES_COLLECT_RULE_ACTION_OPTIONS,
  MES_COLLECT_RULE_TYPE_LABEL,
  MES_COLLECT_RULE_TYPE_OPTIONS,
  type MesCollectRule,
  type MesCollectRuleQuery,
  type MesCollectRuleSaveRequest,
} from '@/types/mesCollect';

const { Title } = Typography;

const MANAGE = 'mes:collect:rule:manage';

export default function MesCollectRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MesCollectRuleSaveRequest>();
  const [data, setData] = useState<MesCollectRule[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [ruleType, setRuleType] = useState<string | undefined>(undefined);
  const [ruleAction, setRuleAction] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = ruleType,
      action = ruleAction,
    ) => {
      setLoading(true);
      try {
        const params: MesCollectRuleQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          ruleType: type,
          ruleAction: action,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, ruleType, ruleAction],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ ruleType: 'RANGE', ruleAction: 'WARN', ruleStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesCollectRule) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesCollectRuleSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('校验规则已创建');
      } else {
        await service.update(editId, payload);
        message.success('校验规则已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('校验规则已删除');
    void loadData();
  };

  const columns: ColumnsType<MesCollectRule> = [
    { title: '规则编号', dataIndex: 'ruleNo', width: 190, fixed: 'left', render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 170, render: plain },
    { title: '数据点编码', dataIndex: 'pointCode', width: 160, render: plain },
    {
      title: '校验类型',
      dataIndex: 'ruleType',
      width: 130,
      render: (v) => statusTag(MES_COLLECT_RULE_TYPE_LABEL, v),
    },
    { title: '最小值', dataIndex: 'minValue', width: 120, render: plain },
    { title: '最大值', dataIndex: 'maxValue', width: 120, render: plain },
    { title: '校验表达式', dataIndex: 'expression', width: 200, render: plain },
    { title: '时间戳容差(秒)', dataIndex: 'timestampTolerance', width: 130, render: plain },
    {
      title: '处理动作',
      dataIndex: 'ruleAction',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_RULE_ACTION_LABEL, v),
    },
    { title: '规则状态', dataIndex: 'ruleStatus', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该校验规则？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        校验规则
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="校验类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={ruleType}
              onChange={(v) => setRuleType(v)}
              options={[...MES_COLLECT_RULE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="处理动作">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={ruleAction}
              onChange={(v) => setRuleAction(v)}
              options={[...MES_COLLECT_RULE_ACTION_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编号 / 规则名称 / 数据点编码 / 表达式"
              allowClear
              style={{ width: 400 }}
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
                  void loadData(1, pageSize, keyword, ruleType, ruleAction);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRuleType(undefined);
                  setRuleAction(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建校验规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`校验规则（共 ${total} 条）`}>
        <Table<MesCollectRule>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1770 }}
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
        title={editId == null ? '新建校验规则' : '编辑校验规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleNo" label="规则编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称">
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="pointCode" label="数据点编码" rules={[{ required: true, message: '请输入数据点编码' }]}>
            <Input placeholder="请输入数据点编码" />
          </Form.Item>
          <Form.Item name="ruleType" label="校验类型">
            <Select placeholder="为空默认 RANGE" options={[...MES_COLLECT_RULE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="minValue" label="最小值">
            <InputNumber style={{ width: '100%' }} placeholder="请输入最小值" />
          </Form.Item>
          <Form.Item name="maxValue" label="最大值">
            <InputNumber style={{ width: '100%' }} placeholder="请输入最大值" />
          </Form.Item>
          <Form.Item name="expression" label="校验表达式">
            <Input placeholder="请输入校验表达式" />
          </Form.Item>
          <Form.Item name="timestampTolerance" label="时间戳容差(秒)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入时间戳容差" />
          </Form.Item>
          <Form.Item name="ruleAction" label="处理动作">
            <Select placeholder="为空默认 WARN" options={[...MES_COLLECT_RULE_ACTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ruleStatus" label="规则状态">
            <Input placeholder="为空默认 DRAFT" />
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
