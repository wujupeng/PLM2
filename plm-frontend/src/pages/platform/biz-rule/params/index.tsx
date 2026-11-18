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
import { bizRuleParamService } from '@/services/bizRuleService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/biz-rule/shared';
import {
  RULE_PARAM_STATUS_LABEL,
  RULE_PARAM_STATUS_OPTIONS,
  RULE_VALUE_TYPE_LABEL,
  RULE_VALUE_TYPE_OPTIONS,
  type BizRuleParamItem,
  type BizRuleParamSaveParams,
  type BizRuleParamStats,
} from '@/types/bizRule';

const { Title } = Typography;

const PARAM_MANAGE = 'platform:bizrule:param:manage';

export default function BizRuleParamPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BizRuleParamSaveParams>();
  const [data, setData] = useState<BizRuleParamItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [paramKey, setParamKey] = useState('');
  const [valueType, setValueType] = useState<string | undefined>(undefined);
  const [paramStatus, setParamStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<BizRuleParamStats>({});

  const loadStats = useCallback(async () => {
    const res = await bizRuleParamService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rCode = ruleCode,
      pKey = paramKey,
      vType = valueType,
      pStatus = paramStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await bizRuleParamService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          ruleCode: rCode || undefined,
          paramKey: pKey || undefined,
          valueType: vType,
          paramStatus: pStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, ruleCode, paramKey, valueType, paramStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ valueType: 'STRING', paramStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: BizRuleParamItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: BizRuleParamSaveParams = { ...values };
      if (editId == null) {
        await bizRuleParamService.create(payload);
        message.success('规则参数已创建');
      } else {
        await bizRuleParamService.update(editId, payload);
        message.success('规则参数已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await bizRuleParamService.remove(id);
    message.success('规则参数已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<BizRuleParamItem> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 160, fixed: 'left', render: plain },
    { title: '参数键', dataIndex: 'paramKey', width: 160, render: plain },
    { title: '参数名称', dataIndex: 'paramName', width: 160, render: plain },
    { title: '参数值', dataIndex: 'paramValue', width: 180, ellipsis: true, render: plain },
    { title: '值类型', dataIndex: 'valueType', width: 110, render: (v) => statusTag(RULE_VALUE_TYPE_LABEL, v) },
    { title: '排序号', dataIndex: 'seqNo', width: 100, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'paramStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(RULE_PARAM_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(PARAM_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该规则参数？"
              onConfirm={() => void act(bizRuleParamService.enable, record.id, '规则参数已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该规则参数？"
              onConfirm={() => void act(bizRuleParamService.disable, record.id, '规则参数已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该规则参数？" onConfirm={() => void remove(record.id)}>
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
        规则参数
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="参数总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="规则编码">
            <Input
              placeholder="请输入规则编码"
              allowClear
              style={{ width: 160 }}
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="参数键">
            <Input
              placeholder="请输入参数键"
              allowClear
              style={{ width: 160 }}
              value={paramKey}
              onChange={(e) => setParamKey(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="值类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={valueType}
              onChange={(v) => setValueType(v)}
              options={[...RULE_VALUE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={paramStatus}
              onChange={(v) => setParamStatus(v)}
              options={[...RULE_PARAM_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="参数键 / 名称"
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
                  void loadData(1, pageSize, keyword, ruleCode, paramKey, valueType, paramStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRuleCode('');
                  setParamKey('');
                  setValueType(undefined);
                  setParamStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(PARAM_MANAGE) && <Button onClick={openCreate}>新建规则参数</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`规则参数（共 ${total} 条）`}>
        <Table<BizRuleParamItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建规则参数' : '编辑规则参数'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true, message: '请输入规则编码' }]}>
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="paramKey" label="参数键" rules={[{ required: true, message: '请输入参数键' }]}>
            <Input placeholder="请输入参数键" />
          </Form.Item>
          <Form.Item name="paramName" label="参数名称">
            <Input placeholder="请输入参数名称" />
          </Form.Item>
          <Form.Item name="paramValue" label="参数值">
            <Input.TextArea rows={2} placeholder="请输入参数值" />
          </Form.Item>
          <Form.Item name="valueType" label="值类型">
            <Select placeholder="请选择" options={[...RULE_VALUE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="seqNo" label="排序号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序号" />
          </Form.Item>
          <Form.Item name="paramStatus" label="状态">
            <Select placeholder="请选择" options={[...RULE_PARAM_STATUS_OPTIONS]} />
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
