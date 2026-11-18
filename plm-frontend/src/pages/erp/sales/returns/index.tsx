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
import { erpSalesReturnService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_RETURN_STATUS_LABEL,
  ERP_RETURN_STATUS_OPTIONS,
  type ErpSalesReturn,
  type ErpSalesReturnSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:return:manage';

type FormValues = Omit<ErpSalesReturnSaveRequest, 'returnDate'> & {
  returnDate?: Dayjs;
};

export default function ErpSalesReturnPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpSalesReturn[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [returnStatus, setReturnStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = returnStatus,
      no = orderNo,
      customer = customerCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpSalesReturnService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          returnStatus: status,
          orderNo: no || undefined,
          customerCode: customer || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, returnStatus, orderNo, customerCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ returnStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpSalesReturn) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      returnDate: record.returnDate ? dayjs(record.returnDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        returnDate: values.returnDate ? values.returnDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpSalesReturnService.create(payload);
        message.success('销售退货已创建');
      } else {
        await erpSalesReturnService.update(editId, payload);
        message.success('销售退货已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpSalesReturnService.remove(id);
    message.success('销售退货已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpSalesReturn> = [
    { title: '退货单号', dataIndex: 'returnNo', width: 160, fixed: 'left', render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '发货单号', dataIndex: 'deliveryNo', width: 160, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: plain },
    { title: '客户名称', dataIndex: 'customerName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '退货日期', dataIndex: 'returnDate', width: 130, render: formatDateTime },
    { title: '退货数量', dataIndex: 'returnQty', width: 110, render: plain },
    { title: '退货原因', dataIndex: 'returnReason', width: 160, ellipsis: true, render: plain },
    { title: '退货金额', dataIndex: 'returnAmount', width: 120, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '退货状态',
      dataIndex: 'returnStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_RETURN_STATUS_LABEL, v),
    },
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
            <Popconfirm title="确认删除该销售退货？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        销售退货
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="退货状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={returnStatus}
              onChange={(v) => setReturnStatus(v)}
              options={[...ERP_RETURN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单号">
            <Input
              placeholder="请输入订单号"
              allowClear
              style={{ width: 180 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="客户编码">
            <Input
              placeholder="请输入客户编码"
              allowClear
              style={{ width: 160 }}
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="退货单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, returnStatus, orderNo, customerCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReturnStatus(undefined);
                  setOrderNo('');
                  setCustomerCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建销售退货</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`销售退货（共 ${total} 条）`}>
        <Table<ErpSalesReturn>
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
        title={editId == null ? '新建销售退货' : '编辑销售退货'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="deliveryNo" label="发货单号">
            <Input placeholder="请输入发货单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="returnDate" label="退货日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择退货日期" />
          </Form.Item>
          <Form.Item name="returnQty" label="退货数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入退货数量" />
          </Form.Item>
          <Form.Item name="returnReason" label="退货原因">
            <Input placeholder="请输入退货原因" />
          </Form.Item>
          <Form.Item name="returnAmount" label="退货金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入退货金额" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="returnStatus" label="退货状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_RETURN_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
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
