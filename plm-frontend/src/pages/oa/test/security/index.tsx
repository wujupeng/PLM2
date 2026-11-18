import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
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
import { oaSecurityTestService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_SECURITY_CHECK_TYPE_LABEL,
  OA_SECURITY_CHECK_TYPE_OPTIONS,
  OA_SECURITY_FIX_STATUS_LABEL,
  OA_SECURITY_FIX_STATUS_OPTIONS,
  OA_SECURITY_SEVERITY_LABEL,
  OA_SECURITY_SEVERITY_OPTIONS,
  type OaSecurityTestItem,
  type OaSecurityTestSaveParams,
  type OaTestQuery,
} from '@/types/oa';

const { Title } = Typography;

const SECURITY_MANAGE = 'oa:test:security:manage';

const RISK_ACCEPTED_OPTIONS = [
  { label: '已接受风险', value: 1 },
  { label: '未接受', value: 0 },
] as const;

export default function OaSecurityTestPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaSecurityTestSaveParams>();
  const [data, setData] = useState<OaSecurityTestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [checkType, setCheckType] = useState<string | undefined>(undefined);
  const [severity, setSeverity] = useState<string | undefined>(undefined);
  const [fixStatus, setFixStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaSecurityTestItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = checkType,
      sev = severity,
      status = fixStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          checkType: type,
          severity: sev,
          fixStatus: status,
        };
        const res = await oaSecurityTestService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, checkType, severity, fixStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaSecurityTestService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: OaSecurityTestItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      scanNo: record.scanNo,
      checkName: record.checkName,
      checkType: record.checkType,
      severity: record.severity,
      target: record.target,
      toolName: record.toolName,
      finding: record.finding,
      suggestion: record.suggestion,
      fixStatus: record.fixStatus,
      riskAccepted: record.riskAccepted,
      verifyResult: record.verifyResult,
      tester: record.tester,
      testTime: record.testTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaSecurityTestItem) => {
    setDetailOpen(true);
    const res = await oaSecurityTestService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaSecurityTestSaveParams = { ...values };
      if (editingId !== null) {
        await oaSecurityTestService.update(editingId, payload);
        message.success('安全测试已更新');
      } else {
        await oaSecurityTestService.create(payload);
        message.success('安全测试已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const fix = async (id: number) => {
    await oaSecurityTestService.fix(id, 'FIXED', '通过');
    message.success('已标记为已修复');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaSecurityTestService.remove(id);
    message.success('安全测试已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaSecurityTestItem> = [
    { title: '扫描编码', dataIndex: 'scanNo', width: 160, fixed: 'left', render: plain },
    { title: '检查项名称', dataIndex: 'checkName', width: 200, render: plain },
    {
      title: '检查类型',
      dataIndex: 'checkType',
      width: 110,
      render: (v) => enumText(OA_SECURITY_CHECK_TYPE_LABEL, v),
    },
    {
      title: '风险级别',
      dataIndex: 'severity',
      width: 100,
      render: (v) => enumTag(OA_SECURITY_SEVERITY_LABEL, v),
    },
    { title: '检查目标', dataIndex: 'target', width: 160, render: plain },
    { title: '工具', dataIndex: 'toolName', width: 130, render: plain },
    { title: '发现问题', dataIndex: 'finding', width: 220, ellipsis: true, render: plain },
    {
      title: '整改状态',
      dataIndex: 'fixStatus',
      width: 110,
      render: (v) => enumTag(OA_SECURITY_FIX_STATUS_LABEL, v),
    },
    {
      title: '风险接受',
      dataIndex: 'riskAccepted',
      width: 100,
      render: (v) => (Number(v) === 1 ? '已接受' : '未接受'),
    },
    { title: '验证结果', dataIndex: 'verifyResult', width: 150, ellipsis: true, render: plain },
    { title: '执行人', dataIndex: 'tester', width: 110, render: plain },
    { title: '测试时间', dataIndex: 'testTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(SECURITY_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(SECURITY_MANAGE) && (
            <Button type="link" size="small" onClick={() => void fix(record.id)}>
              标记已修复
            </Button>
          )}
          {hasPermission(SECURITY_MANAGE) && (
            <Popconfirm title="确认删除该安全测试？" onConfirm={() => void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        安全测试与整改
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="安全测试总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="严重"
            value={Number(stats.critical ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="高"
            value={Number(stats.high ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="中"
            value={Number(stats.medium ?? 0)}
            valueStyle={{ color: '#d4b106' }}
          />
          <Statistic title="低" value={Number(stats.low ?? 0)} />
          <Statistic
            title="待整改"
            value={Number(stats.open ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="已修复"
            value={Number(stats.fixed ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic title="已接受风险" value={Number(stats.accepted ?? 0)} />
          <Statistic title="风险容差" value={Number(stats.riskTolerance ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="检查类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={checkType}
              onChange={(v) => setCheckType(v)}
              options={[...OA_SECURITY_CHECK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="风险级别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 110 }}
              value={severity}
              onChange={(v) => setSeverity(v)}
              options={[...OA_SECURITY_SEVERITY_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="整改状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={fixStatus}
              onChange={(v) => setFixStatus(v)}
              options={[...OA_SECURITY_FIX_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="扫描编码 / 检查项名称"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, keyword, checkType, severity, fixStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCheckType(undefined);
                  setSeverity(undefined);
                  setFixStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(SECURITY_MANAGE) && <Button onClick={openCreate}>新增安全测试</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`安全测试（共 ${total} 条）`}>
        <Table<OaSecurityTestItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title="安全测试详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="扫描编码">{plain(detail.scanNo)}</Descriptions.Item>
            <Descriptions.Item label="检查项名称">{plain(detail.checkName)}</Descriptions.Item>
            <Descriptions.Item label="检查类型">
              {enumText(OA_SECURITY_CHECK_TYPE_LABEL, detail.checkType)}
            </Descriptions.Item>
            <Descriptions.Item label="风险级别">
              {enumTag(OA_SECURITY_SEVERITY_LABEL, detail.severity)}
            </Descriptions.Item>
            <Descriptions.Item label="检查目标">{plain(detail.target)}</Descriptions.Item>
            <Descriptions.Item label="工具">{plain(detail.toolName)}</Descriptions.Item>
            <Descriptions.Item label="发现问题" span={2}>
              {plain(detail.finding)}
            </Descriptions.Item>
            <Descriptions.Item label="整改建议" span={2}>
              {plain(detail.suggestion)}
            </Descriptions.Item>
            <Descriptions.Item label="整改状态">
              {enumTag(OA_SECURITY_FIX_STATUS_LABEL, detail.fixStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="风险接受">
              {Number(detail.riskAccepted) === 1 ? '已接受' : '未接受'}
            </Descriptions.Item>
            <Descriptions.Item label="验证结果" span={2}>
              {plain(detail.verifyResult)}
            </Descriptions.Item>
            <Descriptions.Item label="执行人">{plain(detail.tester)}</Descriptions.Item>
            <Descriptions.Item label="测试时间">{formatDateTime(detail.testTime)}</Descriptions.Item>
            <Descriptions.Item label="归属组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注">{plain(detail.remark)}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑安全测试' : '新增安全测试'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="scanNo" label="扫描编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="checkName"
            label="检查项名称"
            rules={[{ required: true, message: '请输入检查项名称' }]}
          >
            <Input placeholder="请输入检查项名称" />
          </Form.Item>
          <Form.Item name="checkType" label="检查类型">
            <Select placeholder="请选择" options={[...OA_SECURITY_CHECK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="severity" label="风险级别">
            <Select placeholder="请选择" options={[...OA_SECURITY_SEVERITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="target" label="检查目标">
            <Input placeholder="如 系统地址 / 模块" />
          </Form.Item>
          <Form.Item name="toolName" label="工具">
            <Input placeholder="扫描工具名称" />
          </Form.Item>
          <Form.Item name="finding" label="发现问题">
            <Input.TextArea rows={3} placeholder="发现的安全问题" />
          </Form.Item>
          <Form.Item name="suggestion" label="整改建议">
            <Input.TextArea rows={2} placeholder="整改建议" />
          </Form.Item>
          <Form.Item name="fixStatus" label="整改状态">
            <Select placeholder="请选择" options={[...OA_SECURITY_FIX_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="riskAccepted" label="风险接受">
            <Select placeholder="请选择" options={[...RISK_ACCEPTED_OPTIONS]} />
          </Form.Item>
          <Form.Item name="verifyResult" label="验证结果">
            <Input.TextArea rows={2} placeholder="整改验证结果" />
          </Form.Item>
          <Form.Item name="tester" label="执行人">
            <Input placeholder="执行人" />
          </Form.Item>
          <Form.Item name="testTime" label="测试时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
