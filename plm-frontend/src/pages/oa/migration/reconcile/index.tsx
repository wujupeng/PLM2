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
import { oaMigrationReconcileService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { enumTag } from '@/pages/oa/integration/shared';
import {
  OA_MIGRATION_RECONCILE_STATUS_LABEL,
  OA_MIGRATION_RECONCILE_STATUS_OPTIONS,
  type OaMigrationQuery,
  type OaMigrationReconcileItem,
  type OaMigrationReconcileSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const RECONCILE_MANAGE = 'oa:migration:reconcile:manage';

interface ReconcileFormValues {
  reconcileNo?: string;
  batchId?: number;
  batchNo?: string;
  objectCode?: string;
  sourceCount?: number;
  targetCount?: number;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  diffCount?: number;
  diffReason?: string;
  conclusion?: string;
  reconcileStatus?: string;
  reportTime?: string;
  remark?: string;
}

/** 按对象对账汇总行（report().items 元素）。 */
interface ReconcileReportRow {
  reconcileNo?: string;
  objectCode?: string;
  sourceCount?: number;
  targetCount?: number;
  successCount?: number;
  failCount?: number;
  skipCount?: number;
  diffCount?: number;
  reconcileStatus?: string;
}

export default function OaMigrationReconcilePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ReconcileFormValues>();
  const [confirmForm] = Form.useForm<{ conclusion?: string }>();
  const [data, setData] = useState<OaMigrationReconcileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [objectCode, setObjectCode] = useState('');
  const [reconcileStatus, setReconcileStatus] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [report, setReport] = useState<Record<string, unknown>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<OaMigrationReconcileItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      code = objectCode,
      status = reconcileStatus,
      kw = keyword,
    ) => {
      setLoading(true);
      try {
        const params: OaMigrationQuery = {
          pageNum: page,
          pageSize: size,
          objectCode: code || undefined,
          reconcileStatus: status,
          keyword: kw || undefined,
        };
        const res = await oaMigrationReconcileService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, objectCode, reconcileStatus, keyword],
  );

  const loadReport = useCallback(async () => {
    const res = await oaMigrationReconcileService.report();
    setReport((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ reconcileStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = async (record: OaMigrationReconcileItem) => {
    setEditId(record.id);
    form.resetFields();
    const detail = await oaMigrationReconcileService.detail(record.id);
    form.setFieldsValue({
      reconcileNo: detail.reconcileNo,
      batchId: detail.batchId,
      batchNo: detail.batchNo,
      objectCode: detail.objectCode,
      sourceCount: detail.sourceCount,
      targetCount: detail.targetCount,
      successCount: detail.successCount,
      failCount: detail.failCount,
      skipCount: detail.skipCount,
      diffCount: detail.diffCount,
      diffReason: detail.diffReason,
      conclusion: detail.conclusion,
      reconcileStatus: detail.reconcileStatus,
      reportTime: detail.reportTime,
      remark: detail.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationReconcileSaveParams = { ...values };
      if (editId == null) {
        await oaMigrationReconcileService.create(payload);
        message.success('对账单已创建');
      } else {
        await oaMigrationReconcileService.update(editId, payload);
        message.success('对账单已更新');
      }
      setOpen(false);
      void loadData();
      void loadReport();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationReconcileService.remove(id);
    message.success('对账单已删除');
    void loadData();
    void loadReport();
  };

  const openConfirm = (record: OaMigrationReconcileItem) => {
    setConfirmTarget(record);
    confirmForm.resetFields();
    confirmForm.setFieldsValue({ conclusion: record.conclusion });
    setConfirmOpen(true);
  };

  const submitConfirm = async () => {
    if (!confirmTarget) return;
    const values = await confirmForm.validateFields();
    setConfirming(true);
    try {
      await oaMigrationReconcileService.confirm(confirmTarget.id, values.conclusion);
      message.success('对账已确认');
      setConfirmOpen(false);
      void loadData();
      void loadReport();
    } finally {
      setConfirming(false);
    }
  };

  const reportColumns: ColumnsType<ReconcileReportRow> = [
    { title: '对账单号', dataIndex: 'reconcileNo', width: 170, render: plain },
    { title: '对象编码', dataIndex: 'objectCode', width: 130, render: plain },
    { title: '源数量', dataIndex: 'sourceCount', width: 90, render: plain },
    { title: '目标数量', dataIndex: 'targetCount', width: 90, render: plain },
    { title: '成功', dataIndex: 'successCount', width: 80, render: plain },
    { title: '失败', dataIndex: 'failCount', width: 80, render: plain },
    { title: '跳过', dataIndex: 'skipCount', width: 80, render: plain },
    { title: '差异', dataIndex: 'diffCount', width: 80, render: plain },
    {
      title: '状态',
      dataIndex: 'reconcileStatus',
      width: 100,
      render: (v) => enumTag(OA_MIGRATION_RECONCILE_STATUS_LABEL, v),
    },
  ];

  const columns: ColumnsType<OaMigrationReconcileItem> = [
    { title: '对账单号', dataIndex: 'reconcileNo', width: 170, fixed: 'left', render: plain },
    { title: '批次编号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '对象编码', dataIndex: 'objectCode', width: 130, render: plain },
    { title: '源数量', dataIndex: 'sourceCount', width: 90, render: plain },
    { title: '目标数量', dataIndex: 'targetCount', width: 90, render: plain },
    { title: '成功', dataIndex: 'successCount', width: 80, render: plain },
    { title: '失败', dataIndex: 'failCount', width: 80, render: plain },
    { title: '跳过', dataIndex: 'skipCount', width: 80, render: plain },
    {
      title: '差异',
      dataIndex: 'diffCount',
      width: 80,
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? '#cf1322' : undefined }}>{plain(v)}</span>
      ),
    },
    { title: '差异原因', dataIndex: 'diffReason', width: 180, ellipsis: true, render: plain },
    { title: '结论', dataIndex: 'conclusion', width: 180, ellipsis: true, render: plain },
    {
      title: '状态',
      dataIndex: 'reconcileStatus',
      width: 100,
      render: (v) => enumTag(OA_MIGRATION_RECONCILE_STATUS_LABEL, v),
    },
    { title: '报告时间', dataIndex: 'reportTime', width: 160, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 190,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission(RECONCILE_MANAGE) && record.reconcileStatus !== 'CONFIRMED' && (
            <Button type="link" size="small" onClick={() => openConfirm(record)}>
              确认
            </Button>
          )}
          {hasPermission(RECONCILE_MANAGE) && (
            <Button type="link" size="small" onClick={() => void openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(RECONCILE_MANAGE) && (
            <Popconfirm title="确认删除该对账单？" onConfirm={() => void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const reportRows: ReconcileReportRow[] = Array.isArray(report.items)
    ? (report.items as ReconcileReportRow[])
    : [];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        迁移对账
      </Title>

      <Card>
        <Space size="large" wrap>
          <Statistic title="对账总数" value={Number(report.total ?? 0)} />
          <Statistic
            title="差异对象数"
            value={Number(report.diffObjectCount ?? 0)}
            valueStyle={{ color: Number(report.diffObjectCount ?? 0) ? '#cf1322' : undefined }}
          />
          <Statistic title="差异容差" value={Number(report.diffTolerance ?? 0)} />
        </Space>
      </Card>

      <Card title="按对象对账汇总">
        <Table<ReconcileReportRow>
          rowKey={(_, index) => String(index)}
          size="small"
          columns={reportColumns}
          dataSource={reportRows}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="对象编码">
            <Input
              placeholder="对象编码"
              allowClear
              style={{ width: 160 }}
              value={objectCode}
              onChange={(e) => setObjectCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="对账状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={reconcileStatus}
              onChange={(v) => setReconcileStatus(v)}
              options={[...OA_MIGRATION_RECONCILE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="对账单号 / 对象编码 / 批次编号"
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
                  void loadData(1, pageSize, objectCode, reconcileStatus, keyword);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setObjectCode('');
                  setReconcileStatus(undefined);
                  setKeyword('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(RECONCILE_MANAGE) && <Button onClick={openCreate}>新建对账单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`迁移对账（共 ${total} 条）`}>
        <Table<OaMigrationReconcileItem>
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
        title="确认对账"
        open={confirmOpen}
        onOk={() => void submitConfirm()}
        confirmLoading={confirming}
        onCancel={() => setConfirmOpen(false)}
        destroyOnClose
        width={520}
      >
        <Descriptions column={1} size="small" style={{ marginBottom: 12 }}>
          <Descriptions.Item label="对账单号">{plain(confirmTarget?.reconcileNo)}</Descriptions.Item>
          <Descriptions.Item label="对象编码">{plain(confirmTarget?.objectCode)}</Descriptions.Item>
        </Descriptions>
        <Form form={confirmForm} layout="vertical" preserve={false}>
          <Form.Item name="conclusion" label="对账结论">
            <Input.TextArea rows={3} placeholder="填写对账结论" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editId == null ? '新建对账单' : '编辑对账单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reconcileNo" label="对账单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="batchId" label="批次ID">
            <InputNumber style={{ width: '100%' }} placeholder="批次ID" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次编号">
            <Input placeholder="批次编号" />
          </Form.Item>
          <Form.Item
            name="objectCode"
            label="对象编码"
            rules={[{ required: true, message: '请输入对象编码' }]}
          >
            <Input placeholder="对象编码" />
          </Form.Item>
          <Form.Item name="sourceCount" label="源数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetCount" label="目标数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="successCount" label="成功数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="failCount" label="失败数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="skipCount" label="跳过数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="diffCount" label="差异数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="diffReason" label="差异原因">
            <Input.TextArea rows={2} placeholder="差异原因" />
          </Form.Item>
          <Form.Item name="conclusion" label="对账结论">
            <Input.TextArea rows={2} placeholder="对账结论" />
          </Form.Item>
          <Form.Item name="reconcileStatus" label="对账状态">
            <Select placeholder="请选择" options={[...OA_MIGRATION_RECONCILE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reportTime" label="报告时间">
            <Input placeholder="YYYY-MM-DD HH:mm:ss，留空取当前时间" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
