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
import { erpSalesOutboundService } from '@/services/erpSalesService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_OUTBOUND_STATUS_LABEL,
  ERP_OUTBOUND_STATUS_OPTIONS,
  type ErpSalesOutbound,
  type ErpSalesOutboundSaveRequest,
} from '@/types/erpSales';

const { Title } = Typography;

const MANAGE = 'erp:sales:outbound:manage';

type FormValues = Omit<ErpSalesOutboundSaveRequest, 'outboundDate'> & {
  outboundDate?: Dayjs;
};

export default function ErpSalesOutboundPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpSalesOutbound[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [outboundStatus, setOutboundStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [deliveryNo, setDeliveryNo] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = outboundStatus,
      no = orderNo,
      delivery = deliveryNo,
      customer = customerCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpSalesOutboundService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          outboundStatus: status,
          orderNo: no || undefined,
          deliveryNo: delivery || undefined,
          customerCode: customer || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, outboundStatus, orderNo, deliveryNo, customerCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ outboundStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpSalesOutbound) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      outboundDate: record.outboundDate ? dayjs(record.outboundDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        outboundDate: values.outboundDate ? values.outboundDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      if (editId == null) {
        await erpSalesOutboundService.create(payload);
        message.success('销售出库已创建');
      } else {
        await erpSalesOutboundService.update(editId, payload);
        message.success('销售出库已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpSalesOutboundService.remove(id);
    message.success('销售出库已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpSalesOutbound> = [
    { title: '出库单号', dataIndex: 'outboundNo', width: 160, fixed: 'left', render: plain },
    { title: '发货单号', dataIndex: 'deliveryNo', width: 160, render: plain },
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '出库日期', dataIndex: 'outboundDate', width: 130, render: formatDateTime },
    { title: '出库数量', dataIndex: 'outboundQty', width: 110, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: plain },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '出库状态',
      dataIndex: 'outboundStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_OUTBOUND_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该销售出库？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        销售出库
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="出库状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={outboundStatus}
              onChange={(v) => setOutboundStatus(v)}
              options={[...ERP_OUTBOUND_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="订单号">
            <Input
              placeholder="请输入订单号"
              allowClear
              style={{ width: 160 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="发货单号">
            <Input
              placeholder="请输入发货单号"
              allowClear
              style={{ width: 160 }}
              value={deliveryNo}
              onChange={(e) => setDeliveryNo(e.target.value)}
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
              placeholder="出库单号 / 批次号"
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
                  void loadData(1, pageSize, keyword, outboundStatus, orderNo, deliveryNo, customerCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setOutboundStatus(undefined);
                  setOrderNo('');
                  setDeliveryNo('');
                  setCustomerCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建销售出库</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`销售出库（共 ${total} 条）`}>
        <Table<ErpSalesOutbound>
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
        title={editId == null ? '新建销售出库' : '编辑销售出库'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="deliveryNo" label="发货单号">
            <Input placeholder="请输入发货单号" />
          </Form.Item>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="outboundDate" label="出库日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择出库日期" />
          </Form.Item>
          <Form.Item name="outboundQty" label="出库数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入出库数量" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="outboundStatus" label="出库状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_OUTBOUND_STATUS_OPTIONS]} />
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
