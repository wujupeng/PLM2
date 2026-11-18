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
import { oaCutoverPlanService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_CUTOVER_PLAN_TYPE_LABEL,
  OA_CUTOVER_PLAN_TYPE_OPTIONS,
  OA_CUTOVER_STATUS_LABEL,
  OA_CUTOVER_STATUS_OPTIONS,
  OA_REHEARSAL_RESULT_LABEL,
  OA_REHEARSAL_RESULT_OPTIONS,
  type OaCutoverPlanItem,
  type OaCutoverPlanSaveParams,
  type OaTestQuery,
} from '@/types/oa';

const { Title } = Typography;

const CUTOVER_MANAGE = 'oa:test:cutover:manage';

export default function OaCutoverPlanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaCutoverPlanSaveParams>();
  const [data, setData] = useState<OaCutoverPlanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [planType, setPlanType] = useState<string | undefined>(undefined);
  const [cutoverStatus, setCutoverStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaCutoverPlanItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = planType,
      status = cutoverStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          planType: type,
          cutoverStatus: status,
        };
        const res = await oaCutoverPlanService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, planType, cutoverStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaCutoverPlanService.stats();
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

  const openEdit = (record: OaCutoverPlanItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      planNo: record.planNo,
      planName: record.planName,
      planType: record.planType,
      cutoverWindow: record.cutoverWindow,
      freezeTime: record.freezeTime,
      incrementSync: record.incrementSync,
      entrySwitch: record.entrySwitch,
      notifyPlan: record.notifyPlan,
      dutyPerson: record.dutyPerson,
      rollbackTrigger: record.rollbackTrigger,
      rollbackOwner: record.rollbackOwner,
      rehearsalResult: record.rehearsalResult,
      rehearsalTime: record.rehearsalTime,
      status: record.status,
      approver: record.approver,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaCutoverPlanItem) => {
    setDetailOpen(true);
    const res = await oaCutoverPlanService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaCutoverPlanSaveParams = { ...values };
      if (editingId !== null) {
        await oaCutoverPlanService.update(editingId, payload);
        message.success('切换预案已更新');
      } else {
        await oaCutoverPlanService.create(payload);
        message.success('切换预案已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const rehearse = async (id: number) => {
    await oaCutoverPlanService.rehearse(id, 'PASS');
    message.success('演练结果已登记');
    void loadData();
    void loadStats();
  };

  const approve = async (id: number) => {
    await oaCutoverPlanService.approve(id, '管理员');
    message.success('预案已批准');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaCutoverPlanService.remove(id);
    message.success('切换预案已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaCutoverPlanItem> = [
    { title: '预案编号', dataIndex: 'planNo', width: 170, fixed: 'left', render: plain },
    { title: '预案名称', dataIndex: 'planName', width: 200, render: plain },
    {
      title: '预案类型',
      dataIndex: 'planType',
      width: 110,
      render: (v) => enumText(OA_CUTOVER_PLAN_TYPE_LABEL, v),
    },
    { title: '切换窗口', dataIndex: 'cutoverWindow', width: 180, render: plain },
    { title: '冻结时间', dataIndex: 'freezeTime', width: 170, render: formatDateTime },
    { title: '值守负责人', dataIndex: 'dutyPerson', width: 130, render: plain },
    {
      title: '演练结果',
      dataIndex: 'rehearsalResult',
      width: 100,
      render: (v) => enumTag(OA_REHEARSAL_RESULT_LABEL, v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => enumTag(OA_CUTOVER_STATUS_LABEL, v),
    },
    { title: '批准人', dataIndex: 'approver', width: 110, render: plain },
    { title: '演练时间', dataIndex: 'rehearsalTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 290,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(CUTOVER_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(CUTOVER_MANAGE) && (
            <Button type="link" size="small" onClick={() => void rehearse(record.id)}>
              演练
            </Button>
          )}
          {hasPermission(CUTOVER_MANAGE) && (
            <Button type="link" size="small" onClick={() => void approve(record.id)}>
              批准
            </Button>
          )}
          {hasPermission(CUTOVER_MANAGE) && (
            <Popconfirm title="确认删除该切换预案？" onConfirm={() => void remove(record.id)}>
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
        上线切换与回退预案
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="预案总数" value={Number(stats.total ?? 0)} />
          <Statistic title="正式切换" value={Number(stats.cutover ?? 0)} />
          <Statistic title="回退预案" value={Number(stats.rollback ?? 0)} />
          <Statistic
            title="草稿"
            value={Number(stats.draft ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic title="已评审" value={Number(stats.reviewed ?? 0)} />
          <Statistic
            title="已批准"
            value={Number(stats.approved ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="演练通过"
            value={Number(stats.rehearsalPass ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="演练失败"
            value={Number(stats.rehearsalFail ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic title="切换窗口" value={plain(stats.cutoverWindow)} />
          <Statistic title="回退窗口(分钟)" value={Number(stats.rollbackWindowMinutes ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="预案编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="预案类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={planType}
              onChange={(v) => setPlanType(v)}
              options={[...OA_CUTOVER_PLAN_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={cutoverStatus}
              onChange={(v) => setCutoverStatus(v)}
              options={[...OA_CUTOVER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, planType, cutoverStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPlanType(undefined);
                  setCutoverStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(CUTOVER_MANAGE) && <Button onClick={openCreate}>新增预案</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`上线切换与回退预案（共 ${total} 条）`}>
        <Table<OaCutoverPlanItem>
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
        title="切换预案详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="预案编号">{plain(detail.planNo)}</Descriptions.Item>
            <Descriptions.Item label="预案名称">{plain(detail.planName)}</Descriptions.Item>
            <Descriptions.Item label="预案类型">
              {enumText(OA_CUTOVER_PLAN_TYPE_LABEL, detail.planType)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_CUTOVER_STATUS_LABEL, detail.status)}
            </Descriptions.Item>
            <Descriptions.Item label="切换窗口" span={2}>
              {plain(detail.cutoverWindow)}
            </Descriptions.Item>
            <Descriptions.Item label="冻结时间">{formatDateTime(detail.freezeTime)}</Descriptions.Item>
            <Descriptions.Item label="值守负责人">{plain(detail.dutyPerson)}</Descriptions.Item>
            <Descriptions.Item label="增量同步" span={2}>
              {plain(detail.incrementSync)}
            </Descriptions.Item>
            <Descriptions.Item label="入口切换" span={2}>
              {plain(detail.entrySwitch)}
            </Descriptions.Item>
            <Descriptions.Item label="通知方案" span={2}>
              {plain(detail.notifyPlan)}
            </Descriptions.Item>
            <Descriptions.Item label="回退触发条件" span={2}>
              {plain(detail.rollbackTrigger)}
            </Descriptions.Item>
            <Descriptions.Item label="回退负责人">{plain(detail.rollbackOwner)}</Descriptions.Item>
            <Descriptions.Item label="演练结果">
              {enumTag(OA_REHEARSAL_RESULT_LABEL, detail.rehearsalResult)}
            </Descriptions.Item>
            <Descriptions.Item label="演练时间">
              {formatDateTime(detail.rehearsalTime)}
            </Descriptions.Item>
            <Descriptions.Item label="批准人">{plain(detail.approver)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑切换预案' : '新增切换预案'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="planNo" label="预案编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="planName"
            label="预案名称"
            rules={[{ required: true, message: '请输入预案名称' }]}
          >
            <Input placeholder="请输入预案名称" />
          </Form.Item>
          <Form.Item name="planType" label="预案类型">
            <Select placeholder="请选择" options={[...OA_CUTOVER_PLAN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="cutoverWindow" label="切换窗口">
            <Input placeholder="如 2026-01-01 22:00 ~ 2026-01-02 02:00" />
          </Form.Item>
          <Form.Item name="freezeTime" label="冻结时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="incrementSync" label="增量同步">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="entrySwitch" label="入口切换">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="notifyPlan" label="通知方案">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="dutyPerson" label="值守负责人">
            <Input placeholder="请输入值守负责人" />
          </Form.Item>
          <Form.Item name="rollbackTrigger" label="回退触发条件">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="rollbackOwner" label="回退负责人">
            <Input placeholder="请输入回退负责人" />
          </Form.Item>
          <Form.Item name="rehearsalResult" label="演练结果">
            <Select placeholder="请选择" options={[...OA_REHEARSAL_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="rehearsalTime" label="演练时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={[...OA_CUTOVER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="approver" label="批准人">
            <Input placeholder="请输入批准人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
