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
import { erpDemandPlanService } from '@/services/erpDemandPlanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_DEMAND_LINE_STATUS_LABEL,
  ERP_DEMAND_LINE_STATUS_OPTIONS,
  ERP_DEMAND_PLAN_SOURCE_LABEL,
  ERP_DEMAND_PLAN_SOURCE_OPTIONS,
  ERP_DEMAND_PLAN_STATUS_LABEL,
  ERP_DEMAND_PLAN_STATUS_OPTIONS,
  ERP_DEMAND_PLAN_TYPE_LABEL,
  ERP_DEMAND_PLAN_TYPE_OPTIONS,
  ERP_DEMAND_SOURCE_TYPE_LABEL,
  ERP_DEMAND_SOURCE_TYPE_OPTIONS,
  type ErpDemandPlan,
  type ErpDemandPlanDetail,
  type ErpDemandPlanLine,
  type ErpDemandPlanLineSaveRequest,
  type ErpDemandPlanQuery,
  type ErpDemandPlanSaveRequest,
} from '@/types/erpDemandPlan';

const { Title } = Typography;

const MANAGE = 'erp:demand-plan:plan:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/** 主单头表单：日期字段放宽为 Dayjs。 */
type DemandPlanHeaderForm = Omit<
  ErpDemandPlanSaveRequest,
  'planDate' | 'horizonStart' | 'horizonEnd'
> & {
  planDate?: Dayjs;
  horizonStart?: Dayjs;
  horizonEnd?: Dayjs;
};

/** 明细行表单：日期字段放宽为 Dayjs。 */
type DemandPlanLineForm = Omit<ErpDemandPlanLineSaveRequest, 'demandDate'> & {
  demandDate?: Dayjs;
};

