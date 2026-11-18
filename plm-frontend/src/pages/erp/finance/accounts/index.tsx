/** G3-N6 ERP 财务核算（T028）会计科目页面。 */
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { erpFinanceAccountService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_ACCOUNT_STATUS_LABEL,
  ERP_FINANCE_ACCOUNT_STATUS_OPTIONS,
  ERP_FINANCE_ACCOUNT_TYPE_LABEL,
  ERP_FINANCE_ACCOUNT_TYPE_OPTIONS,
  ERP_FINANCE_BALANCE_DIRECTION_LABEL,
  ERP_FINANCE_BALANCE_DIRECTION_OPTIONS,
  type ErpFinanceAccount,
  type ErpFinanceAccountQuery,
  type ErpFinanceAccountSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:account:manage';

export default function ErpFinanceAccountPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpFinanceAccountSaveRequest>();
  const [data, setData] = useState<ErpFinanceAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [accountType, setAccountType] = useState<string | undefined>(undefined);
  const [accountStatus, setAccountStatus] = useState<string | undefined>(undefined);
  const [parentCode, setParentCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = accountType,
      status = accountStatus,
      parent = parentCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinanceAccountQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          accountType: type,
          accountStatus: status,
          parentCode: parent || undefined,
        };
        const res = await erpFinanceAccountService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, accountType, accountStatus, parentCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      accountType: 'ASSET',
      balanceDirection: 'DEBIT',
      currencyCode: 'CNY',
      accountStatus: 'ACTIVE',
      levelNo: 1,
      isLeaf: 1,
    });
    setOpen(true);
  };

  const openEdit = (record: ErpFinanceAccount) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinanceAccountSaveRequest = { ...values };
      if (editId == null) {
        await erpFinanceAccountService.create(payload);
        message.success('会计科目已创建');
      } else {
        await erpFinanceAccountService.update(editId, payload);
        message.success('会计科目已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinanceAccountService.remove(id);
    message.success('会计科目已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinanceAccount> = [
    { title: '科目编码', dataIndex: 'accountCode', width: 150, fixed: 'left', render: plain },
    { title: '科目名称', dataIndex: 'accountName', width: 180, render: plain },
    {
      title: '科目类型',
      dataIndex: 'accountType',
      width: 110,
      render: (v) => statusTag(ERP_FINANCE_ACCOUNT_TYPE_LABEL, v),
    },
    {
      title: '余额方向',
      dataIndex: 'balanceDirection',
      width: 100,
      render: (v) => statusTag(ERP_FINANCE_BALANCE_DIRECTION_LABEL, v),
    },
    { title: '上级科目编码', dataIndex: 'parentCode', width: 140, render: plain },
    { title: '科目层级', dataIndex: 'levelNo', width: 90, render: plain },
    { title: '末级科目', dataIndex: 'isLeaf', width: 90, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    {
      title: '科目状态',
      dataIndex: 'accountStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_ACCOUNT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该会计科目？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        会计科目
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="科目类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={accountType}
              onChange={(v) => setAccountType(v)}
              options={[...ERP_FINANCE_ACCOUNT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="科目状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={accountStatus}
              onChange={(v) => setAccountStatus(v)}
              options={[...ERP_FINANCE_ACCOUNT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="上级科目编码">
            <Input
              placeholder="请输入上级科目编码"
              allowClear
              style={{ width: 160 }}
              value={parentCode}
              onChange={(e) => setParentCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="科目编码 / 科目名称"
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
                  void loadData(1, pageSize, keyword, accountType, accountStatus, parentCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAccountType(undefined);
                  setAccountStatus(undefined);
                  setParentCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建会计科目</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`会计科目（共 ${total} 条）`}>
        <Table<ErpFinanceAccount>
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
        title={editId == null ? '新建会计科目' : '编辑会计科目'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="accountCode"
            label="科目编码"
            rules={[{ required: true, message: '请输入科目编码' }]}
          >
            <Input placeholder="请输入科目编码" />
          </Form.Item>
          <Form.Item name="accountName" label="科目名称">
            <Input placeholder="请输入科目名称" />
          </Form.Item>
          <Form.Item name="accountType" label="科目类型">
            <Select placeholder="为空默认 ASSET" options={[...ERP_FINANCE_ACCOUNT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="balanceDirection" label="余额方向">
            <Select placeholder="为空默认 DEBIT" options={[...ERP_FINANCE_BALANCE_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="parentCode" label="上级科目编码">
            <Input placeholder="请输入上级科目编码" />
          </Form.Item>
          <Form.Item name="levelNo" label="科目层级">
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="请输入科目层级" />
          </Form.Item>
          <Form.Item name="isLeaf" label="末级科目">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入末级科目" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="accountStatus" label="科目状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_FINANCE_ACCOUNT_STATUS_OPTIONS]} />
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
