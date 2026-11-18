import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
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
import { oaRollbackRecordService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_DECISION_RESULT_LABEL,
  OA_GOLIVE_DECISION_RESULT_OPTIONS,
  OA_GOLIVE_DRILL_RESULT_LABEL,
  OA_GOLIVE_DRILL_RESULT_OPTIONS,
  OA_GOLIVE_ROLLBACK_TYPE_LABEL,
  OA_GOLIVE_ROLLBACK_TYPE_OPTIONS,
  type OaGoliveQuery,
  type OaRollbackRecordItem,
  type OaRollbackRecordSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const ROLLBACK_MANAGE = 'oa:golive:rollback:manage';

export default function OaRollbackRecordPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaRollbackRecordSaveParams>();
  const [data, setData] = useState<OaRollbackRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [rollbackType, setRollbackType] = useState<string | undefined>(undefined);
  const [decisionResult, setDecisionResult] = useState<string | undefined>(undefined);
  const [drillResult, setDrillResult] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaRollbackRecordItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = rollbackType,
      decision = decisionResult,
      drill = drillResult,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          rollbackType: type,
          decisionResult: decision,
          drillResult: drill,
        };
        const res = await oaRollbackRecordService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, rollbackType, decisionResult, drillResult],
  );

  const loadStats = useCallback(async () => {
    const res = await oaRollbackRecordService.stats();
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

  const openEdit = (record: OaRollbackRecordItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      rollbackNo: record.rollbackNo,
      rollbackName: record.rollbackName,
      rollbackType: record.rollbackType,
      rollbackReason: record.rollbackReason,
      triggerCondition: record.triggerCondition,
      rollbackScope: record.rollbackScope,
      dataBoundary: record.dataBoundary,
      decisionResult: record.decisionResult,
      decisionTime: record.decisionTime,
      drillResult: record.drillResult,
      drillTime: record.drillTime,
      windowMinutes: record.windowMinutes,
      doubleWriteAvoided: record.doubleWriteAvoided,
      rollbackOwner: record.rollbackOwner,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaRollbackRecordItem) => {
    setDetailOpen(true);
    const res = await oaRollbackRecordService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaRollbackRecordSaveParams = { ...values };
      if (editingId !== null) {
        await oaRollbackRecordService.update(editingId, payload);
        message.success('回退记录已更新');
      } else {
        await oaRollbackRecordService.create(payload);
        message.success('回退记录已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const decide = async (id: number) => {
    await oaRollbackRecordService.decide(id);
    message.success('回退决策已登记');
    void loadData();
    void loadStats();
  };

  const drill = async (id: number) => {
    await oaRollbackRecordService.drill(id);
    message.success('回退演练已登记');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaRollbackRecordService.remove(id);
    message.success('回退记录已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaRollbackRecordItem> = [
    { title: '回退编号', dataIndex: 'rollbackNo', width: 170, fixed: 'left', render: plain },
    { title: '回退名称', dataIndex: 'rollbackName', width: 200, render: plain },
    {
      title: '回退类型',
      dataIndex: 'rollbackType',
      width: 110,
      render: (v) => enumText(OA_GOLIVE_ROLLBACK_TYPE_LABEL, v),
    },
    { title: '回退范围', dataIndex: 'rollbackScope', width: 160, render: plain },
    { title: '回退负责人', dataIndex: 'rollbackOwner', width: 120, render: plain },
    {
      title: '决策结果',
      dataIndex: 'decisionResult',
      width: 110,
      render: (v) => enumTag(OA_GOLIVE_DECISION_RESULT_LABEL, v),
    },
    {
      title: '演练结果',
      dataIndex: 'drillResult',
      width: 110,
      render: (v) => enumTag(OA_GOLIVE_DRILL_RESULT_LABEL, v),
    },
    { title: '窗口(分钟)', dataIndex: 'windowMinutes', width: 110, render: (v) => plain(v) },
    { title: '避免双写', dataIndex: 'doubleWriteAvoided', width: 100, render: (v) => flagText(v) },
    { title: '决策时间', dataIndex: 'decisionTime', width: 170, render: formatDateTime },
    { title: '演练时间', dataIndex: 'drillTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(ROLLBACK_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(ROLLBACK_MANAGE) && record.decisionResult !== 'GO' && record.decisionResult !== 'ROLLBACK' && (
            <Button type="link" size="small" onClick={() => void decide(record.id)}>
              决策
            </Button>
          )}
          {hasPermission(ROLLBACK_MANAGE) && record.drillResult !== 'PASS' && record.drillResult !== 'FAIL' && (
            <Button type="link" size="small" onClick={() => void drill(record.id)}>
              演练
            </Button>
          )}
          {hasPermission(ROLLBACK_MANAGE) && (
            <Popconfirm title="确认删除该回退记录？" onConfirm={() => void remove(record.id)}>
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
        正式切换与现有OA退役 · 回退决策
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="回退记录总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待决策" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="继续运行" value={Number(stats.goCount ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="执行回退" value={Number(stats.rollbackCount ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="演练通过" value={Number(stats.drillPass ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="演练失败" value={Number(stats.drillFail ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="避免双写" value={Number(stats.doubleWriteAvoidedCount ?? 0)} />
          <Statistic title="回退窗口(分钟)" value={Number(stats.rollbackWindowMinutes ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="回退编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="回退类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={rollbackType}
              onChange={(v) => setRollbackType(v)}
              options={[...OA_GOLIVE_ROLLBACK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="决策结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={decisionResult}
              onChange={(v) => setDecisionResult(v)}
              options={[...OA_GOLIVE_DECISION_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="演练结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={drillResult}
              onChange={(v) => setDrillResult(v)}
              options={[...OA_GOLIVE_DRILL_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, rollbackType, decisionResult, drillResult);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRollbackType(undefined);
                  setDecisionResult(undefined);
                  setDrillResult(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(ROLLBACK_MANAGE) && <Button onClick={openCreate}>新增回退记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`回退决策（共 ${total} 条）`}>
        <Table<OaRollbackRecordItem>
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
        title="回退记录详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="回退编号">{plain(detail.rollbackNo)}</Descriptions.Item>
            <Descriptions.Item label="回退名称">{plain(detail.rollbackName)}</Descriptions.Item>
            <Descriptions.Item label="回退类型">
              {enumText(OA_GOLIVE_ROLLBACK_TYPE_LABEL, detail.rollbackType)}
            </Descriptions.Item>
            <Descriptions.Item label="回退负责人">{plain(detail.rollbackOwner)}</Descriptions.Item>
            <Descriptions.Item label="回退原因" span={2}>
              {plain(detail.rollbackReason)}
            </Descriptions.Item>
            <Descriptions.Item label="触发条件" span={2}>
              {plain(detail.triggerCondition)}
            </Descriptions.Item>
            <Descriptions.Item label="回退范围" span={2}>
              {plain(detail.rollbackScope)}
            </Descriptions.Item>
            <Descriptions.Item label="数据边界" span={2}>
              {plain(detail.dataBoundary)}
            </Descriptions.Item>
            <Descriptions.Item label="决策结果">
              {enumTag(OA_GOLIVE_DECISION_RESULT_LABEL, detail.decisionResult)}
            </Descriptions.Item>
            <Descriptions.Item label="决策时间">{formatDateTime(detail.decisionTime)}</Descriptions.Item>
            <Descriptions.Item label="演练结果">
              {enumTag(OA_GOLIVE_DRILL_RESULT_LABEL, detail.drillResult)}
            </Descriptions.Item>
            <Descriptions.Item label="演练时间">{formatDateTime(detail.drillTime)}</Descriptions.Item>
            <Descriptions.Item label="窗口(分钟)">{plain(detail.windowMinutes)}</Descriptions.Item>
            <Descriptions.Item label="避免双写">{flagText(detail.doubleWriteAvoided)}</Descriptions.Item>
            <Descriptions.Item label="组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑回退记录' : '新增回退记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="rollbackNo" label="回退编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="rollbackName"
            label="回退名称"
            rules={[{ required: true, message: '请输入回退记录名称' }]}
          >
            <Input placeholder="请输入回退记录名称" />
          </Form.Item>
          <Form.Item name="rollbackType" label="回退类型">
            <Select placeholder="请选择" options={[...OA_GOLIVE_ROLLBACK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="rollbackReason" label="回退原因">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="triggerCondition" label="触发条件">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="rollbackScope" label="回退范围">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="dataBoundary" label="数据边界">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="decisionResult" label="决策结果">
            <Select placeholder="请选择" options={[...OA_GOLIVE_DECISION_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="decisionTime" label="决策时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="drillResult" label="演练结果">
            <Select placeholder="请选择" options={[...OA_GOLIVE_DRILL_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="drillTime" label="演练时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="windowMinutes" label="回退窗口(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="doubleWriteAvoided" label="是否避免双写">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="rollbackOwner" label="回退责任人">
            <Input placeholder="请输入回退责任人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
