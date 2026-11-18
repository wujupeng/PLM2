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
import { oaBackupDrillService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag, enumText } from '@/pages/oa/integration/shared';
import {
  OA_BACKUP_DRILL_TYPE_LABEL,
  OA_BACKUP_DRILL_TYPE_OPTIONS,
  OA_BACKUP_RESTORE_RESULT_LABEL,
  OA_BACKUP_RESTORE_RESULT_OPTIONS,
  type OaBackupDrillItem,
  type OaBackupDrillSaveParams,
  type OaTestQuery,
} from '@/types/oa';

const { Title } = Typography;

const BACKUP_MANAGE = 'oa:test:backup:manage';

const DATA_VERIFIED_OPTIONS = [
  { label: '已校验', value: 1 },
  { label: '未校验', value: 0 },
] as const;

export default function OaBackupDrillPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaBackupDrillSaveParams>();
  const [data, setData] = useState<OaBackupDrillItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [drillType, setDrillType] = useState<string | undefined>(undefined);
  const [restoreResult, setRestoreResult] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OaBackupDrillItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = drillType,
      result = restoreResult,
    ) => {
      setLoading(true);
      try {
        const params: OaTestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          drillType: type,
          restoreResult: result,
        };
        const res = await oaBackupDrillService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, drillType, restoreResult],
  );

  const loadStats = useCallback(async () => {
    const res = await oaBackupDrillService.stats();
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

  const openEdit = (record: OaBackupDrillItem) => {
    setEditingId(record.id);
    form.resetFields();
    form.setFieldsValue({
      drillNo: record.drillNo,
      drillName: record.drillName,
      drillType: record.drillType,
      backupSource: record.backupSource,
      backupTime: record.backupTime,
      targetRpoMinutes: record.targetRpoMinutes,
      targetRtoMinutes: record.targetRtoMinutes,
      restoreStart: record.restoreStart,
      restoreEnd: record.restoreEnd,
      actualRpoMinutes: record.actualRpoMinutes,
      actualRtoMinutes: record.actualRtoMinutes,
      restoreResult: record.restoreResult,
      dataVerified: record.dataVerified,
      operatorName: record.operatorName,
      drillTime: record.drillTime,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaBackupDrillItem) => {
    setDetailOpen(true);
    const res = await oaBackupDrillService.detail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaBackupDrillSaveParams = { ...values };
      if (editingId !== null) {
        await oaBackupDrillService.update(editingId, payload);
        message.success('备份恢复演练已更新');
      } else {
        await oaBackupDrillService.create(payload);
        message.success('备份恢复演练已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const restore = async (id: number) => {
    await oaBackupDrillService.restore(id);
    message.success('已执行恢复');
    void loadData();
    void loadStats();
  };

  const remove = async (id: number) => {
    await oaBackupDrillService.remove(id);
    message.success('备份恢复演练已删除');
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<OaBackupDrillItem> = [
    { title: '演练编号', dataIndex: 'drillNo', width: 170, fixed: 'left', render: plain },
    { title: '演练名称', dataIndex: 'drillName', width: 180, render: plain },
    {
      title: '演练类型',
      dataIndex: 'drillType',
      width: 110,
      render: (v) => enumText(OA_BACKUP_DRILL_TYPE_LABEL, v),
    },
    { title: '备份来源', dataIndex: 'backupSource', width: 180, render: plain },
    { title: '备份时间', dataIndex: 'backupTime', width: 170, render: formatDateTime },
    { title: '目标RPO', dataIndex: 'targetRpoMinutes', width: 100, render: plain },
    { title: '目标RTO', dataIndex: 'targetRtoMinutes', width: 100, render: plain },
    { title: '实际RPO', dataIndex: 'actualRpoMinutes', width: 100, render: plain },
    { title: '实际RTO', dataIndex: 'actualRtoMinutes', width: 100, render: plain },
    {
      title: '恢复结果',
      dataIndex: 'restoreResult',
      width: 110,
      render: (v) => enumTag(OA_BACKUP_RESTORE_RESULT_LABEL, v),
    },
    {
      title: '数据校验',
      dataIndex: 'dataVerified',
      width: 100,
      render: (v) => (Number(v) === 1 ? '已校验' : '未校验'),
    },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: plain },
    { title: '演练时间', dataIndex: 'drillTime', width: 170, render: formatDateTime },
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
          {hasPermission(BACKUP_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(BACKUP_MANAGE) && (
            <Button type="link" size="small" onClick={() => void restore(record.id)}>
              执行恢复
            </Button>
          )}
          {hasPermission(BACKUP_MANAGE) && (
            <Popconfirm title="确认删除该演练记录？" onConfirm={() => void remove(record.id)}>
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
        备份恢复演练
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="演练总数" value={Number(stats.total ?? 0)} />
          <Statistic
            title="成功"
            value={Number(stats.success ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="部分成功"
            value={Number(stats.partial ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic
            title="失败"
            value={Number(stats.failed ?? 0)}
            valueStyle={{ color: '#cf1322' }}
          />
          <Statistic
            title="待恢复"
            value={Number(stats.pending ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic title="目标RPO(分钟)" value={Number(stats.targetRpo ?? 0)} />
          <Statistic title="目标RTO(分钟)" value={Number(stats.targetRto ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="演练类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={drillType}
              onChange={(v) => setDrillType(v)}
              options={[...OA_BACKUP_DRILL_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="恢复结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={restoreResult}
              onChange={(v) => setRestoreResult(v)}
              options={[...OA_BACKUP_RESTORE_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="演练编号 / 名称"
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
                  void loadData(1, pageSize, keyword, drillType, restoreResult);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setDrillType(undefined);
                  setRestoreResult(undefined);
                  setKeyword('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(BACKUP_MANAGE) && <Button onClick={openCreate}>新增演练</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`备份恢复演练（共 ${total} 条）`}>
        <Table<OaBackupDrillItem>
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
        title="备份恢复演练详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="演练编号">{plain(detail.drillNo)}</Descriptions.Item>
            <Descriptions.Item label="演练名称">{plain(detail.drillName)}</Descriptions.Item>
            <Descriptions.Item label="演练类型">
              {enumText(OA_BACKUP_DRILL_TYPE_LABEL, detail.drillType)}
            </Descriptions.Item>
            <Descriptions.Item label="备份来源">{plain(detail.backupSource)}</Descriptions.Item>
            <Descriptions.Item label="备份时间">{formatDateTime(detail.backupTime)}</Descriptions.Item>
            <Descriptions.Item label="目标RPO">{plain(detail.targetRpoMinutes)}</Descriptions.Item>
            <Descriptions.Item label="目标RTO">{plain(detail.targetRtoMinutes)}</Descriptions.Item>
            <Descriptions.Item label="实际RPO">{plain(detail.actualRpoMinutes)}</Descriptions.Item>
            <Descriptions.Item label="实际RTO">{plain(detail.actualRtoMinutes)}</Descriptions.Item>
            <Descriptions.Item label="恢复开始">{plain(detail.restoreStart)}</Descriptions.Item>
            <Descriptions.Item label="恢复结束">{plain(detail.restoreEnd)}</Descriptions.Item>
            <Descriptions.Item label="恢复结果">
              {enumTag(OA_BACKUP_RESTORE_RESULT_LABEL, detail.restoreResult)}
            </Descriptions.Item>
            <Descriptions.Item label="数据校验">
              {Number(detail.dataVerified) === 1 ? '已校验' : '未校验'}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">{plain(detail.operatorName)}</Descriptions.Item>
            <Descriptions.Item label="演练时间">{formatDateTime(detail.drillTime)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editingId !== null ? '编辑备份恢复演练' : '新增备份恢复演练'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="drillNo" label="演练编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="drillName"
            label="演练名称"
            rules={[{ required: true, message: '请输入演练名称' }]}
          >
            <Input placeholder="如 数据库全量恢复演练" />
          </Form.Item>
          <Form.Item name="drillType" label="演练类型">
            <Select placeholder="请选择" options={[...OA_BACKUP_DRILL_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="backupSource" label="备份来源">
            <Input placeholder="备份文件 / 快照标识" />
          </Form.Item>
          <Form.Item name="backupTime" label="备份时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="targetRpoMinutes" label="目标RPO(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetRtoMinutes" label="目标RTO(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="restoreStart" label="恢复开始">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="restoreEnd" label="恢复结束">
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="actualRpoMinutes" label="实际RPO(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="actualRtoMinutes" label="实际RTO(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="restoreResult" label="恢复结果">
            <Select placeholder="请选择" options={[...OA_BACKUP_RESTORE_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="dataVerified" label="数据校验">
            <Select placeholder="请选择" options={[...DATA_VERIFIED_OPTIONS]} />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input />
          </Form.Item>
          <Form.Item name="drillTime" label="演练时间">
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
