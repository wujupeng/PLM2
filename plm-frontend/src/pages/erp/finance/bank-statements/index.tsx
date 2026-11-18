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
import { erpFinanceBankStatementService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_BANK_DIRECTION_LABEL,
  ERP_FINANCE_BANK_DIRECTION_OPTIONS,
  ERP_FINANCE_BANK_MATCH_STATUS_LABEL,
  ERP_FINANCE_BANK_MATCH_STATUS_OPTIONS,
  ERP_FINANCE_BANK_STATEMENT_STATUS_LABEL,
  ERP_FINANCE_BANK_STATEMENT_STATUS_OPTIONS,
  type ErpFinanceBankStatement,
  type ErpFinanceBankStatementQuery,
  type ErpFinanceBankStatementSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:bank-statement:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinanceBankStatementSaveRequest, 'transactionDate'> & {
  transactionDate?: Dayjs;
};

export default function ErpFinanceBankStatementPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinanceBankStatement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [direction, setDirection] = useState<string | undefined>(undefined);
  const [matchStatus, setMatchStatus] = useState<string | undefined>(undefined);
  const [statementStatus, setStatementStatus] = useState<string | undefined>(undefined);
  const [bankAccount, setBankAccount] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      dir = direction,
      match = matchStatus,
      statement = statementStatus,
      account = bankAccount,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinanceBankStatementQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          direction: dir,
          matchStatus: match,
          statementStatus: statement,
          bankAccount: account || undefined,
        };
        const res = await erpFinanceBankStatementService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, direction, matchStatus, statementStatus, bankAccount],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      direction: 'IN',
      currencyCode: 'CNY',
      matchStatus: 'UNMATCHED',
      statementStatus: 'IMPORTED',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpFinanceBankStatement) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      transactionDate: record.transactionDate ? dayjs(record.transactionDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinanceBankStatementSaveRequest = {
        ...values,
        transactionDate: values.transactionDate ? values.transactionDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinanceBankStatementService.create(payload);
        message.success('银行对账单已创建');
      } else {
        await erpFinanceBankStatementService.update(editId, payload);
        message.success('银行对账单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinanceBankStatementService.remove(id);
    message.success('银行对账单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinanceBankStatement> = [
    { title: '对账单号', dataIndex: 'statementNo', width: 170, fixed: 'left', render: plain },
    { title: '银行账号', dataIndex: 'bankAccount', width: 170, render: plain },
    { title: '开户银行', dataIndex: 'bankName', width: 150, render: plain },
    { title: '银行流水号', dataIndex: 'transactionNo', width: 160, render: plain },
    { title: '交易日期', dataIndex: 'transactionDate', width: 120, render: plain },
    {
      title: '收付方向',
      dataIndex: 'direction',
      width: 100,
      render: (v) => statusTag(ERP_FINANCE_BANK_DIRECTION_LABEL, v),
    },
    { title: '交易金额', dataIndex: 'amount', width: 110, render: plain },
    { title: '账户余额', dataIndex: 'balance', width: 110, render: plain },
    { title: '对方户名', dataIndex: 'counterpartyName', width: 150, render: plain },
    { title: '对方账号', dataIndex: 'counterpartyAccount', width: 170, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    {
      title: '对账匹配状态',
      dataIndex: 'matchStatus',
      width: 120,
      render: (v) => statusTag(ERP_FINANCE_BANK_MATCH_STATUS_LABEL, v),
    },
    {
      title: '对账单状态',
      dataIndex: 'statementStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_BANK_STATEMENT_STATUS_LABEL, v),
    },
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
            <Popconfirm title="确认删除该银行对账单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        银行对账
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="收付方向">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={direction}
              onChange={(v) => setDirection(v)}
              options={[...ERP_FINANCE_BANK_DIRECTION_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="对账匹配状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={matchStatus}
              onChange={(v) => setMatchStatus(v)}
              options={[...ERP_FINANCE_BANK_MATCH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="对账单状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={statementStatus}
              onChange={(v) => setStatementStatus(v)}
              options={[...ERP_FINANCE_BANK_STATEMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="银行账号">
            <Input
              placeholder="请输入银行账号"
              allowClear
              style={{ width: 180 }}
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="对账单号 / 银行流水号 / 对方户名"
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
                  void loadData(1, pageSize, keyword, direction, matchStatus, statementStatus, bankAccount);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDirection(undefined);
                  setMatchStatus(undefined);
                  setStatementStatus(undefined);
                  setBankAccount('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建银行对账单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`银行对账（共 ${total} 条）`}>
        <Table<ErpFinanceBankStatement>
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
        title={editId == null ? '新建银行对账单' : '编辑银行对账单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="statementNo" label="对账单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="bankAccount"
            label="银行账号"
            rules={[{ required: true, message: '请输入银行账号' }]}
          >
            <Input placeholder="请输入银行账号" />
          </Form.Item>
          <Form.Item name="bankName" label="开户银行">
            <Input placeholder="请输入开户银行" />
          </Form.Item>
          <Form.Item name="transactionNo" label="银行流水号">
            <Input placeholder="请输入银行流水号" />
          </Form.Item>
          <Form.Item name="transactionDate" label="交易日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择交易日期" />
          </Form.Item>
          <Form.Item name="direction" label="收付方向">
            <Select placeholder="为空默认 IN" options={[...ERP_FINANCE_BANK_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="amount" label="交易金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入交易金额" />
          </Form.Item>
          <Form.Item name="balance" label="账户余额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入账户余额" />
          </Form.Item>
          <Form.Item name="counterpartyName" label="对方户名">
            <Input placeholder="请输入对方户名" />
          </Form.Item>
          <Form.Item name="counterpartyAccount" label="对方账号">
            <Input placeholder="请输入对方账号" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="matchStatus" label="对账匹配状态">
            <Select placeholder="为空默认 UNMATCHED" options={[...ERP_FINANCE_BANK_MATCH_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="statementStatus" label="对账单状态">
            <Select placeholder="为空默认 IMPORTED" options={[...ERP_FINANCE_BANK_STATEMENT_STATUS_OPTIONS]} />
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
