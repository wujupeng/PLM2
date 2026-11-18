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
import { codeRuleService } from '@/services/dataQualityService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/data-quality/shared';
import {
  CODE_RESET_CYCLE_LABEL,
  CODE_RESET_CYCLE_OPTIONS,
  CODE_RULE_STATUS_LABEL,
  CODE_RULE_STATUS_OPTIONS,
  type CodeRuleItem,
  type CodeRuleSaveParams,
  type CodeRuleStats,
} from '@/types/dataQuality';

const { Title } = Typography;

const CODE_RULE_MANAGE = 'platform:dq:coderule:manage';

export default function CodeRulePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<CodeRuleSaveParams>();
  const [data, setData] = useState<CodeRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [codeCode, setCodeCode] = useState('');
  const [codeName, setCodeName] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [resetCycle, setResetCycle] = useState<string | undefined>(undefined);
  const [codeStatus, setCodeStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<CodeRuleStats>({});

  const loadStats = useCallback(async () => {
    const res = await codeRuleService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      cCode = codeCode,
      cName = codeName,
      tEntity = targetEntity,
      rCycle = resetCycle,
      cStatus = codeStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await codeRuleService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          codeCode: cCode || undefined,
          codeName: cName || undefined,
          targetEntity: tEntity || undefined,
          resetCycle: rCycle,
          codeStatus: cStatus,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, codeCode, codeName, targetEntity, resetCycle, codeStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ resetCycle: 'NONE', seqLength: 4, currentSeq: 0, codeStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: CodeRuleItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: CodeRuleSaveParams = { ...values };
      if (editId == null) {
        await codeRuleService.create(payload);
        message.success('编码规则已创建');
      } else {
        await codeRuleService.update(editId, payload);
        message.success('编码规则已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await codeRuleService.remove(id);
    message.success('编码规则已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const generate = async (record: CodeRuleItem) => {
    const res = await codeRuleService.generate(record.id);
    message.success(`已生成编码：${res?.generatedCode ?? '-'}`);
    void loadData();
  };

  const columns: ColumnsType<CodeRuleItem> = [
    { title: '编码规则编码', dataIndex: 'codeCode', width: 170, fixed: 'left', render: plain },
    { title: '编码规则名称', dataIndex: 'codeName', width: 180, render: plain },
    { title: '目标实体', dataIndex: 'targetEntity', width: 160, render: plain },
    { title: '前缀', dataIndex: 'prefix', width: 120, render: plain },
    { title: '日期格式', dataIndex: 'datePattern', width: 140, render: plain },
    { title: '流水号长度', dataIndex: 'seqLength', width: 120, render: plain },
    { title: '重置周期', dataIndex: 'resetCycle', width: 120, render: (v) => statusTag(CODE_RESET_CYCLE_LABEL, v) },
    { title: '当前流水号', dataIndex: 'currentSeq', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'codeStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(CODE_RULE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(CODE_RULE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => void generate(record)}>
              生成编码
            </Button>
            <Popconfirm
              title="确认启用该编码规则？"
              onConfirm={() => void act(codeRuleService.enable, record.id, '编码规则已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该编码规则？"
              onConfirm={() => void act(codeRuleService.disable, record.id, '编码规则已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该编码规则？" onConfirm={() => void remove(record.id)}>
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
        编码规则
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="编码规则总数" value={Number(stats.total ?? 0)} />
          <Statistic title="生效" value={Number(stats.active ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="停用" value={Number(stats.disabled ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="编码规则编码">
            <Input
              placeholder="请输入编码规则编码"
              allowClear
              style={{ width: 170 }}
              value={codeCode}
              onChange={(e) => setCodeCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="编码规则名称">
            <Input
              placeholder="请输入编码规则名称"
              allowClear
              style={{ width: 170 }}
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="目标实体">
            <Input
              placeholder="请输入目标实体"
              allowClear
              style={{ width: 160 }}
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="重置周期">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={resetCycle}
              onChange={(v) => setResetCycle(v)}
              options={[...CODE_RESET_CYCLE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={codeStatus}
              onChange={(v) => setCodeStatus(v)}
              options={[...CODE_RULE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编码规则编码 / 名称"
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
                    codeCode,
                    codeName,
                    targetEntity,
                    resetCycle,
                    codeStatus,
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
                  setCodeCode('');
                  setCodeName('');
                  setTargetEntity('');
                  setResetCycle(undefined);
                  setCodeStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(CODE_RULE_MANAGE) && <Button onClick={openCreate}>新建编码规则</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`编码规则（共 ${total} 条）`}>
        <Table<CodeRuleItem>
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
        title={editId == null ? '新建编码规则' : '编辑编码规则'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="codeCode" label="编码规则编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="codeName" label="编码规则名称" rules={[{ required: true, message: '请输入编码规则名称' }]}>
            <Input placeholder="请输入编码规则名称" />
          </Form.Item>
          <Form.Item name="targetEntity" label="目标实体" rules={[{ required: true, message: '请输入目标实体' }]}>
            <Input placeholder="请输入目标实体" />
          </Form.Item>
          <Form.Item name="prefix" label="前缀">
            <Input placeholder="请输入编码前缀" />
          </Form.Item>
          <Form.Item name="datePattern" label="日期格式">
            <Input placeholder="如 yyyyMMdd，留空表示不含日期" />
          </Form.Item>
          <Form.Item name="seqLength" label="流水号长度">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入流水号长度" />
          </Form.Item>
          <Form.Item name="resetCycle" label="重置周期">
            <Select placeholder="请选择" options={[...CODE_RESET_CYCLE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="currentSeq" label="当前流水号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入当前流水号" />
          </Form.Item>
          <Form.Item name="codeStatus" label="状态">
            <Select placeholder="请选择" options={[...CODE_RULE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgId" label="组织ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入组织ID" />
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