export default function ErpDemandPlanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DemandPlanHeaderForm>();
  const [lineForm] = Form.useForm<DemandPlanLineForm>();

  const [data, setData] = useState<ErpDemandPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [planStatus, setPlanStatus] = useState<string | undefined>(undefined);
  const [planType, setPlanType] = useState<string | undefined>(undefined);
  const [planSource, setPlanSource] = useState<string | undefined>(undefined);
  const [planOrg, setPlanOrg] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ErpDemandPlanDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [headerId, setHeaderId] = useState<number | null>(null);

  const [lineOpen, setLineOpen] = useState(false);
  const [lineEditing, setLineEditing] = useState<ErpDemandPlanLine | null>(null);
  const [lineSaving, setLineSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = planStatus,
      type = planType,
      source = planSource,
      org = planOrg,
    ) => {
      setLoading(true);
      try {
        const params: ErpDemandPlanQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          planStatus: status,
          planType: type,
          planSource: source,
          planOrg: org || undefined,
        };
        const res = await erpDemandPlanService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, planStatus, planType, planSource, planOrg],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await erpDemandPlanService.detail(id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record: ErpDemandPlan) => {
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
      planType: 'ORDER',
      planSource: 'SALES',
      currencyCode: 'CNY',
      planStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: ErpDemandPlan) => {
    setEditId(record.id ?? null);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      planDate: record.planDate ? dayjs(record.planDate) : undefined,
      horizonStart: record.horizonStart ? dayjs(record.horizonStart) : undefined,
      horizonEnd: record.horizonEnd ? dayjs(record.horizonEnd) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const { planDate, horizonStart, horizonEnd, ...rest } = values;
    const payload: ErpDemandPlanSaveRequest = {
      ...rest,
      planDate: planDate ? planDate.format(DATETIME_FORMAT) : undefined,
      horizonStart: horizonStart ? horizonStart.format(DATETIME_FORMAT) : undefined,
      horizonEnd: horizonEnd ? horizonEnd.format(DATETIME_FORMAT) : undefined,
    };
    setSaving(true);
    try {
      if (editId == null) {
        await erpDemandPlanService.create(payload);
        message.success('需求计划已创建');
      } else {
        await erpDemandPlanService.update(editId, payload);
        message.success('需求计划已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpDemandPlanService.remove(id);
    message.success('需求计划已删除');
    void loadData();
  };

  const openLineCreate = () => {
    setLineEditing(null);
    lineForm.resetFields();
    lineForm.setFieldsValue({ lineStatus: 'OPEN', uom: 'PCS', sourceType: 'SALES' });
    setLineOpen(true);
  };

  const openLineEdit = (line: ErpDemandPlanLine) => {
    setLineEditing(line);
    lineForm.resetFields();
    lineForm.setFieldsValue({
      ...line,
      demandDate: line.demandDate ? dayjs(line.demandDate) : undefined,
    });
    setLineOpen(true);
  };

  const submitLine = async () => {
    const values = await lineForm.validateFields();
    const { demandDate, ...rest } = values;
    const payload: ErpDemandPlanLineSaveRequest = {
      ...rest,
      demandDate: demandDate ? demandDate.format(DATETIME_FORMAT) : undefined,
    };
    setLineSaving(true);
    try {
      if (lineEditing?.id != null) {
        await erpDemandPlanService.updateLine(lineEditing.id, payload);
        message.success('需求计划行已更新');
      } else if (headerId != null) {
        await erpDemandPlanService.addLine(headerId, payload);
        message.success('需求计划行已新增');
      }
      setLineOpen(false);
      if (headerId != null) void loadDetail(headerId);
    } finally {
      setLineSaving(false);
    }
  };

  const removeLine = async (line: ErpDemandPlanLine) => {
    if (line.id == null) return;
    await erpDemandPlanService.removeLine(line.id);
    message.success('需求计划行已删除');
    if (headerId != null) void loadDetail(headerId);
  };

  const columns: ColumnsType<ErpDemandPlan> = [
    { title: '计划单号', dataIndex: 'planNo', width: 170, fixed: 'left', render: plain },
    { title: '计划名称', dataIndex: 'planName', width: 180, render: plain },
    {
      title: '计划类型',
      dataIndex: 'planType',
      width: 120,
      render: (v) => statusTag(ERP_DEMAND_PLAN_TYPE_LABEL, v),
    },
    {
      title: '计划来源',
      dataIndex: 'planSource',
      width: 120,
      render: (v) => statusTag(ERP_DEMAND_PLAN_SOURCE_LABEL, v),
    },
    { title: '计划组织', dataIndex: 'planOrg', width: 140, render: plain },
    { title: '计划员', dataIndex: 'planner', width: 110, render: plain },
    { title: '计划日期', dataIndex: 'planDate', width: 170, render: formatDateTime },
    { title: '开始日期', dataIndex: 'horizonStart', width: 170, render: formatDateTime },
    { title: '结束日期', dataIndex: 'horizonEnd', width: 170, render: formatDateTime },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    {
      title: '计划状态',
      dataIndex: 'planStatus',
      width: 110,
      render: (v) => statusTag(ERP_DEMAND_PLAN_STATUS_LABEL, v),
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
              title="确认删除该需求计划？"
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

  const lineColumns: ColumnsType<ErpDemandPlanLine> = [
    { title: '行号', dataIndex: 'lineNo', width: 70, render: plain },
    {
      title: '行状态',
      dataIndex: 'lineStatus',
      width: 100,
      render: (v) => statusTag(ERP_DEMAND_LINE_STATUS_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '需求数量', dataIndex: 'demandQty', width: 100, render: plain },
    {
      title: '来源类型',
      dataIndex: 'sourceType',
      width: 120,
      render: (v) => statusTag(ERP_DEMAND_SOURCE_TYPE_LABEL, v),
    },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 130, render: plain },
    { title: '需求日期', dataIndex: 'demandDate', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该需求计划行？" onConfirm={() => void removeLine(record)}>
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
        需求计划
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="计划状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={planStatus}
              onChange={(v) => setPlanStatus(v)}
              options={[...ERP_DEMAND_PLAN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="计划类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={planType}
              onChange={(v) => setPlanType(v)}
              options={[...ERP_DEMAND_PLAN_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="计划来源">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={planSource}
              onChange={(v) => setPlanSource(v)}
              options={[...ERP_DEMAND_PLAN_SOURCE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="计划组织">
            <Input
              placeholder="请输入计划组织"
              allowClear
              style={{ width: 160 }}
              value={planOrg}
              onChange={(e) => setPlanOrg(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="计划单号 / 计划名称"
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
                  void loadData(1, pageSize, keyword, planStatus, planType, planSource, planOrg);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPlanStatus(undefined);
                  setPlanType(undefined);
                  setPlanSource(undefined);
                  setPlanOrg('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && (
                <Button icon={<PlusOutlined />} onClick={openCreate}>
                  新建需求计划
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`需求计划（共 ${total} 条）`}>
        <Table<ErpDemandPlan>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建需求计划' : '编辑需求计划'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="planNo" label="计划单号">
            <Input disabled placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="planName" label="计划名称">
            <Input placeholder="请输入计划名称" />
          </Form.Item>
          <Form.Item name="planType" label="计划类型">
            <Select placeholder="为空默认 ORDER" options={[...ERP_DEMAND_PLAN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="planSource" label="计划来源">
            <Select placeholder="为空默认 SALES" options={[...ERP_DEMAND_PLAN_SOURCE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="planOrg" label="计划组织">
            <Input placeholder="请输入计划组织" />
          </Form.Item>
          <Form.Item name="planner" label="计划员">
            <Input placeholder="请输入计划员" />
          </Form.Item>
          <Form.Item name="planDate" label="计划日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择计划日期" />
          </Form.Item>
          <Form.Item name="horizonStart" label="计划开始日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择计划开始日期" />
          </Form.Item>
          <Form.Item name="horizonEnd" label="计划结束日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择计划结束日期" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="为空默认 CNY" />
          </Form.Item>
          <Form.Item name="planStatus" label="计划状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_DEMAND_PLAN_STATUS_OPTIONS]} />
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
        title={`需求计划明细${detail?.header?.planNo ? `：${detail.header.planNo}` : ''}`}
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="计划单号">{plain(detail?.header?.planNo)}</Descriptions.Item>
          <Descriptions.Item label="计划名称">{plain(detail?.header?.planName)}</Descriptions.Item>
          <Descriptions.Item label="计划类型">
            {statusTag(ERP_DEMAND_PLAN_TYPE_LABEL, detail?.header?.planType)}
          </Descriptions.Item>
          <Descriptions.Item label="计划来源">
            {statusTag(ERP_DEMAND_PLAN_SOURCE_LABEL, detail?.header?.planSource)}
          </Descriptions.Item>
          <Descriptions.Item label="计划组织">{plain(detail?.header?.planOrg)}</Descriptions.Item>
          <Descriptions.Item label="计划员">{plain(detail?.header?.planner)}</Descriptions.Item>
          <Descriptions.Item label="计划日期">
            {formatDateTime(detail?.header?.planDate)}
          </Descriptions.Item>
          <Descriptions.Item label="计划开始日期">
            {formatDateTime(detail?.header?.horizonStart)}
          </Descriptions.Item>
          <Descriptions.Item label="计划结束日期">
            {formatDateTime(detail?.header?.horizonEnd)}
          </Descriptions.Item>
          <Descriptions.Item label="币种">{plain(detail?.header?.currencyCode)}</Descriptions.Item>
          <Descriptions.Item label="计划状态">
            {statusTag(ERP_DEMAND_PLAN_STATUS_LABEL, detail?.header?.planStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="组织名称">{plain(detail?.header?.orgName)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDateTime(detail?.header?.createdAt)}
          </Descriptions.Item>
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

        <Table<ErpDemandPlanLine>
          rowKey="id"
          size="small"
          loading={detailLoading}
          columns={lineColumns}
          dataSource={detail?.lines || []}
          scroll={{ x: 1800 }}
          pagination={false}
        />
      </Drawer>

      <Modal
        title={lineEditing ? '编辑需求计划行' : '新增需求计划行'}
        open={lineOpen}
        onOk={() => void submitLine()}
        confirmLoading={lineSaving}
        onCancel={() => setLineOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={lineForm} layout="vertical" preserve={false}>
          <Form.Item name="lineStatus" label="行状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_DEMAND_LINE_STATUS_OPTIONS]} />
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
          <Form.Item name="demandQty" label="需求数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入需求数量" />
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="为空默认 SALES" options={[...ERP_DEMAND_SOURCE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="demandDate" label="需求日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择需求日期" />
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
