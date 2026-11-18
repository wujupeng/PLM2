import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { ediService } from '@/services/ediService';
import {
  EDI_DIRECTION_COLOR,
  EDI_DIRECTION_LABEL,
  EDI_DIRECTION_OPTIONS,
  EDI_LOG_ACTION_LABEL,
  EDI_LOG_RESULT_COLOR,
  EDI_LOG_RESULT_LABEL,
  EDI_LOG_RESULT_OPTIONS,
  EDI_PARSE_STATUS_COLOR,
  EDI_PARSE_STATUS_LABEL,
  EDI_PARSE_STATUS_OPTIONS,
  EDI_PROTOCOL_OPTIONS,
  EDI_STANDARD_OPTIONS,
  EDI_TRANS_CODE_LABEL,
  EDI_TRANS_CODE_OPTIONS,
  type EdiMessageReceiveParams,
  type EdiPartnerItem,
  type EdiRawMessageItem,
  type EdiTransactionLogItem,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title, Paragraph } = Typography;

/** 交易日志动作类型下拉选项（由 EDI_LOG_ACTION_LABEL 生成） */
const LOG_ACTION_OPTIONS = Object.entries(EDI_LOG_ACTION_LABEL).map(([value, label]) => ({ label, value }));

interface PartnerOption {
  label: string;
  value: string;
}

