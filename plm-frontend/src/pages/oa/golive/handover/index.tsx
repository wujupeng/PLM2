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
import { oaOpsHandoverService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_DELIVERABLE_TYPE_LABEL,
  OA_GOLIVE_DELIVERABLE_TYPE_OPTIONS,
  OA_GOLIVE_HANDOVER_STATUS_LABEL,
  OA_GOLIVE_HANDOVER_STATUS_OPTIONS,
  type OaGoliveQuery,
  type OaOpsHandoverItem,
  type OaOpsHandoverSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const HANDOVER_MANAGE = 'oa:golive:handover:manage';

export default function OaOpsHandoverPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaOpsHandoverSaveParams>();
  const [data, setData] = useState<OaOpsHandoverItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [deliverableType, setDeliverableType] = useState<string | undefined>(undefined);
  const [handoverStatus, setHandoverStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaOpsHandoverItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = deliverableType,
      status = handoverStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          deliverableType: type,
          handoverStatus: status,
        };
        const res = await oaOpsHandoverService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, deliverableType, handoverStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaOpsHandoverService.stats();
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

  const openEdit = (record: OaOpsHandoverItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      handoverNo: record.handoverNo,
      handoverName: record.handoverName,
      deliverableType: record.deliverableType,
      deliverableDesc: record.deliverableDesc,
      location: record.location,
      handoverStatus: record.handoverStatus,
      deliveredTime: record.deliveredTime,
      receiver: record.receiver,
      confirmTime: record.confirmTime,
      warrantyMonths: record.warrantyMonths,
      warrantyStart: record.warrantyStart,
      warrantyEnd: record.warrantyEnd,
      acceptanceVerified: record.acceptanceVerified,
      orgName: record.orgName,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaOpsHandoverItem) => {
    setDetailOpen(true);
    const res = await oaOpsHandoverService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaOpsHandoverSaveParams = { ...values };
      if (editingId !== null) {
        await oaOpsHandoverService.update(editingId, payload);
        message.success('运维交接已更新');
      } else {
        await oaOpsHandoverService.create(payload);
        message.success('运维交接已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const deliver = async (record: OaOpsHandoverItem) => {
    await oaOpsHandoverService.deliver(record.id, record.receiver);
    message.success('交接物已交付');
    void loadData();
    void loadStats();
  };

  const confirm = async (id: number) => {
    await oaOpsHandoverService.confirm(id);
    message.success('交接已确认');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaOpsHandoverService.remove(id);
    message.success('运维交接已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaOpsHandoverItem> = [
    { title: '交接编号', dataIndex: 'handoverNo', width: 170, fixed: 'left', render: plain },
    { title: '交接名称', dataIndex: 'handoverName', width: 200, render: plain },
    {
      title: '交付物类型',
      dataIndex: 'deliverableType',
      width: 120,
      render: (v) => enumText(OA_GOLIVE_DELIVERABLE_TYPE_LABEL, v),
    },
    { title: '交付位置', dataIndex: 'location', width: 180, render: plain },
    { title: '接收人', dataIndex: 'receiver', width: 110, render: plain },
    { title: '质保月数', dataIndex: 'warrantyMonths', width: 100, render: (v) => plain(v) },
    { title: '验收确认', dataIndex: 'acceptanceVerified', width: 100, render: (v) => flagText(v) },
    {
      title: '状态',
      dataIndex: 'handoverStatus',
      width: 110,
      render: (v) => enumTag(OA_GOLIVE_HANDOVER_STATUS_LABEL, v),
    },
    { title: '交付时间', dataIndex: 'deliveredTime', width: 170, render: formatDateTime },
    { title: '确认时间', dataIndex: 'confirmTime', width: 170, render: formatDateTime },
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
          {hasPermission(HANDOVER_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(HANDOVER_MANAGE) && record.handoverStatus !== 'DELIVERED' && record.handoverStatus !== 'CONFIRMED' && (
            <Button type="link" size="small" onClick={() => void deliver(record)}>
              交付
            </Button>
          )}
          {hasPermission(HANDOVER_MANAGE) && record.handoverStatus === 'DELIVERED' && (
            <Button type="link" size="small" onClick={() => void confirm(record.id)}>
              确认
            </Button>
          )}
          {hasPermission(HANDOVER_MANAGE) && (
            <Popconfirm title="确认删除该运维交接？" onConfirm={() => void remove(record.id)}>
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
        正式切换与现有OA退役 · 运维交接
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="交接总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待交付" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已交付" value={Number(stats.delivered ?? 0)} />
          <Statistic title="已确认" value={Number(stats.confirmed ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="质保期限(月)" value={Number(stats.warrantyMonths ?? 0)} />
          <Statistic title="验收确认数" value={Number(stats.acceptanceVerifiedCount ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="交接编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="交付物类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={deliverableType}
              onChange={(v) => setDeliverableType(v)}
              options={[...OA_GOLIVE_DELIVERABLE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={handoverStatus}
              onChange={(v) => setHandoverStatus(v)}
              options={[...OA_GOLIVE_HANDOVER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, deliverableType, handoverStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDeliverableType(undefined);
                  setHandoverStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(HANDOVER_MANAGE) && <Button onClick={openCreate}>新增交接</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`运维交接（共 ${total} 条）`}>
        <Table<OaOpsHandoverItem>
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
        title="运维交接详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="交接编号">{plain(detail.handoverNo)}</Descriptions.Item>
            <Descriptions.Item label="交接名称">{plain(detail.handoverName)}</Descriptions.Item>
            <Descriptions.Item label="交付物类型">
              {enumText(OA_GOLIVE_DELIVERABLE_TYPE_LABEL, detail.deliverableType)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_GOLIVE_HANDOVER_STATUS_LABEL, detail.handoverStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="交付物说明" span={2}>
              {plain(detail.deliverableDesc)}
            </Descriptions.Item>
            <Descriptions.Item label="交付位置" span={2}>
              {plain(detail.location)}
            </Descriptions.Item>
            <Descriptions.Item label="交付时间">{formatDateTime(detail.deliveredTime)}</Descriptions.Item>
            <Descriptions.Item label="接收人">{plain(detail.receiver)}</Descriptions.Item>
            <Descriptions.Item label="确认时间">{formatDateTime(detail.confirmTime)}</Descriptions.Item>
            <Descriptions.Item label="质保月数">{plain(detail.warrantyMonths)}</Descriptions.Item>
            <Descriptions.Item label="质保开始">{formatDateTime(detail.warrantyStart)}</Descriptions.Item>
            <Descriptions.Item label="质保结束">{formatDateTime(detail.warrantyEnd)}</Descriptions.Item>
            <Descriptions.Item label="验收确认">{flagText(detail.acceptanceVerified)}</Descriptions.Item>
            <Descriptions.Item label="组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑运维交接' : '新增运维交接'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="handoverNo" label="交接编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="handoverName"
            label="交接名称"
            rules={[{ required: true, message: '请输入交接名称' }]}
          >
            <Input placeholder="请输入交接名称" />
          </Form.Item>
          <Form.Item name="deliverableType" label="交付物类型">
            <Select placeholder="请选择" options={[...OA_GOLIVE_DELIVERABLE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="deliverableDesc" label="交付物说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="location" label="交付位置">
            <Input placeholder="请输入交付位置" />
          </Form.Item>
          <Form.Item name="handoverStatus" label="状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_HANDOVER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="deliveredTime" label="交付时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="receiver" label="接收人">
            <Input placeholder="请输入接收人" />
          </Form.Item>
          <Form.Item name="confirmTime" label="确认时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="warrantyMonths" label="质保月数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warrantyStart" label="质保开始时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="warrantyEnd" label="质保结束时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="acceptanceVerified" label="是否验收确认">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
