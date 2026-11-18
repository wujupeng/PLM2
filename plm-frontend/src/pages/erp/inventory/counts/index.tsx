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
import { erpInventoryCountService } from '@/services/erpInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_INVENTORY_COUNT_STATUS_LABEL,
  ERP_INVENTORY_COUNT_STATUS_OPTIONS,
  ERP_INVENTORY_COUNT_TYPE_LABEL,
  ERP_INVENTORY_COUNT_TYPE_OPTIONS,
  ERP_INVENTORY_LINE_STATUS_LABEL,
  ERP_INVENTORY_LINE_STATUS_OPTIONS,
  type ErpInventoryCount,
  type ErpInventoryCountDetail,
  type ErpInventoryCountLine,
  type ErpInventoryCountLineSaveRequest,
  type ErpInventoryCountQuery,
  type ErpInventoryCountSaveRequest,
} from '@/types/erpInventory';

const { Title } = Typography;

const MANAGE = 'erp:inventory:count:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type CountHeaderForm = Omit<ErpInventoryCountSaveRequest, 'countDate'> & {
  countDate?: Dayjs;
};

export default function ErpInventoryCountPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<CountHeaderForm>();
  const [lineForm] = Form.useForm<ErpInventoryCountLineSaveRequest>();

  const [data, setData] = useState<ErpInventoryCount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [countStatus, setCountStatus] = useState<string | undefined>(undefined);
  const [countType, setCountType] = useState<string | undefined>(undefined);
  const [warehouseCode, setWarehouseCode] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<ErpInventoryCountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpInventoryCountLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = countStatus,
      type = countType,
      warehouse = warehouseCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpInventoryCountQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          countStatus: status,
          countType: type,
          warehouseCode: warehouse || undefined,
        };
        const res = await erpInventoryCountService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, countStatus, countType, warehouseCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpInventoryCountService.detail(id);
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
    form.setFieldsValue({ countType: 'FULL', countStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpInventoryCount) => {
    setEditId(record.id ?? null);
    setHeaderId(record.id ?? null);
    setDetail(null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      countDate: record.countDate ? dayjs(record.countDate) : undefined,
    });
    setOpen(true);
    if (record.id != null) void loadDetail(record.id);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { countDate, ...rest } = values;
    const payload: ErpInventoryCountSaveRequest = {
      ...rest,
      countDate: countDate ? countDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpInventoryCountService.create(payload);
        message.success('库存盘点已创建');
      } else {
        await erpInventoryCountService.update(editId, payload);
        message.success('库存盘点已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpInventoryCountService.remove(id);
    message.success('库存盘点已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ lineStatus: 'OPEN', uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpInventoryCountLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const payload: ErpInventoryCountLineSaveRequest = { ...values };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpInventoryCountService.updateLine(lineEditing.id, payload);
        message.success('盘点明细行已更新');
      } else if (headerId != null) {
        await erpInventoryCountService.addLine(headerId, payload);
        message.success('盘点明细行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpInventoryCountLine) => {
    if (line.id == null) return;
    await erpInventoryCountService.removeLine(line.id);
    message.success('盘点明细行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpInventoryCount> = [
    { title: '盘点单号', dataIndex: 'countNo', width: 170, fixed: 'left', render: plain },
    {
      title: '盘点类型',
      dataIndex: 'countType',
      width: 120,
      render: (v) => statusTag(ERP_INVENTORY_COUNT_TYPE_LABEL, v),
    },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    { title: '仓库名称', dataIndex: 'warehouseName', width: 150, render: plain },
    { title: '盘点人', dataIndex: 'countBy', width: 110, render: plain },
    { title: '盘点日期', dataIndex: 'countDate', width: 170, render: formatDateTime },
    { title: '差异总量', dataIndex: 'totalDiffQty', width: 100, render: plain },
    {
      title: '盘点状态',
      dataIndex: 'countStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_INVENTORY_COUNT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该库存盘点？" onConfirm={() => record.id != null && void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const lineColumns: ColumnsType<ErpInventoryCountLine> = [
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
    { title: '库位', dataIndex: 'locationCode', width: 120, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '账面数量', dataIndex: 'bookQty', width: 100, render: plain },
    { title: '实盘数量', dataIndex: 'actualQty', width: 100, render: plain },
    { title: '差异数量', dataIndex: 'diffQty', width: 100, render: plain },
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
            <Popconfirm title="确认删除该盘点明细行？" onConfirm={() => void removeLine(record)}>
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
        库存盘点
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="盘点状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={countStatus}
              onChange={(v) => setCountStatus(v)}
              options={[...ERP_INVENTORY_COUNT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="盘点类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={countType}
              onChange={(v) => setCountType(v)}
              options={[...ERP_INVENTORY_COUNT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="仓库编码">
            <Input
              placeholder="请输入仓库编码"
              allowClear
              style={{ width: 160 }}
              value={warehouseCode}
              onChange={(e) => setWarehouseCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="盘点单号 / 仓库名称"
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
                  void loadData(1, pageSize, keyword, countStatus, countType, warehouseCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setCountStatus(undefined);
                  setCountType(undefined);
                  setWarehouseCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建库存盘点
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存盘点（共 ${total} 条）`}>
        <Table<ErpInventoryCount>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建库存盘点' : '编辑库存盘点'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={1000}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="countNo" label="盘点单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="countType" label="盘点类型">
            <Select placeholder="为空默认 FULL" options={[...ERP_INVENTORY_COUNT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="warehouseName" label="仓库名称">
            <Input placeholder="请输入仓库名称" />
          </Form.Item>
          <Form.Item name="countBy" label="盘点人">
            <Input placeholder="请输入盘点人" />
          </Form.Item>
          <Form.Item name="countDate" label="盘点日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择盘点日期" />
          </Form.Item>
          <Form.Item name="totalDiffQty" label="差异总量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入差异总量" />
          </Form.Item>
          <Form.Item name="countStatus" label="盘点状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_INVENTORY_COUNT_STATUS_OPTIONS]} />
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
            <Table<ErpInventoryCountLine>
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
        title={lineEditing ? '编辑盘点明细行' : '新增盘点明细行'}
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
          <Form.Item name="locationCode" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="bookQty" label="账面数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入账面数量" />
          </Form.Item>
          <Form.Item name="actualQty" label="实盘数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入实盘数量" />
          </Form.Item>
          <Form.Item name="diffQty" label="差异数量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入差异数量" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
