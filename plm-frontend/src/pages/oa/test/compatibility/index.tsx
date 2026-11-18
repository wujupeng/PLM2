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
import { oaCompatTestService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_COMPAT_BLOCK_LEVEL_LABEL,
  OA_COMPAT_BLOCK_LEVEL_OPTIONS,
  OA_COMPAT_ENV_TYPE_LABEL,
  OA_COMPAT_ENV_TYPE_OPTIONS,
  OA_COMPAT_TEST_RESULT_LABEL,
  OA_COMPAT_TEST_RESULT_OPTIONS,
  type OaCompatTestItem,
  type OaCompatTestSaveParams,
  type OaTestQuery,
} from '@/types/oa';

const { Title } = Typography;

const COMPAT_MANAGE = 'oa:test:compat:manage';

export default function OaCompatTestPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaCompatTestSaveParams>();
  const [data, setData] = useState<OaCompatTestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [envType, setEnvType] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaCompatTestItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      env = envType,
      testResult = result,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          envType: env,
          result: testResult,
        };
        const res = await oaCompatTestService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, envType, result],
  );

  const loadStats = useCallback(async () => {
    const res = await oaCompatTestService.stats();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: OaCompatTestItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      testNo: record.testNo,
      envType: record.envType,
      envName: record.envName,
      envVersion: record.envVersion,
      network: record.network,
      scene: record.scene,
      result: record.result,
      blockLevel: record.blockLevel,
      issue: record.issue,
      tester: record.tester,
      testTime: record.testTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaCompatTestItem) => {
    setDetailOpen(true);
    const res = await oaCompatTestService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaCompatTestSaveParams = { ...values };
      if (editingId !== null) {
        await oaCompatTestService.update(editingId, payload);
        message.success('兼容性测试记录已更新');
      } else {
        await oaCompatTestService.create(payload);
        message.success('兼容性测试记录已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const evaluate = async (id: number) => {
    await oaCompatTestService.evaluate(id, 'PASS');
    message.success('已判定为通过');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaCompatTestService.remove(id);
    message.success('兼容性测试记录已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaCompatTestItem> = [
    { title: '测试编号', dataIndex: 'testNo', width: 170, fixed: 'left', render: plain },
    {
      title: '环境类型',
      dataIndex: 'envType',
      width: 110,
      render: (v) => enumText(OA_COMPAT_ENV_TYPE_LABEL, v),
    },
    { title: '环境名称', dataIndex: 'envName', width: 180, render: plain },
    { title: '环境版本', dataIndex: 'envVersion', width: 120, render: plain },
    { title: '网络条件', dataIndex: 'network', width: 120, render: plain },
    { title: '测试场景', dataIndex: 'scene', width: 180, render: plain },
    {
      title: '结论',
      dataIndex: 'result',
      width: 100,
      render: (v) => enumTag(OA_COMPAT_TEST_RESULT_LABEL, v),
    },
    {
      title: '阻塞级别',
      dataIndex: 'blockLevel',
      width: 100,
      render: (v) => enumTag(OA_COMPAT_BLOCK_LEVEL_LABEL, v),
    },
    { title: '问题描述', dataIndex: 'issue', width: 220, ellipsis: true, render: plain },
    { title: '测试人员', dataIndex: 'tester', width: 110, render: plain },
    { title: '测试时间', dataIndex: 'testTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(COMPAT_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(COMPAT_MANAGE) && (
            <Button type="link" size="small" onClick={() => void evaluate(record.id)}>
              判定通过
            </Button>
          )}
          {hasPermission(COMPAT_MANAGE) && (
            <Popconfirm title="确认删除该测试记录？" onConfirm={() => void remove(record.id)}>
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
        兼容性测试
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="测试总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="通过"
            value={Number(stats.pass ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="部分通过"
            value={Number(stats.partial ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="失败"
            value={Number(stats.fail ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="待测试"
            value={Number(stats.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="阻断问题数"
            value={Number(stats.blockerCount ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic title="兼容浏览器范围" value={String(stats.compatBrowsers ?? '-')} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="环境类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={envType}
              onChange={(v) => setEnvType(v)}
              options={[...OA_COMPAT_ENV_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="结论">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={result}
              onChange={(v) => setResult(v)}
              options={[...OA_COMPAT_TEST_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="测试编号 / 环境名称"
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
                  void loadData(1, pageSize, keyword, envType, result);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setEnvType(undefined);
                  setResult(undefined);
                  setKeyword('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(COMPAT_MANAGE) && <Button onClick={openCreate}>新增测试</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`兼容性测试（共 ${total} 条）`}>
        <Table<OaCompatTestItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title="兼容性测试详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="测试编号">{plain(detail.testNo)}</Descriptions.Item>
            <Descriptions.Item label="环境类型">
              {enumText(OA_COMPAT_ENV_TYPE_LABEL, detail.envType)}
            </Descriptions.Item>
            <Descriptions.Item label="环境名称">{plain(detail.envName)}</Descriptions.Item>
            <Descriptions.Item label="环境版本">{plain(detail.envVersion)}</Descriptions.Item>
            <Descriptions.Item label="网络条件">{plain(detail.network)}</Descriptions.Item>
            <Descriptions.Item label="测试场景">{plain(detail.scene)}</Descriptions.Item>
            <Descriptions.Item label="结论">
              {enumTag(OA_COMPAT_TEST_RESULT_LABEL, detail.result)}
            </Descriptions.Item>
            <Descriptions.Item label="阻塞级别">
              {enumTag(OA_COMPAT_BLOCK_LEVEL_LABEL, detail.blockLevel)}
            </Descriptions.Item>
            <Descriptions.Item label="问题描述" span={2}>
              {plain(detail.issue)}
            </Descriptions.Item>
            <Descriptions.Item label="测试人员">{plain(detail.tester)}</Descriptions.Item>
            <Descriptions.Item label="测试时间">{formatDateTime(detail.testTime)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑兼容性测试' : '新增兼容性测试'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="testNo" label="测试编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="envType" label="环境类型">
            <Select placeholder="请选择" options={[...OA_COMPAT_ENV_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="envName"
            label="环境名称"
            rules={[{ required: true, message: '请输入测试环境名称' }]}
          >
            <Input placeholder="如 Chrome 120" />
          </Form.Item>
          <Form.Item name="envVersion" label="环境版本">
            <Input />
          </Form.Item>
          <Form.Item name="network" label="网络条件">
            <Input placeholder="如 4G / 弱网" />
          </Form.Item>
          <Form.Item name="scene" label="测试场景">
            <Input />
          </Form.Item>
          <Form.Item name="result" label="结论">
            <Select placeholder="请选择" options={[...OA_COMPAT_TEST_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="blockLevel" label="阻塞级别">
            <Select placeholder="请选择" options={[...OA_COMPAT_BLOCK_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="issue" label="问题描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="tester" label="测试人员">
            <Input />
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
