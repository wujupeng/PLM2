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
import { platformIdempotentService } from '@/services/platformService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { statusTag } from '@/pages/platform/integration/shared';
import {
  PLATFORM_RECORD_STATUS_LABEL,
  PLATFORM_RECORD_STATUS_OPTIONS,
  type PlatformIdempotentCheckResult,
  type PlatformIdempotentRecordItem,
  type PlatformIdempotentRecordSaveParams,
  type PlatformStats,
} from '@/types/platform';

const { Title } = Typography;

const IDEMPOTENT_MANAGE = 'platform:integration:idempotent:manage';

interface RecordFormValues {
  idempotentKey?: string;
  bizType?: string;
  bizId?: string;
  requestHash?: string;
  resultCode?: number;
  expireAt?: string;
  recordStatus?: string;
  operatorName?: string;
  orgName?: string;
  remark?: string;
}

export default function PlatformIdempotentRecordsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<RecordFormValues>();
  const [data, setData] = useState<PlatformIdempotentRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [recordStatus, setRecordStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({});

  const [checkKey, setCheckKey] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<PlatformIdempotentCheckResult | null>(null);

  const loadStats = useCallback(async () => {
    const res = await platformIdempotentService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, st = recordStatus) => {
      setLoading(true);
      try {
        const res = await platformIdempotentService.pageRecords({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          recordStatus: st,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, recordStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runCheck = async () => {
    if (!checkKey.trim()) {
      message.warning('请输入幂等键');
      return;
    }
    setCheckLoading(true);
    try {
      const res = await platformIdempotentService.check(checkKey.trim());
      setCheckResult(res);
    } finally {
      setCheckLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ recordStatus: 'PROCESSING' });
    setOpen(true);
  };

  const openEdit = (record: PlatformIdempotentRecordItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformIdempotentRecordSaveParams = { ...values, idempotentKey: values.idempotentKey! };
      if (editId == null) {
        await platformIdempotentService.create(payload);
        message.success('幂等记录已创建');
      } else {
        await platformIdempotentService.update(editId, payload);
        message.success('幂等记录已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformIdempotentService.remove(id);
    message.success('幂等记录已删除');
    void loadData();
    void loadStats();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<PlatformIdempotentRecordItem> = [
    { title: '幂等键', dataIndex: 'idempotentKey', width: 220, fixed: 'left', ellipsis: true, render: plain },
    { title: '业务类型', dataIndex: 'bizType', width: 140, render: plain },
    { title: '业务ID', dataIndex: 'bizId', width: 150, render: plain },
    { title: '请求摘要', dataIndex: 'requestHash', width: 180, ellipsis: true, render: plain },
    { title: '结果码', dataIndex: 'resultCode', width: 90, render: plain },
    { title: '过期时间', dataIndex: 'expireAt', width: 160, render: formatDateTime },
    {
      title: '记录状态',
      dataIndex: 'recordStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(PLATFORM_RECORD_STATUS_LABEL, v),
    },
    { title: '操作人', dataIndex: 'operatorName', width: 100, render: plain },
    { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(IDEMPOTENT_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认标记为成功？" onConfirm={() => void act(platformIdempotentService.markSuccess, record.id, '已标记成功')}>
              <Button type="link" size="small">
                标记成功
              </Button>
            </Popconfirm>
            <Popconfirm title="确认标记为重复？" onConfirm={() => void act(platformIdempotentService.markDuplicate, record.id, '已标记重复')}>
              <Button type="link" size="small">
                标记重复
              </Button>
            </Popconfirm>
            <Popconfirm title="确认标记为失败？" onConfirm={() => void act(platformIdempotentService.markFail, record.id, '已标记失败')}>
              <Button type="link" size="small">
                标记失败
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该幂等记录？" onConfirm={() => void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        幂等记录
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="记录总数" value={Number(stats.total ?? 0)} />
          <Statistic title="处理中" value={Number(stats.processing ?? 0)} />
          <Statistic title="成功" value={Number(stats.success ?? 0)} />
          <Statistic title="重复请求" value={Number(stats.duplicate ?? 0)} />
          <Statistic title="失败" value={Number(stats.failed ?? 0)} />
          <Statistic title="有效期(小时)" value={Number(stats.expireHours ?? 0)} />
        </Space>
      </Card>

      <Card title="幂等校验">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Input
              placeholder="请输入幂等键"
              allowClear
              style={{ width: 320 }}
              value={checkKey}
              onChange={(e) => setCheckKey(e.target.value)}
              onPressEnter={() => void runCheck()}
            />
            <Button type="primary" loading={checkLoading} onClick={() => void runCheck()}>
              校验
            </Button>
            <Button
              onClick={() => {
                setCheckKey('');
                setCheckResult(null);
              }}
            >
              清空
            </Button>
          </Space>
          {checkResult ? (
            <Descriptions column={4} bordered size="small">
              <Descriptions.Item label="是否存在">{checkResult.exists ? '存在' : '不存在'}</Descriptions.Item>
              <Descriptions.Item label="记录状态">
                {enumText(PLATFORM_RECORD_STATUS_LABEL, checkResult.recordStatus ?? '')}
              </Descriptions.Item>
              <Descriptions.Item label="业务类型">{plain(checkResult.bizType)}</Descriptions.Item>
              <Descriptions.Item label="业务ID">{plain(checkResult.bizId)}</Descriptions.Item>
            </Descriptions>
          ) : null}
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="记录状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={recordStatus}
              onChange={(v) => setRecordStatus(v)}
              options={[...PLATFORM_RECORD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="幂等键 / 业务类型 / 业务ID"
              allowClear
              style={{ width: 230 }}
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
                  void loadData(1, pageSize, keyword, recordStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRecordStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(IDEMPOTENT_MANAGE) && <Button onClick={openCreate}>新建幂等记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`幂等记录（共 ${total} 条）`}>
        <Table<PlatformIdempotentRecordItem>
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
        title={editId == null ? '新建幂等记录' : '编辑幂等记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="idempotentKey" label="幂等键" rules={[{ required: true, message: '请输入幂等键' }]}>
            <Input placeholder="请输入幂等键" />
          </Form.Item>
          <Form.Item name="bizType" label="业务类型">
            <Input placeholder="请输入业务类型" />
          </Form.Item>
          <Form.Item name="bizId" label="业务ID">
            <Input placeholder="请输入业务ID" />
          </Form.Item>
          <Form.Item name="requestHash" label="请求摘要哈希">
            <Input placeholder="请输入请求摘要哈希" />
          </Form.Item>
          <Form.Item name="resultCode" label="处理结果码">
            <InputNumber style={{ width: '100%' }} placeholder="如 200" />
          </Form.Item>
          <Form.Item name="expireAt" label="过期时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss，留空按有效期自动计算" />
          </Form.Item>
          <Form.Item name="recordStatus" label="记录状态">
            <Select placeholder="请选择" options={[...PLATFORM_RECORD_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
