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
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { erpFinanceVoucherService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_VOUCHER_STATUS_LABEL,
  ERP_FINANCE_VOUCHER_STATUS_OPTIONS,
  ERP_FINANCE_VOUCHER_TYPE_LABEL,
  ERP_FINANCE_VOUCHER_TYPE_OPTIONS,
  ERP_FINANCE_VOUCHER_WORD_OPTIONS,
  type ErpFinanceVoucher,
  type ErpFinanceVoucherDetail,
  type ErpFinanceVoucherLine,
  type ErpFinanceVoucherLineSaveRequest,
  type ErpFinanceVoucherQuery,
  type ErpFinanceVoucherSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:voucher:manage';

/** 记账日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type VoucherHeaderForm = Omit<ErpFinanceVoucherSaveRequest, 'voucherDate'> & {
  voucherDate?: Dayjs;
};

export default function ErpFinanceVoucherPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<VoucherHeaderForm>();
  const [lineForm] = Form.useForm<ErpFinanceVoucherLineSaveRequest>();

  const [data, setData] = useState<ErpFinanceVoucher[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<string | undefined>(undefined);
  const [voucherType, setVoucherType] = useState<string | undefined>(undefined);
  const [periodCode, setPeriodCode] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<ErpFinanceVoucherDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpFinanceVoucherLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = voucherStatus,
      type = voucherType,
      period = periodCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinanceVoucherQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          voucherStatus: status,
          voucherType: type,
          periodCode: period || undefined,
        };
        const res = await erpFinanceVoucherService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, voucherStatus, voucherType, periodCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpFinanceVoucherService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setHeaderId(null);
    setDetail(null);
    form.resetFields();
    form.setFieldsValue({ voucherWord: '记', bizType: 'MANUAL', voucherStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpFinanceVoucher) => {
    setEditId(record.id ?? null);
    setHeaderId(record.id ?? null);
    setDetail(null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      voucherDate: record.voucherDate ? dayjs(record.voucherDate) : undefined,
    });
    setOpen(true);
    if (record.id != null) void loadDetail(record.id);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { voucherDate, ...rest } = values;
    const payload: ErpFinanceVoucherSaveRequest = {
      ...rest,
      voucherDate: voucherDate ? voucherDate.format(DATE_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpFinanceVoucherService.create(payload);
        message.success('记账凭证已创建');
      } else {
        await erpFinanceVoucherService.update(editId, payload);
        message.success('记账凭证已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinanceVoucherService.remove(id);
    message.success('记账凭证已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ currencyCode: 'CNY', exchangeRate: 1, debitAmount: 0, creditAmount: 0 });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpFinanceVoucherLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const payload: ErpFinanceVoucherLineSaveRequest = { ...values };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpFinanceVoucherService.updateLine(lineEditing.id, payload);
        message.success('凭证明细行已更新');
      } else if (headerId != null) {
        await erpFinanceVoucherService.addLine(headerId, payload);
        message.success('凭证明细行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpFinanceVoucherLine) => {
    if (line.id == null) return;
    await erpFinanceVoucherService.removeLine(line.id);
    message.success('凭证明细行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpFinanceVoucher> = [
    { title: '凭证号', dataIndex: 'voucherNo', width: 170, fixed: 'left', render: plain },
    { title: '凭证字', dataIndex: 'voucherWord', width: 90, render: plain },
    { title: '会计期间编码', dataIndex: 'periodCode', width: 130, render: plain },
    { title: '记账日期', dataIndex: 'voucherDate', width: 120, render: plain },
    {
      title: '业务类型',
      dataIndex: 'bizType',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_VOUCHER_TYPE_LABEL, v),
    },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '借方合计', dataIndex: 'totalDebit', width: 110, render: plain },
    { title: '贷方合计', dataIndex: 'totalCredit', width: 110, render: plain },
    { title: '附件张数', dataIndex: 'attachmentCount', width: 100, render: plain },
    {
      title: '凭证状态',
      dataIndex: 'voucherStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_VOUCHER_STATUS_LABEL, v),
    },
    { title: '凭证摘要', dataIndex: 'summary', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该记账凭证？" onConfirm={() => record.id != null && void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const lineColumns: ColumnsType<ErpFinanceVoucherLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    { title: '科目编码', dataIndex: 'accountCode', width: 140, render: plain },
    { title: '科目名称', dataIndex: 'accountName', width: 160, render: plain },
    { title: '摘要', dataIndex: 'summary', width: 180, ellipsis: true, render: plain },
    { title: '借方金额', dataIndex: 'debitAmount', width: 110, render: plain },
    { title: '贷方金额', dataIndex: 'creditAmount', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '汇率', dataIndex: 'exchangeRate', width: 100, render: plain },
    { title: '部门编码', dataIndex: 'deptCode', width: 120, render: plain },
    { title: '项目编码', dataIndex: 'projectCode', width: 130, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openLineEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该凭证明细行？" onConfirm={() => void removeLine(record)}>
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
        记账凭证
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="凭证状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={voucherStatus}
              onChange={(v) => setVoucherStatus(v)}
              options={[...ERP_FINANCE_VOUCHER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={voucherType}
              onChange={(v) => setVoucherType(v)}
              options={[...ERP_FINANCE_VOUCHER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="会计期间编码">
            <Input
              placeholder="请输入会计期间编码"
              allowClear
              style={{ width: 160 }}
              value={periodCode}
              onChange={(e) => setPeriodCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="凭证号 / 凭证摘要"
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
                  void loadData(1, pageSize, keyword, voucherStatus, voucherType, periodCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setVoucherStatus(undefined);
                  setVoucherType(undefined);
                  setPeriodCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建记账凭证
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`记账凭证（共 ${total} 条）`}>
        <Table<ErpFinanceVoucher>
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
        title={editId == null ? '新建记账凭证' : '编辑记账凭证'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={1000}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="voucherNo" label="凭证号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="voucherWord" label="凭证字">
            <Select placeholder="为空默认 记" options={[...ERP_FINANCE_VOUCHER_WORD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="periodCode" label="会计期间编码">
            <Input placeholder="请输入会计期间编码" />
          </Form.Item>
          <Form.Item name="voucherDate" label="记账日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择记账日期" />
          </Form.Item>
          <Form.Item name="bizType" label="业务类型">
            <Select placeholder="为空默认 MANUAL" options={[...ERP_FINANCE_VOUCHER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="totalDebit" label="借方合计">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入借方合计" />
          </Form.Item>
          <Form.Item name="totalCredit" label="贷方合计">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入贷方合计" />
          </Form.Item>
          <Form.Item name="attachmentCount" label="附件张数">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入附件张数" />
          </Form.Item>
          <Form.Item name="voucherStatus" label="凭证状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_FINANCE_VOUCHER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="summary" label="凭证摘要">
            <Input.TextArea rows={2} placeholder="请输入凭证摘要" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>

        {editId != null && (
          <>
            {hasPermission(MANAGE) && (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                style={{ marginBottom: 12 }}
                onClick={openLineCreate}
              >
                新增明细行
              </Button>
            )}
            <Table<ErpFinanceVoucherLine>
              rowKey="id"
              size="small"
              loading={detailLoading}
              columns={lineColumns}
              dataSource={detail?.lines || []}
              scroll={{ x: 1700 }}
              pagination={false}
            />
          </>
        )}
      </Modal>

      <Modal
        title={lineEditing ? '编辑凭证明细行' : '新增凭证明细行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="lineNo" label="行号">
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="accountCode" label="科目编码" rules={[{ required: true, message: '请输入科目编码' }]}>
            <Input placeholder="请输入科目编码" />
          </Form.Item>
          <Form.Item name="accountName" label="科目名称">
            <Input placeholder="请输入科目名称" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input placeholder="请输入摘要" />
          </Form.Item>
          <Form.Item name="debitAmount" label="借方金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入借方金额" />
          </Form.Item>
          <Form.Item name="creditAmount" label="贷方金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入贷方金额" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="exchangeRate" label="汇率">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入汇率" />
          </Form.Item>
          <Form.Item name="deptCode" label="部门编码">
            <Input placeholder="请输入部门编码" />
          </Form.Item>
          <Form.Item name="projectCode" label="项目编码">
            <Input placeholder="请输入项目编码" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
