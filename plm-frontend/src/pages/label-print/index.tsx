import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { labelService } from '@/services/labelService';
import type {
  LabelPrintLogItem,
  LabelPrintQuery,
  LabelPrintTaskItem,
  LabelTemplateItem,
} from '@/types/label';
import {
  LABEL_TYPE_LABEL,
  LABEL_TYPE_OPTIONS,
  PRINT_ACTION_COLOR,
  PRINT_ACTION_LABEL,
  PRINT_STATUS_COLOR,
  PRINT_STATUS_LABEL,
  PRINT_STATUS_OPTIONS,
} from '@/types/label';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 是否补打下拉项 */
const REPRINT_FLAG_OPTIONS = [
  { label: '正常', value: 0 },
  { label: '补打', value: 1 },
];

/** 打印日志操作类型下拉项 */
const PRINT_ACTION_OPTIONS = [
  { label: '首次打印', value: 'PRINT' },
  { label: '补打', value: 'REPRINT' },
  { label: '作废', value: 'VOID' },
];

/** 打印任务查询表单值 */
interface PrintSearchValues {
  taskNo?: string;
  targetCode?: string;
  sourceCode?: string;
  printStatus?: string;
  reprintFlag?: number;
}

/** 打印任务查询条件 */
interface PrintCond {
  taskNo?: string;
  targetCode?: string;
  sourceCode?: string;
  printStatus?: string;
  reprintFlag?: number;
}

/** 打印日志查询表单值 */
interface PrintLogSearchValues {
  taskNo?: string;
  targetCode?: string;
  actionType?: string;
  range?: [Dayjs, Dayjs];
}

/** 打印日志查询条件 */
interface PrintLogCond {
  taskNo?: string;
  targetCode?: string;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** 新建打印任务表单值 */
interface PrintCreateValues {
  targetCode: string;
  templateCode?: string;
  labelType?: string;
  sourceCode?: string;
  qty?: number;
  printerName?: string;
  remark?: string;
}

/** 补打表单值 */
interface ReprintValues {
  reason: string;
  qty?: number;
  printerName?: string;
}

/** 作废表单值 */
interface VoidValues {
  reason?: string;
}

export default function LabelPrintPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  /* ---------------- Tab 1：打印任务 ---------------- */
  const [printForm] = Form.useForm<PrintSearchValues>();
  const [printData, setPrintData] = useState<LabelPrintTaskItem[]>([]);
  const [printTotal, setPrintTotal] = useState(0);
  const [printLoading, setPrintLoading] = useState(false);
  const [printPageNum, setPrintPageNum] = useState(1);
  const [printPageSize, setPrintPageSize] = useState(10);
  const [printCond, setPrintCond] = useState<PrintCond>({});

  /* 新建打印任务 */
  const [createForm] = Form.useForm<PrintCreateValues>();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [templateOptions, setTemplateOptions] = useState<LabelTemplateItem[]>([]);

