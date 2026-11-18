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
import { oaPermissionTestService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_PERMISSION_SCENE_TYPE_LABEL,
  OA_PERMISSION_SCENE_TYPE_OPTIONS,
  OA_PERMISSION_TEST_RESULT_LABEL,
  OA_PERMISSION_TEST_RESULT_OPTIONS,
  type OaPermissionTestItem,
  type OaPermissionTestSaveParams,
  type OaTestQuery,
} from '@/types/oa';

const { Title } = Typography;

const PERMISSION_MANAGE = 'oa:test:permission:manage';

const ISOLATION_OPTIONS = [
  { label: '通过', value: 1 },
  { label: '未通过', value: 0 },
] as const;

export default function OaPermissionTestPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaPermissionTestSaveParams>();
  const [data, setData] = useState<OaPermissionTestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sceneType, setSceneType] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaPermissionTestItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = sceneType,
      res = result,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          sceneType: type,
          result: res,
        };
        const pageRes = await oaPermissionTestService.page(params);
        setData(pageRes.list || []);
        setTotal(pageRes.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, sceneType, result],
  );

  const loadStats = useCallback(async () => {
    const res = await oaPermissionTestService.stats();
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

  const openEdit = (record: OaPermissionTestItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      testNo: record.testNo,
      sceneName: record.sceneName,
      sceneType: record.sceneType,
      roleName: record.roleName,
      subject: record.subject,
      dataScope: record.dataScope,
      expectedResult: record.expectedResult,
      actualResult: record.actualResult,
      isolationPass: record.isolationPass,
      result: record.result,
      defectNo: record.defectNo,
      tester: record.tester,
      testTime: record.testTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaPermissionTestItem) => {
    setDetailOpen(true);
    const res = await oaPermissionTestService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaPermissionTestSaveParams = { ...values };
      if (editingId !== null) {
        await oaPermissionTestService.update(editingId, payload);
        message.success('权限测试已更新');
      } else {
        await oaPermissionTestService.create(payload);
        message.success('权限测试已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const evaluate = async (id: number) => {
    await oaPermissionTestService.evaluate(id, 'PASS', true);
    message.success('已判定为通过');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaPermissionTestService.remove(id);
    message.success('权限测试已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaPermissionTestItem> = [
    { title: '测试编码', dataIndex: 'testNo', width: 160, fixed: 'left', render: plain },
    { title: '场景名称', dataIndex: 'sceneName', width: 200, render: plain },
    {
      title: '场景类型',
      dataIndex: 'sceneType',
      width: 110,
      render: (v) => enumText(OA_PERMISSION_SCENE_TYPE_LABEL, v),
    },
    { title: '测试角色', dataIndex: 'roleName', width: 130, render: plain },
    { title: '测试主体', dataIndex: 'subject', width: 150, render: plain },
    { title: '数据范围', dataIndex: 'dataScope', width: 150, render: plain },
    { title: '预期结果', dataIndex: 'expectedResult', width: 180, ellipsis: true, render: plain },
    { title: '实际结果', dataIndex: 'actualResult', width: 180, ellipsis: true, render: plain },
    {
      title: '隔离通过',
      dataIndex: 'isolationPass',
      width: 100,
      render: (v) => (Number(v) === 1 ? '通过' : '未通过'),
    },
    {
      title: '测试结论',
      dataIndex: 'result',
      width: 100,
      render: (v) => enumTag(OA_PERMISSION_TEST_RESULT_LABEL, v),
    },
    { title: '关联缺陷', dataIndex: 'defectNo', width: 140, render: plain },
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
          {hasPermission(PERMISSION_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(PERMISSION_MANAGE) && (
            <Button type="link" size="small" onClick={() => void evaluate(record.id)}>
              判定通过
            </Button>
          )}
          {hasPermission(PERMISSION_MANAGE) && (
            <Popconfirm title="确认删除该权限测试？" onConfirm={() => void remove(record.id)}>
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
        角色与数据隔离测试
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
            title="失败"
            value={Number(stats.fail ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="待执行"
            value={Number(stats.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic title="跨部门场景" value={Number(stats.crossDept ?? 0)} />
          <Statistic title="跨工厂场景" value={Number(stats.crossFactory ?? 0)} />
          <Statistic title="隔离通过数" value={Number(stats.isolationPassCount ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="场景类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={sceneType}
              onChange={(v) => setSceneType(v)}
              options={[...OA_PERMISSION_SCENE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="测试结论">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={result}
              onChange={(v) => setResult(v)}
              options={[...OA_PERMISSION_TEST_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="测试编码 / 场景名称"
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
                  void loadData(1, pageSize, keyword, sceneType, result);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSceneType(undefined);
                  setResult(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(PERMISSION_MANAGE) && (
                <Button onClick={openCreate}>新增权限测试</Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`权限测试（共 ${total} 条）`}>
        <Table<OaPermissionTestItem>
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
        title="权限测试详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="测试编码">{plain(detail.testNo)}</Descriptions.Item>
            <Descriptions.Item label="场景名称">{plain(detail.sceneName)}</Descriptions.Item>
            <Descriptions.Item label="场景类型">
              {enumText(OA_PERMISSION_SCENE_TYPE_LABEL, detail.sceneType)}
            </Descriptions.Item>
            <Descriptions.Item label="测试角色">{plain(detail.roleName)}</Descriptions.Item>
            <Descriptions.Item label="测试主体">{plain(detail.subject)}</Descriptions.Item>
            <Descriptions.Item label="数据范围">{plain(detail.dataScope)}</Descriptions.Item>
            <Descriptions.Item label="预期结果" span={2}>
              {plain(detail.expectedResult)}
            </Descriptions.Item>
            <Descriptions.Item label="实际结果" span={2}>
              {plain(detail.actualResult)}
            </Descriptions.Item>
            <Descriptions.Item label="隔离通过">
              {Number(detail.isolationPass) === 1 ? '通过' : '未通过'}
            </Descriptions.Item>
            <Descriptions.Item label="测试结论">
              {enumTag(OA_PERMISSION_TEST_RESULT_LABEL, detail.result)}
            </Descriptions.Item>
            <Descriptions.Item label="关联缺陷">{plain(detail.defectNo)}</Descriptions.Item>
            <Descriptions.Item label="执行人">{plain(detail.tester)}</Descriptions.Item>
            <Descriptions.Item label="测试时间">{formatDateTime(detail.testTime)}</Descriptions.Item>
            <Descriptions.Item label="归属组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑权限测试' : '新增权限测试'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="testNo" label="测试编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="sceneName"
            label="场景名称"
            rules={[{ required: true, message: '请输入测试场景名称' }]}
          >
            <Input placeholder="请输入测试场景名称" />
          </Form.Item>
          <Form.Item name="sceneType" label="场景类型">
            <Select placeholder="请选择" options={[...OA_PERMISSION_SCENE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="roleName" label="测试角色">
            <Input placeholder="如 部门管理员" />
          </Form.Item>
          <Form.Item name="subject" label="测试主体">
            <Input placeholder="测试主体 / 账号" />
          </Form.Item>
          <Form.Item name="dataScope" label="数据范围">
            <Input placeholder="如 本部门 / 本工厂" />
          </Form.Item>
          <Form.Item name="expectedResult" label="预期结果">
            <Input placeholder="预期可见性 / 隔离结果" />
          </Form.Item>
          <Form.Item name="actualResult" label="实际结果">
            <Input placeholder="实际验证结果" />
          </Form.Item>
          <Form.Item name="isolationPass" label="隔离是否通过">
            <Select placeholder="请选择" options={[...ISOLATION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="result" label="测试结论">
            <Select placeholder="请选择" options={[...OA_PERMISSION_TEST_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="defectNo" label="关联缺陷">
            <Input placeholder="缺陷编号" />
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
