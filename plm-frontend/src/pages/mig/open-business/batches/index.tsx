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
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { migOpenBusinessBatchService as service } from '@/services/migOpenBusinessService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MIG_OPEN_BUSINESS_BATCH_STATUS_LABEL,
  MIG_OPEN_BUSINESS_BATCH_STATUS_OPTIONS,
  MIG_OPEN_BUSINESS_IMPORT_ROW_STATUS_LABEL,
  MIG_OPEN_BUSINESS_OBJECT_TYPE_LABEL,
  MIG_OPEN_BUSINESS_OBJECT_TYPE_OPTIONS,
  MIG_OPEN_BUSINESS_TRIGGER_TYPE_LABEL,
  MIG_OPEN_BUSINESS_TRIGGER_TYPE_OPTIONS,
  type MigOpenBusinessBatch,
  type MigOpenBusinessBatchQuery,
  type MigOpenBusinessBatchSaveRequest,
  type MigOpenBusinessImportRecord,
  type MigOpenBusinessImportRow,
} from '@/types/migOpenBusiness';

const { Title } = Typography;

const LIST = 'mig:open-business:batch:list';
const MANAGE = 'mig:open-business:batch:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MigOpenBusinessBatchSaveRequest, 'startTime' | 'endTime'> & {
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export default function MigOpenBusinessBatchPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MigOpenBusinessBatch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [batchStatus, setBatchStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importBatch, setImportBatch] = useState<MigOpenBusinessBatch | null>(null);
  const [importSourceFile, setImportSourceFile] = useState('');
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [rowsOpen, setRowsOpen] = useState(false);
  const [rowsBatch, setRowsBatch] = useState<MigOpenBusinessBatch | null>(null);
  const [rows, setRows] = useState<MigOpenBusinessImportRow[]>([]);
  const [rowsTotal, setRowsTotal] = useState(0);
  const [rowsPage, setRowsPage] = useState(1);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowDetail, setRowDetail] = useState<MigOpenBusinessImportRow | null>(null);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = objectType,
      status = batchStatus,
    ) => {
      setLoading(true);
      try {
        const params: MigOpenBusinessBatchQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: type,
          batchStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, batchStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      direction: 'OPEN_BIZ_MIGRATION',
      objectType: 'OPEN_SALES_ORDER',
      triggerType: 'MANUAL',
      batchStatus: 'PENDING',
    });
    setOpen(true);
  };

  const openEdit = (record: MigOpenBusinessBatch) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MigOpenBusinessBatchSaveRequest = {
        ...values,
        startTime: values.startTime ? values.startTime.format(DATETIME_FORMAT) : undefined,
        endTime: values.endTime ? values.endTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('同步批次已创建');
      } else {
        await service.update(editId, payload);
        message.success('同步批次已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('同步批次已删除');
    void loadData();
  };

  const openImport = (record: MigOpenBusinessBatch) => {
    setImportBatch(record);
    setImportSourceFile('');
    setImportText('');
    setImportOpen(true);
  };

  const submitImport = async () => {
    if (!importBatch?.id) return;
    if (!importText.trim()) {
      message.error('请粘贴真实来源记录，不能使用演示数据导入');
      return;
    }
    let parsed: { records?: MigOpenBusinessImportRecord[] };
    try {
      parsed = JSON.parse(importText) as { records?: MigOpenBusinessImportRecord[] };
    } catch {
      message.error('JSON 格式错误，请检查导入内容');
      return;
    }
    if (!Array.isArray(parsed.records) || parsed.records.length === 0) {
      message.error('JSON 中必须包含非空 records 数组');
      return;
    }
    setImporting(true);
    try {
      const result = await service.importRows(importBatch.id, {
        sourceFile: importSourceFile || undefined,
        records: parsed.records,
      });
      message.success(`已暂存 ${result.totalCount} 条：${result.validCount} 条待审核，${result.invalidCount} 条校验失败`);
      setImportOpen(false);
      void loadData();
    } finally {
      setImporting(false);
    }
  };

  const loadRows = async (batch: MigOpenBusinessBatch, page = 1, size = 10) => {
    if (!batch.id) return;
    setRowsLoading(true);
    try {
      const result = await service.rows(batch.id, { pageNum: page, pageSize: size });
      setRows(result.list || []);
      setRowsTotal(result.total || 0);
      setRowsPage(page);
    } finally {
      setRowsLoading(false);
    }
  };

  const openRows = (record: MigOpenBusinessBatch) => {
    setRowsBatch(record);
    setRowsOpen(true);
    void loadRows(record);
  };

  const reviewRow = async (record: MigOpenBusinessImportRow, approved: boolean) => {
    await service.reviewRow(record.id, { approved });
    message.success(approved ? '暂存行已审核通过' : '暂存行已驳回');
    if (rowsBatch) {
      await loadRows(rowsBatch, rowsPage);
      void loadData();
    }
  };

  const promoteRow = async (record: MigOpenBusinessImportRow) => {
    const promoted = await service.promoteRow(record.id);
    message.success(`已转入正式业务，目标记录 ID：${promoted.targetId}`);
    if (rowsBatch) {
      await loadRows(rowsBatch, rowsPage);
      void loadData();
    }
  };

  const columns: ColumnsType<MigOpenBusinessBatch> = [
    { title: '批次编号', dataIndex: 'batchNo', width: 200, fixed: 'left', render: plain },
    { title: '批次名称', dataIndex: 'batchName', width: 180, render: plain },
    { title: '接口编号', dataIndex: 'interfaceNo', width: 200, render: plain },
    { title: '集成方向', dataIndex: 'direction', width: 130, render: plain },
    {
      title: '集成对象',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(MIG_OPEN_BUSINESS_OBJECT_TYPE_LABEL, v),
    },
    {
      title: '触发方式',
      dataIndex: 'triggerType',
      width: 120,
      render: (v) => statusTag(MIG_OPEN_BUSINESS_TRIGGER_TYPE_LABEL, v),
    },
    { title: '总数', dataIndex: 'totalCount', width: 90, render: plain },
    { title: '成功数', dataIndex: 'successCount', width: 90, render: plain },
    { title: '失败数', dataIndex: 'failCount', width: 90, render: plain },
    { title: '开始时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'batchStatus',
      width: 110,
      render: (v) => statusTag(MIG_OPEN_BUSINESS_BATCH_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) =>
        (
          <Space size="small" wrap>
            {hasPermission(LIST) && (
            <Button type="link" size="small" onClick={() => openRows(record)}>
              暂存行
            </Button>
            )}
            {hasPermission(MANAGE) && record.batchStatus !== 'SUCCESS' && record.batchStatus !== 'RUNNING' && (
              <Button type="link" size="small" onClick={() => openImport(record)}>
                导入JSON
              </Button>
            )}
            {hasPermission(MANAGE) && (record.totalCount || 0) === 0 && (
              <>
                <Button type="link" size="small" onClick={() => openEdit(record)}>
                  编辑
                </Button>
                <Popconfirm
                  title="确认删除该同步批次？"
                  onConfirm={() => record.id != null && void remove(record.id)}
                >
                  <Button type="link" size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        ),
    },
  ];

  const importRowColumns: ColumnsType<MigOpenBusinessImportRow> = [
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    {
      title: '对象类型',
      dataIndex: 'objectType',
      width: 150,
      render: (value) => statusTag(MIG_OPEN_BUSINESS_OBJECT_TYPE_LABEL, value),
    },
    {
      title: '状态',
      dataIndex: 'rowStatus',
      width: 130,
      render: (value) => statusTag(MIG_OPEN_BUSINESS_IMPORT_ROW_STATUS_LABEL, value),
    },
    {
      title: '校验/审核信息',
      dataIndex: 'validationMessage',
      width: 260,
      render: (value, record) => plain(value || record.reviewComment),
    },
    { title: '目标记录ID', dataIndex: 'targetId', width: 110, render: plain },
    {
      title: '操作',
      key: 'rowAction',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => setRowDetail(record)}>
            查看数据
          </Button>
          {hasPermission(MANAGE) && record.rowStatus === 'PENDING_REVIEW' && (
            <>
              <Popconfirm title="确认审核通过该行？" onConfirm={() => void reviewRow(record, true)}>
                <Button type="link" size="small">通过</Button>
              </Popconfirm>
              <Popconfirm title="确认驳回该行？" onConfirm={() => void reviewRow(record, false)}>
                <Button type="link" size="small" danger>驳回</Button>
              </Popconfirm>
            </>
          )}
          {hasPermission(MANAGE) && record.rowStatus === 'PROMOTION_FAILED' && (
            <Popconfirm
              title="关闭该失败行？"
              description="关闭后可在新批次修正数据并重新导入。"
              onConfirm={() => void reviewRow(record, false)}
            >
              <Button type="link" size="small" danger>关闭并重导</Button>
            </Popconfirm>
          )}
          {hasPermission(MANAGE)
            && (record.rowStatus === 'APPROVED' || record.rowStatus === 'PROMOTION_FAILED') && (
            <Popconfirm
              title={record.rowStatus === 'APPROVED' ? '确认创建正式业务单据？' : '重试转入正式单据？'}
              description="该操作会调用现有 ERP 业务服务写入正式数据。"
              onConfirm={() => void promoteRow(record)}
            >
              <Button type="link" size="small">
                {record.rowStatus === 'APPROVED' ? '转正式单据' : '重试转入'}
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
        同步批次
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="集成对象">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...MIG_OPEN_BUSINESS_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="批次状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={batchStatus}
              onChange={(v) => setBatchStatus(v)}
              options={[...MIG_OPEN_BUSINESS_BATCH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="批次编号 / 批次名称 / 消息"
              allowClear
              style={{ width: 380 }}
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
                  void loadData(1, pageSize, keyword, objectType, batchStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setBatchStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建同步批次</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`同步批次（共 ${total} 条）`}>
        <Table<MigOpenBusinessBatch>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2300 }}
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
        title={editId == null ? '新建同步批次' : '编辑同步批次'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="批次编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="batchName"
            label="批次名称"
            rules={[{ required: true, message: '请输入批次名称' }]}
          >
            <Input placeholder="请输入批次名称" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="接口编号">
            <Input placeholder="请输入接口编号" />
          </Form.Item>
          <Form.Item name="direction" label="集成方向">
            <Input placeholder="请输入集成方向" />
          </Form.Item>
          <Form.Item name="objectType" label="集成对象">
            <Select placeholder="为空默认 OPEN_SALES_ORDER" options={[...MIG_OPEN_BUSINESS_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="triggerType" label="触发方式">
            <Select placeholder="为空默认 MANUAL" options={[...MIG_OPEN_BUSINESS_TRIGGER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="totalCount" label="总数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入总数" />
          </Form.Item>
          <Form.Item name="successCount" label="成功数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入成功数" />
          </Form.Item>
          <Form.Item name="failCount" label="失败数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入失败数" />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="batchStatus" label="状态">
            <Select placeholder="为空默认 PENDING" options={[...MIG_OPEN_BUSINESS_BATCH_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="message" label="消息">
            <Input.TextArea rows={2} placeholder="请输入消息" />
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
        title={`导入暂存数据${importBatch?.batchNo ? ` - ${importBatch.batchNo}` : ''}`}
        open={importOpen}
        onOk={() => void submitImport()}
        confirmLoading={importing}
        onCancel={() => setImportOpen(false)}
        destroyOnClose
        width={900}
      >
        <Typography.Paragraph type="secondary">
          使用 JSON records 数组导入，系统将按对象类型校验并暂存；审核通过后才会写入正式 ERP 单据。单次最多 1000 条，每条数据最大 1 MB。
          订单和到货/发运数据需提供 header 与 lines。
        </Typography.Paragraph>
        <Form layout="vertical">
          <Form.Item label="来源文件名">
            <Input value={importSourceFile} onChange={(event) => setImportSourceFile(event.target.value)} />
          </Form.Item>
          <Form.Item label="JSON 数据" required>
            <Input.TextArea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="粘贴脱敏旧系统导出的 JSON。需包含 records 数组，每行提供 sourceNo、objectType 和 payload；请勿使用演示数据代替真实来源记录。"
              rows={18}
              spellCheck={false}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`暂存行${rowsBatch?.batchNo ? ` - ${rowsBatch.batchNo}` : ''}（共 ${rowsTotal} 条）`}
        open={rowsOpen}
        onCancel={() => setRowsOpen(false)}
        footer={null}
        destroyOnClose
        width={1100}
      >
        <Table<MigOpenBusinessImportRow>
          rowKey="id"
          loading={rowsLoading}
          columns={importRowColumns}
          dataSource={rows}
          scroll={{ x: 1100 }}
          pagination={{
            current: rowsPage,
            pageSize: 10,
            total: rowsTotal,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (page, size) => rowsBatch && void loadRows(rowsBatch, page, size),
          }}
        />
      </Modal>

      <Modal
        title={`来源数据 - ${rowDetail?.sourceNo || ''}`}
        open={rowDetail != null}
        onCancel={() => setRowDetail(null)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Input.TextArea
          readOnly
          rows={22}
          value={rowDetail?.sourcePayload
            ? (() => {
                try {
                  return JSON.stringify(JSON.parse(rowDetail.sourcePayload), null, 2);
                } catch {
                  return rowDetail.sourcePayload;
                }
              })()
            : ''}
          spellCheck={false}
        />
      </Modal>
    </Space>
  );
}
