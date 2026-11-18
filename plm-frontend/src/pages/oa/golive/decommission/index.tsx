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
import { oaDecommissionRecordService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_DECOMMISSION_STATUS_LABEL,
  OA_GOLIVE_DECOMMISSION_STATUS_OPTIONS,
  OA_GOLIVE_RESOURCE_TYPE_LABEL,
  OA_GOLIVE_RESOURCE_TYPE_OPTIONS,
  type OaDecommissionRecordItem,
  type OaDecommissionRecordSaveParams,
  type OaGoliveQuery,
} from '@/types/oa';

const { Title } = Typography;

const DECOMMISSION_MANAGE = 'oa:golive:decommission:manage';

export default function OaDecommissionRecordPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaDecommissionRecordSaveParams>();
  const [data, setData] = useState<OaDecommissionRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [resourceType, setResourceType] = useState<string | undefined>(undefined);
  const [decommissionStatus, setDecommissionStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaDecommissionRecordItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = resourceType,
      status = decommissionStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          resourceType: type,
          decommissionStatus: status,
        };
        const res = await oaDecommissionRecordService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, resourceType, decommissionStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaDecommissionRecordService.stats();
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

  const openEdit = (record: OaDecommissionRecordItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      decommissionNo: record.decommissionNo,
      decommissionName: record.decommissionName,
      resourceType: record.resourceType,
      resourceDesc: record.resourceDesc,
      revokeScope: record.revokeScope,
      approved: record.approved,
      approver: record.approver,
      decommissionStatus: record.decommissionStatus,
      executeTime: record.executeTime,
      backupKept: record.backupKept,
      riskNote: record.riskNote,
      operatorName: record.operatorName,
      orgName: record.orgName,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaDecommissionRecordItem) => {
    setDetailOpen(true);
    const res = await oaDecommissionRecordService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaDecommissionRecordSaveParams = { ...values };
      if (editingId !== null) {
        await oaDecommissionRecordService.update(editingId, payload);
        message.success('资源回收已更新');
      } else {
        await oaDecommissionRecordService.create(payload);
        message.success('资源回收已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const approve = async (id: number) => {
    await oaDecommissionRecordService.approve(id, '管理员');
    message.success('资源回收已批准');
    void loadData();
    void loadStats();
  };

  const execute = async (id: number) => {
    await oaDecommissionRecordService.execute(id);
    message.success('资源回收已执行');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaDecommissionRecordService.remove(id);
    message.success('资源回收已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaDecommissionRecordItem> = [
    { title: '回收编号', dataIndex: 'decommissionNo', width: 170, fixed: 'left', render: plain },
    { title: '回收名称', dataIndex: 'decommissionName', width: 200, render: plain },
    {
      title: '资源类型',
      dataIndex: 'resourceType',
      width: 120,
      render: (v) => enumText(OA_GOLIVE_RESOURCE_TYPE_LABEL, v),
    },
    { title: '资源说明', dataIndex: 'resourceDesc', width: 200, render: plain },
    { title: '已批准', dataIndex: 'approved', width: 90, render: (v) => flagText(v) },
    { title: '批准人', dataIndex: 'approver', width: 110, render: plain },
    { title: '保留备份', dataIndex: 'backupKept', width: 100, render: (v) => flagText(v) },
    {
      title: '状态',
      dataIndex: 'decommissionStatus',
      width: 110,
      render: (v) => enumTag(OA_GOLIVE_DECOMMISSION_STATUS_LABEL, v),
    },
    { title: '执行时间', dataIndex: 'executeTime', width: 170, render: formatDateTime },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
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
          {hasPermission(DECOMMISSION_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(DECOMMISSION_MANAGE) && Number(record.approved) !== 1 && (
            <Button type="link" size="small" onClick={() => void approve(record.id)}>
              批准
            </Button>
          )}
          {hasPermission(DECOMMISSION_MANAGE) &&
            Number(record.approved) === 1 &&
            record.decommissionStatus !== 'EXECUTED' && (
              <Button type="link" size="small" onClick={() => void execute(record.id)}>
                执行
              </Button>
            )}
          {hasPermission(DECOMMISSION_MANAGE) && (
            <Popconfirm title="确认删除该资源回收？" onConfirm={() => void remove(record.id)}>
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
        正式切换与现有OA退役 · 授权与资源回收
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="回收总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待回收" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已回收" value={Number(stats.executed ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="已批准" value={Number(stats.approvedCount ?? 0)} />
          <Statistic title="外部访问" value={Number(stats.accessCount ?? 0)} />
          <Statistic title="软件许可" value={Number(stats.licenseCount ?? 0)} />
          <Statistic title="保留备份" value={Number(stats.backupKeptCount ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="回收编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="资源类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={resourceType}
              onChange={(v) => setResourceType(v)}
              options={[...OA_GOLIVE_RESOURCE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={decommissionStatus}
              onChange={(v) => setDecommissionStatus(v)}
              options={[...OA_GOLIVE_DECOMMISSION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, resourceType, decommissionStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setResourceType(undefined);
                  setDecommissionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(DECOMMISSION_MANAGE) && <Button onClick={openCreate}>新增回收</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`授权与资源回收（共 ${total} 条）`}>
        <Table<OaDecommissionRecordItem>
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
        title="资源回收详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="回收编号">{plain(detail.decommissionNo)}</Descriptions.Item>
            <Descriptions.Item label="回收名称">{plain(detail.decommissionName)}</Descriptions.Item>
            <Descriptions.Item label="资源类型">
              {enumText(OA_GOLIVE_RESOURCE_TYPE_LABEL, detail.resourceType)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_GOLIVE_DECOMMISSION_STATUS_LABEL, detail.decommissionStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="资源说明" span={2}>
              {plain(detail.resourceDesc)}
            </Descriptions.Item>
            <Descriptions.Item label="授权撤销范围" span={2}>
              {plain(detail.revokeScope)}
            </Descriptions.Item>
            <Descriptions.Item label="已批准">{flagText(detail.approved)}</Descriptions.Item>
            <Descriptions.Item label="批准人">{plain(detail.approver)}</Descriptions.Item>
            <Descriptions.Item label="保留备份">{flagText(detail.backupKept)}</Descriptions.Item>
            <Descriptions.Item label="执行时间">{formatDateTime(detail.executeTime)}</Descriptions.Item>
            <Descriptions.Item label="风险说明" span={2}>
              {plain(detail.riskNote)}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">{plain(detail.operatorName)}</Descriptions.Item>
            <Descriptions.Item label="组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑资源回收' : '新增资源回收'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="decommissionNo" label="回收编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="decommissionName"
            label="回收名称"
            rules={[{ required: true, message: '请输入回收名称' }]}
          >
            <Input placeholder="请输入回收名称" />
          </Form.Item>
          <Form.Item name="resourceType" label="资源类型">
            <Select placeholder="请选择" options={[...OA_GOLIVE_RESOURCE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="resourceDesc" label="资源说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="revokeScope" label="授权撤销范围">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="approved" label="是否已批准">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="approver" label="批准人">
            <Input placeholder="请输入批准人" />
          </Form.Item>
          <Form.Item name="decommissionStatus" label="状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_DECOMMISSION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="executeTime" label="执行时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="backupKept" label="是否保留备份">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="riskNote" label="风险说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
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
