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
import { erpCompletionReceiptService } from '@/services/erpProductionService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_COMPLETION_INSPECTION_STATUS_LABEL,
  ERP_COMPLETION_INSPECTION_STATUS_OPTIONS,
  ERP_COMPLETION_RECEIPT_STATUS_LABEL,
  ERP_COMPLETION_RECEIPT_STATUS_OPTIONS,
  type ErpCompletionReceipt,
  type ErpCompletionReceiptQuery,
  type ErpCompletionReceiptSaveRequest,
} from '@/types/erpProduction';

const { Title } = Typography;

const MANAGE = 'erp:production:receipt:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 是否报检选项。 */
const INSPECTION_REQUIRED_OPTIONS = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

type FormValues = Omit<ErpCompletionReceiptSaveRequest, 'receiptDate'> & {
  receiptDate?: Dayjs;
};

export default function ErpCompletionReceiptPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpCompletionReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [receiptStatus, setReceiptStatus] = useState<string | undefined>(undefined);
  const [inspectionStatus, setInspectionStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = receiptStatus,
      inspection = inspectionStatus,
      order = orderNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpCompletionReceiptQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          receiptStatus: status,
          inspectionStatus: inspection,
          orderNo: order || undefined,
        };
        const res = await erpCompletionReceiptService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, receiptStatus, inspectionStatus, orderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ uom: 'PCS', inspectionRequired: 0, inspectionStatus: 'PENDING', receiptStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpCompletionReceipt) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      receiptDate: record.receiptDate ? dayjs(record.receiptDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpCompletionReceiptSaveRequest = {
        ...values,
        receiptDate: values.receiptDate ? values.receiptDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpCompletionReceiptService.create(payload);
        message.success('完工入库单已创建');
      } else {
        await erpCompletionReceiptService.update(editId, payload);
        message.success('完工入库单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpCompletionReceiptService.remove(id);
    message.success('完工入库单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpCompletionReceipt> = [
    { title: '完工入库单号', dataIndex: 'receiptNo', width: 170, fixed: 'left', render: plain },
    { title: '生产订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '完工数量', dataIndex: 'completedQty', width: 110, render: plain },
    { title: '报废数量', dataIndex: 'scrapQty', width: 110, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '入库日期', dataIndex: 'receiptDate', width: 170, render: formatDateTime },
    {
      title: '是否报检',
      dataIndex: 'inspectionRequired',
      width: 100,
      render: (v) => (v === 1 ? '是' : '否'),
    },
    {
      title: '检验状态',
      dataIndex: 'inspectionStatus',
      width: 110,
      render: (v) => statusTag(ERP_COMPLETION_INSPECTION_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '入库状态',
      dataIndex: 'receiptStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_COMPLETION_RECEIPT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该完工入库单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        完工入库
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="入库状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={receiptStatus}
              onChange={(v) => setReceiptStatus(v)}
              options={[...ERP_COMPLETION_RECEIPT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="检验状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={inspectionStatus}
              onChange={(v) => setInspectionStatus(v)}
              options={[...ERP_COMPLETION_INSPECTION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="生产订单号">
            <Input
              placeholder="请输入生产订单号"
              allowClear
              style={{ width: 160 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="完工入库单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, receiptStatus, inspectionStatus, orderNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReceiptStatus(undefined);
                  setInspectionStatus(undefined);
                  setOrderNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建完工入库</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`完工入库（共 ${total} 条）`}>
        <Table<ErpCompletionReceipt>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title={editId == null ? '新建完工入库' : '编辑完工入库'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="receiptNo" label="完工入库单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderNo" label="生产订单号">
            <Input placeholder="请输入生产订单号" />
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
          <Form.Item name="completedQty" label="完工数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入完工数量" />
          </Form.Item>
          <Form.Item name="scrapQty" label="报废数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入报废数量" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="receiptDate" label="入库日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择入库日期" />
          </Form.Item>
          <Form.Item name="inspectionRequired" label="是否报检">
            <Select placeholder="为空默认 否" options={INSPECTION_REQUIRED_OPTIONS} />
          </Form.Item>
          <Form.Item name="inspectionStatus" label="检验状态">
            <Select placeholder="为空默认 PENDING" options={[...ERP_COMPLETION_INSPECTION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="receiptStatus" label="入库状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_COMPLETION_RECEIPT_STATUS_OPTIONS]} />
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
