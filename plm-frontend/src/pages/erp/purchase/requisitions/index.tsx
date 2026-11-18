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
import { erpPurchaseRequisitionService } from '@/services/erpPurchaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PURCHASE_SOURCE_TYPE_LABEL,
  ERP_PURCHASE_SOURCE_TYPE_OPTIONS,
  ERP_REQUISITION_STATUS_LABEL,
  ERP_REQUISITION_STATUS_OPTIONS,
  ERP_REQUISITION_TYPE_LABEL,
  ERP_REQUISITION_TYPE_OPTIONS,
  ERP_REQ_LINE_STATUS_LABEL,
  ERP_REQ_LINE_STATUS_OPTIONS,
  type ErpPurchaseRequisition,
  type ErpPurchaseRequisitionDetail,
  type ErpPurchaseRequisitionLine,
  type ErpPurchaseRequisitionLineSaveRequest,
  type ErpPurchaseRequisitionSaveRequest,
} from '@/types/erpPurchase';

const { Title } = Typography;

const MANAGE = 'erp:purchase:requisition:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type RequisitionHeaderForm = Omit<
  ErpPurchaseRequisitionSaveRequest,
  'applyDate' | 'requiredDate'
> & {
  applyDate?: Dayjs;
  requiredDate?: Dayjs;
};

/** 明细行表单：日期字段放宽为 Dayjs。 */
type RequisitionLineForm = Omit<ErpPurchaseRequisitionLineSaveRequest, 'reqDate'> & {
  reqDate?: Dayjs;
};

export default function ErpPurchaseRequisitionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<RequisitionHeaderForm>();
  const [lineForm] = Form.useForm<RequisitionLineForm>();

  const [data, setData] = useState<ErpPurchaseRequisition[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [requisitionStatus, setRequisitionStatus] = useState<string | undefined>(undefined);
  const [requisitionType, setRequisitionType] = useState<string | undefined>(undefined);
  const [applicant, setApplicant] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpPurchaseRequisitionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpPurchaseRequisitionLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = requisitionStatus,
      type = requisitionType,
      applicantName = applicant,
    ) => {
      setLoading(true);
      try {
        const res = await erpPurchaseRequisitionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          requisitionStatus: status,
          requisitionType: type,
          applicant: applicantName || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, requisitionStatus, requisitionType, applicant],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpPurchaseRequisitionService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpPurchaseRequisition) => {
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
      requisitionType: 'NORMAL',
      currencyCode: 'CNY',
      sourceType: 'MANUAL',
      requisitionStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpPurchaseRequisition) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      applyDate: record.applyDate ? dayjs(record.applyDate) : undefined,
      requiredDate: record.requiredDate ? dayjs(record.requiredDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { applyDate, requiredDate, ...rest } = values;
    const payload: ErpPurchaseRequisitionSaveRequest = {
      ...rest,
      applyDate: applyDate ? applyDate.format(DATETIME_FORMAT) : undefined,
      requiredDate: requiredDate ? requiredDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpPurchaseRequisitionService.create(payload);
        message.success('请购单已创建');
      } else {
        await erpPurchaseRequisitionService.update(editId, payload);
        message.success('请购单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpPurchaseRequisitionService.remove(id);
    message.success('请购单已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ lineStatus: 'OPEN', uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpPurchaseRequisitionLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({
      ...line,
      reqDate: line.reqDate ? dayjs(line.reqDate) : undefined,
    });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const { reqDate, ...rest } = values;
    const payload: ErpPurchaseRequisitionLineSaveRequest = {
      ...rest,
      reqDate: reqDate ? reqDate.format(DATETIME_FORMAT) : undefined,
    };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpPurchaseRequisitionService.updateLine(lineEditing.id, payload);
        message.success('请购行已更新');
      } else if (headerId != null) {
        await erpPurchaseRequisitionService.addLine(headerId, payload);
        message.success('请购行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpPurchaseRequisitionLine) => {
    if (line.id == null) return;
    await erpPurchaseRequisitionService.removeLine(line.id);
    message.success('请购行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpPurchaseRequisition> = [
    { title: '请购单号', dataIndex: 'requisitionNo', width: 170, fixed: 'left', render: plain },
    {
      title: '请购类型',
      dataIndex: 'requisitionType',
      width: 120,
      render: (v) => statusTag(ERP_REQUISITION_TYPE_LABEL, v),
    },
    { title: '请购组织', dataIndex: 'reqOrg', width: 140, render: plain },
    { title: '请购人', dataIndex: 'applicant', width: 110, render: plain },
    { title: '申请日期', dataIndex: 'applyDate', width: 170, render: formatDateTime },
    { title: '需求日期', dataIndex: 'requiredDate', width: 170, render: formatDateTime },
    { title: '币别', dataIndex: 'currencyCode', width: 90, render: plain },
    {
      title: '来源类型',
      dataIndex: 'sourceType',
      width: 110,
      render: (v) => statusTag(ERP_PURCHASE_SOURCE_TYPE_LABEL, v),
    },
    {
      title: '请购单状态',
      dataIndex: 'requisitionStatus',
      width: 120,
      render: (v) => statusTag(ERP_REQUISITION_STATUS_LABEL, v),
    },
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
              title="确认删除该请购单？"
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

  const lineColumns: ColumnsType<ErpPurchaseRequisitionLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    {
      title: '行状态',
      dataIndex: 'lineStatus',
      width: 100,
      render: (v) => statusTag(ERP_REQ_LINE_STATUS_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '请购数量', dataIndex: 'reqQty', width: 100, render: plain },
    { title: '已采购数量', dataIndex: 'orderedQty', width: 110, render: plain },
    { title: '剩余数量', dataIndex: 'remainingQty', width: 100, render: plain },
    { title: '需求日期', dataIndex: 'reqDate', width: 170, render: formatDateTime },
    { title: '建议供应商', dataIndex: 'suggestedSupplier', width: 140, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
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
            <Popconfirm title="确认删除该请购行？" onConfirm={() => void removeLine(record)}>
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
        请购单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="请购单状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={requisitionStatus}
              onChange={(v) => setRequisitionStatus(v)}
              options={[...ERP_REQUISITION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="请购类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={requisitionType}
              onChange={(v) => setRequisitionType(v)}
              options={[...ERP_REQUISITION_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="请购人">
            <Input
              placeholder="请输入请购人"
              allowClear
              style={{ width: 160 }}
              value={applicant}
              onChange={(e) => setApplicant(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="请购单号 / 请购人"
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
                  void loadData(1, pageSize, keyword, requisitionStatus, requisitionType, applicant);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRequisitionStatus(undefined);
                  setRequisitionType(undefined);
                  setApplicant('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建请购单
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`请购单（共 ${total} 条）`}>
        <Table<ErpPurchaseRequisition>
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
        title={editId == null ? '新建请购单' : '编辑请购单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="requisitionNo" label="单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="requisitionType" label="请购类型">
            <Select placeholder="为空默认 NORMAL" options={[...ERP_REQUISITION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reqOrg" label="请购组织">
            <Input placeholder="请输入请购组织" />
          </Form.Item>
          <Form.Item name="applicant" label="请购人">
            <Input placeholder="请输入请购人" />
          </Form.Item>
          <Form.Item name="applyDate" label="申请日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requiredDate" label="需求日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="currencyCode" label="币别">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="为空默认 MANUAL" options={[...ERP_PURCHASE_SOURCE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="requisitionStatus" label="请购单状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_REQUISITION_STATUS_OPTIONS]} />
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
        title={`请购单明细${
          detail?.header?.requisitionNo ? `：${detail.header.requisitionNo}` : ''
        }`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="请购组织">{plain(detail?.header?.reqOrg)}</Descriptions.Item>
          <Descriptions.Item label="请购人">{plain(detail?.header?.applicant)}</Descriptions.Item>
          <Descriptions.Item label="请购类型">
            {statusTag(ERP_REQUISITION_TYPE_LABEL, detail?.header?.requisitionType)}
          </Descriptions.Item>
          <Descriptions.Item label="请购单状态">
            {statusTag(ERP_REQUISITION_STATUS_LABEL, detail?.header?.requisitionStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="申请日期">{formatDateTime(detail?.header?.applyDate)}</Descriptions.Item>
          <Descriptions.Item label="需求日期">{formatDateTime(detail?.header?.requiredDate)}</Descriptions.Item>
          <Descriptions.Item label="币别">{plain(detail?.header?.currencyCode)}</Descriptions.Item>
          <Descriptions.Item label="来源类型">
            {statusTag(ERP_PURCHASE_SOURCE_TYPE_LABEL, detail?.header?.sourceType)}
          </Descriptions.Item>
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

        <Table<ErpPurchaseRequisitionLine>
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
        title={lineEditing ? '编辑请购行' : '新增请购行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="lineStatus" label="行状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_REQ_LINE_STATUS_OPTIONS]} />
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
          <Form.Item name="reqQty" label="请购数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入请购数量" />
          </Form.Item>
          <Form.Item name="orderedQty" label="已采购数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已采购数量" />
          </Form.Item>
          <Form.Item name="remainingQty" label="剩余数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入剩余数量" />
          </Form.Item>
          <Form.Item name="reqDate" label="需求日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="suggestedSupplier" label="建议供应商">
            <Input placeholder="请输入建议供应商" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
