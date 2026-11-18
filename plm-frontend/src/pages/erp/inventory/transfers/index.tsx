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
import { erpInventoryTransferService } from '@/services/erpInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INVENTORY_LINE_STATUS_LABEL,
  ERP_INVENTORY_LINE_STATUS_OPTIONS,
  ERP_INVENTORY_TRANSFER_STATUS_LABEL,
  ERP_INVENTORY_TRANSFER_STATUS_OPTIONS,
  ERP_INVENTORY_TRANSFER_TYPE_LABEL,
  ERP_INVENTORY_TRANSFER_TYPE_OPTIONS,
  type ErpInventoryTransfer,
  type ErpInventoryTransferDetail,
  type ErpInventoryTransferLine,
  type ErpInventoryTransferLineSaveRequest,
  type ErpInventoryTransferQuery,
  type ErpInventoryTransferSaveRequest,
} from '@/types/erpInventory';

const { Title } = Typography;

const MANAGE = 'erp:inventory:transfer:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type TransferHeaderForm = Omit<ErpInventoryTransferSaveRequest, 'transferDate'> & {
  transferDate?: Dayjs;
};

export default function ErpInventoryTransferPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<TransferHeaderForm>();
  const [lineForm] = Form.useForm<ErpInventoryTransferLineSaveRequest>();

  const [data, setData] = useState<ErpInventoryTransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [transferStatus, setTransferStatus] = useState<string | undefined>(undefined);
  const [transferType, setTransferType] = useState<string | undefined>(undefined);
  const [fromWarehouseCode, setFromWarehouseCode] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<ErpInventoryTransferDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpInventoryTransferLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = transferStatus,
      type = transferType,
      fromWh = fromWarehouseCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpInventoryTransferQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          transferStatus: status,
          transferType: type,
          fromWarehouseCode: fromWh || undefined,
        };
        const res = await erpInventoryTransferService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, transferStatus, transferType, fromWarehouseCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpInventoryTransferService.detail(id);
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
    form.setFieldsValue({ transferType: 'DIRECT', transferStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpInventoryTransfer) => {
    setEditId(record.id ?? null);
    setHeaderId(record.id ?? null);
    setDetail(null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      transferDate: record.transferDate ? dayjs(record.transferDate) : undefined,
    });
    setOpen(true);
    if (record.id != null) void loadDetail(record.id);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { transferDate, ...rest } = values;
    const payload: ErpInventoryTransferSaveRequest = {
      ...rest,
      transferDate: transferDate ? transferDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpInventoryTransferService.create(payload);
        message.success('库存调拨已创建');
      } else {
        await erpInventoryTransferService.update(editId, payload);
        message.success('库存调拨已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpInventoryTransferService.remove(id);
    message.success('库存调拨已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ lineStatus: 'OPEN', uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpInventoryTransferLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const payload: ErpInventoryTransferLineSaveRequest = { ...values };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpInventoryTransferService.updateLine(lineEditing.id, payload);
        message.success('调拨明细行已更新');
      } else if (headerId != null) {
        await erpInventoryTransferService.addLine(headerId, payload);
        message.success('调拨明细行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpInventoryTransferLine) => {
    if (line.id == null) return;
    await erpInventoryTransferService.removeLine(line.id);
    message.success('调拨明细行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpInventoryTransfer> = [
    { title: '调拨单号', dataIndex: 'transferNo', width: 170, fixed: 'left', render: plain },
    {
      title: '调拨类型',
      dataIndex: 'transferType',
      width: 120,
      render: (v) => statusTag(ERP_INVENTORY_TRANSFER_TYPE_LABEL, v),
    },
    { title: '调出仓库编码', dataIndex: 'fromWarehouseCode', width: 130, render: plain },
    { title: '调出仓库名称', dataIndex: 'fromWarehouseName', width: 150, render: plain },
    { title: '调入仓库编码', dataIndex: 'toWarehouseCode', width: 130, render: plain },
    { title: '调入仓库名称', dataIndex: 'toWarehouseName', width: 150, render: plain },
    { title: '调拨人', dataIndex: 'transferBy', width: 110, render: plain },
    { title: '调拨日期', dataIndex: 'transferDate', width: 170, render: formatDateTime },
    { title: '总数量', dataIndex: 'totalQty', width: 100, render: plain },
    {
      title: '调拨状态',
      dataIndex: 'transferStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_INVENTORY_TRANSFER_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该库存调拨？" onConfirm={() => record.id != null && void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const lineColumns: ColumnsType<ErpInventoryTransferLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    {
      title: '行状态',
      dataIndex: 'lineStatus',
      width: 100,
      render: (v) => statusTag(ERP_INVENTORY_LINE_STATUS_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '调出库位', dataIndex: 'fromLocationCode', width: 120, render: plain },
    { title: '调入库位', dataIndex: 'toLocationCode', width: 120, render: plain },
    { title: '调拨数量', dataIndex: 'transferQty', width: 100, render: plain },
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
            <Popconfirm title="确认删除该调拨明细行？" onConfirm={() => void removeLine(record)}>
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
        库存调拨
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="调拨状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={transferStatus}
              onChange={(v) => setTransferStatus(v)}
              options={[...ERP_INVENTORY_TRANSFER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="调拨类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={transferType}
              onChange={(v) => setTransferType(v)}
              options={[...ERP_INVENTORY_TRANSFER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="调出仓库编码">
            <Input
              placeholder="请输入调出仓库编码"
              allowClear
              style={{ width: 160 }}
              value={fromWarehouseCode}
              onChange={(e) => setFromWarehouseCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="调拨单号 / 调出仓库 / 调入仓库"
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
                  void loadData(1, pageSize, keyword, transferStatus, transferType, fromWarehouseCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTransferStatus(undefined);
                  setTransferType(undefined);
                  setFromWarehouseCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建库存调拨
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存调拨（共 ${total} 条）`}>
        <Table<ErpInventoryTransfer>
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
        title={editId == null ? '新建库存调拨' : '编辑库存调拨'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={1000}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="transferNo" label="调拨单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="transferType" label="调拨类型">
            <Select placeholder="为空默认 DIRECT" options={[...ERP_INVENTORY_TRANSFER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="fromWarehouseCode" label="调出仓库编码">
            <Input placeholder="请输入调出仓库编码" />
          </Form.Item>
          <Form.Item name="fromWarehouseName" label="调出仓库名称">
            <Input placeholder="请输入调出仓库名称" />
          </Form.Item>
          <Form.Item name="toWarehouseCode" label="调入仓库编码">
            <Input placeholder="请输入调入仓库编码" />
          </Form.Item>
          <Form.Item name="toWarehouseName" label="调入仓库名称">
            <Input placeholder="请输入调入仓库名称" />
          </Form.Item>
          <Form.Item name="transferBy" label="调拨人">
            <Input placeholder="请输入调拨人" />
          </Form.Item>
          <Form.Item name="transferDate" label="调拨日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择调拨日期" />
          </Form.Item>
          <Form.Item name="totalQty" label="总数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入总数量" />
          </Form.Item>
          <Form.Item name="transferStatus" label="调拨状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_INVENTORY_TRANSFER_STATUS_OPTIONS]} />
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
            <Table<ErpInventoryTransferLine>
              rowKey="id"
              size="small"
              loading={detailLoading}
              columns={lineColumns}
              dataSource={detail?.lines || []}
              scroll={{ x: 1500 }}
              pagination={false}
            />
          </>
        )}
      </Modal>

      <Modal
        title={lineEditing ? '编辑调拨明细行' : '新增调拨明细行'}
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
          <Form.Item name="lineStatus" label="行状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_INVENTORY_LINE_STATUS_OPTIONS]} />
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
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="fromLocationCode" label="调出库位">
            <Input placeholder="请输入调出库位" />
          </Form.Item>
          <Form.Item name="toLocationCode" label="调入库位">
            <Input placeholder="请输入调入库位" />
          </Form.Item>
          <Form.Item name="transferQty" label="调拨数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入调拨数量" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
