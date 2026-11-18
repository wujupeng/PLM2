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
import { dataQualityExceptionService } from '@/services/dataQualityService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/data-quality/shared';
import {
  DQ_ERROR_LEVEL_LABEL,
  DQ_ERROR_LEVEL_OPTIONS,
  DQ_EXCEPTION_STATUS_LABEL,
  DQ_EXCEPTION_STATUS_OPTIONS,
  type DataQualityExceptionHandleParams,
  type DataQualityExceptionItem,
  type DataQualityExceptionSaveParams,
  type DataQualityExceptionStats,
} from '@/types/dataQuality';

const { Title } = Typography;

const EXCEPTION_MANAGE = 'platform:dq:exception:manage';

export default function DataQualityExceptionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DataQualityExceptionSaveParams>();
  const [resolveForm] = Form.useForm<DataQualityExceptionHandleParams>();
  const [data, setData] = useState<DataQualityExceptionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [recordKey, setRecordKey] = useState('');
  const [errorLevel, setErrorLevel] = useState<string | undefined>(undefined);
  const [exceptionStatus, setExceptionStatus] = useState<string | undefined>(undefined);
  const [handlerName, setHandlerName] = useState('');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<DataQualityExceptionStats>({});
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolveSaving, setResolveSaving] = useState(false);

  const loadStats = useCallback(async () => {
    const res = await dataQualityExceptionService.stats();
    setStats(res || {});
  }, []);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rCode = ruleCode,
      tEntity = targetEntity,
      rKey = recordKey,
      eLevel = errorLevel,
      eStatus = exceptionStatus,
      hName = handlerName,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await dataQualityExceptionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          ruleCode: rCode || undefined,
          targetEntity: tEntity || undefined,
          recordKey: rKey || undefined,
          errorLevel: eLevel,
          exceptionStatus: eStatus,
          handlerName: hName || undefined,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [
      pageNum,
      pageSize,
      keyword,
      ruleCode,
      targetEntity,
      recordKey,
      errorLevel,
      exceptionStatus,
      handlerName,
      range,
    ],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', '', '', undefined, undefined, '', null);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ errorLevel: 'ERROR', exceptionStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: DataQualityExceptionItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DataQualityExceptionSaveParams = { ...values };
      if (editId == null) {
        await dataQualityExceptionService.create(payload);
        message.success('数据异常已创建');
      } else {
        await dataQualityExceptionService.update(editId, payload);
        message.success('数据异常已更新');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await dataQualityExceptionService.remove(id);
    message.success('数据异常已删除');
    void loadData();
    void loadStats();
  };

  const handle = async (id: number) => {
    await dataQualityExceptionService.handle(id);
    message.success('数据异常已受理');
    void loadData();
    void loadStats();
  };

  const ignore = async (id: number) => {
    await dataQualityExceptionService.ignore(id);
    message.success('数据异常已忽略');
    void loadData();
    void loadStats();
  };

  const openResolve = (record: DataQualityExceptionItem) => {
    setResolveId(record.id);
    resolveForm.resetFields();
    resolveForm.setFieldsValue({ handleNote: record.handleNote });
    setResolveOpen(true);
  };

  const submitResolve = async () => {
    const values = await resolveForm.validateFields();
    setResolveSaving(true);
    try {
      if (resolveId != null) {
        await dataQualityExceptionService.resolve(resolveId, { handleNote: values.handleNote || undefined });
        message.success('数据异常已解决');
        setResolveOpen(false);
        void loadData();
        void loadStats();
      }
    } finally {
      setResolveSaving(false);
    }
  };

  const columns: ColumnsType<DataQualityExceptionItem> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 160, fixed: 'left', render: plain },
    { title: '目标实体', dataIndex: 'targetEntity', width: 160, render: plain },
    { title: '记录ID', dataIndex: 'recordId', width: 100, render: plain },
    { title: '记录键', dataIndex: 'recordKey', width: 160, render: plain },
    { title: '错误级别', dataIndex: 'errorLevel', width: 100, render: (v) => statusTag(DQ_ERROR_LEVEL_LABEL, v) },
    { title: '错误信息', dataIndex: 'errorMessage', width: 220, ellipsis: true, render: plain },
    { title: '处理人', dataIndex: 'handlerName', width: 120, render: plain },
    { title: '处理时间', dataIndex: 'handledTime', width: 160, render: formatDateTime },
    { title: '处理说明', dataIndex: 'handleNote', width: 200, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'exceptionStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(DQ_EXCEPTION_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(EXCEPTION_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认受理该数据异常？" onConfirm={() => void handle(record.id)}>
              <Button type="link" size="small">
                受理
              </Button>
            </Popconfirm>
            <Button type="link" size="small" onClick={() => openResolve(record)}>
              解决
            </Button>
            <Popconfirm title="确认忽略该数据异常？" onConfirm={() => void ignore(record.id)}>
              <Button type="link" size="small">
                忽略
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该数据异常？" onConfirm={() => void remove(record.id)}>
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
        数据异常队列
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="异常总数" value={Number(stats.total ?? 0)} />
          <Statistic title="待处理" value={Number(stats.open ?? 0)} valueStyle={{ color: '#cf1322' }} />
          <Statistic title="处理中" value={Number(stats.handling ?? 0)} valueStyle={{ color: '#d48806' }} />
          <Statistic title="已解决" value={Number(stats.resolved ?? 0)} valueStyle={{ color: '#3f8600' }} />
          <Statistic title="已忽略" value={Number(stats.ignored ?? 0)} />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="规则编码">
            <Input
              placeholder="请输入规则编码"
              allowClear
              style={{ width: 160 }}
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="目标实体">
            <Input
              placeholder="请输入目标实体"
              allowClear
              style={{ width: 160 }}
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="记录键">
            <Input
              placeholder="请输入记录键"
              allowClear
              style={{ width: 160 }}
              value={recordKey}
              onChange={(e) => setRecordKey(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="错误级别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={errorLevel}
              onChange={(v) => setErrorLevel(v)}
              options={[...DQ_ERROR_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="异常状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={exceptionStatus}
              onChange={(v) => setExceptionStatus(v)}
              options={[...DQ_EXCEPTION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="处理人">
            <Input
              placeholder="请输入处理人"
              allowClear
              style={{ width: 140 }}
              value={handlerName}
              onChange={(e) => setHandlerName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="规则编码 / 记录键"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(
                    1,
                    pageSize,
                    keyword,
                    ruleCode,
                    targetEntity,
                    recordKey,
                    errorLevel,
                    exceptionStatus,
                    handlerName,
                    range,
                  );
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRuleCode('');
                  setTargetEntity('');
                  setRecordKey('');
                  setErrorLevel(undefined);
                  setExceptionStatus(undefined);
                  setHandlerName('');
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', '', '', undefined, undefined, '', null);
                }}
              >
                重置
              </Button>
              {hasPermission(EXCEPTION_MANAGE) && <Button onClick={openCreate}>新建数据异常</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`数据异常队列（共 ${total} 条）`}>
        <Table<DataQualityExceptionItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2500 }}
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
        title={editId == null ? '新建数据异常' : '编辑数据异常'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true, message: '请输入规则编码' }]}>
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="targetEntity" label="目标实体" rules={[{ required: true, message: '请输入目标实体' }]}>
            <Input placeholder="请输入目标实体" />
          </Form.Item>
          <Form.Item name="recordId" label="记录ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入记录ID" />
          </Form.Item>
          <Form.Item name="recordKey" label="记录键">
            <Input placeholder="请输入记录键" />
          </Form.Item>
          <Form.Item name="errorLevel" label="错误级别">
            <Select placeholder="请选择" options={[...DQ_ERROR_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="errorMessage" label="错误信息">
            <Input.TextArea rows={2} placeholder="请输入错误信息" />
          </Form.Item>
          <Form.Item name="exceptionStatus" label="异常状态">
            <Select placeholder="请选择" options={[...DQ_EXCEPTION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="handlerName" label="处理人">
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="handledTime" label="处理时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="handleNote" label="处理说明">
            <Input.TextArea rows={2} placeholder="请输入处理说明" />
          </Form.Item>
          <Form.Item name="orgId" label="组织ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入组织ID" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="解决数据异常"
        open={resolveOpen}
        onOk={() => void submitResolve()}
        confirmLoading={resolveSaving}
        onCancel={() => setResolveOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={resolveForm} layout="vertical" preserve={false}>
          <Form.Item name="handleNote" label="处理说明">
            <Input.TextArea rows={4} placeholder="请输入处理说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
