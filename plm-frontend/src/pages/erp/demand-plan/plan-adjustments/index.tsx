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
import { erpPlanAdjustmentService } from '@/services/erpDemandPlanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PLAN_ADJUSTMENT_STATUS_LABEL,
  ERP_PLAN_ADJUSTMENT_STATUS_OPTIONS,
  ERP_PLAN_ADJUSTMENT_TYPE_LABEL,
  ERP_PLAN_ADJUSTMENT_TYPE_OPTIONS,
  type ErpPlanAdjustment,
  type ErpPlanAdjustmentQuery,
  type ErpPlanAdjustmentSaveRequest,
} from '@/types/erpDemandPlan';

const { Title } = Typography;

const MANAGE = 'erp:demand-plan:adjustment:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpPlanAdjustmentSaveRequest, 'oldDate' | 'newDate' | 'adjustDate'> & {
  oldDate?: Dayjs;
  newDate?: Dayjs;
  adjustDate?: Dayjs;
};

export default function ErpPlanAdjustmentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpPlanAdjustment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [adjustmentStatus, setAdjustmentStatus] = useState<string | undefined>(undefined);
  const [adjustmentType, setAdjustmentType] = useState<string | undefined>(undefined);
  const [materialCode, setMaterialCode] = useState('');
  const [planNo, setPlanNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = adjustmentStatus,
      type = adjustmentType,
      material = materialCode,
      plan = planNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpPlanAdjustmentQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          adjustmentStatus: status,
          adjustmentType: type,
          materialCode: material || undefined,
          planNo: plan || undefined,
        };
        const res = await erpPlanAdjustmentService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, adjustmentStatus, adjustmentType, materialCode, planNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ adjustmentType: 'DEMAND', uom: 'PCS', adjustmentStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpPlanAdjustment) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      oldDate: record.oldDate ? dayjs(record.oldDate) : undefined,
      newDate: record.newDate ? dayjs(record.newDate) : undefined,
      adjustDate: record.adjustDate ? dayjs(record.adjustDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpPlanAdjustmentSaveRequest = {
        ...values,
        oldDate: values.oldDate ? values.oldDate.format(DATETIME_FORMAT) : undefined,
        newDate: values.newDate ? values.newDate.format(DATETIME_FORMAT) : undefined,
        adjustDate: values.adjustDate ? values.adjustDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpPlanAdjustmentService.create(payload);
        message.success('计划调整单已创建');
      } else {
        await erpPlanAdjustmentService.update(editId, payload);
        message.success('计划调整单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpPlanAdjustmentService.remove(id);
    message.success('计划调整单已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpPlanAdjustment> = [
    { title: '调整单号', dataIndex: 'adjustmentNo', width: 170, fixed: 'left', render: plain },
    { title: '计划单号', dataIndex: 'planNo', width: 160, render: plain },
    {
      title: '调整类型',
      dataIndex: 'adjustmentType',
      width: 130,
      render: (v) => statusTag(ERP_PLAN_ADJUSTMENT_TYPE_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '原数量', dataIndex: 'oldQty', width: 100, render: plain },
    { title: '新数量', dataIndex: 'newQty', width: 100, render: plain },
    { title: '原日期', dataIndex: 'oldDate', width: 170, render: formatDateTime },
    { title: '新日期', dataIndex: 'newDate', width: 170, render: formatDateTime },
    { title: '调整原因', dataIndex: 'adjustReason', width: 160, ellipsis: true, render: plain },
    { title: '调整人', dataIndex: 'adjustBy', width: 110, render: plain },
    { title: '调整日期', dataIndex: 'adjustDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '调整状态',
      dataIndex: 'adjustmentStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PLAN_ADJUSTMENT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该计划调整单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        计划调整单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="调整状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={adjustmentStatus}
              onChange={(v) => setAdjustmentStatus(v)}
              options={[...ERP_PLAN_ADJUSTMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="调整类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={adjustmentType}
              onChange={(v) => setAdjustmentType(v)}
              options={[...ERP_PLAN_ADJUSTMENT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="物料编码">
            <Input
              placeholder="请输入物料编码"
              allowClear
              style={{ width: 160 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="计划单号">
            <Input
              placeholder="请输入计划单号"
              allowClear
              style={{ width: 160 }}
              value={planNo}
              onChange={(e) => setPlanNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="调整单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, adjustmentStatus, adjustmentType, materialCode, planNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAdjustmentStatus(undefined);
                  setAdjustmentType(undefined);
                  setMaterialCode('');
                  setPlanNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建调整单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`计划调整单（共 ${total} 条）`}>
        <Table<ErpPlanAdjustment>
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
        title={editId == null ? '新建调整单' : '编辑调整单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="adjustmentNo" label="调整单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="planNo" label="计划单号">
            <Input placeholder="请输入计划单号" />
          </Form.Item>
          <Form.Item name="adjustmentType" label="调整类型">
            <Select placeholder="为空默认 DEMAND" options={[...ERP_PLAN_ADJUSTMENT_TYPE_OPTIONS]} />
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
          <Form.Item name="oldQty" label="原数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入原数量" />
          </Form.Item>
          <Form.Item name="newQty" label="新数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入新数量" />
          </Form.Item>
          <Form.Item name="oldDate" label="原日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择原日期" />
          </Form.Item>
          <Form.Item name="newDate" label="新日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择新日期" />
          </Form.Item>
          <Form.Item name="adjustReason" label="调整原因">
            <Input placeholder="请输入调整原因" />
          </Form.Item>
          <Form.Item name="adjustBy" label="调整人">
            <Input placeholder="请输入调整人" />
          </Form.Item>
          <Form.Item name="adjustDate" label="调整日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择调整日期" />
          </Form.Item>
          <Form.Item name="adjustmentStatus" label="调整状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_PLAN_ADJUSTMENT_STATUS_OPTIONS]} />
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
