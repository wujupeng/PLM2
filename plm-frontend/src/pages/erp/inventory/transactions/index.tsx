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
import { erpInventoryTransactionService } from '@/services/erpInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INVENTORY_BIZ_TYPE_LABEL,
  ERP_INVENTORY_BIZ_TYPE_OPTIONS,
  ERP_INVENTORY_DIRECTION_LABEL,
  ERP_INVENTORY_DIRECTION_OPTIONS,
  ERP_INVENTORY_TRANSACTION_STATUS_LABEL,
  ERP_INVENTORY_TRANSACTION_STATUS_OPTIONS,
  ERP_INVENTORY_TRANSACTION_TYPE_LABEL,
  ERP_INVENTORY_TRANSACTION_TYPE_OPTIONS,
  type ErpInventoryTransaction,
  type ErpInventoryTransactionQuery,
  type ErpInventoryTransactionSaveRequest,
} from '@/types/erpInventory';

const { Title } = Typography;

const MANAGE = 'erp:inventory:transaction:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type FormValues = Omit<ErpInventoryTransactionSaveRequest, 'transactionDate'> & {
  transactionDate?: Dayjs;
};

export default function ErpInventoryTransactionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpInventoryTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined);
  const [bizType, setBizType] = useState<string | undefined>(undefined);
  const [transactionStatus, setTransactionStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = transactionType,
      biz = bizType,
      status = transactionStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpInventoryTransactionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          transactionType: type,
          bizType: biz,
          transactionStatus: status,
        };
        const res = await erpInventoryTransactionService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, transactionType, bizType, transactionStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      transactionType: 'IN',
      bizType: 'MANUAL',
      direction: 'IN',
      transactionStatus: 'POSTED',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpInventoryTransaction) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      transactionDate: record.transactionDate ? dayjs(record.transactionDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { transactionDate, ...rest } = values;
    const payload: ErpInventoryTransactionSaveRequest = {
      ...rest,
      transactionDate: transactionDate ? transactionDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpInventoryTransactionService.create(payload);
        message.success('库存流水已创建');
      } else {
        await erpInventoryTransactionService.update(editId, payload);
        message.success('库存流水已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpInventoryTransactionService.remove(id);
    message.success('库存流水已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpInventoryTransaction> = [
    { title: '流水单号', dataIndex: 'transactionNo', width: 170, fixed: 'left', render: plain },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      width: 110,
      render: (v) => statusTag(ERP_INVENTORY_TRANSACTION_TYPE_LABEL, v),
    },
    {
      title: '业务类型',
      dataIndex: 'bizType',
      width: 120,
      render: (v) => statusTag(ERP_INVENTORY_BIZ_TYPE_LABEL, v),
    },
    {
      title: '收发方向',
      dataIndex: 'direction',
      width: 100,
      render: (v) => statusTag(ERP_INVENTORY_DIRECTION_LABEL, v),
    },
    { title: '来源单号', dataIndex: 'bizNo', width: 150, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '库位', dataIndex: 'locationCode', width: 120, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '数量', dataIndex: 'qty', width: 100, render: plain },
    { title: '单位成本', dataIndex: 'unitCost', width: 110, render: plain },
    { title: '金额', dataIndex: 'amount', width: 120, render: plain },
    { title: '交易日期', dataIndex: 'transactionDate', width: 170, render: formatDateTime },
    { title: '操作人', dataIndex: 'operator', width: 110, render: plain },
    {
      title: '交易状态',
      dataIndex: 'transactionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_INVENTORY_TRANSACTION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该库存流水？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        库存流水
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="交易类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={transactionType}
              onChange={(v) => setTransactionType(v)}
              options={[...ERP_INVENTORY_TRANSACTION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={bizType}
              onChange={(v) => setBizType(v)}
              options={[...ERP_INVENTORY_BIZ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="交易状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={transactionStatus}
              onChange={(v) => setTransactionStatus(v)}
              options={[...ERP_INVENTORY_TRANSACTION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="流水单号 / 物料编码 / 来源单号"
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
                  void loadData(1, pageSize, keyword, transactionType, bizType, transactionStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTransactionType(undefined);
                  setBizType(undefined);
                  setTransactionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建库存流水</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存流水（共 ${total} 条）`}>
        <Table<ErpInventoryTransaction>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2600 }}
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
        title={editId == null ? '新建库存流水' : '编辑库存流水'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="transactionNo" label="流水单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="transactionType" label="交易类型">
            <Select placeholder="为空默认 IN" options={[...ERP_INVENTORY_TRANSACTION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizType" label="业务类型">
            <Select placeholder="为空默认 MANUAL" options={[...ERP_INVENTORY_BIZ_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="direction" label="收发方向">
            <Select placeholder="为空默认 IN" options={[...ERP_INVENTORY_DIRECTION_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="uom" label="单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="locationCode" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="qty" label="数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="unitCost" label="单位成本">
            <InputNumber step={0.01} style={{ width: '100%' }} placeholder="请输入单位成本" />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>
          <Form.Item name="transactionDate" label="交易日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择交易日期" />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="transactionStatus" label="交易状态">
            <Select placeholder="为空默认 POSTED" options={[...ERP_INVENTORY_TRANSACTION_STATUS_OPTIONS]} />
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
