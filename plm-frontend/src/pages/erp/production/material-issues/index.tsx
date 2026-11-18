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
import { erpMaterialIssueService } from '@/services/erpProductionService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_MATERIAL_ISSUE_LINE_STATUS_LABEL,
  ERP_MATERIAL_ISSUE_LINE_STATUS_OPTIONS,
  ERP_MATERIAL_ISSUE_STATUS_LABEL,
  ERP_MATERIAL_ISSUE_STATUS_OPTIONS,
  type ErpMaterialIssue,
  type ErpMaterialIssueDetail,
  type ErpMaterialIssueLine,
  type ErpMaterialIssueLineSaveRequest,
  type ErpMaterialIssueQuery,
  type ErpMaterialIssueSaveRequest,
} from '@/types/erpProduction';

const { Title } = Typography;

const MANAGE = 'erp:production:issue:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type MaterialIssueHeaderForm = Omit<ErpMaterialIssueSaveRequest, 'issueDate'> & {
  issueDate?: Dayjs;
};

/** 明细行表单。 */
type MaterialIssueLineForm = ErpMaterialIssueLineSaveRequest;

export default function ErpMaterialIssuePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MaterialIssueHeaderForm>();
  const [lineForm] = Form.useForm<MaterialIssueLineForm>();

  const [data, setData] = useState<ErpMaterialIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [issueStatus, setIssueStatus] = useState<string | undefined>(undefined);
  const [orderNo, setOrderNo] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpMaterialIssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpMaterialIssueLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = issueStatus,
      order = orderNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpMaterialIssueQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          issueStatus: status,
          orderNo: order || undefined,
        };
        const res = await erpMaterialIssueService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, issueStatus, orderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpMaterialIssueService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpMaterialIssue) => {
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

  const openEdit = (record: ErpMaterialIssue) => {
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
    const payload: ErpMaterialIssueSaveRequest = {
      ...rest,
      issueDate: issueDate ? issueDate.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpMaterialIssueService.create(payload);
        message.success('材料领用单已创建');
      } else {
        await erpMaterialIssueService.update(editId, payload);
        message.success('材料领用单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpMaterialIssueService.remove(id);
    message.success('材料领用单已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ lineStatus: 'OPEN', uom: 'PCS' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpMaterialIssueLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({ ...line });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const payload: ErpMaterialIssueLineSaveRequest = { ...values };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpMaterialIssueService.updateLine(lineEditing.id, payload);
        message.success('材料领用行已更新');
      } else if (headerId != null) {
        await erpMaterialIssueService.addLine(headerId, payload);
        message.success('材料领用行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpMaterialIssueLine) => {
    if (line.id == null) return;
    await erpMaterialIssueService.removeLine(line.id);
    message.success('材料领用行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpMaterialIssue> = [
    { title: '领用单号', dataIndex: 'issueNo', width: 170, fixed: 'left', render: plain },
    { title: '生产订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '车间', dataIndex: 'workshop', width: 140, render: plain },
    { title: '领料人', dataIndex: 'issueBy', width: 120, render: plain },
    { title: '领料日期', dataIndex: 'issueDate', width: 170, render: formatDateTime },
    { title: '领料总数量', dataIndex: 'totalQty', width: 110, render: plain },
    {
      title: '领料状态',
      dataIndex: 'issueStatus',
      width: 110,
      render: (v) => statusTag(ERP_MATERIAL_ISSUE_STATUS_LABEL, v),
    },
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
              title="确认删除该材料领用单？"
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

  const lineColumns: ColumnsType<ErpMaterialIssueLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    {
      title: '行状态',
      dataIndex: 'lineStatus',
      width: 100,
      render: (v) => statusTag(ERP_MATERIAL_ISSUE_LINE_STATUS_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '领用数量', dataIndex: 'issueQty', width: 100, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
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
            <Popconfirm title="确认删除该材料领用行？" onConfirm={() => void removeLine(record)}>
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
        材料领用
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="领料状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={issueStatus}
              onChange={(v) => setIssueStatus(v)}
              options={[...ERP_MATERIAL_ISSUE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="生产订单号">
            <Input
              placeholder="请输入生产订单号"
              allowClear
              style={{ width: 180 }}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="领用单号 / 领料人"
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
                  void loadData(1, pageSize, keyword, issueStatus, orderNo);
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
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建材料领用单
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`材料领用（共 ${total} 条）`}>
        <Table<ErpMaterialIssue>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1300 }}
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
        title={editId == null ? '新建材料领用单' : '编辑材料领用单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="issueNo" label="领用单号">
            <Input disabled placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="orderNo" label="生产订单号">
            <Input placeholder="请输入生产订单号" />
          </Form.Item>
          <Form.Item name="workshop" label="车间">
            <Input placeholder="请输入车间" />
          </Form.Item>
          <Form.Item name="issueBy" label="领料人">
            <Input placeholder="请输入领料人" />
          </Form.Item>
          <Form.Item name="issueDate" label="领料日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择领料日期" />
          </Form.Item>
          <Form.Item name="totalQty" label="领料总数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入领料总数量" />
          </Form.Item>
          <Form.Item name="issueStatus" label="领料状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_MATERIAL_ISSUE_STATUS_OPTIONS]} />
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
        title={`材料领用明细${detail?.header?.issueNo ? `：${detail.header.issueNo}` : ''}`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="领用单号">{plain(detail?.header?.issueNo)}</Descriptions.Item>
          <Descriptions.Item label="生产订单号">{plain(detail?.header?.orderNo)}</Descriptions.Item>
          <Descriptions.Item label="车间">{plain(detail?.header?.workshop)}</Descriptions.Item>
          <Descriptions.Item label="领料人">{plain(detail?.header?.issueBy)}</Descriptions.Item>
          <Descriptions.Item label="领料日期">
            {formatDateTime(detail?.header?.issueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="领料总数量">{plain(detail?.header?.totalQty)}</Descriptions.Item>
          <Descriptions.Item label="领料状态">
            {statusTag(ERP_MATERIAL_ISSUE_STATUS_LABEL, detail?.header?.issueStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDateTime(detail?.header?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="描述">{plain(detail?.header?.description)}</Descriptions.Item>
          <Descriptions.Item label="备注">{plain(detail?.header?.remark)}</Descriptions.Item>
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

        <Table<ErpMaterialIssueLine>
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
        title={lineEditing ? '编辑材料领用行' : '新增材料领用行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="lineNo" label="行号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入行号" />
          </Form.Item>
          <Form.Item name="lineStatus" label="行状态">
            <Select
              placeholder="为空默认 OPEN"
              options={[...ERP_MATERIAL_ISSUE_LINE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
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
          <Form.Item name="issueQty" label="领用数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入领用数量" />
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
