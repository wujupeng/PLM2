import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
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
import { erpGoodsReceiptService } from '@/services/erpPurchaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INSPECTION_RESULT_LABEL,
  ERP_INSPECTION_RESULT_OPTIONS,
  ERP_RECEIPT_STATUS_LABEL,
  ERP_RECEIPT_STATUS_OPTIONS,
  ERP_RECEIPT_TYPE_LABEL,
  ERP_RECEIPT_TYPE_OPTIONS,
  type ErpGoodsReceipt,
  type ErpGoodsReceiptDetail,
  type ErpGoodsReceiptLine,
  type ErpGoodsReceiptLineSaveRequest,
  type ErpGoodsReceiptSaveRequest,
} from '@/types/erpPurchase';

const { Title } = Typography;

const MANAGE = 'erp:purchase:receipt:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 是否需报检选项。 */
const INSPECTION_REQUIRED_OPTIONS = [
  { label: '免检', value: 0 },
  { label: '需报检', value: 1 },
];

/** 主单头表单：日期字段放宽为 Dayjs。 */
type GoodsReceiptHeaderForm = Omit<ErpGoodsReceiptSaveRequest, 'receiptDate'> & {
  receiptDate?: Dayjs;
};

export default function ErpGoodsReceiptPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GoodsReceiptHeaderForm>();
  const [lineForm] = Form.useForm<ErpGoodsReceiptLineSaveRequest>();

  const [data, setData] = useState<ErpGoodsReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [receiptStatus, setReceiptStatus] = useState<string | undefined>(undefined);
  const [receiptType, setReceiptType] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [supplierCode, setSupplierCode] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpGoodsReceiptDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpGoodsReceiptLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = receiptStatus,
      type = receiptType,
      order = orderNo,
      supplier = supplierCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpGoodsReceiptService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          receiptStatus: status,
          receiptType: type,
          orderNo: order || undefined,
          supplierCode: supplier || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, receiptStatus, receiptType, orderNo, supplierCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpGoodsReceiptService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpGoodsReceipt) => {
    if (record.id == null) return;
    setHeaderId(record.id);
    setDetail(null);
    setDrawerOpen(true);
    void loadDetail(record.id);
  };

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      receiptType: 'NORMAL',
      inspectionRequired: 1,
      receiptStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpGoodsReceipt) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      receiptDate: record.receiptDate ? dayjs(record.receiptDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { receiptDate, ...rest } = values;
    const payload: ErpGoodsReceiptSaveRequest = {
      ...rest,
      receiptDate: receiptDate ? receiptDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpGoodsReceiptService.create(payload);
        message.success('到货单已创建');
      } else {
        await erpGoodsReceiptService.update(editId, payload);
        message.success('到货单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpGoodsReceiptService.remove(id);
    message.success('到货单已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ uom: 'PCS', inspectionResult: 'PENDING' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpGoodsReceiptLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const payload: ErpGoodsReceiptLineSaveRequest = { ...values };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpGoodsReceiptService.updateLine(lineEditing.id, payload);
        message.success('到货行已更新');
      } else if (headerId != null) {
        await erpGoodsReceiptService.addLine(headerId, payload);
        message.success('到货行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpGoodsReceiptLine) => {
    if (line.id == null) return;
    await erpGoodsReceiptService.removeLine(line.id);
    message.success('到货行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpGoodsReceipt> = [
    { title: '到货单号', dataIndex: 'receiptNo', width: 170, fixed: 'left', render: plain },
    {
      title: '到货类型',
      dataIndex: 'receiptType',
      width: 120,
      render: (v) => statusTag(ERP_RECEIPT_TYPE_LABEL, v),
    },
    { title: '采购订单号', dataIndex: 'orderNo', width: 170, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 140, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '到货日期', dataIndex: 'receiptDate', width: 170, render: formatDateTime },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    {
      title: '是否需报检',
      dataIndex: 'inspectionRequired',
      width: 110,
      render: (v) => (v === 1 ? '需报检' : '免检'),
    },
    { title: '收货人', dataIndex: 'receiver', width: 110, render: plain },
    {
      title: '到货单状态',
      dataIndex: 'receiptStatus',
      width: 120,
      render: (v) => statusTag(ERP_RECEIPT_STATUS_LABEL, v),
    },
    { title: '到货总数量', dataIndex: 'totalQty', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            明细
          </Button>
          {hasPermission(MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(MANAGE) && (
            <Popconfirm
              title="确认删除该到货单？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const lineColumns: ColumnsType<ErpGoodsReceiptLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    { title: '采购订单号', dataIndex: 'orderNo', width: 170, render: plain },
    { title: '订单行号', dataIndex: 'orderLineNo', width: 100, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '到货数量', dataIndex: 'receiptQty', width: 100, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    {
      title: '检验结果',
      dataIndex: 'inspectionResult',
      width: 110,
      render: (v) => statusTag(ERP_INSPECTION_RESULT_LABEL, v),
    },
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
            <Popconfirm title="确认删除该到货行？" onConfirm={() => void removeLine(record)}>
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
        采购到货单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="到货单状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={receiptStatus}
              onChange={(v) => setReceiptStatus(v)}
              options={[...ERP_RECEIPT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="到货类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={receiptType}
              onChange={(v) => setReceiptType(v)}
              options={[...ERP_RECEIPT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="采购订单号">
            <Input
              placeholder="请输入采购订单号"
              allowClear
              style={{ width: 170 }}
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
              placeholder="到货单号 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, receiptStatus, receiptType, orderNo, supplierCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReceiptStatus(undefined);
                  setReceiptType(undefined);
                  setOrderNo('');
                  setSupplierCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建到货单
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采购到货单（共 ${total} 条）`}>
        <Table<ErpGoodsReceipt>
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
        title={editId == null ? '新建到货单' : '编辑到货单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="receiptNo" label="单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="receiptType" label="到货类型">
            <Select placeholder="为空默认 NORMAL" options={[...ERP_RECEIPT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orderNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="receiptDate" label="到货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="inspectionRequired" label="是否需报检">
            <Select placeholder="为空默认 需报检" options={INSPECTION_REQUIRED_OPTIONS} />
          </Form.Item>
          <Form.Item name="receiver" label="收货人">
            <Input placeholder="请输入收货人" />
          </Form.Item>
          <Form.Item name="receiptStatus" label="到货单状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_RECEIPT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="totalQty" label="到货总数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入到货总数量" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`采购到货单明细${detail?.header?.receiptNo ? `：${detail.header.receiptNo}` : ''}`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="到货类型">
            {statusTag(ERP_RECEIPT_TYPE_LABEL, detail?.header?.receiptType)}
          </Descriptions.Item>
          <Descriptions.Item label="到货单状态">
            {statusTag(ERP_RECEIPT_STATUS_LABEL, detail?.header?.receiptStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="采购订单号">{plain(detail?.header?.orderNo)}</Descriptions.Item>
          <Descriptions.Item label="到货日期">{formatDateTime(detail?.header?.receiptDate)}</Descriptions.Item>
          <Descriptions.Item label="供应商编码">{plain(detail?.header?.supplierCode)}</Descriptions.Item>
          <Descriptions.Item label="供应商名称">{plain(detail?.header?.supplierName)}</Descriptions.Item>
          <Descriptions.Item label="仓库编码">{plain(detail?.header?.warehouseCode)}</Descriptions.Item>
          <Descriptions.Item label="是否需报检">
            {detail?.header?.inspectionRequired === 1 ? '需报检' : '免检'}
          </Descriptions.Item>
          <Descriptions.Item label="收货人">{plain(detail?.header?.receiver)}</Descriptions.Item>
          <Descriptions.Item label="到货总数量">{plain(detail?.header?.totalQty)}</Descriptions.Item>
          <Descriptions.Item label="组织名称">{plain(detail?.header?.orgName)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDateTime(detail?.header?.createdAt)}</Descriptions.Item>
        </Descriptions>

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

        <Table<ErpGoodsReceiptLine>
          rowKey="id"
          size="small"
          loading={detailLoading}
          columns={lineColumns}
          dataSource={detail?.lines || []}
          scroll={{ x: 1500 }}
          pagination={false}
        />
      </Drawer>

      <Modal
        title={lineEditing ? '编辑到货行' : '新增到货行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
          </Form.Item>
          <Form.Item name="orderLineNo" label="订单行号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入订单行号" />
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
          <Form.Item name="receiptQty" label="到货数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入到货数量" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="inspectionResult" label="检验结果">
            <Select placeholder="为空默认 PENDING" options={[...ERP_INSPECTION_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
