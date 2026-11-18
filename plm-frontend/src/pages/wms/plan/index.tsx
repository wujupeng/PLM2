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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { wmsService } from '@/services/wmsService';
import {
  WMS_PLAN_STATUS_COLOR,
  WMS_PLAN_STATUS_LABEL,
  WMS_PLAN_STATUS_OPTIONS,
  WMS_PLAN_TYPE_LABEL,
  WMS_PLAN_TYPE_OPTIONS,
  type WmsContingencyPlanItem,
  type WmsPlanQuery,
  type WmsPlanSaveParams,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface PlanFormValues {
  caseNo?: string;
  warningNo?: string;
  materialCode: string;
  planType: string;
  substituteMaterial?: string;
  targetLocationCode?: string;
  supplierCode?: string;
  expectedQty?: number;
  expectedDate?: Dayjs;
  costImpact?: string;
  remark?: string;
}

interface ApproveFormValues {
  approver?: string;
  remark?: string;
}

interface PlanSearchState {
  planType?: string;
  planStatus?: string;
  materialCode?: string;
  caseNo?: string;
  supplierCode?: string;
}

export default function WmsPlanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<PlanFormValues>();
  const [approveForm] = Form.useForm<ApproveFormValues>();

  const [data, setData] = useState<WmsContingencyPlanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<PlanSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WmsContingencyPlanItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveRecord, setApproveRecord] = useState<WmsContingencyPlanItem | null>(null);
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsPlanQuery = {
          pageNum: page,
          pageSize: size,
          planType: cond.planType || undefined,
          planStatus: cond.planStatus || undefined,
          materialCode: cond.materialCode || undefined,
          caseNo: cond.caseNo || undefined,
          supplierCode: cond.supplierCode || undefined,
        };
        const res = await wmsService.planPage(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: PlanSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: WmsContingencyPlanItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      caseNo: record.caseNo,
      warningNo: record.warningNo,
      materialCode: record.materialCode,
      planType: record.planType,
      substituteMaterial: record.substituteMaterial,
      targetLocationCode: record.targetLocationCode,
      supplierCode: record.supplierCode,
      expectedQty: record.expectedQty,
      expectedDate: record.expectedDate ? dayjs(record.expectedDate) : undefined,
      costImpact: record.costImpact,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsPlanSaveParams = {
      caseNo: values.caseNo,
      warningNo: values.warningNo,
      materialCode: values.materialCode,
      planType: values.planType,
      substituteMaterial: values.substituteMaterial,
      targetLocationCode: values.targetLocationCode,
      supplierCode: values.supplierCode,
      expectedQty: values.expectedQty,
      expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : undefined,
      costImpact: values.costImpact,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await wmsService.planUpdate(editing.planNo, payload);
        message.success('更新成功');
      } else {
        await wmsService.planCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: WmsContingencyPlanItem) => {
    await wmsService.planRemove(record.planNo);
    message.success('删除成功');
    void loadData();
  };

  const openApprove = (record: WmsContingencyPlanItem) => {
    setApproveRecord(record);
    approveForm.resetFields();
    setApproveOpen(true);
  };

  const handleApprove = async () => {
    if (!approveRecord) return;
    const values = await approveForm.validateFields();
    setApproveSubmitting(true);
    try {
      await wmsService.planApprove(approveRecord.planNo, values);
      message.success('审批成功');
      setApproveOpen(false);
      void loadData();
    } finally {
      setApproveSubmitting(false);
    }
  };

  const handleExecute = async (record: WmsContingencyPlanItem) => {
    await wmsService.planExecute(record.planNo);
    message.success('执行成功');
    void loadData();
  };

  const handleCancel = async (record: WmsContingencyPlanItem) => {
    await wmsService.planCancel(record.planNo);
    message.success('取消成功');
    void loadData();
  };

  const columns: ColumnsType<WmsContingencyPlanItem> = [
    { title: '预案编号', dataIndex: 'planNo', width: 160, render: (v) => v || '-' },
    { title: '欠料单号', dataIndex: 'caseNo', width: 150, render: (v) => v || '-' },
    { title: '缺料预警号', dataIndex: 'warningNo', width: 150, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    {
      title: '预案类型',
      dataIndex: 'planType',
      width: 120,
      render: (v?: string) => (v ? WMS_PLAN_TYPE_LABEL[v] || v : '-'),
    },
    { title: '替代物料', dataIndex: 'substituteMaterial', width: 140, render: (v) => v || '-' },
    { title: '目标库位', dataIndex: 'targetLocationCode', width: 140, render: (v) => v || '-' },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 140, render: (v) => v || '-' },
    { title: '预期数量', dataIndex: 'expectedQty', width: 100, render: (v) => v ?? '-' },
    { title: '预期日期', dataIndex: 'expectedDate', width: 120, render: (v) => v || '-' },
    { title: '成本影响', dataIndex: 'costImpact', width: 140, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'planStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_PLAN_STATUS_COLOR[v]}>{WMS_PLAN_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '审批人', dataIndex: 'approver', width: 110, render: (v) => v || '-' },
    {
      title: '审批时间',
      dataIndex: 'approvedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '执行时间',
      dataIndex: 'executedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('wms:plan:save') && record.planStatus === 'DRAFT' && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('wms:plan:save') && (
            <Popconfirm title="确认删除该预案？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
          {hasPermission('wms:plan:approve') && record.planStatus === 'DRAFT' && (
            <Button type="link" size="small" onClick={() => openApprove(record)}>
              审批
            </Button>
          )}
          {hasPermission('wms:plan:approve') && record.planStatus === 'APPROVED' && (
            <Popconfirm title="确认执行该预案？" onConfirm={() => handleExecute(record)}>
              <Button type="link" size="small">
                执行
              </Button>
            </Popconfirm>
          )}
          {hasPermission('wms:plan:approve') &&
            ['DRAFT', 'APPROVED', 'EXECUTING'].includes(record.planStatus || '') && (
              <Popconfirm title="确认取消该预案？" onConfirm={() => handleCancel(record)}>
                <Button type="link" size="small" danger>
                  取消
                </Button>
              </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        应急预案
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="planType" label="预案类型">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={WMS_PLAN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="planStatus" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_PLAN_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="caseNo" label="欠料单号">
            <Input placeholder="请输入欠料单号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`应急预案（共 ${total} 条）`}
        extra={
          hasPermission('wms:plan:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建预案
            </Button>
          )
        }
      >
        <Table<WmsContingencyPlanItem>
          rowKey="planNo"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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

      {/* 新增/编辑预案 */}
      <Modal
        title={editing ? '编辑预案' : '新建预案'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="caseNo" label="欠料单号">
            <Input placeholder="请输入欠料单号" />
          </Form.Item>
          <Form.Item name="warningNo" label="缺料预警号">
            <Input placeholder="请输入缺料预警号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="planType" label="预案类型" rules={[{ required: true, message: '请选择预案类型' }]}>
            <Select placeholder="请选择" options={WMS_PLAN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="substituteMaterial" label="替代物料">
            <Input placeholder="请输入替代物料" />
          </Form.Item>
          <Form.Item name="targetLocationCode" label="目标库位">
            <Input placeholder="请输入目标库位" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="expectedQty" label="预期数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入预期数量" />
          </Form.Item>
          <Form.Item name="expectedDate" label="预期日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择预期日期" />
          </Form.Item>
          <Form.Item name="costImpact" label="成本影响">
            <Input placeholder="请输入成本影响" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 审批预案 */}
      <Modal
        title="审批预案"
        open={approveOpen}
        onOk={handleApprove}
        confirmLoading={approveSubmitting}
        onCancel={() => setApproveOpen(false)}
        destroyOnClose
        width={520}
      >
        <Form form={approveForm} layout="vertical" preserve={false}>
          <Form.Item name="approver" label="审批人">
            <Input placeholder="请输入审批人" />
          </Form.Item>
          <Form.Item name="remark" label="审批意见">
            <Input.TextArea rows={3} placeholder="请输入审批意见" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
