import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
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
import { iamSodRuleService } from '@/services/iamService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/iam/shared';
import {
  IAM_BIZ_MODULE_LABEL,
  IAM_BIZ_MODULE_OPTIONS,
  IAM_RISK_LEVEL_LABEL,
  IAM_RISK_LEVEL_OPTIONS,
  IAM_RULE_STATUS_LABEL,
  IAM_RULE_STATUS_OPTIONS,
  type IamSodRuleItem,
  type IamSodRuleSaveParams,
  type IamSodRuleStats,
} from '@/types/iam';

const { Title } = Typography;

const SOD_RULE_MANAGE = 'platform:iam:sodrule:manage';

export default function IamSodRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IamSodRuleSaveParams>();
  const [data, setData] = useState<IamSodRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizModule, setBizModule] = useState<string | undefined>(undefined);
  const [riskLevel, setRiskLevel] = useState<string | undefined>(undefined);
  const [ruleStatus, setRuleStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<IamSodRuleStats>({});

  const loadStats = useCallback(async () => {
    const res = await iamSodRuleService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, module = bizModule, risk = riskLevel, rstatus = ruleStatus, rg = range) => {
      setLoading(true);
      try {
        const res = await iamSodRuleService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizModule: module,
          riskLevel: risk,
          ruleStatus: rstatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizModule, riskLevel, ruleStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ bizModule: 'PLM', riskLevel: 'HIGH', ruleStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: IamSodRuleItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IamSodRuleSaveParams = { ...values, ruleName: values.ruleName! };
      if (editId == null) {
        await iamSodRuleService.create(payload);
        message.success('职责分离规则已创建');
      } else {
        await iamSodRuleService.update(editId, payload);
        message.success('职责分离规则已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await iamSodRuleService.remove(id);
    message.success('职责分离规则已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<IamSodRuleItem> = [
    { title: '规则编号', dataIndex: 'ruleNo', width: 170, fixed: 'left', render: plain },
    { title: '规则名称', dataIndex: 'ruleName', width: 180, render: plain },
    { title: '业务模块', dataIndex: 'bizModule', width: 130, render: (v) => enumText(IAM_BIZ_MODULE_LABEL, v) },
    { title: '互斥角色 A', dataIndex: 'conflictRoleA', width: 140, render: plain },
    { title: '互斥角色 B', dataIndex: 'conflictRoleB', width: 140, render: plain },
    { title: '互斥权限 A', dataIndex: 'conflictPermA', width: 150, ellipsis: true, render: plain },
    { title: '互斥权限 B', dataIndex: 'conflictPermB', width: 150, ellipsis: true, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '风险级别', dataIndex: 'riskLevel', width: 110, render: (v) => statusTag(IAM_RISK_LEVEL_LABEL, v) },
    {
      title: '规则状态',
      dataIndex: 'ruleStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(IAM_RULE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(SOD_RULE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该职责分离规则？"
              onConfirm={() => void act(iamSodRuleService.enable, record.id, '规则已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该职责分离规则？"
              onConfirm={() => void act(iamSodRuleService.disable, record.id, '规则已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该职责分离规则？" onConfirm={() => void remove(record.id)}>
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
        职责分离规则
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="规则总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
          <Statistic title="高风险" value={Number(stats.highRisk ?? 0)} valueStyle={{ color: '#cf1322' }} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="业务模块">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              value={bizModule}
              onChange={(v) => setBizModule(v)}
              options={[...IAM_BIZ_MODULE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="风险级别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={riskLevel}
              onChange={(v) => setRiskLevel(v)}
              options={[...IAM_RISK_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="规则状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={ruleStatus}
              onChange={(v) => setRuleStatus(v)}
              options={[...IAM_RULE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编号 / 规则名称 / 角色"
              allowClear
              style={{ width: 220 }}
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
                  void loadData(1, pageSize, keyword, bizModule, riskLevel, ruleStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBizModule(undefined);
                  setRiskLevel(undefined);
                  setRuleStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(SOD_RULE_MANAGE) && <Button onClick={openCreate}>新建规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`职责分离规则（共 ${total} 条）`}>
        <Table<IamSodRuleItem>
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
        title={editId == null ? '新建职责分离规则' : '编辑职责分离规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleNo" label="规则编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Select placeholder="请选择" allowClear options={[...IAM_BIZ_MODULE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="conflictRoleA" label="互斥角色 A">
            <Input placeholder="请输入互斥角色 A" />
          </Form.Item>
          <Form.Item name="conflictRoleB" label="互斥角色 B">
            <Input placeholder="请输入互斥角色 B" />
          </Form.Item>
          <Form.Item name="conflictPermA" label="互斥权限 A">
            <Input placeholder="请输入互斥权限 A" />
          </Form.Item>
          <Form.Item name="conflictPermB" label="互斥权限 B">
            <Input placeholder="请输入互斥权限 B" />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险级别">
            <Select placeholder="请选择" options={[...IAM_RISK_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ruleStatus" label="规则状态">
            <Select placeholder="请选择" options={[...IAM_RULE_STATUS_OPTIONS]} />
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
