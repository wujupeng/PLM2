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
import { oaFinalMigrationService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText, flagText } from '@/pages/oa/integration/shared';
import {
  OA_GOLIVE_MIG_STATUS_LABEL,
  OA_GOLIVE_MIG_STATUS_OPTIONS,
  OA_GOLIVE_MIG_TYPE_LABEL,
  OA_GOLIVE_MIG_TYPE_OPTIONS,
  OA_GOLIVE_VERIFY_STATUS_LABEL,
  OA_GOLIVE_VERIFY_STATUS_OPTIONS,
  type OaFinalMigrationItem,
  type OaFinalMigrationSaveParams,
  type OaGoliveQuery,
} from '@/types/oa';

const { Title } = Typography;

const MIGRATION_MANAGE = 'oa:golive:migration:manage';

export default function OaFinalMigrationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaFinalMigrationSaveParams>();
  const [data, setData] = useState<OaFinalMigrationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [migType, setMigType] = useState<string | undefined>(undefined);
  const [migStatus, setMigStatus] = useState<string | undefined>(undefined);
  const [verifyStatus, setVerifyStatus] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaFinalMigrationItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = migType,
      status = migStatus,
      vStatus = verifyStatus,
    ) => {
      setLoading(true);
      try {
        const params: OaGoliveQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          migType: type,
          migStatus: status,
          verifyStatus: vStatus,
        };
        const res = await oaFinalMigrationService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, migType, migStatus, verifyStatus],
  );

  const loadStats = useCallback(async () => {
    const res = await oaFinalMigrationService.stats();
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

  const openEdit = (record: OaFinalMigrationItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      migNo: record.migNo,
      migName: record.migName,
      migType: record.migType,
      sourceScope: record.sourceScope,
      extractStart: record.extractStart,
      extractEnd: record.extractEnd,
      importedCount: record.importedCount,
      failedCount: record.failedCount,
      attachmentCount: record.attachmentCount,
      verifyStatus: record.verifyStatus,
      verifyPass: record.verifyPass,
      migStatus: record.migStatus,
      operatorName: record.operatorName,
      migTime: record.migTime,
      orgName: record.orgName,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaFinalMigrationItem) => {
    setDetailOpen(true);
    const res = await oaFinalMigrationService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaFinalMigrationSaveParams = { ...values };
      if (editingId !== null) {
        await oaFinalMigrationService.update(editingId, payload);
        message.success('最终迁移已更新');
      } else {
        await oaFinalMigrationService.create(payload);
        message.success('最终迁移已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const execute = async (id: number) => {
    await oaFinalMigrationService.execute(id);
    message.success('迁移已执行');
    void loadData();
    void loadStats();
  };

  const verify = async (id: number) => {
    await oaFinalMigrationService.verify(id, 1, 'VERIFIED');
    message.success('迁移结果校验通过');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaFinalMigrationService.remove(id);
    message.success('最终迁移已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaFinalMigrationItem> = [
    { title: '迁移编号', dataIndex: 'migNo', width: 170, fixed: 'left', render: plain },
    { title: '迁移名称', dataIndex: 'migName', width: 200, render: plain },
    {
      title: '迁移类型',
      dataIndex: 'migType',
      width: 110,
      render: (v) => enumText(OA_GOLIVE_MIG_TYPE_LABEL, v),
    },
    { title: '抽取范围', dataIndex: 'sourceScope', width: 180, render: plain },
    { title: '抽取开始', dataIndex: 'extractStart', width: 170, render: formatDateTime },
    { title: '抽取结束', dataIndex: 'extractEnd', width: 170, render: formatDateTime },
    { title: '导入成功', dataIndex: 'importedCount', width: 100, render: (v) => plain(v) },
    { title: '导入失败', dataIndex: 'failedCount', width: 100, render: (v) => plain(v) },
    { title: '附件数', dataIndex: 'attachmentCount', width: 90, render: (v) => plain(v) },
    {
      title: '校验状态',
      dataIndex: 'verifyStatus',
      width: 110,
      render: (v) => enumTag(OA_GOLIVE_VERIFY_STATUS_LABEL, v),
    },
    { title: '校验通过', dataIndex: 'verifyPass', width: 100, render: (v) => flagText(v) },
    {
      title: '迁移状态',
      dataIndex: 'migStatus',
      width: 110,
      render: (v) => enumTag(OA_GOLIVE_MIG_STATUS_LABEL, v),
    },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
    { title: '迁移时间', dataIndex: 'migTime', width: 170, render: formatDateTime },
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
          {hasPermission(MIGRATION_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(MIGRATION_MANAGE) && record.migStatus !== 'SUCCESS' && (
            <Button type="link" size="small" onClick={() => void execute(record.id)}>
              执行
            </Button>
          )}
          {hasPermission(MIGRATION_MANAGE) && record.verifyStatus !== 'VERIFIED' && (
            <Button type="link" size="small" onClick={() => void verify(record.id)}>
              校验
            </Button>
          )}
          {hasPermission(MIGRATION_MANAGE) && (
            <Popconfirm title="确认删除该最终迁移？" onConfirm={() => void remove(record.id)}>
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
        正式切换与现有OA退役 · 最终数据迁移
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="迁移总数" value={Number(stats.total ?? 0)} />
          <Statistic title="成功" value={Number(stats.success ?? 0)} valueStyle={{ color: '#389e0d' }} />
          <Statistic title="部分成功" value={Number(stats.partial ?? 0)} valueStyle={{ color: '#d46b08' }} />
          <Statistic title="失败" value={Number(stats.failed ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="待执行" value={Number(stats.pending ?? 0)} />
          <Statistic title="全量迁移" value={Number(stats.fullCount ?? 0)} />
          <Statistic title="增量迁移" value={Number(stats.incrementCount ?? 0)} />
          <Statistic title="导入总条数" value={Number(stats.importedTotal ?? 0)} />
          <Statistic title="失败总条数" value={Number(stats.failedTotal ?? 0)} />
          <Statistic title="核对容差(条)" value={Number(stats.verifyTolerance ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              placeholder="迁移编号 / 名称"
              allowClear
              style={{ width: 220 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="迁移类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={migType}
              onChange={(v) => setMigType(v)}
              options={[...OA_GOLIVE_MIG_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="迁移状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={migStatus}
              onChange={(v) => setMigStatus(v)}
              options={[...OA_GOLIVE_MIG_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="校验状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={verifyStatus}
              onChange={(v) => setVerifyStatus(v)}
              options={[...OA_GOLIVE_VERIFY_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, migType, migStatus, verifyStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMigType(undefined);
                  setMigStatus(undefined);
                  setVerifyStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MIGRATION_MANAGE) && <Button onClick={openCreate}>新增迁移</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`最终数据迁移（共 ${total} 条）`}>
        <Table<OaFinalMigrationItem>
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
        title="最终迁移详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="迁移编号">{plain(detail.migNo)}</Descriptions.Item>
            <Descriptions.Item label="迁移名称">{plain(detail.migName)}</Descriptions.Item>
            <Descriptions.Item label="迁移类型">
              {enumText(OA_GOLIVE_MIG_TYPE_LABEL, detail.migType)}
            </Descriptions.Item>
            <Descriptions.Item label="迁移状态">
              {enumTag(OA_GOLIVE_MIG_STATUS_LABEL, detail.migStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="抽取范围" span={2}>
              {plain(detail.sourceScope)}
            </Descriptions.Item>
            <Descriptions.Item label="抽取开始">{formatDateTime(detail.extractStart)}</Descriptions.Item>
            <Descriptions.Item label="抽取结束">{formatDateTime(detail.extractEnd)}</Descriptions.Item>
            <Descriptions.Item label="导入成功">{plain(detail.importedCount)}</Descriptions.Item>
            <Descriptions.Item label="导入失败">{plain(detail.failedCount)}</Descriptions.Item>
            <Descriptions.Item label="附件数">{plain(detail.attachmentCount)}</Descriptions.Item>
            <Descriptions.Item label="校验状态">
              {enumTag(OA_GOLIVE_VERIFY_STATUS_LABEL, detail.verifyStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="校验通过">{flagText(detail.verifyPass)}</Descriptions.Item>
            <Descriptions.Item label="操作人">{plain(detail.operatorName)}</Descriptions.Item>
            <Descriptions.Item label="迁移时间">{formatDateTime(detail.migTime)}</Descriptions.Item>
            <Descriptions.Item label="组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑最终迁移' : '新增最终迁移'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="migNo" label="迁移编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="migName"
            label="迁移名称"
            rules={[{ required: true, message: '请输入迁移名称' }]}
          >
            <Input placeholder="请输入迁移名称" />
          </Form.Item>
          <Form.Item name="migType" label="迁移类型">
            <Select placeholder="请选择" options={[...OA_GOLIVE_MIG_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceScope" label="抽取范围">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="extractStart" label="抽取开始时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="extractEnd" label="抽取结束时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="importedCount" label="导入成功条数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="failedCount" label="导入失败条数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="attachmentCount" label="附件数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="verifyStatus" label="校验状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_VERIFY_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="verifyPass" label="校验是否通过">
            <Select
              placeholder="请选择"
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="migStatus" label="迁移状态">
            <Select placeholder="请选择" options={[...OA_GOLIVE_MIG_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="migTime" label="迁移时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
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