  /* 详情 Drawer */
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTask, setDetailTask] = useState<LabelPrintTaskItem | null>(null);
  const [taskLogs, setTaskLogs] = useState<LabelPrintLogItem[]>([]);
  const [taskLogsLoading, setTaskLogsLoading] = useState(false);

  /* 补打 Modal */
  const [reprintForm] = Form.useForm<ReprintValues>();
  const [reprintOpen, setReprintOpen] = useState(false);
  const [reprinting, setReprinting] = useState(false);
  const [reprintTask, setReprintTask] = useState<LabelPrintTaskItem | null>(null);

  /* 作废 Modal */
  const [voidForm] = Form.useForm<VoidValues>();
  const [voidOpen, setVoidOpen] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [voidTask, setVoidTask] = useState<LabelPrintTaskItem | null>(null);

  /* ---------------- Tab 2：打印日志 ---------------- */
  const [logForm] = Form.useForm<PrintLogSearchValues>();
  const [logData, setLogData] = useState<LabelPrintLogItem[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logLoading, setLogLoading] = useState(false);
  const [logPageNum, setLogPageNum] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);
  const [logCond, setLogCond] = useState<PrintLogCond>({});

  /* ---------------- 打印任务列表 ---------------- */
  const loadPrints = useCallback(
    async (page = printPageNum, size = printPageSize, cond = printCond) => {
      setPrintLoading(true);
      try {
        const params: LabelPrintQuery = {
          pageNum: page,
          pageSize: size,
          taskNo: cond.taskNo || undefined,
          targetCode: cond.targetCode || undefined,
          sourceCode: cond.sourceCode || undefined,
          printStatus: cond.printStatus || undefined,
          reprintFlag: cond.reprintFlag,
        };
        const res = await labelService.printPage(params);
        setPrintData(res.list || []);
        setPrintTotal(res.total || 0);
      } finally {
        setPrintLoading(false);
      }
    },
    [printPageNum, printPageSize, printCond],
  );

  useEffect(() => {
    void loadPrints(1, printPageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPrintSearch = (values: PrintSearchValues) => {
    const cond: PrintCond = {
      taskNo: values.taskNo,
      targetCode: values.targetCode,
      sourceCode: values.sourceCode,
      printStatus: values.printStatus,
      reprintFlag: values.reprintFlag,
    };
    setPrintCond(cond);
    setPrintPageNum(1);
    void loadPrints(1, printPageSize, cond);
  };

  const onPrintReset = () => {
    printForm.resetFields();
    setPrintCond({});
    setPrintPageNum(1);
    void loadPrints(1, printPageSize, {});
  };

  /* 新建打印任务 */
  const openCreate = async () => {
    createForm.resetFields();
    createForm.setFieldsValue({ qty: 1 });
    setCreateOpen(true);
    const list = await labelService.templateOptions();
    setTemplateOptions(list || []);
  };

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    setCreating(true);
    try {
      await labelService.printCreate({
        targetCode: values.targetCode,
        templateCode: values.templateCode,
        labelType: values.labelType,
        sourceCode: values.sourceCode,
        qty: values.qty,
        printerName: values.printerName,
        remark: values.remark,
      });
      message.success('打印任务已创建');
      setCreateOpen(false);
      void loadPrints();
    } finally {
      setCreating(false);
    }
  };

  /* 详情 */
  const openDetail = async (record: LabelPrintTaskItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setTaskLogsLoading(true);
    try {
      const [detail, logs] = await Promise.all([
        labelService.printDetail(record.id),
        labelService.printLogsByTask(record.id),
      ]);
      setDetailTask(detail);
      setTaskLogs(logs || []);
    } finally {
      setDetailLoading(false);
      setTaskLogsLoading(false);
    }
  };

  /* 补打 */
  const openReprint = (record: LabelPrintTaskItem) => {
    reprintForm.resetFields();
    setReprintTask(record);
    setReprintOpen(true);
  };

  const handleReprint = async () => {
    if (!reprintTask) return;
    const values = await reprintForm.validateFields();
    setReprinting(true);
    try {
      const newTaskId = await labelService.reprint(reprintTask.id, {
        reason: values.reason,
        qty: values.qty,
        printerName: values.printerName,
      });
      message.success(`补打任务已创建，新任务 ID：${newTaskId}`);
      setReprintOpen(false);
      void loadPrints();
    } finally {
      setReprinting(false);
    }
  };

  /* 作废 */
  const openVoid = (record: LabelPrintTaskItem) => {
    voidForm.resetFields();
    setVoidTask(record);
    setVoidOpen(true);
  };

  const handleVoid = async () => {
    if (!voidTask) return;
    const values = await voidForm.validateFields();
    setVoiding(true);
    try {
      await labelService.voidTask(voidTask.id, values.reason);
      message.success('已作废');
      setVoidOpen(false);
      void loadPrints();
    } finally {
      setVoiding(false);
    }
  };

  /* ---------------- 打印日志列表 ---------------- */
  const loadLogs = useCallback(
    async (page = logPageNum, size = logPageSize, cond = logCond) => {
      setLogLoading(true);
      try {
        const res = await labelService.printLogPage({
          pageNum: page,
          pageSize: size,
          taskNo: cond.taskNo || undefined,
          targetCode: cond.targetCode || undefined,
          actionType: cond.actionType || undefined,
          dateFrom: cond.dateFrom,
          dateTo: cond.dateTo,
        });
        setLogData(res.list || []);
        setLogTotal(res.total || 0);
      } finally {
        setLogLoading(false);
      }
    },
    [logPageNum, logPageSize, logCond],
  );

  useEffect(() => {
    void loadLogs(1, logPageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogSearch = (values: PrintLogSearchValues) => {
    const cond: PrintLogCond = {
      taskNo: values.taskNo,
      targetCode: values.targetCode,
      actionType: values.actionType,
      dateFrom: values.range?.[0]?.format('YYYY-MM-DD'),
      dateTo: values.range?.[1]?.format('YYYY-MM-DD'),
    };
    setLogCond(cond);
    setLogPageNum(1);
    void loadLogs(1, logPageSize, cond);
  };

  const onLogReset = () => {
    logForm.resetFields();
    setLogCond({});
    setLogPageNum(1);
    void loadLogs(1, logPageSize, {});
  };

  /* ---------------- 列定义 ---------------- */
  const printColumns: ColumnsType<LabelPrintTaskItem> = [
    { title: '任务号', dataIndex: 'taskNo', width: 180 },
    { title: '追溯码', dataIndex: 'targetCode', width: 220, render: (v) => v || '-' },
    { title: '来源编码', dataIndex: 'sourceCode', width: 170, render: (v) => v || '-' },
    { title: '模板', dataIndex: 'templateCode', width: 130, render: (v) => v || '-' },
    {
      title: '标签类型',
      dataIndex: 'labelType',
      width: 130,
      render: (v?: string) => (v ? LABEL_TYPE_LABEL[v] || v : '-'),
    },
    { title: '打印数量', dataIndex: 'qty', width: 90, render: (v) => v ?? '-' },
    { title: '已打印', dataIndex: 'printedQty', width: 90, render: (v) => v ?? '-' },
    {
      title: '是否补打',
      dataIndex: 'reprintFlag',
      width: 180,
      render: (v: number | undefined, record) =>
        v === 1 ? (
          <Space size="small">
            <Tag color="orange">补打</Tag>
            {record.reprintReason ? <span>{record.reprintReason}</span> : null}
          </Space>
        ) : (
          '-'
        ),
    },
    { title: '原任务号', dataIndex: 'originTaskNo', width: 180, render: (v) => v || '-' },
    { title: '打印机', dataIndex: 'printerName', width: 130, render: (v) => v || '-' },
    {
      title: '打印状态',
      dataIndex: 'printStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={PRINT_STATUS_COLOR[v] || 'default'}>{PRINT_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: (v) => v || '-' },
    {
      title: '打印时间',
      dataIndex: 'printAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission('label:reprint') && record.printStatus === 'success' && (
            <Button type="link" size="small" onClick={() => openReprint(record)}>
              补打
            </Button>
          )}
          {hasPermission('label:reprint') && record.printStatus !== 'void' && (
            <Button type="link" size="small" danger onClick={() => openVoid(record)}>
              作废
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const logColumns: ColumnsType<LabelPrintLogItem> = [
    { title: '任务号', dataIndex: 'taskNo', width: 180, render: (v) => v || '-' },
    {
      title: '操作类型',
      dataIndex: 'actionType',
      width: 120,
      render: (v?: string) =>
        v ? <Tag color={PRINT_ACTION_COLOR[v] || 'default'}>{PRINT_ACTION_LABEL[v] || v}</Tag> : '-',
    },
    { title: '追溯码', dataIndex: 'targetCode', width: 220, render: (v) => v || '-' },
    { title: '模板', dataIndex: 'templateCode', width: 130, render: (v) => v || '-' },
    { title: '打印机', dataIndex: 'printerName', width: 130, render: (v) => v || '-' },
    { title: '结果', dataIndex: 'result', width: 100, render: (v) => v || '-' },
    { title: '明细', dataIndex: 'message', width: 240, render: (v) => v || '-' },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: (v) => v || '-' },
    {
      title: '打印时间',
      dataIndex: 'printAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  /* ================= Tab 1：打印任务 ================= */
  const printTab = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form form={printForm} layout="inline" onFinish={onPrintSearch}>
          <Form.Item name="taskNo" label="任务号">
            <Input placeholder="任务号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="targetCode" label="追溯码">
            <Input placeholder="追溯码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="sourceCode" label="来源编码">
            <Input placeholder="来源编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="printStatus" label="打印状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={PRINT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="reprintFlag" label="是否补打">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={REPRINT_FLAG_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onPrintReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`打印任务（共 ${printTotal} 条）`}
        extra={
          hasPermission('label:print') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => void openCreate()}>
              新建打印任务
            </Button>
          )
        }
      >
        <Table<LabelPrintTaskItem>
          rowKey="id"
          loading={printLoading}
          columns={printColumns}
          dataSource={printData}
          scroll={{ x: 2000 }}
          pagination={{
            current: printPageNum,
            pageSize: printPageSize,
            total: printTotal,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setPrintPageNum(page);
              setPrintPageSize(size);
              void loadPrints(page, size);
            },
          }}
        />
      </Card>
    </Space>
  );

  /* ================= Tab 2：打印日志 ================= */
  const logTab = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form form={logForm} layout="inline" onFinish={onLogSearch}>
          <Form.Item name="taskNo" label="任务号">
            <Input placeholder="任务号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="targetCode" label="追溯码">
            <Input placeholder="追溯码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="actionType" label="操作类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={PRINT_ACTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="range" label="打印时间">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onLogReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`打印日志（共 ${logTotal} 条）`}>
        <Table<LabelPrintLogItem>
          rowKey="id"
          loading={logLoading}
          columns={logColumns}
          dataSource={logData}
          scroll={{ x: 1400 }}
          pagination={{
            current: logPageNum,
            pageSize: logPageSize,
            total: logTotal,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setLogPageNum(page);
              setLogPageSize(size);
              void loadLogs(page, size);
            },
          }}
        />
      </Card>
    </Space>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        标签打印与补打
      </Title>

      <Tabs
        defaultActiveKey="tasks"
        items={[
          { key: 'tasks', label: '打印任务', children: printTab },
          { key: 'logs', label: '打印日志', children: logTab },
        ]}
      />

      {/* 新建打印任务 */}
      <Modal
        title="新建打印任务"
        open={createOpen}
        onOk={() => void handleCreate()}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={createForm} layout="vertical" preserve={false}>
          <Form.Item name="targetCode" label="追溯码" rules={[{ required: true, message: '请输入追溯码' }]}>
            <Input placeholder="请输入追溯码" />
          </Form.Item>
          <Form.Item name="templateCode" label="标签模板">
            <Select
              placeholder="请选择标签模板"
              allowClear
              options={templateOptions.map((item) => ({
                label: `${item.templateCode} - ${item.templateName}`,
                value: item.templateCode,
              }))}
            />
          </Form.Item>
          <Form.Item name="labelType" label="标签类型">
            <Select placeholder="请选择" allowClear options={LABEL_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceCode" label="来源编码">
            <Input placeholder="请输入来源编码" />
          </Form.Item>
          <Form.Item name="qty" label="打印数量">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="printerName" label="打印机">
            <Input placeholder="请输入打印机名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 打印任务详情 */}
      <Drawer
        title={`打印任务详情 - ${detailTask?.taskNo || ''}`}
        width={900}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" title="任务信息" loading={detailLoading}>
            {detailTask && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'id', label: 'ID', children: detailTask.id },
                  { key: 'taskNo', label: '任务号', children: detailTask.taskNo },
                  { key: 'targetCode', label: '追溯码', children: detailTask.targetCode || '-' },
                  { key: 'sourceCode', label: '来源编码', children: detailTask.sourceCode || '-' },
                  { key: 'templateCode', label: '模板', children: detailTask.templateCode || '-' },
                  {
                    key: 'labelType',
                    label: '标签类型',
                    children: detailTask.labelType ? LABEL_TYPE_LABEL[detailTask.labelType] || detailTask.labelType : '-',
                  },
                  { key: 'productCode', label: '产品编码', children: detailTask.productCode || '-' },
                  { key: 'materialCode', label: '物料编码', children: detailTask.materialCode || '-' },
                  { key: 'qty', label: '打印数量', children: detailTask.qty ?? '-' },
                  { key: 'printedQty', label: '已打印', children: detailTask.printedQty ?? '-' },
                  {
                    key: 'reprintFlag',
                    label: '是否补打',
                    children: detailTask.reprintFlag === 1 ? <Tag color="orange">补打</Tag> : '正常',
                  },
                  { key: 'reprintReason', label: '补打原因', children: detailTask.reprintReason || '-' },
                  { key: 'originTaskNo', label: '原任务号', children: detailTask.originTaskNo || '-' },
                  { key: 'printerName', label: '打印机', children: detailTask.printerName || '-' },
                  {
                    key: 'printStatus',
                    label: '打印状态',
                    children: detailTask.printStatus ? (
                      <Tag color={PRINT_STATUS_COLOR[detailTask.printStatus] || 'default'}>
                        {PRINT_STATUS_LABEL[detailTask.printStatus] || detailTask.printStatus}
                      </Tag>
                    ) : (
                      '-'
                    ),
                  },
                  { key: 'operatorName', label: '操作人', children: detailTask.operatorName || '-' },
                  {
                    key: 'printAt',
                    label: '打印时间',
                    children: detailTask.printAt ? dayjs(detailTask.printAt).format('YYYY-MM-DD HH:mm:ss') : '-',
                  },
                  { key: 'scanLogId', label: '扫描日志 ID', children: detailTask.scanLogId ?? '-' },
                  { key: 'remark', label: '备注', children: detailTask.remark || '-' },
                ]}
              />
            )}
          </Card>
          <Card size="small" title="标签内容">
            <pre style={{ margin: 0, maxHeight: 260, overflow: 'auto' }}>{detailTask?.contentText || '-'}</pre>
          </Card>
          <Card size="small" title="操作日志" loading={taskLogsLoading}>
            {taskLogs.length > 0 ? (
              <Timeline
                items={taskLogs.map((log) => ({
                  color: PRINT_ACTION_COLOR[log.actionType || ''] || 'blue',
                  children: (
                    <div>
                      <div>
                        <Tag color={PRINT_ACTION_COLOR[log.actionType || ''] || 'default'}>
                          {PRINT_ACTION_LABEL[log.actionType || ''] || log.actionType || '-'}
                        </Tag>
                        {log.result ? <span>结果：{log.result}</span> : null}
                      </div>
                      {log.message ? <div>明细：{log.message}</div> : null}
                      <div style={{ color: '#888' }}>
                        {log.operatorName || '-'}　{log.printAt ? dayjs(log.printAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Typography.Text type="secondary">暂无操作日志</Typography.Text>
            )}
          </Card>
        </Space>
      </Drawer>

      {/* 补打 */}
      <Modal
        title={`补打标签 - ${reprintTask?.taskNo || ''}`}
        open={reprintOpen}
        onOk={() => void handleReprint()}
        confirmLoading={reprinting}
        onCancel={() => setReprintOpen(false)}
        destroyOnClose
      >
        <Form form={reprintForm} layout="vertical" preserve={false}>
          <Form.Item name="reason" label="补打原因" rules={[{ required: true, message: '请输入补打原因' }]}>
            <Input.TextArea rows={3} placeholder="请输入补打原因" />
          </Form.Item>
          <Form.Item name="qty" label="打印数量" tooltip="留空表示沿用原任务数量">
            <InputNumber style={{ width: '100%' }} min={1} placeholder="留空沿用原数量" />
          </Form.Item>
          <Form.Item name="printerName" label="打印机">
            <Input placeholder="请输入打印机名称" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 作废 */}
      <Modal
        title={`作废标签任务 - ${voidTask?.taskNo || ''}`}
        open={voidOpen}
        onOk={() => void handleVoid()}
        confirmLoading={voiding}
        onCancel={() => setVoidOpen(false)}
        destroyOnClose
      >
        <p>确认作废该打印任务？作废后不可恢复。</p>
        <Form form={voidForm} layout="vertical" preserve={false}>
          <Form.Item name="reason" label="作废原因">
            <Input.TextArea rows={3} placeholder="请输入作废原因（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
