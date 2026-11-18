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
import { oaLegacyArchiveService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_ARCHIVE_STATUS_LABEL,
  OA_GOLIVE_ARCHIVE_STATUS_OPTIONS,
  OA_GOLIVE_ARCHIVE_TYPE_LABEL,
  OA_GOLIVE_ARCHIVE_TYPE_OPTIONS,
  type OaGoliveQuery,
  type OaLegacyArchiveItem,
  type OaLegacyArchiveSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const ARCHIVE_MANAGE = 'oa:golive:archive:manage';

export default function OaLegacyArchivePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaLegacyArchiveSaveParams>();
  const [data, setData] = useState<OaLegacyArchiveItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [archiveType, setArchiveType] = useState<string | undefined>(undefined);
  const [archiveStatus, setArchiveStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaLegacyArchiveItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = archiveType,
      status = archiveStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          archiveType: type,
          archiveStatus: status,
        };
        const res = await oaLegacyArchiveService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, archiveType, archiveStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaLegacyArchiveService.stats();
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

  const openEdit = (record: OaLegacyArchiveItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      archiveNo: record.archiveNo,
      archiveName: record.archiveName,
      archiveType: record.archiveType,
      archiveScope: record.archiveScope,
      snapshotPath: record.snapshotPath,
      snapshotChecksum: record.snapshotChecksum,
      retentionYears: record.retentionYears,
      retentionPolicy: record.retentionPolicy,
      backupVerified: record.backupVerified,
      queryEntry: record.queryEntry,
      archiveStatus: record.archiveStatus,
      archiveTime: record.archiveTime,
      approver: record.approver,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaLegacyArchiveItem) => {
    setDetailOpen(true);
    const res = await oaLegacyArchiveService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaLegacyArchiveSaveParams = { ...values };
      if (editingId !== null) {
        await oaLegacyArchiveService.update(editingId, payload);
        message.success('只读封存已更新');
      } else {
        await oaLegacyArchiveService.create(payload);
        message.success('只读封存已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const archive = async (id: number) => {
    await oaLegacyArchiveService.archive(id);
    message.success('旧系统已封存');
    void loadData();
    void loadStats();
  };

  const verify = async (id: number) => {
    await oaLegacyArchiveService.verify(id);
    message.success('备份已校验');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaLegacyArchiveService.remove(id);
    message.success('只读封存已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaLegacyArchiveItem> = [
    { title: '封存编号', dataIndex: 'archiveNo', width: 170, fixed: 'left', render: plain },
    { title: '封存名称', dataIndex: 'archiveName', width: 200, render: plain },
    {
      title: '封存类型',
      dataIndex: 'archiveType',
      width: 110,
      render: (v) => enumText(OA_GOLIVE_ARCHIVE_TYPE_LABEL, v),
    },
    { title: '封存范围', dataIndex: 'archiveScope', width: 180, render: plain },
    { title: '保留年限', dataIndex: 'retentionYears', width: 100, render: (v) => plain(v) },
    { title: '备份校验', dataIndex: 'backupVerified', width: 100, render: (v) => flagText(v) },
    { title: '审批人', dataIndex: 'approver', width: 110, render: plain },
    {
      title: '状态',
      dataIndex: 'archiveStatus',
      width: 100,
      render: (v) => enumTag(OA_GOLIVE_ARCHIVE_STATUS_LABEL, v),
    },
    { title: '封存时间', dataIndex: 'archiveTime', width: 170, render: formatDateTime },
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
          {hasPermission(ARCHIVE_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(ARCHIVE_MANAGE) && record.archiveStatus !== 'ARCHIVED' && (
            <Button type="link" size="small" onClick={() => void archive(record.id)}>
              封存
            </Button>
          )}
          {hasPermission(ARCHIVE_MANAGE) && Number(record.backupVerified) !== 1 && (
            <Button type="link" size="small" onClick={() => void verify(record.id)}>
              校验备份
            </Button>
          )}
          {hasPermission(ARCHIVE_MANAGE) && (
            <Popconfirm title="确认删除该只读封存？" onConfirm={() => void remove(record.id)}>
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
        正式切换与现有OA退役 · 旧系统只读封存
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="封存总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待封存" value={Number(stats.pending ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="已封存" value={Number(stats.archived ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="只读封存" value={Number(stats.readonlyCount ?? 0)} />
          <Statistic title="离线封存" value={Number(stats.offlineCount ?? 0)} />
          <Statistic title="备份已校验" value={Number(stats.backupVerifiedCount ?? 0)} />
          <Statistic title="保留年限(年)" value={Number(stats.retentionYears ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="封存编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="封存类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={archiveType}
              onChange={(v) => setArchiveType(v)}
              options={[...OA_GOLIVE_ARCHIVE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={archiveStatus}
              onChange={(v) => setArchiveStatus(v)}
              options={[...OA_GOLIVE_ARCHIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, archiveType, archiveStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setArchiveType(undefined);
                  setArchiveStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(ARCHIVE_MANAGE) && <Button onClick={openCreate}>新增封存</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`旧系统只读封存（共 ${total} 条）`}>
        <Table<OaLegacyArchiveItem>
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
        title="只读封存详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="封存编号">{plain(detail.archiveNo)}</Descriptions.Item>
            <Descriptions.Item label="封存名称">{plain(detail.archiveName)}</Descriptions.Item>
            <Descriptions.Item label="封存类型">
              {enumText(OA_GOLIVE_ARCHIVE_TYPE_LABEL, detail.archiveType)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {enumTag(OA_GOLIVE_ARCHIVE_STATUS_LABEL, detail.archiveStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="封存范围" span={2}>
              {plain(detail.archiveScope)}
            </Descriptions.Item>
            <Descriptions.Item label="快照路径" span={2}>
              {plain(detail.snapshotPath)}
            </Descriptions.Item>
            <Descriptions.Item label="快照校验值" span={2}>
              {plain(detail.snapshotChecksum)}
            </Descriptions.Item>
            <Descriptions.Item label="保留年限">{plain(detail.retentionYears)}</Descriptions.Item>
            <Descriptions.Item label="备份校验">{flagText(detail.backupVerified)}</Descriptions.Item>
            <Descriptions.Item label="保留策略" span={2}>
              {plain(detail.retentionPolicy)}
            </Descriptions.Item>
            <Descriptions.Item label="查询入口" span={2}>
              {plain(detail.queryEntry)}
            </Descriptions.Item>
            <Descriptions.Item label="封存时间">{formatDateTime(detail.archiveTime)}</Descriptions.Item>
            <Descriptions.Item label="审批人">{plain(detail.approver)}</Descriptions.Item>
            <Descriptions.Item label="组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑只读封存' : '新增只读封存'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="archiveNo" label="封存编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="archiveName"
            label="封存名称"
            rules={[{ required: true, message: '请输入封存名称' }]}
          >
            <Input placeholder="请输入封存名称" />
          </Form.Item>
          <Form.Item name="archiveType" label="封存类型">
            <Select placeholder="请选择" options={[...OA_GOLIVE_ARCHIVE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="archiveScope" label="封存范围">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="snapshotPath" label="快照路径">
            <Input placeholder="请输入快照路径" />
          </Form.Item>
          <Form.Item name="snapshotChecksum" label="快照校验值">
            <Input placeholder="请输入快照校验值" />
          </Form.Item>
          <Form.Item name="retentionYears" label="保留年限">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="retentionPolicy" label="保留策略">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="backupVerified" label="备份是否已校验">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="queryEntry" label="查询入口">
            <Input placeholder="请输入查询入口" />
          </Form.Item>
          <Form.Item name="archiveStatus" label="状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_ARCHIVE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="archiveTime" label="封存时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="approver" label="审批人">
            <Input placeholder="请输入审批人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
