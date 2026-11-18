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
import { erpFinancePayableService } from '@/services/erpFinanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_FINANCE_AP_STATUS_LABEL,
  ERP_FINANCE_AP_STATUS_OPTIONS,
  type ErpFinancePayable,
  type ErpFinancePayableQuery,
  type ErpFinancePayableSaveRequest,
} from '@/types/erpFinance';

const { Title } = Typography;

const MANAGE = 'erp:finance:payable:manage';

/** 日期提交格式。 */
const DATE_FORMAT = 'YYYY-MM-DD';

type FormValues = Omit<ErpFinancePayableSaveRequest, 'apDate' | 'dueDate'> & {
  apDate?: Dayjs;
  dueDate?: Dayjs;
};

export default function ErpFinancePayablePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpFinancePayable[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [apStatus, setApStatus] = useState<string | undefined>(undefined);
  const [supplierCode, setSupplierCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = apStatus,
      supplier = supplierCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpFinancePayableQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          apStatus: status,
          supplierCode: supplier || undefined,
        };
        const res = await erpFinancePayableService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, apStatus, supplierCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ apStatus: 'OPEN', currencyCode: 'CNY' });
    setOpen(true);
  };

  const openEdit = (record: ErpFinancePayable) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      apDate: record.apDate ? dayjs(record.apDate) : undefined,
      dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpFinancePayableSaveRequest = {
        ...values,
        apDate: values.apDate ? values.apDate.format(DATE_FORMAT) : undefined,
        dueDate: values.dueDate ? values.dueDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpFinancePayableService.create(payload);
        message.success('应付单已创建');
      } else {
        await erpFinancePayableService.update(editId, payload);
        message.success('应付单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpFinancePayableService.remove(id);
    message.success('应付单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpFinancePayable> = [
    { title: '应付单号', dataIndex: 'apNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 130, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '发票号', dataIndex: 'invoiceNo', width: 140, render: plain },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '应付金额', dataIndex: 'apAmount', width: 110, render: plain },
    { title: '已结算金额', dataIndex: 'settledAmount', width: 120, render: plain },
    { title: '应付余额', dataIndex: 'apBalance', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '应付日期', dataIndex: 'apDate', width: 120, render: plain },
    { title: '到期日期', dataIndex: 'dueDate', width: 120, render: plain },
    {
      title: '应付状态',
      dataIndex: 'apStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_FINANCE_AP_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该应付单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        应付单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="应付状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={apStatus}
              onChange={(v) => setApStatus(v)}
              options={[...ERP_FINANCE_AP_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="供应商编码">
            <Input
              placeholder="请输入供应商编码"
              allowClear
              style={{ width: 160 }}
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="应付单号 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, apStatus, supplierCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setApStatus(undefined);
                  setSupplierCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建应付单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`应付单（共 ${total} 条）`}>
        <Table<ErpFinancePayable>
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
        title={editId == null ? '新建应付单' : '编辑应付单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="apNo" label="应付单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="supplierCode"
            label="供应商编码"
            rules={[{ required: true, message: '请输入供应商编码' }]}
          >
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="invoiceNo" label="发票号">
            <Input placeholder="请输入发票号" />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="apAmount" label="应付金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入应付金额" />
          </Form.Item>
          <Form.Item name="settledAmount" label="已结算金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已结算金额" />
          </Form.Item>
          <Form.Item name="apBalance" label="应付余额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入应付余额" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="apDate" label="应付日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择应付日期" />
          </Form.Item>
          <Form.Item name="dueDate" label="到期日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择到期日期" />
          </Form.Item>
          <Form.Item name="apStatus" label="应付状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_FINANCE_AP_STATUS_OPTIONS]} />
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
