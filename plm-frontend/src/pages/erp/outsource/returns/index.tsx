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
import { erpOutsourceReturnService } from '@/services/erpOutsourceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_OUTSOURCE_RETURN_STATUS_LABEL,
  ERP_OUTSOURCE_RETURN_STATUS_OPTIONS,
  type ErpOutsourceReturn,
  type ErpOutsourceReturnQuery,
  type ErpOutsourceReturnSaveRequest,
} from '@/types/erpOutsource';

const { Title } = Typography;

const MANAGE = 'erp:outsource:return:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpOutsourceReturnSaveRequest, 'returnDate'> & {
  returnDate?: Dayjs;
};

export default function ErpOutsourceReturnPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpOutsourceReturn[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [returnStatus, setReturnStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
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
      supplier = supplierCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpOutsourceReturnQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          returnStatus: status,
          orderNo: no || undefined,
          supplierCode: supplier || undefined,
        };
        const res = await erpOutsourceReturnService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, returnStatus, orderNo, supplierCode],
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

  const openEdit = (record: ErpOutsourceReturn) => {
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
        returnDate: values.returnDate ? values.returnDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpOutsourceReturnService.create(payload);
        message.success('委外退货已创建');
      } else {
        await erpOutsourceReturnService.update(editId, payload);
        message.success('委外退货已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpOutsourceReturnService.remove(id);
    message.success('委外退货已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpOutsourceReturn> = [
    { title: '退货单号', dataIndex: 'returnNo', width: 160, fixed: 'left', render: plain },
    { title: '委外订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '到货单号', dataIndex: 'receiptNo', width: 160, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 130, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '退货日期', dataIndex: 'returnDate', width: 170, render: formatDateTime },
    { title: '退货数量', dataIndex: 'returnQty', width: 120, render: plain },
    { title: '退货原因', dataIndex: 'returnReason', width: 160, render: plain },
    { title: '退货金额', dataIndex: 'returnAmount', width: 120, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '退货状态',
      dataIndex: 'returnStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_OUTSOURCE_RETURN_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该委外退货？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        委外退货
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
              options={[...ERP_OUTSOURCE_RETURN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="委外订单号">
            <Input
              placeholder="请输入委外订单号"
              allowClear
              style={{ width: 160 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
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
              placeholder="退货单号 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, returnStatus, orderNo, supplierCode);
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
                  setSupplierCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建退货</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`委外退货（共 ${total} 条）`}>
        <Table<ErpOutsourceReturn>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建退货' : '编辑退货'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="returnNo" label="退货单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderNo" label="委外订单号">
            <Input placeholder="请输入委外订单号" />
          </Form.Item>
          <Form.Item name="receiptNo" label="到货单号">
            <Input placeholder="请输入到货单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
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
            <Select placeholder="为空默认 DRAFT" options={[...ERP_OUTSOURCE_RETURN_STATUS_OPTIONS]} />
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