/** 格式化 JSON 文本：解析成功则美化，失败原样返回 */
const formatJson = (text?: string) => {
  if (!text) return '-';
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

/* ==================== 报文台账 ==================== */

interface RawSearchState {
  keyword?: string;
  partnerCode?: string;
  transCode?: string;
  direction?: string;
  parseStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface RawSearchFormValues extends Omit<RawSearchState, 'dateFrom' | 'dateTo'> {
  receivedRange?: [Dayjs, Dayjs];
}

interface ReceiveFormValues {
  partnerCode: string;
  transCode?: string;
  controlNo?: string;
  standard?: string;
  protocol?: string;
  fileName?: string;
  rawContent: string;
  autoParse?: boolean;
  remark?: string;
}

function RawMessageTab({ partnerOptions }: { partnerOptions: PartnerOption[] }) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [data, setData] = useState<EdiRawMessageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<RawSearchState>({});

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<EdiRawMessageItem | null>(null);
  const [detailLogs, setDetailLogs] = useState<EdiTransactionLogItem[]>([]);
  const [detailLogLoading, setDetailLogLoading] = useState(false);

  // 接收报文
  const [receiveForm] = Form.useForm<ReceiveFormValues>();
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiving, setReceiving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await ediService.rawMessagePage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          partnerCode: cond.partnerCode || undefined,
          transCode: cond.transCode || undefined,
          direction: cond.direction || undefined,
          parseStatus: cond.parseStatus || undefined,
          dateFrom: cond.dateFrom || undefined,
          dateTo: cond.dateTo || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: RawSearchFormValues) => {
    const { receivedRange, ...rest } = values;
    const cond: RawSearchState = {
      ...rest,
      dateFrom: receivedRange?.[0] ? receivedRange[0].format('YYYY-MM-DD') : undefined,
      dateTo: receivedRange?.[1] ? receivedRange[1].format('YYYY-MM-DD') : undefined,
    };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openDetail = async (record: EdiRawMessageItem) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLogs([]);
    setDetailLoading(true);
    setDetailLogLoading(true);
    try {
      const info = await ediService.rawMessageDetail(record.messageNo);
      setDetail(info);
    } finally {
      setDetailLoading(false);
    }
    try {
      const logs = await ediService.logByMessage(record.messageNo);
      setDetailLogs(logs || []);
    } finally {
      setDetailLogLoading(false);
    }
  };

  const handleParse = async (record: EdiRawMessageItem) => {
    await ediService.rawMessageParse(record.messageNo);
    message.success('解析成功');
    void loadData();
  };

  const handleRetry = async (record: EdiRawMessageItem) => {
    await ediService.rawMessageRetry(record.messageNo);
    message.success('重试成功');
    void loadData();
  };

  const handleReplay = async (record: EdiRawMessageItem) => {
    await ediService.rawMessageReplay(record.messageNo);
    message.success('重放成功');
    void loadData();
  };

  const openReceive = () => {
    receiveForm.resetFields();
    receiveForm.setFieldsValue({ autoParse: true });
    setReceiveOpen(true);
  };

  const handleReceive = async () => {
    const values = await receiveForm.validateFields();
    const payload: EdiMessageReceiveParams = {
      partnerCode: values.partnerCode,
      transCode: values.transCode,
      controlNo: values.controlNo,
      standard: values.standard,
      protocol: values.protocol,
      fileName: values.fileName,
      rawContent: values.rawContent,
      autoParse: values.autoParse,
      remark: values.remark,
    };
    setReceiving(true);
    try {
      await ediService.rawMessageReceive(payload);
      message.success('接收成功');
      setReceiveOpen(false);
      void loadData();
    } finally {
      setReceiving(false);
    }
  };

  const detailLogColumns: ColumnsType<EdiTransactionLogItem> = [
    {
      title: '动作',
      dataIndex: 'actionType',
      width: 100,
      render: (v?: string) => (v ? EDI_LOG_ACTION_LABEL[v] || v : '-'),
    },
    {
      title: '结果',
      dataIndex: 'result',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={EDI_LOG_RESULT_COLOR[v]}>{EDI_LOG_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    { title: '消息', dataIndex: 'message', render: (v) => v || '-' },
    {
      title: '时间',
      dataIndex: 'logAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '关联业务号', dataIndex: 'refNo', width: 150, render: (v) => v || '-' },
  ];

  const columns: ColumnsType<EdiRawMessageItem> = [
    { title: '报文编号', dataIndex: 'messageNo', width: 180, render: (v) => v || '-' },
    { title: '伙伴', dataIndex: 'partnerCode', width: 120, render: (v) => v || '-' },
    {
      title: '交易代码',
      dataIndex: 'transCode',
      width: 140,
      render: (v?: string) => (v ? EDI_TRANS_CODE_LABEL[v] || v : '-'),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={EDI_DIRECTION_COLOR[v]}>{EDI_DIRECTION_LABEL[v] || v}</Tag> : '-',
    },
    { title: '标准', dataIndex: 'standard', width: 100, render: (v) => v || '-' },
    { title: '文件名', dataIndex: 'fileName', width: 180, render: (v) => v || '-' },
    { title: '大小', dataIndex: 'rawSize', width: 90, render: (v) => (v ?? '-') },
    { title: '控制号', dataIndex: 'controlNo', width: 140, render: (v) => v || '-' },
    {
      title: '接收时间',
      dataIndex: 'receivedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '解析状态',
      dataIndex: 'parseStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_PARSE_STATUS_COLOR[v]}>{EDI_PARSE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '是否重复',
      dataIndex: 'duplicateFlag',
      width: 100,
      render: (v?: number) => (v === 1 ? <Tag color="red">是</Tag> : v === 0 ? <Tag>否</Tag> : '-'),
    },
    { title: '重试次数', dataIndex: 'retryCount', width: 100, render: (v) => (v ?? '-') },
    { title: '关联单据', dataIndex: 'relatedDocNo', width: 160, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {record.parseStatus !== 'PARSED' && hasPermission('edi:demand:parse') && (
            <Popconfirm title="确认解析该报文？" onConfirm={() => handleParse(record)}>
              <Button type="link" size="small">
                解析
              </Button>
            </Popconfirm>
          )}
          {hasPermission('edi:monitor:retry') && (
            <Popconfirm title="确认重试该报文？" onConfirm={() => handleRetry(record)}>
              <Button type="link" size="small">
                重试
              </Button>
            </Popconfirm>
          )}
          {hasPermission('edi:monitor:replay') && (
            <Popconfirm title="确认重放该报文？" onConfirm={() => handleReplay(record)}>
              <Button type="link" size="small">
                重放
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="报文编号 / 文件名" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="partnerCode" label="伙伴">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 180 }}
              options={partnerOptions}
            />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={EDI_TRANS_CODE_OPTIONS} />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={EDI_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="parseStatus" label="解析状态">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={EDI_PARSE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="receivedRange" label="接收时间">
            <DatePicker.RangePicker style={{ width: 260 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`报文台账（共 ${total} 条）`}
        extra={
          hasPermission('edi:demand:parse') && (
            <Button type="primary" onClick={openReceive}>
              接收报文
            </Button>
          )
        }
      >
        <Table<EdiRawMessageItem>
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

      {/* 报文详情 */}
      <Drawer
        title="报文详情"
        width={720}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        loading={detailLoading}
      >
        {detail && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="报文编号">{detail.messageNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="控制号">{detail.controlNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="伙伴编码">{detail.partnerCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="交易代码">
              {detail.transCode ? EDI_TRANS_CODE_LABEL[detail.transCode] || detail.transCode : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="方向">
              {detail.direction ? EDI_DIRECTION_LABEL[detail.direction] || detail.direction : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="标准">{detail.standard || '-'}</Descriptions.Item>
            <Descriptions.Item label="协议">{detail.protocol || '-'}</Descriptions.Item>
            <Descriptions.Item label="文件名">{detail.fileName || '-'}</Descriptions.Item>
            <Descriptions.Item label="大小">{detail.rawSize ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="校验和">{detail.checksum || '-'}</Descriptions.Item>
            <Descriptions.Item label="接收时间">
              {detail.receivedAt ? dayjs(detail.receivedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="解析状态">
              {detail.parseStatus ? (
                <Tag color={EDI_PARSE_STATUS_COLOR[detail.parseStatus]}>
                  {EDI_PARSE_STATUS_LABEL[detail.parseStatus] || detail.parseStatus}
                </Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="是否重复">
              {detail.duplicateFlag === 1 ? <Tag color="red">是</Tag> : detail.duplicateFlag === 0 ? '否' : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="重试次数">{detail.retryCount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="最近重试时间">
              {detail.lastRetryAt ? dayjs(detail.lastRetryAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="关联单据">{detail.relatedDocNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="解析消息">{detail.parseMessage || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注">{detail.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}

        <div style={{ marginTop: 16 }}>
          <Title level={5}>原始报文</Title>
          {detail?.rawContent ? (
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: '#fafafa',
                borderRadius: 4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 320,
                overflow: 'auto',
              }}
            >
              {detail.rawContent}
            </pre>
          ) : (
            <Paragraph type="secondary">-</Paragraph>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <Title level={5}>解析结果</Title>
          {detail?.parsedJson ? (
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: '#fafafa',
                borderRadius: 4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 320,
                overflow: 'auto',
              }}
            >
              {formatJson(detail.parsedJson)}
            </pre>
          ) : (
            <Paragraph type="secondary">-</Paragraph>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <Title level={5}>交易日志</Title>
          <Table<EdiTransactionLogItem>
            rowKey="id"
            size="small"
            loading={detailLogLoading}
            columns={detailLogColumns}
            dataSource={detailLogs}
            pagination={false}
          />
        </div>
      </Drawer>

      {/* 接收报文 */}
      <Modal
        title="接收报文"
        open={receiveOpen}
        onOk={handleReceive}
        confirmLoading={receiving}
        onCancel={() => setReceiveOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={receiveForm} layout="vertical" preserve={false}>
          <Form.Item name="partnerCode" label="伙伴" rules={[{ required: true, message: '请选择伙伴' }]}>
            <Select
              placeholder="请选择"
              showSearch
              optionFilterProp="label"
              options={partnerOptions}
            />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码">
            <Select placeholder="请选择" allowClear options={EDI_TRANS_CODE_OPTIONS} />
          </Form.Item>
          <Form.Item name="controlNo" label="控制号">
            <Input placeholder="请输入控制号" />
          </Form.Item>
          <Form.Item name="standard" label="标准">
            <Select placeholder="请选择" allowClear options={EDI_STANDARD_OPTIONS} />
          </Form.Item>
          <Form.Item name="protocol" label="协议">
            <Select placeholder="请选择" allowClear options={EDI_PROTOCOL_OPTIONS} />
          </Form.Item>
          <Form.Item name="fileName" label="文件名">
            <Input placeholder="请输入文件名" />
          </Form.Item>
          <Form.Item name="rawContent" label="报文内容" rules={[{ required: true, message: '请输入报文内容' }]}>
            <Input.TextArea rows={8} placeholder="请粘贴原始报文内容" />
          </Form.Item>
          <Form.Item name="autoParse" label="自动解析" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ==================== 交易日志 ==================== */

interface LogSearchState {
  keyword?: string;
  messageNo?: string;
  partnerCode?: string;
  transCode?: string;
  actionType?: string;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface LogSearchFormValues extends Omit<LogSearchState, 'dateFrom' | 'dateTo'> {
  logRange?: [Dayjs, Dayjs];
}

function LogTab() {
  const [data, setData] = useState<EdiTransactionLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<LogSearchState>({});

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await ediService.logPage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          messageNo: cond.messageNo || undefined,
          partnerCode: cond.partnerCode || undefined,
          transCode: cond.transCode || undefined,
          actionType: cond.actionType || undefined,
          result: cond.result || undefined,
          dateFrom: cond.dateFrom || undefined,
          dateTo: cond.dateTo || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: LogSearchFormValues) => {
    const { logRange, ...rest } = values;
    const cond: LogSearchState = {
      ...rest,
      dateFrom: logRange?.[0] ? logRange[0].format('YYYY-MM-DD') : undefined,
      dateTo: logRange?.[1] ? logRange[1].format('YYYY-MM-DD') : undefined,
    };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const columns: ColumnsType<EdiTransactionLogItem> = [
    { title: '日志编号', dataIndex: 'logNo', width: 180, render: (v) => v || '-' },
    { title: '报文编号', dataIndex: 'messageNo', width: 180, render: (v) => v || '-' },
    { title: '伙伴', dataIndex: 'partnerCode', width: 120, render: (v) => v || '-' },
    {
      title: '交易代码',
      dataIndex: 'transCode',
      width: 140,
      render: (v?: string) => (v ? EDI_TRANS_CODE_LABEL[v] || v : '-'),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 90,
      render: (v?: string) => (v ? EDI_DIRECTION_LABEL[v] || v : '-'),
    },
    {
      title: '动作',
      dataIndex: 'actionType',
      width: 100,
      render: (v?: string) => (v ? EDI_LOG_ACTION_LABEL[v] || v : '-'),
    },
    {
      title: '结果',
      dataIndex: 'result',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={EDI_LOG_RESULT_COLOR[v]}>{EDI_LOG_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    { title: '消息', dataIndex: 'message', width: 220, render: (v) => v || '-' },
    { title: '关联业务号', dataIndex: 'refNo', width: 160, render: (v) => v || '-' },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: (v) => v || '-' },
    {
      title: '时间',
      dataIndex: 'logAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="日志编号 / 消息" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="messageNo" label="报文编号">
            <Input placeholder="请输入报文编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="partnerCode" label="伙伴">
            <Input placeholder="请输入伙伴编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={EDI_TRANS_CODE_OPTIONS} />
          </Form.Item>
          <Form.Item name="actionType" label="动作">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={LOG_ACTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={EDI_LOG_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="logRange" label="时间">
            <DatePicker.RangePicker style={{ width: 260 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`交易日志（共 ${total} 条）`}>
        <Table<EdiTransactionLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
    </Space>
  );
}

/* ==================== 监控台主页面 ==================== */

export default function EdiMonitorPage() {
  const [partnerList, setPartnerList] = useState<EdiPartnerItem[]>([]);

  const loadPartners = useCallback(async () => {
    const res = await ediService.partnerOptions();
    setPartnerList(res || []);
  }, []);

  useEffect(() => {
    void loadPartners();
  }, [loadPartners]);

  const partnerOptions = useMemo<PartnerOption[]>(
    () => partnerList.map((item) => ({ label: item.partnerName, value: item.partnerCode })),
    [partnerList],
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        EDI 报文监控台
      </Title>

      <Tabs
        defaultActiveKey="raw"
        items={[
          {
            key: 'raw',
            label: '报文台账',
            children: <RawMessageTab partnerOptions={partnerOptions} />,
          },
          {
            key: 'log',
            label: '交易日志',
            children: <LogTab />,
          },
        ]}
      />
    </Space>
  );
}
