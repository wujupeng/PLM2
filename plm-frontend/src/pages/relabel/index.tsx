import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Collapse,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, ScanOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { relabelService } from '@/services/relabelService';
import { labelService } from '@/services/labelService';
import { codeService } from '@/services/codeService';
import type {
  CodeDictionaryItem,
  CodeGenerateResult,
  CodeMappingItem,
  CodeParseResult,
  CodeSegmentValue,
  RelabelScanResult,
  ScanLogItem,
} from '@/types/label';
import {
  CODE_MAPPING_STATUS_COLOR,
  CODE_MAPPING_STATUS_LABEL,
  CODE_TYPE_OPTIONS,
  SCAN_ACTION_COLOR,
  SCAN_ACTION_LABEL,
  SCAN_ACTION_OPTIONS,
  SEGMENT_VALUE_TYPE_LABEL,
} from '@/types/label';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 是否有效下拉项 */
const VALID_FLAG_OPTIONS = [
  { label: '有效', value: 1 },
  { label: '失败', value: 0 },
];

/** 单条扫描表单值 */
interface ScanFormValues {
  sourceCode: string;
  terminalNo?: string;
  plantCode?: string;
}

/** 生成编码小工具表单值 */
interface GenFormValues {
  codeType?: string;
  customerPartNo?: string;
  versionNo?: string;
  generateDate: Dayjs;
}

/** 扫码日志查询表单值 */
interface LogSearchValues {
  sourceCode?: string;
  targetCode?: string;
  actionType?: string;
  validFlag?: number;
  terminalNo?: string;
  range?: [Dayjs, Dayjs];
}

/** 扫码日志查询条件 */
interface LogCond {
  sourceCode?: string;
  targetCode?: string;
  actionType?: string;
  validFlag?: number;
  terminalNo?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** 将 JSON 字符串格式化展示，解析失败时返回原文 */
function formatJson(text?: string): string {
  if (!text) return '-';
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export default function RelabelPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canScan = hasPermission('relabel:scan');

  /* ---------------- Card 1：扫描换标 ---------------- */
  const [scanForm] = Form.useForm<ScanFormValues>();
  const [plantOptions, setPlantOptions] = useState<CodeDictionaryItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<RelabelScanResult | null>(null);
  const [parseResult, setParseResult] = useState<CodeParseResult | null>(null);

  const [batchText, setBatchText] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchRows, setBatchRows] = useState<RelabelScanResult[]>([]);

  const [barcode, setBarcode] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  /* 生成编码小工具 */
  const [genForm] = Form.useForm<GenFormValues>();
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<CodeGenerateResult | null>(null);

