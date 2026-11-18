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
import { erpOutsourceIssueService } from '@/services/erpOutsourceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_OUTSOURCE_ISSUE_STATUS_LABEL,
  ERP_OUTSOURCE_ISSUE_STATUS_OPTIONS,
  type ErpOutsourceIssue,
  type ErpOutsourceIssueDetail,
  type ErpOutsourceIssueLine,
  type ErpOutsourceIssueLineSaveRequest,
  type ErpOutsourceIssueSaveRequest,
} from '@/types/erpOutsource';

const { Title } = Typography;

const MANAGE = 'erp:outsource:issue:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type OutsourceIssueHeaderForm = Omit<ErpOutsourceIssueSaveRequest, 'issueDate'> & {
  issueDate?: Dayjs;
};

export default function ErpOutsourceIssuePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OutsourceIssueHeaderForm>();
  const [lineForm] = Form.useForm<ErpOutsourceIssueLineSaveRequest>();

  const [data, setData] = useState<ErpOutsourceIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [issueStatus, setIssueStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');
  const [supplierCode, setSupplierCode] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpOutsourceIssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpOutsourceIssueLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = issueStatus,
      order = orderNo,
      supplier = supplierCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpOutsourceIssueService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          issueStatus: status,
          orderNo: order || undefined,
          supplierCode: supplier || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, issueStatus, orderNo, supplierCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpOutsourceIssueService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpOutsourceIssue) => {
    if (record.id == null) return;
    setHeaderId(record.id);
    setDetail(null);
    setDrawerOpen(true);
    void loadDetail(record.id);
  };

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ issueStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpOutsourceIssue) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { issueDate, ...rest } = values;
    const payload: ErpOutsourceIssueSaveRequest = {
      ...rest,
      issueDate: issueDate ? issueDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpOutsourceIssueService.create(payload);
        message.success('委外发料单已创建');
      } else {
        await erpOutsourceIssueService.update(editId, payload);
        message.success('委外发料单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpOutsourceIssueService.remove(id);
    message.success('委外发料单已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpOutsourceIssueLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const payload: ErpOutsourceIssueLineSaveRequest = { ...values };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpOutsourceIssueService.updateLine(lineEditing.id, payload);
        message.success('发料行已更新');
      } else if (headerId != null) {
        await erpOutsourceIssueService.addLine(headerId, payload);
        message.success('发料行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpOutsourceIssueLine) => {
    if (line.id == null) return;
    await erpOutsourceIssueService.removeLine(line.id);
    message.success('发料行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpOutsourceIssue> = [
    { title: '发料单号', dataIndex: 'issueNo', width: 170, fixed: 'left', render: plain },
    { title: '关联订单号', dataIndex: 'orderNo', width: 170, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 140, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '发料日期', dataIndex: 'issueDate', width: 170, render: formatDateTime },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '发料人', dataIndex: 'issuer', width: 110, render: plain },
    {
      title: '发料状态',
      dataIndex: 'issueStatus',
      width: 110,
      render: (v) => statusTag(ERP_OUTSOURCE_ISSUE_STATUS_LABEL, v),
    },
    { title: '发料数量', dataIndex: 'totalQty', width: 110, render: plain },
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
              title="确认删除该委外发料单？"
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

  const lineColumns: ColumnsType<ErpOutsourceIssueLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    { title: '关联订单号', dataIndex: 'orderNo', width: 170, render: plain },
    { title: '订单行号', dataIndex: 'orderLineNo', width: 90, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '发料数量', dataIndex: 'issueQty', width: 100, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 120, render: plain },
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
            <Popconfirm title="确认删除该发料行？" onConfirm={() => void removeLine(record)}>
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
        委外发料
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="发料状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={issueStatus}
              onChange={(v) => setIssueStatus(v)}
              options={[...ERP_OUTSOURCE_ISSUE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关联订单号">
            <Input
              placeholder="请输入订单号"
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
              placeholder="发料单号 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, issueStatus, orderNo, supplierCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setIssueStatus(undefined);
                  setOrderNo('');
                  setSupplierCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建委外发料单
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`委外发料（共 ${total} 条）`}>
        <Table<ErpOutsourceIssue>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1700 }}
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
        title={editId == null ? '新建委外发料单' : '编辑委外发料单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="issueNo" label="发料单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderNo" label="关联订单号">
            <Input placeholder="请输入委外订单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码" rules={[{ required: true, message: '请输入供应商编码' }]}>
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="issueDate" label="发料日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="issuer" label="发料人">
            <Input placeholder="请输入发料人" />
          </Form.Item>
          <Form.Item name="issueStatus" label="发料状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_OUTSOURCE_ISSUE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="totalQty" label="发料数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入发料数量" />
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
        title={`委外发料明细${detail?.header?.issueNo ? `：${detail.header.issueNo}` : ''}`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="关联订单号">{plain(detail?.header?.orderNo)}</Descriptions.Item>
          <Descriptions.Item label="供应商编码">{plain(detail?.header?.supplierCode)}</Descriptions.Item>
          <Descriptions.Item label="供应商名称">{plain(detail?.header?.supplierName)}</Descriptions.Item>
          <Descriptions.Item label="发料日期">{formatDateTime(detail?.header?.issueDate)}</Descriptions.Item>
          <Descriptions.Item label="仓库编码">{plain(detail?.header?.warehouseCode)}</Descriptions.Item>
          <Descriptions.Item label="发料人">{plain(detail?.header?.issuer)}</Descriptions.Item>
          <Descriptions.Item label="发料状态">
            {statusTag(ERP_OUTSOURCE_ISSUE_STATUS_LABEL, detail?.header?.issueStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="发料数量">{plain(detail?.header?.totalQty)}</Descriptions.Item>
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

        <Table<ErpOutsourceIssueLine>
          rowKey="id"
          size="small"
          loading={detailLoading}
          columns={lineColumns}
          dataSource={detail?.lines || []}
          scroll={{ x: 1300 }}
          pagination={false}
        />
      </Drawer>

      <Modal
        title={lineEditing ? '编辑发料行' : '新增发料行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="关联订单号">
            <Input placeholder="请输入委外订单号" />
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
          <Form.Item name="issueQty" label="发料数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入发料数量" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
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
