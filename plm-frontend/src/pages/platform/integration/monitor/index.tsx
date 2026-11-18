import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import type { Dayjs } from 'dayjs';
import { platformMonitorService } from '@/services/platformService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumText } from '@/pages/oa/integration/shared';
import { boolTag, healthTag, percentText } from '@/pages/platform/integration/shared';
import {
  PLATFORM_HEALTH_STATUS_LABEL,
  PLATFORM_HEALTH_STATUS_OPTIONS,
  PLATFORM_SYSTEM_LABEL,
  PLATFORM_SYSTEM_OPTIONS,
  PLATFORM_TARGET_TYPE_LABEL,
  PLATFORM_TARGET_TYPE_OPTIONS,
  type PlatformMonitorItem,
  type PlatformMonitorSaveParams,
  type PlatformStats,
} from '@/types/platform';

const { Title } = Typography;

const MONITOR_MANAGE = 'platform:integration:monitor:manage';

interface MonitorFormValues {
  monitorNo?: string;
  monitorDay?: string;
  statHour?: number;
  systemCode?: string;
  targetType?: string;
  targetCode?: string;
  targetName?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  avgCostMs?: number;
  maxCostMs?: number;
  orgName?: string;
  remark?: string;
}

export default function PlatformMonitorPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MonitorFormValues>();
  const [data, setData] = useState<PlatformMonitorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [systemCode, setSystemCode] = useState<string | undefined>(undefined);
  const [targetType, setTargetType] = useState<string | undefined>(undefined);
  const [healthStatus, setHealthStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({});

  const loadStats = useCallback(async () => {
    const res = await platformMonitorService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sys = systemCode,
      tt = targetType,
      hs = healthStatus,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await platformMonitorService.pageMonitors({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          systemCode: sys,
          targetType: tt,
          healthStatus: hs,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, systemCode, targetType, healthStatus, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      targetType: 'API',
      statHour: 0,
      totalCount: 0,
      successCount: 0,
      failCount: 0,
      avgCostMs: 0,
      maxCostMs: 0,
    });
    setOpen(true);
  };

  const openEdit = (record: PlatformMonitorItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: PlatformMonitorSaveParams = { ...values, systemCode: values.systemCode! };
      if (editId == null) {
        await platformMonitorService.create(payload);
        message.success('监控记录已创建');
      } else {
        await platformMonitorService.update(editId, payload);
        message.success('监控记录已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await platformMonitorService.remove(id);
    message.success('监控记录已删除');
    void loadData();
    void loadStats();
  };

  const aggregate = async (id: number) => {
    const res = await platformMonitorService.aggregate(id);
    message.success(`已重新汇总，健康度：${PLATFORM_HEALTH_STATUS_LABEL[res.healthStatus] || res.healthStatus}`);
    void loadData();
    void loadStats();
  };

  const columns: ColumnsType<PlatformMonitorItem> = [
    { title: '监控编号', dataIndex: 'monitorNo', width: 170, fixed: 'left', render: plain },
    { title: '监控日期', dataIndex: 'monitorDay', width: 120, render: plain },
    { title: '小时', dataIndex: 'statHour', width: 70, render: plain },
    { title: '所属系统', dataIndex: 'systemCode', width: 100, render: (v) => enumText(PLATFORM_SYSTEM_LABEL, v) },
    { title: '目标类型', dataIndex: 'targetType', width: 100, render: (v) => enumText(PLATFORM_TARGET_TYPE_LABEL, v) },
    { title: '目标编码', dataIndex: 'targetCode', width: 160, render: plain },
    { title: '目标名称', dataIndex: 'targetName', width: 160, render: plain },
    { title: '调用总数', dataIndex: 'totalCount', width: 90, render: plain },
    { title: '成功数', dataIndex: 'successCount', width: 90, render: plain },
    { title: '失败数', dataIndex: 'failCount', width: 90, render: plain },
    { title: '失败率', key: 'failRate', width: 90, render: (_, r) => percentText(r.totalCount ? Math.round(((r.failCount ?? 0) * 100) / r.totalCount) : 0) },
    { title: '平均耗时(ms)', dataIndex: 'avgCostMs', width: 110, render: plain },
    { title: '最大耗时(ms)', dataIndex: 'maxCostMs', width: 110, render: plain },
    {
      title: '健康度',
      dataIndex: 'healthStatus',
      width: 90,
      fixed: 'right',
      render: (v) => healthTag(PLATFORM_HEALTH_STATUS_LABEL, v),
    },
    { title: '告警', dataIndex: 'alertFlag', width: 70, render: boolTag },
    { title: '告警信息', dataIndex: 'alertMessage', width: 180, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MONITOR_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认按当前计数重新汇总健康度？" onConfirm={() => void aggregate(record.id)}>
              <Button type="link" size="small">
                重新汇总
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该监控记录？" onConfirm={() => void remove(record.id)}>
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
        集成监控
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="监控总数" value={Number(stats.total ?? 0)} />
          <Statistic title="健康" value={Number(stats.healthy ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="告警" value={Number(stats.warning ?? 0)} valueStyle={{ color: '#d48806' }} />
          <Statistic title="严重" value={Number(stats.critical ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="告警记录" value={Number(stats.alertCount ?? 0)} />
          <Statistic title="调用总量" value={Number(stats.totalCount ?? 0)} />
          <Statistic title="成功总量" value={Number(stats.successCount ?? 0)} />
          <Statistic title="失败总量" value={Number(stats.failCount ?? 0)} />
          <Statistic title="整体失败率" value={Number(stats.failRate ?? 0)} suffix="%" />
          <Statistic title="告警阈值" value={Number(stats.alertFailRate ?? 0)} suffix="%" />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="所属系统">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={systemCode}
              onChange={(v) => setSystemCode(v)}
              options={[...PLATFORM_SYSTEM_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="目标类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={targetType}
              onChange={(v) => setTargetType(v)}
              options={[...PLATFORM_TARGET_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="健康度">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={healthStatus}
              onChange={(v) => setHealthStatus(v)}
              options={[...PLATFORM_HEALTH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="监控日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="编号 / 系统 / 目标"
              allowClear
              style={{ width: 190 }}
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
                  void loadData(1, pageSize, keyword, systemCode, targetType, healthStatus, range);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSystemCode(undefined);
                  setTargetType(undefined);
                  setHealthStatus(undefined);
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, null);
                }}
              >
                重置
              </Button>
              {hasPermission(MONITOR_MANAGE) && <Button onClick={openCreate}>新建监控</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`集成监控（共 ${total} 条）`}>
        <Table<PlatformMonitorItem>
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
        title={editId == null ? '新建监控记录' : '编辑监控记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="monitorNo" label="监控编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="monitorDay" label="监控日期">
            <Input placeholder="格式 yyyy-MM-dd，留空取当天" />
          </Form.Item>
          <Form.Item name="statHour" label="统计小时">
            <InputNumber min={0} max={23} style={{ width: '100%' }} placeholder="0-23，0 表示按天汇总" />
          </Form.Item>
          <Form.Item name="systemCode" label="所属系统" rules={[{ required: true, message: '请选择所属系统' }]}>
            <Select placeholder="请选择" options={[...PLATFORM_SYSTEM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="targetType" label="目标类型">
            <Select placeholder="请选择" options={[...PLATFORM_TARGET_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="targetCode" label="目标编码">
            <Input placeholder="请输入目标编码" />
          </Form.Item>
          <Form.Item name="targetName" label="目标名称">
            <Input placeholder="请输入目标名称" />
          </Form.Item>
          <Form.Item name="totalCount" label="调用总数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="successCount" label="成功数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="failCount" label="失败数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="avgCostMs" label="平均耗时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxCostMs" label="最大耗时(ms)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="健康度与告警由失败率自动推导，无需手工填写" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