  /* ---------------- Card 2：扫码日志 ---------------- */
  const [logForm] = Form.useForm<LogSearchValues>();
  const [logData, setLogData] = useState<ScanLogItem[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logLoading, setLogLoading] = useState(false);
  const [logPageNum, setLogPageNum] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);
  const [logCond, setLogCond] = useState<LogCond>({});

  const [logDetailOpen, setLogDetailOpen] = useState(false);
  const [logDetailLoading, setLogDetailLoading] = useState(false);
  const [logDetail, setLogDetail] = useState<ScanLogItem | null>(null);

  /* ---------------- Card 3：映射查询 ---------------- */
  const [mappingForm] = Form.useForm<{ sourceCode?: string; targetCode?: string }>();
  const [mapping, setMapping] = useState<CodeMappingItem | null>(null);
  const [mappingLoading, setMappingLoading] = useState(false);

  /* 制造地码表 */
  useEffect(() => {
    const load = async () => {
      const list = await codeService.dictOptions('code_plant');
      setPlantOptions(list || []);
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 新码条码（Data Matrix） */
  const targetCode = result?.targetCode;
  useEffect(() => {
    if (!targetCode) {
      setBarcode('');
      return;
    }
    let cancelled = false;
    setBarcodeLoading(true);
    labelService
      .barcodeBase64(targetCode, 'DATA_MATRIX', 220)
      .then((url) => {
        if (!cancelled) setBarcode(url);
      })
      .finally(() => {
        if (!cancelled) setBarcodeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetCode]);

  /* ---------------- 扫描换标操作 ---------------- */
  const handleScan = async (values: ScanFormValues) => {
    setScanning(true);
    try {
      const res = await relabelService.scan({
        sourceCode: values.sourceCode,
        plantCode: values.plantCode,
        terminalNo: values.terminalNo,
      });
      setResult(res);
      setParseResult(null);
    } finally {
      setScanning(false);
    }
  };

  const handleParse = async () => {
    const values = await scanForm.validateFields(['sourceCode']);
    const res = await relabelService.parse({ code: values.sourceCode });
    setParseResult(res);
  };

  const handleBatch = async () => {
    const codes = batchText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (codes.length === 0) {
      message.warning('请先粘贴待扫描的原标签编码');
      return;
    }
    setBatchLoading(true);
    try {
      const res = await relabelService.scanBatch({ sourceCodes: codes });
      setBatchRows(res || []);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleGenerate = async (values: GenFormValues) => {
    setGenerating(true);
    try {
      const res = await relabelService.generate({
        codeType: values.codeType,
        generateDate: values.generateDate.format('YYYY-MM-DD'),
        fieldValues: {
          customerPartNo: values.customerPartNo ?? '',
          versionNo: values.versionNo ?? '',
        },
      });
      setGenResult(res);
    } finally {
      setGenerating(false);
    }
  };

  /* ---------------- 扫码日志操作 ---------------- */
  const loadLogs = useCallback(
    async (page = logPageNum, size = logPageSize, cond = logCond) => {
      setLogLoading(true);
      try {
        const res = await relabelService.logPage({
          pageNum: page,
          pageSize: size,
          sourceCode: cond.sourceCode || undefined,
          targetCode: cond.targetCode || undefined,
          actionType: cond.actionType || undefined,
          validFlag: cond.validFlag,
          terminalNo: cond.terminalNo || undefined,
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

  const onLogSearch = (values: LogSearchValues) => {
    const cond: LogCond = {
      sourceCode: values.sourceCode,
      targetCode: values.targetCode,
      actionType: values.actionType,
      validFlag: values.validFlag,
      terminalNo: values.terminalNo,
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

  const openLogDetail = async (record: ScanLogItem) => {
    setLogDetailOpen(true);
    setLogDetailLoading(true);
    try {
      const res = await relabelService.logDetail(record.id);
      setLogDetail(res);
    } finally {
      setLogDetailLoading(false);
    }
  };

  /* ---------------- 映射查询操作 ---------------- */
  const queryMappingBySource = async () => {
    const code = mappingForm.getFieldValue('sourceCode')?.trim();
    if (!code) {
      message.warning('请输入原码');
      return;
    }
    setMappingLoading(true);
    try {
      const res = await relabelService.mappingBySource(code);
      setMapping(res);
    } catch {
      setMapping(null);
      message.warning('未找到映射记录');
    } finally {
      setMappingLoading(false);
    }
  };

  const queryMappingByTarget = async () => {
    const code = mappingForm.getFieldValue('targetCode')?.trim();
    if (!code) {
      message.warning('请输入新码');
      return;
    }
    setMappingLoading(true);
    try {
      const res = await relabelService.mappingByTarget(code);
      setMapping(res);
    } catch {
      setMapping(null);
      message.warning('未找到映射记录');
    } finally {
      setMappingLoading(false);
    }
  };

  /* ---------------- 列定义 ---------------- */
  const segmentColumns: ColumnsType<CodeSegmentValue> = [
    { title: '序号', dataIndex: 'segNo', width: 70, render: (v) => v ?? '-' },
    { title: '分段名称', dataIndex: 'segName', width: 140, render: (v) => v || '-' },
    { title: '字段键', dataIndex: 'segKey', width: 130, render: (v) => v || '-' },
    {
      title: '起止位置',
      key: 'pos',
      width: 110,
      render: (_, r) => `${r.startPos ?? '-'}-${r.endPos ?? '-'}`,
    },
    { title: '长度', dataIndex: 'segLength', width: 70, render: (v) => v ?? '-' },
    {
      title: '取值类型',
      dataIndex: 'valueType',
      width: 110,
      render: (v?: string) => (v ? SEGMENT_VALUE_TYPE_LABEL[v] || v : '-'),
    },
    { title: '取值', dataIndex: 'value', width: 140, render: (v) => v || '-' },
    { title: '取值含义', dataIndex: 'valueName', width: 140, render: (v) => v || '-' },
  ];

  const batchColumns: ColumnsType<RelabelScanResult> = [
    { title: '原码', dataIndex: 'sourceCode', width: 200, render: (v) => v || '-' },
    {
      title: '动作类型',
      dataIndex: 'actionType',
      width: 130,
      render: (v?: string) =>
        v ? <Tag color={SCAN_ACTION_COLOR[v] || 'default'}>{SCAN_ACTION_LABEL[v] || v}</Tag> : '-',
    },
    { title: '新码', dataIndex: 'targetCode', width: 260, render: (v) => v || '-' },
    { title: '失败原因', dataIndex: 'failReason', render: (v) => v || '-' },
  ];

  const logColumns: ColumnsType<ScanLogItem> = [
    { title: '扫描流水号', dataIndex: 'scanNo', width: 180 },
    { title: '原码', dataIndex: 'sourceCode', width: 180, render: (v) => v || '-' },
    { title: '新码', dataIndex: 'targetCode', width: 220, render: (v) => v || '-' },
    {
      title: '动作类型',
      dataIndex: 'actionType',
      width: 130,
      render: (v?: string) =>
        v ? <Tag color={SCAN_ACTION_COLOR[v] || 'default'}>{SCAN_ACTION_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '是否有效',
      dataIndex: 'validFlag',
      width: 100,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">有效</Tag> : <Tag color="error">失败</Tag>,
    },
    { title: '失败原因', dataIndex: 'failReason', width: 160, render: (v) => v || '-' },
    { title: '终端号', dataIndex: 'terminalNo', width: 100, render: (v) => v || '-' },
    { title: '规则', dataIndex: 'ruleCode', width: 130, render: (v) => v || '-' },
    { title: '操作人', dataIndex: 'operatorName', width: 110, render: (v) => v || '-' },
    {
      title: '扫描时间',
      dataIndex: 'scanAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openLogDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  /* 扫描结果动作提示 */
  const renderScanAlert = (r: RelabelScanResult) => {
    switch (r.actionType) {
      case 'NEW':
        return <Alert type="success" showIcon message="首次换标成功" />;
      case 'REUSE':
        return <Alert type="info" showIcon message="该原标签已换标，返回已有映射" />;
      case 'REPRINT':
        return <Alert type="warning" showIcon message="补打" />;
      default:
        return <Alert type="error" showIcon message="扫描失败" description={r.failReason || '-'} />;
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        扫码换标工作台
      </Title>

      {/* ================= Card 1：扫描换标 ================= */}
      <Card title="扫描换标">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={scanForm} layout="inline" initialValues={{ terminalNo: 'T-01' }} onFinish={(values) => void handleScan(values)}>
            <Form.Item name="sourceCode" label="原标签编码" rules={[{ required: true, message: '请输入原标签编码' }]}>
              <Input placeholder="扫描或输入 14 位原标签编码" autoFocus allowClear style={{ width: 260 }} />
            </Form.Item>
            <Form.Item name="terminalNo" label="终端编号">
              <Input placeholder="终端编号" allowClear style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="plantCode" label="制造地">
              <Select
                placeholder="请选择制造地"
                allowClear
                style={{ width: 200 }}
                options={plantOptions.map((item) => ({
                  label: `${item.dictCode} - ${item.dictName}`,
                  value: item.dictCode,
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Space wrap>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<ScanOutlined />}
                  loading={scanning}
                  disabled={!canScan}
                >
                  扫描换标
                </Button>
                <Button onClick={() => void handleParse()} disabled={!canScan}>
                  解析预检
                </Button>
              </Space>
            </Form.Item>
          </Form>

          {/* 批量扫描 */}
          <div>
            <Input.TextArea
              rows={4}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="每行一个 14 位原标签编码"
            />
            <Space style={{ marginTop: 8 }}>
              <Button type="primary" onClick={() => void handleBatch()} loading={batchLoading} disabled={!canScan}>
                批量扫描
              </Button>
            </Space>
            {batchRows.length > 0 && (
              <Table<RelabelScanResult>
                style={{ marginTop: 12 }}
                rowKey={(_, index) => String(index)}
                size="small"
                loading={batchLoading}
                columns={batchColumns}
                dataSource={batchRows}
                pagination={false}
                scroll={{ x: 900 }}
              />
            )}
          </div>

          {/* 解析预检结果（不落库） */}
          {parseResult && (
            <Alert
              type={parseResult.validFlag ? 'success' : 'error'}
              showIcon
              message={parseResult.validFlag ? '解析通过（仅预检，未落库）' : `解析失败：${parseResult.failReason || '未知原因'}`}
              description={
                <Space direction="vertical" size={2}>
                  <span>
                    规则：{parseResult.ruleCode || '-'}　编码长度：{parseResult.codeLength ?? '-'}　流水号：
                    {parseResult.sequenceValue ?? '-'}
                  </span>
                  {(parseResult.warnings || []).map((w, i) => (
                    <span key={i}>{w}</span>
                  ))}
                </Space>
              }
            />
          )}

          {/* 扫描结果 */}
          {result && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {renderScanAlert(result)}
              {result.sequenceWarn && result.sequenceMessage && (
                <Alert type="warning" showIcon message={result.sequenceMessage} />
              )}
              {(result.warnings || []).map((w, i) => (
                <Alert key={i} type="warning" showIcon message={w} />
              ))}
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'scanNo', label: '扫描流水号', children: result.scanNo || '-' },
                  { key: 'sourceCode', label: '原码', children: result.sourceCode || '-' },
                  { key: 'sourceType', label: '原码类型', children: result.sourceType || '-' },
                  {
                    key: 'targetCode',
                    label: '新追溯码',
                    span: 2,
                    children: result.targetCode ? (
                      <Typography.Text copyable style={{ fontSize: 18, fontWeight: 600 }}>
                        {result.targetCode}
                      </Typography.Text>
                    ) : (
                      '-'
                    ),
                  },
                  { key: 'mappingId', label: '映射 ID', children: result.mappingId ?? '-' },
                  { key: 'printTaskNo', label: '打印任务号', children: result.printTaskNo || '-' },
                  { key: 'sequenceValue', label: '流水号', children: result.sequenceValue ?? '-' },
                ]}
              />
              {targetCode && (
                <div>
                  <div style={{ marginBottom: 8, color: '#666' }}>新码 Data Matrix</div>
                  {barcodeLoading ? (
                    <Spin />
                  ) : barcode ? (
                    <img src={barcode} alt={targetCode} width={220} height={220} />
                  ) : null}
                </div>
              )}
              {result.segments && result.segments.length > 0 && (
                <Table<CodeSegmentValue>
                  rowKey={(_, index) => String(index)}
                  size="small"
                  title={() => '分段明细'}
                  columns={segmentColumns}
                  dataSource={result.segments}
                  pagination={false}
                  scroll={{ x: 900 }}
                />
              )}
            </Space>
          )}

          {/* 生成编码小工具 */}
          <Collapse
            items={[
              {
                key: 'gen',
                label: '生成编码（无扫码枪时快速验证）',
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Form
                      form={genForm}
                      layout="inline"
                      initialValues={{ codeType: 'CODE24', generateDate: dayjs() }}
                      onFinish={(values) => void handleGenerate(values)}
                    >
                      <Form.Item name="codeType" label="编码类型">
                        <Select style={{ width: 180 }} options={CODE_TYPE_OPTIONS} />
                      </Form.Item>
                      <Form.Item name="customerPartNo" label="客户零件号">
                        <Input placeholder="客户零件号" allowClear style={{ width: 160 }} />
                      </Form.Item>
                      <Form.Item name="versionNo" label="版本号">
                        <Input placeholder="版本号" allowClear style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item name="generateDate" label="生成日期">
                        <DatePicker />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={generating} disabled={!canScan}>
                          生成编码
                        </Button>
                      </Form.Item>
                    </Form>
                    {genResult && (
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Alert type="success" showIcon message={`生成成功：${genResult.code}`} />
                        {genResult.codes && genResult.codes.length > 0 && (
                          <div>
                            <div style={{ marginBottom: 4, color: '#666' }}>批量编码：</div>
                            <pre style={{ margin: 0 }}>{genResult.codes.join('\n')}</pre>
                          </div>
                        )}
                        {(genResult.warnings || []).map((w, i) => (
                          <Alert key={i} type="warning" showIcon message={w} />
                        ))}
                      </Space>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </Space>
      </Card>

      {/* ================= Card 2：扫码日志 ================= */}
      <Card title={`扫码日志（共 ${logTotal} 条）`}>
        <Form form={logForm} layout="inline" onFinish={onLogSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="sourceCode" label="原码">
            <Input placeholder="原标签编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="targetCode" label="新码">
            <Input placeholder="追溯码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="actionType" label="动作类型">
            <Select placeholder="请选择" allowClear style={{ width: 150 }} options={SCAN_ACTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="validFlag" label="是否有效">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={VALID_FLAG_OPTIONS} />
          </Form.Item>
          <Form.Item name="terminalNo" label="终端号">
            <Input placeholder="终端号" allowClear style={{ width: 110 }} />
          </Form.Item>
          <Form.Item name="range" label="扫描时间">
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
        <Table<ScanLogItem>
          rowKey="id"
          loading={logLoading}
          columns={logColumns}
          dataSource={logData}
          scroll={{ x: 1600 }}
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

      {/* 扫码日志详情 */}
      <Drawer
        title={`扫码日志详情 - ${logDetail?.scanNo || ''}`}
        width={800}
        open={logDetailOpen}
        onClose={() => setLogDetailOpen(false)}
        destroyOnClose
      >
        <Spin spinning={logDetailLoading}>
          {logDetail && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'id', label: 'ID', children: logDetail.id },
                  { key: 'scanNo', label: '扫描流水号', children: logDetail.scanNo || '-' },
                  { key: 'sourceCode', label: '原码', children: logDetail.sourceCode || '-' },
                  { key: 'sourceType', label: '原码类型', children: logDetail.sourceType || '-' },
                  { key: 'targetCode', label: '新码', children: logDetail.targetCode || '-' },
                  {
                    key: 'actionType',
                    label: '动作类型',
                    children: logDetail.actionType ? (
                      <Tag color={SCAN_ACTION_COLOR[logDetail.actionType] || 'default'}>
                        {SCAN_ACTION_LABEL[logDetail.actionType] || logDetail.actionType}
                      </Tag>
                    ) : (
                      '-'
                    ),
                  },
                  {
                    key: 'validFlag',
                    label: '是否有效',
                    children: logDetail.validFlag === 1 ? <Tag color="success">有效</Tag> : <Tag color="error">失败</Tag>,
                  },
                  { key: 'failReason', label: '失败原因', children: logDetail.failReason || '-' },
                  { key: 'mappingId', label: '映射 ID', children: logDetail.mappingId ?? '-' },
                  { key: 'reprintFlag', label: '是否补打', children: logDetail.reprintFlag ?? '-' },
                  { key: 'ruleCode', label: '规则', children: logDetail.ruleCode || '-' },
                  { key: 'terminalNo', label: '终端号', children: logDetail.terminalNo || '-' },
                  { key: 'operatorName', label: '操作人', children: logDetail.operatorName || '-' },
                  {
                    key: 'scanAt',
                    label: '扫描时间',
                    children: logDetail.scanAt ? dayjs(logDetail.scanAt).format('YYYY-MM-DD HH:mm:ss') : '-',
                  },
                  { key: 'remark', label: '备注', children: logDetail.remark || '-' },
                ]}
              />
              <div>
                <div style={{ marginBottom: 4, color: '#666' }}>解析明细（parseJson）</div>
                <pre style={{ margin: 0, maxHeight: 320, overflow: 'auto' }}>{formatJson(logDetail.parseJson)}</pre>
              </div>
            </Space>
          )}
        </Spin>
      </Drawer>

      {/* ================= Card 3：原码-新码映射查询 ================= */}
      <Card title="原码-新码映射查询">
        <Form form={mappingForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="sourceCode" label="原码">
            <Input placeholder="原标签编码" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} loading={mappingLoading} onClick={() => void queryMappingBySource()}>
              按原码查询
            </Button>
          </Form.Item>
          <Form.Item name="targetCode" label="新码">
            <Input placeholder="追溯码" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item>
            <Button icon={<SearchOutlined />} loading={mappingLoading} onClick={() => void queryMappingByTarget()}>
              按新码查询
            </Button>
          </Form.Item>
        </Form>
        {mapping ? (
          <Descriptions
            size="small"
            bordered
            column={2}
            items={[
              { key: 'sourceCode', label: '原码', children: mapping.sourceCode || '-' },
              { key: 'targetCode', label: '新码', children: mapping.targetCode || '-' },
              { key: 'sourceCodeType', label: '原码类型', children: mapping.sourceCodeType || '-' },
              { key: 'ruleCode', label: '目标规则', children: mapping.ruleCode || '-' },
              { key: 'productCode', label: '零件号', children: mapping.productCode || '-' },
              { key: 'materialCode', label: '物料', children: mapping.materialCode || '-' },
              { key: 'plantCode', label: '制造地', children: mapping.plantCode || '-' },
              {
                key: 'status',
                label: '状态',
                children: mapping.status ? (
                  <Tag color={CODE_MAPPING_STATUS_COLOR[mapping.status] || 'default'}>
                    {CODE_MAPPING_STATUS_LABEL[mapping.status] || mapping.status}
                  </Tag>
                ) : (
                  '-'
                ),
              },
              { key: 'scanCount', label: '扫描次数', children: mapping.scanCount ?? '-' },
              {
                key: 'firstScanAt',
                label: '首次扫描时间',
                children: mapping.firstScanAt ? dayjs(mapping.firstScanAt).format('YYYY-MM-DD HH:mm:ss') : '-',
              },
              {
                key: 'lastScanAt',
                label: '最近扫描时间',
                children: mapping.lastScanAt ? dayjs(mapping.lastScanAt).format('YYYY-MM-DD HH:mm:ss') : '-',
              },
              { key: 'printTaskNo', label: '打印任务号', children: mapping.printTaskNo || '-' },
            ]}
          />
        ) : (
          <Typography.Text type="secondary">暂无查询结果</Typography.Text>
        )}
      </Card>
    </Space>
  );
}
