import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { FormInstance } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  oaHrAttExceptionService,
  oaHrLeaveService,
  oaHrOvertimeService,
  oaHrResignationService,
  oaHrVehicleApplyService,
  oaHrVehicleService,
  oaHrVisitorService,
} from '@/services/oaService';
import UserSelect from '@/pages/oa/UserSelect';
import { useAuthStore } from '@/stores/authStore';
import type { PageResult } from '@/types/common';
import {
  OA_HR_ATT_EXCEPTION_TYPE_LABEL,
  OA_HR_ATT_EXCEPTION_TYPE_OPTIONS,
  OA_HR_COMPENSATE_TYPE_LABEL,
  OA_HR_COMPENSATE_TYPE_OPTIONS,
  OA_HR_FLOW_STATUS_LABEL,
  OA_HR_FLOW_STATUS_OPTIONS,
  OA_HR_LEAVE_TYPE_LABEL,
  OA_HR_LEAVE_TYPE_OPTIONS,
  OA_HR_OVERTIME_TYPE_LABEL,
  OA_HR_OVERTIME_TYPE_OPTIONS,
  OA_HR_RESIGNATION_TYPE_LABEL,
  OA_HR_RESIGNATION_TYPE_OPTIONS,
  OA_HR_VEHICLE_STATUS_LABEL,
  OA_HR_VEHICLE_STATUS_OPTIONS,
  OA_HR_VEHICLE_TYPE_LABEL,
  OA_HR_VEHICLE_TYPE_OPTIONS,
  OA_HR_VISITOR_STATUS_LABEL,
  OA_YES_NO_OPTIONS,
  type OaHrAttExceptionSaveParams,
  type OaHrFlowItem,
  type OaHrFlowQuery,
  type OaHrLeaveSaveParams,
  type OaHrOvertimeSaveParams,
  type OaHrResignationSaveParams,
  type OaHrVehicleApplySaveParams,
  type OaHrVehicleItem,
  type OaHrVehicleQuery,
  type OaHrVehicleSaveParams,
  type OaHrVisitorSaveParams,
} from '@/types/oa';

const { Title } = Typography;
const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATE_TIME_SECOND_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const HR_FLOW_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  RUNNING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'warning',
};

const HR_VISITOR_STATUS_COLOR: Record<string, string> = {
  APPLIED: 'default',
  APPROVED: 'processing',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'blue',
  REJECTED: 'error',
};

const HR_VEHICLE_STATUS_COLOR: Record<string, string> = {
  IDLE: 'success',
  IN_USE: 'processing',
  MAINTENANCE: 'warning',
  DISABLED: 'default',
};

/** 时间展示（日期时间）。 */
const formatDateTime = (v: unknown): string => (v ? dayjs(String(v)).format(DATE_TIME_FORMAT) : '-');

/** 普通文本展示。 */
const plain = (v: unknown): string =>
  v === null || v === undefined || v === '' ? '-' : String(v);

/** 枚举中文展示。 */
const enumLabel = (map: Record<string, string>, v: unknown): string => {
  const key = v === null || v === undefined ? '' : String(v);
  return key ? map[key] || key : '-';
};

/** 是否停用账号（1=是，0=否）。 */
const yesNoLabel = (v: unknown): string =>
  v === null || v === undefined ? '-' : Number(v) === 1 ? '是' : '否';

const flowStatusTag = (v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={HR_FLOW_STATUS_COLOR[key]}>{OA_HR_FLOW_STATUS_LABEL[key] || key}</Tag>;
};

const visitorStatusTag = (v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={HR_VISITOR_STATUS_COLOR[key]}>{OA_HR_VISITOR_STATUS_LABEL[key] || key}</Tag>;
};

const vehicleStatusTag = (v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={HR_VEHICLE_STATUS_COLOR[key]}>{OA_HR_VEHICLE_STATUS_LABEL[key] || key}</Tag>;
};

/** 人事流程单 service 结构（各子单据端点契约一致）。 */
interface HrFlowService<P> {
  page: (params: OaHrFlowQuery) => Promise<PageResult<OaHrFlowItem>>;
  detail: (id: number) => Promise<OaHrFlowItem>;
  create: (data: P) => Promise<number>;
  update: (id: number, data: P) => Promise<void>;
  remove: (id: number) => Promise<void>;
  cancel?: (id: number) => Promise<void>;
}

/** 表单值统一携带「保存并提交」开关。 */
interface HrSubmitValue {
  submit?: boolean;
}

interface HrFlowDetailField {
  label: string;
  key: string;
  render?: (value: unknown, record: OaHrFlowItem) => React.ReactNode;
}

interface HrFlowTabProps<P, V extends HrSubmitValue> {
  /** 单据名称，如「请假申请」 */
  title: string;
  service: HrFlowService<P>;
  columns: ColumnsType<OaHrFlowItem>;
  detailFields: HrFlowDetailField[];
  /** 表单字段：参数依次为表单实例、当前编辑记录、车辆档案候选 */
  renderFields: (
    form: FormInstance<V>,
    editing: OaHrFlowItem | null,
    vehicles: OaHrVehicleItem[],
  ) => React.ReactNode;
  buildEditValues: (record: OaHrFlowItem) => V;
  buildPayload: (values: V) => P;
  initialValues?: Partial<V>;
  formWidth?: number;
  /** 是否需要加载车辆档案下拉 */
  loadVehicles?: boolean;
  /** 是否允许提交（默认草稿/已驳回/已撤回可提交） */
  canSubmit?: (record: OaHrFlowItem) => boolean;
  /** 是否允许撤回（默认审批中可撤回） */
  canCancel?: (record: OaHrFlowItem) => boolean;
  /** 追加操作按钮（如访客签到/签退） */
  extraActions?: (record: OaHrFlowItem, reload: () => void) => React.ReactNode;
}

const defaultCanSubmit = (record: OaHrFlowItem) =>
  ['DRAFT', 'REJECTED', 'CANCELLED'].includes(record.flowStatus || '');
const defaultCanCancel = (record: OaHrFlowItem) => record.flowStatus === 'RUNNING';

/** 人事流程单通用列表：搜索 + 表格 + 新增/编辑表单 + 详情，并提供提交/撤回/删除。 */
function HrFlowTab<P, V extends HrSubmitValue>({
  title,
  service,
  columns,
  detailFields,
  renderFields,
  buildEditValues,
  buildPayload,
  initialValues,
  formWidth = 720,
  loadVehicles = false,
  canSubmit = defaultCanSubmit,
  canCancel = defaultCanCancel,
  extraActions,
}: HrFlowTabProps<P, V>) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<V>();

  const [data, setData] = useState<OaHrFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ keyword?: string; flowStatus?: string }>({});
  const [vehicles, setVehicles] = useState<OaHrVehicleItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaHrFlowItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OaHrFlowItem | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaHrFlowQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          flowStatus: cond.flowStatus || undefined,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search, service],
  );

  const loadVehicleOptions = useCallback(async () => {
    const list = await oaHrVehicleService.listAll();
    setVehicles(list || []);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, {});
    if (loadVehicles) {
      void loadVehicleOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: { keyword?: string; flowStatus?: string }) => {
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
    form.setFieldsValue(
      { ...initialValues, submit: false } as unknown as Parameters<FormInstance<V>['setFieldsValue']>[0],
    );
    setModalOpen(true);
  };

  const openEdit = (record: OaHrFlowItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue(
      { ...buildEditValues(record), submit: false } as unknown as Parameters<
        FormInstance<V>['setFieldsValue']
      >[0],
    );
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = buildPayload(values);
    setSubmitting(true);
    try {
      if (editing) {
        await service.update(editing.id, payload);
        message.success('保存成功');
      } else {
        await service.create(payload);
        message.success('保存成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  /** 提交：以 submit=true 走更新接口，由后端按配置决定是否发起审批。 */
  const handleSubmitRecord = async (record: OaHrFlowItem) => {
    const values = { ...buildEditValues(record), submit: true } as V;
    await service.update(record.id, buildPayload(values));
    message.success('已提交');
    void loadData();
  };

  const handleCancel = async (record: OaHrFlowItem) => {
    if (!service.cancel) return;
    await service.cancel(record.id);
    message.success('已撤回');
    void loadData();
  };

  const handleDelete = async (record: OaHrFlowItem) => {
    await service.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const openDetail = async (record: OaHrFlowItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await service.detail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const actionColumns: ColumnsType<OaHrFlowItem> = [
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:hr:list') && (
            <Button type="link" size="small" onClick={() => void openDetail(record)}>
              详情
            </Button>
          )}
          {hasPermission('oa:hr:apply') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:hr:apply') && canSubmit(record) && (
            <Button type="link" size="small" onClick={() => void handleSubmitRecord(record)}>
              提交
            </Button>
          )}
          {hasPermission('oa:hr:apply') && service.cancel && canCancel(record) && (
            <Popconfirm title="确认撤回该申请？" onConfirm={() => void handleCancel(record)}>
              <Button type="link" size="small">
                撤回
              </Button>
            </Popconfirm>
          )}
          {hasPermission('oa:hr:apply') && extraActions?.(record, () => void loadData())}
          {hasPermission('oa:hr:apply') && (
            <Popconfirm title="确认删除该申请？" onConfirm={() => void handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="flowStatus" label="流程状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={[...OA_HR_FLOW_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="单号 / 申请人" allowClear style={{ width: 180 }} />
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
        title={`${title}列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:hr:apply') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增{title}
            </Button>
          )
        }
      >
        <Table<OaHrFlowItem>
          rowKey="id"
          loading={loading}
          columns={[...columns, ...actionColumns]}
          dataSource={data}
          scroll={{ x: 1500 }}
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
        title={editing ? `编辑${title}` : `新增${title}`}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={formWidth}
      >
        <Form form={form} layout="vertical" preserve={false}>
          {renderFields(form, editing, vehicles)}
          <Form.Item name="submit" label=" " colon={false} valuePropName="checked">
            <Checkbox>保存并提交</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${title}详情`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={720}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          {detail ? (
            <Descriptions column={2} bordered size="small">
              {detailFields.map((field) => {
                const raw = (detail as unknown as Record<string, unknown>)[field.key];
                return (
                  <Descriptions.Item key={field.key} label={field.label}>
                    {field.render ? field.render(raw, detail) : plain(raw)}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          ) : null}
        </Spin>
      </Modal>
    </Space>
  );
}

/* ---------------- 1. 请假申请 ---------------- */

interface LeaveFormValues extends HrSubmitValue {
  leaveType?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  leaveDays?: number;
  reason?: string;
  remark?: string;
}

function LeaveTab() {
  const columns: ColumnsType<OaHrFlowItem> = [
    { title: '请假单号', dataIndex: 'leaveNo', width: 150, fixed: 'left', render: plain },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: plain },
    {
      title: '请假类型',
      dataIndex: 'leaveType',
      width: 110,
      render: (v) => enumLabel(OA_HR_LEAVE_TYPE_LABEL, v),
    },
    { title: '开始时间', dataIndex: 'startTime', width: 160, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 160, render: formatDateTime },
    { title: '请假天数', dataIndex: 'leaveDays', width: 100, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: flowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <HrFlowTab<OaHrLeaveSaveParams, LeaveFormValues>
      title="请假申请"
      service={oaHrLeaveService}
      columns={columns}
      initialValues={{ leaveType: 'PERSONAL' }}
      detailFields={[
        { label: '请假单号', key: 'leaveNo' },
        { label: '申请人', key: 'applicantName' },
        { label: '请假类型', key: 'leaveType', render: (v) => enumLabel(OA_HR_LEAVE_TYPE_LABEL, v) },
        { label: '开始时间', key: 'startTime', render: (v) => formatDateTime(v) },
        { label: '结束时间', key: 'endTime', render: (v) => formatDateTime(v) },
        { label: '请假天数', key: 'leaveDays' },
        { label: '流程状态', key: 'flowStatus', render: (v) => flowStatusTag(v) },
        { label: '请假事由', key: 'reason' },
        { label: '备注', key: 'remark' },
        { label: '创建时间', key: 'createdAt', render: (v) => formatDateTime(v) },
      ]}
      renderFields={() => (
        <>
          <Form.Item
            name="leaveType"
            label="请假类型"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select placeholder="请选择" options={[...OA_HR_LEAVE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="leaveDays" label="请假天数">
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="请输入请假天数" />
          </Form.Item>
          <Form.Item name="reason" label="请假事由">
            <Input.TextArea rows={2} placeholder="请输入请假事由" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        leaveType: r.leaveType,
        startTime: r.startTime ? dayjs(r.startTime) : undefined,
        endTime: r.endTime ? dayjs(r.endTime) : undefined,
        leaveDays: r.leaveDays,
        reason: r.reason,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        leaveType: v.leaveType,
        startTime: v.startTime ? v.startTime.format(DATE_TIME_SECOND_FORMAT) : undefined,
        endTime: v.endTime ? v.endTime.format(DATE_TIME_SECOND_FORMAT) : undefined,
        leaveDays: v.leaveDays,
        reason: v.reason,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 2. 加班申请 ---------------- */

interface OvertimeFormValues extends HrSubmitValue {
  overtimeType?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  overtimeHours?: number;
  compensateType?: string;
  reason?: string;
  remark?: string;
}

function OvertimeTab() {
  const columns: ColumnsType<OaHrFlowItem> = [
    { title: '加班单号', dataIndex: 'overtimeNo', width: 150, fixed: 'left', render: plain },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: plain },
    {
      title: '加班类型',
      dataIndex: 'overtimeType',
      width: 120,
      render: (v) => enumLabel(OA_HR_OVERTIME_TYPE_LABEL, v),
    },
    {
      title: '补偿方式',
      dataIndex: 'compensateType',
      width: 110,
      render: (v) => enumLabel(OA_HR_COMPENSATE_TYPE_LABEL, v),
    },
    { title: '开始时间', dataIndex: 'startTime', width: 160, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 160, render: formatDateTime },
    { title: '加班时长', dataIndex: 'overtimeHours', width: 100, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: flowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <HrFlowTab<OaHrOvertimeSaveParams, OvertimeFormValues>
      title="加班申请"
      service={oaHrOvertimeService}
      columns={columns}
      initialValues={{ overtimeType: 'WORKDAY', compensateType: 'COMPENSATORY' }}
      detailFields={[
        { label: '加班单号', key: 'overtimeNo' },
        { label: '申请人', key: 'applicantName' },
        {
          label: '加班类型',
          key: 'overtimeType',
          render: (v) => enumLabel(OA_HR_OVERTIME_TYPE_LABEL, v),
        },
        {
          label: '补偿方式',
          key: 'compensateType',
          render: (v) => enumLabel(OA_HR_COMPENSATE_TYPE_LABEL, v),
        },
        { label: '开始时间', key: 'startTime', render: (v) => formatDateTime(v) },
        { label: '结束时间', key: 'endTime', render: (v) => formatDateTime(v) },
        { label: '加班时长', key: 'overtimeHours' },
        { label: '流程状态', key: 'flowStatus', render: (v) => flowStatusTag(v) },
        { label: '加班事由', key: 'reason' },
        { label: '备注', key: 'remark' },
        { label: '创建时间', key: 'createdAt', render: (v) => formatDateTime(v) },
      ]}
      renderFields={() => (
        <>
          <Form.Item
            name="overtimeType"
            label="加班类型"
            rules={[{ required: true, message: '请选择加班类型' }]}
          >
            <Select placeholder="请选择" options={[...OA_HR_OVERTIME_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="overtimeHours" label="加班时长（小时）">
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="请输入加班时长" />
          </Form.Item>
          <Form.Item name="compensateType" label="补偿方式">
            <Select placeholder="请选择" options={[...OA_HR_COMPENSATE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reason" label="加班事由">
            <Input.TextArea rows={2} placeholder="请输入加班事由" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        overtimeType: r.overtimeType,
        startTime: r.startTime ? dayjs(r.startTime) : undefined,
        endTime: r.endTime ? dayjs(r.endTime) : undefined,
        overtimeHours: r.overtimeHours,
        compensateType: r.compensateType,
        reason: r.reason,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        overtimeType: v.overtimeType,
        startTime: v.startTime ? v.startTime.format(DATE_TIME_SECOND_FORMAT) : undefined,
        endTime: v.endTime ? v.endTime.format(DATE_TIME_SECOND_FORMAT) : undefined,
        overtimeHours: v.overtimeHours,
        compensateType: v.compensateType,
        reason: v.reason,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 3. 离职申请 ---------------- */

interface ResignationFormValues extends HrSubmitValue {
  lastWorkDate?: Dayjs;
  resignationType?: string;
  reason?: string;
  handoverUserId?: number;
  handoverJson?: string;
  accountDisableFlag?: number;
  remark?: string;
}

function ResignationTab() {
  const columns: ColumnsType<OaHrFlowItem> = [
    { title: '离职单号', dataIndex: 'resignationNo', width: 150, fixed: 'left', render: plain },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: plain },
    { title: '岗位', dataIndex: 'positionName', width: 140, render: plain },
    { title: '最后工作日', dataIndex: 'lastWorkDate', width: 120, render: plain },
    {
      title: '离职类型',
      dataIndex: 'resignationType',
      width: 110,
      render: (v) => enumLabel(OA_HR_RESIGNATION_TYPE_LABEL, v),
    },
    { title: '交接人', dataIndex: 'handoverUserName', width: 120, render: plain },
    { title: '是否停用账号', dataIndex: 'accountDisableFlag', width: 120, render: yesNoLabel },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: flowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <HrFlowTab<OaHrResignationSaveParams, ResignationFormValues>
      title="离职申请"
      service={oaHrResignationService}
      columns={columns}
      initialValues={{ resignationType: 'VOLUNTARY', accountDisableFlag: 0 }}
      detailFields={[
        { label: '离职单号', key: 'resignationNo' },
        { label: '申请人', key: 'applicantName' },
        { label: '岗位', key: 'positionName' },
        { label: '最后工作日', key: 'lastWorkDate' },
        {
          label: '离职类型',
          key: 'resignationType',
          render: (v) => enumLabel(OA_HR_RESIGNATION_TYPE_LABEL, v),
        },
        { label: '交接人', key: 'handoverUserName' },
        { label: '是否停用账号', key: 'accountDisableFlag', render: (v) => yesNoLabel(v) },
        { label: '交接说明', key: 'handoverJson' },
        { label: '离职原因', key: 'reason' },
        { label: '流程状态', key: 'flowStatus', render: (v) => flowStatusTag(v) },
        { label: '备注', key: 'remark' },
        { label: '创建时间', key: 'createdAt', render: (v) => formatDateTime(v) },
      ]}
      renderFields={(_form, editing) => (
        <>
          <Form.Item
            name="lastWorkDate"
            label="最后工作日"
            rules={[{ required: true, message: '请选择最后工作日' }]}
          >
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item
            name="resignationType"
            label="离职类型"
            rules={[{ required: true, message: '请选择离职类型' }]}
          >
            <Select placeholder="请选择" options={[...OA_HR_RESIGNATION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reason" label="离职原因">
            <Input.TextArea rows={2} placeholder="请输入离职原因" />
          </Form.Item>
          <Form.Item name="handoverUserId" label="交接人">
            <UserSelect
              style={{ width: '100%' }}
              fallbackLabel={editing?.handoverUserName}
            />
          </Form.Item>
          <Form.Item name="handoverJson" label="交接说明" extra="可填写待交接事项清单（文本）">
            <Input.TextArea rows={2} placeholder="请输入交接事项" />
          </Form.Item>
          <Form.Item name="accountDisableFlag" label="是否停用账号">
            <Radio.Group options={OA_YES_NO_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        lastWorkDate: r.lastWorkDate ? dayjs(r.lastWorkDate) : undefined,
        resignationType: r.resignationType,
        reason: r.reason,
        handoverUserId: r.handoverUserId,
        handoverJson: r.handoverJson,
        accountDisableFlag: r.accountDisableFlag,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        lastWorkDate: v.lastWorkDate ? v.lastWorkDate.format(DATE_FORMAT) : undefined,
        resignationType: v.resignationType,
        reason: v.reason,
        handoverUserId: v.handoverUserId,
        handoverJson: v.handoverJson,
        accountDisableFlag: v.accountDisableFlag,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 4. 访客申请 ---------------- */

interface VisitorFormValues extends HrSubmitValue {
  visitorName?: string;
  visitorCompany?: string;
  visitorPhone?: string;
  visitorCount?: number;
  visitReason?: string;
  visitArea?: string;
  visitStart?: Dayjs;
  visitEnd?: Dayjs;
  hostUserId?: number;
  vehicleNo?: string;
  remark?: string;
}

function VisitorTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const handleCheckin = async (id: number, reload: () => void) => {
    await oaHrVisitorService.checkin(id);
    message.success('签到成功');
    reload();
  };
  const handleCheckout = async (id: number, reload: () => void) => {
    await oaHrVisitorService.checkout(id);
    message.success('签退成功');
    reload();
  };

  const columns: ColumnsType<OaHrFlowItem> = [
    { title: '访客单号', dataIndex: 'visitorNo', width: 150, fixed: 'left', render: plain },
    { title: '访客姓名', dataIndex: 'visitorName', width: 120, render: plain },
    { title: '公司', dataIndex: 'visitorCompany', width: 160, render: plain },
    { title: '电话', dataIndex: 'visitorPhone', width: 130, render: plain },
    { title: '人数', dataIndex: 'visitorCount', width: 80, render: plain },
    { title: '来访事由', dataIndex: 'visitReason', width: 180, render: plain },
    { title: '来访区域', dataIndex: 'visitArea', width: 140, render: plain },
    {
      title: '来访起止',
      key: 'visitRange',
      width: 300,
      render: (_, record) => `${formatDateTime(record.visitStart)} ~ ${formatDateTime(record.visitEnd)}`,
    },
    { title: '接待人', dataIndex: 'hostName', width: 120, render: plain },
    { title: '状态', dataIndex: 'flowStatus', width: 110, render: visitorStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <HrFlowTab<OaHrVisitorSaveParams, VisitorFormValues>
      title="访客申请"
      service={oaHrVisitorService}
      columns={columns}
      initialValues={{ visitorCount: 1 }}
      canCancel={(record) => record.flowStatus === 'APPLIED'}
      extraActions={(record, reload) => (
        <>
          {hasPermission('oa:hr:apply') && record.flowStatus === 'APPROVED' && (
            <Popconfirm title="确认访客已到场签到？" onConfirm={() => void handleCheckin(record.id, reload)}>
              <Button type="link" size="small">
                签到
              </Button>
            </Popconfirm>
          )}
          {hasPermission('oa:hr:apply') && record.flowStatus === 'CHECKED_IN' && (
            <Popconfirm title="确认访客已离开签退？" onConfirm={() => void handleCheckout(record.id, reload)}>
              <Button type="link" size="small">
                签退
              </Button>
            </Popconfirm>
          )}
        </>
      )}
      detailFields={[
        { label: '访客单号', key: 'visitorNo' },
        { label: '访客姓名', key: 'visitorName' },
        { label: '公司', key: 'visitorCompany' },
        { label: '电话', key: 'visitorPhone' },
        { label: '人数', key: 'visitorCount' },
        { label: '来访事由', key: 'visitReason' },
        { label: '来访区域', key: 'visitArea' },
        { label: '来访开始', key: 'visitStart', render: (v) => formatDateTime(v) },
        { label: '来访结束', key: 'visitEnd', render: (v) => formatDateTime(v) },
        { label: '接待人', key: 'hostName' },
        { label: '车牌号', key: 'vehicleNo' },
        { label: '状态', key: 'flowStatus', render: (v) => visitorStatusTag(v) },
        { label: '签到时间', key: 'checkinAt', render: (v) => formatDateTime(v) },
        { label: '签退时间', key: 'checkoutAt', render: (v) => formatDateTime(v) },
        { label: '备注', key: 'remark' },
      ]}
      renderFields={(_form, editing) => (
        <>
          <Form.Item
            name="visitorName"
            label="访客姓名"
            rules={[{ required: true, message: '请输入访客姓名' }]}
          >
            <Input placeholder="请输入访客姓名" />
          </Form.Item>
          <Form.Item name="visitorCompany" label="来访公司">
            <Input placeholder="请输入来访公司" />
          </Form.Item>
          <Form.Item name="visitorPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="visitorCount" label="来访人数">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入来访人数" />
          </Form.Item>
          <Form.Item name="visitReason" label="来访事由">
            <Input.TextArea rows={2} placeholder="请输入来访事由" />
          </Form.Item>
          <Form.Item name="visitArea" label="来访区域">
            <Input placeholder="请输入来访区域，如 3 楼会议室" />
          </Form.Item>
          <Form.Item
            name="visitStart"
            label="来访开始"
            rules={[{ required: true, message: '请选择来访开始时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="visitEnd"
            label="来访结束"
            rules={[{ required: true, message: '请选择来访结束时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hostUserId" label="接待人">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.hostName} />
          </Form.Item>
          <Form.Item name="vehicleNo" label="车牌号">
            <Input placeholder="请输入来访车辆车牌号" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        visitorName: r.visitorName,
        visitorCompany: r.visitorCompany,
        visitorPhone: r.visitorPhone,
        visitorCount: r.visitorCount,
        visitReason: r.visitReason,
        visitArea: r.visitArea,
        visitStart: r.visitStart ? dayjs(r.visitStart) : undefined,
        visitEnd: r.visitEnd ? dayjs(r.visitEnd) : undefined,
        hostUserId: r.hostUserId,
        vehicleNo: r.vehicleNo,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        visitorName: v.visitorName,
        visitorCompany: v.visitorCompany,
        visitorPhone: v.visitorPhone,
        visitorCount: v.visitorCount,
        visitReason: v.visitReason,
        visitArea: v.visitArea,
        visitStart: v.visitStart ? v.visitStart.format(DATE_TIME_SECOND_FORMAT) : undefined,
        visitEnd: v.visitEnd ? v.visitEnd.format(DATE_TIME_SECOND_FORMAT) : undefined,
        hostUserId: v.hostUserId,
        vehicleNo: v.vehicleNo,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 5. 考勤异常 ---------------- */

interface AttExceptionFormValues extends HrSubmitValue {
  exceptionType?: string;
  exceptionDate?: Dayjs;
  exceptionDesc?: string;
  applyReason?: string;
  remark?: string;
}

function AttExceptionTab() {
  const columns: ColumnsType<OaHrFlowItem> = [
    { title: '异常单号', dataIndex: 'exceptionNo', width: 150, fixed: 'left', render: plain },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: plain },
    {
      title: '异常类型',
      dataIndex: 'exceptionType',
      width: 110,
      render: (v) => enumLabel(OA_HR_ATT_EXCEPTION_TYPE_LABEL, v),
    },
    { title: '异常日期', dataIndex: 'exceptionDate', width: 120, render: plain },
    { title: '异常说明', dataIndex: 'exceptionDesc', width: 220, render: plain },
    { title: '处理结果', dataIndex: 'handleResult', width: 200, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: flowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <HrFlowTab<OaHrAttExceptionSaveParams, AttExceptionFormValues>
      title="考勤异常"
      service={oaHrAttExceptionService}
      columns={columns}
      initialValues={{ exceptionType: 'LATE' }}
      detailFields={[
        { label: '异常单号', key: 'exceptionNo' },
        { label: '申请人', key: 'applicantName' },
        {
          label: '异常类型',
          key: 'exceptionType',
          render: (v) => enumLabel(OA_HR_ATT_EXCEPTION_TYPE_LABEL, v),
        },
        { label: '异常日期', key: 'exceptionDate' },
        { label: '异常说明', key: 'exceptionDesc' },
        { label: '申请理由', key: 'applyReason' },
        { label: '处理结果', key: 'handleResult' },
        { label: '流程状态', key: 'flowStatus', render: (v) => flowStatusTag(v) },
        { label: '备注', key: 'remark' },
        { label: '创建时间', key: 'createdAt', render: (v) => formatDateTime(v) },
      ]}
      renderFields={() => (
        <>
          <Typography.Text type="secondary">
            本模块仅登记考勤异常处理申请，不修改或替代权威考勤源的原始打卡数据。
          </Typography.Text>
          <Form.Item
            name="exceptionType"
            label="异常类型"
            rules={[{ required: true, message: '请选择异常类型' }]}
            style={{ marginTop: 12 }}
          >
            <Select placeholder="请选择" options={[...OA_HR_ATT_EXCEPTION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="exceptionDate"
            label="异常日期"
            rules={[{ required: true, message: '请选择异常日期' }]}
          >
            <DatePicker style={{ width: '100%' }} format={DATE_FORMAT} />
          </Form.Item>
          <Form.Item name="exceptionDesc" label="异常说明">
            <Input.TextArea rows={2} placeholder="请描述考勤异常情况" />
          </Form.Item>
          <Form.Item name="applyReason" label="申请理由">
            <Input.TextArea rows={2} placeholder="请输入申请理由" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        exceptionType: r.exceptionType,
        exceptionDate: r.exceptionDate ? dayjs(r.exceptionDate) : undefined,
        exceptionDesc: r.exceptionDesc,
        applyReason: r.applyReason,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        exceptionType: v.exceptionType,
        exceptionDate: v.exceptionDate ? v.exceptionDate.format(DATE_FORMAT) : undefined,
        exceptionDesc: v.exceptionDesc,
        applyReason: v.applyReason,
        remark: v.remark,
        submit: v.submit,
      })}
    />
  );
}

/* ---------------- 6. 用车申请 ---------------- */

interface VehicleApplyFormValues extends HrSubmitValue {
  vehicleId?: number;
  plateNo?: string;
  driverUserId?: number;
  startTime?: Dayjs;
  endTime?: Dayjs;
  destination?: string;
  purpose?: string;
  passengerCount?: number;
  mileage?: number;
  costAmount?: number;
  remark?: string;
}

function VehicleApplyTab() {
  const columns: ColumnsType<OaHrFlowItem> = [
    { title: '申请单号', dataIndex: 'applyNo', width: 150, fixed: 'left', render: plain },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: plain },
    { title: '车牌号', dataIndex: 'plateNo', width: 130, render: plain },
    { title: '驾驶员', dataIndex: 'driverName', width: 120, render: plain },
    {
      title: '用车起止',
      key: 'useRange',
      width: 300,
      render: (_, record) => `${formatDateTime(record.startTime)} ~ ${formatDateTime(record.endTime)}`,
    },
    { title: '目的地', dataIndex: 'destination', width: 160, render: plain },
    { title: '用车事由', dataIndex: 'purpose', width: 180, render: plain },
    { title: '人数', dataIndex: 'passengerCount', width: 80, render: plain },
    { title: '流程状态', dataIndex: 'flowStatus', width: 110, render: flowStatusTag },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
  ];

  return (
    <HrFlowTab<OaHrVehicleApplySaveParams, VehicleApplyFormValues>
      title="用车申请"
      service={oaHrVehicleApplyService}
      columns={columns}
      loadVehicles
      detailFields={[
        { label: '申请单号', key: 'applyNo' },
        { label: '申请人', key: 'applicantName' },
        { label: '车牌号', key: 'plateNo' },
        { label: '驾驶员', key: 'driverName' },
        { label: '用车开始', key: 'startTime', render: (v) => formatDateTime(v) },
        { label: '用车结束', key: 'endTime', render: (v) => formatDateTime(v) },
        { label: '目的地', key: 'destination' },
        { label: '用车事由', key: 'purpose' },
        { label: '乘车人数', key: 'passengerCount' },
        { label: '预估里程', key: 'mileage' },
        { label: '预估费用', key: 'costAmount' },
        { label: '流程状态', key: 'flowStatus', render: (v) => flowStatusTag(v) },
        { label: '备注', key: 'remark' },
        { label: '创建时间', key: 'createdAt', render: (v) => formatDateTime(v) },
      ]}
      renderFields={(form, editing, vehicles) => (
        <>
          <Form.Item
            name="vehicleId"
            label="车辆"
            rules={[{ required: true, message: '请选择车辆' }]}
          >
            <Select
              placeholder="请选择车辆"
              showSearch
              optionFilterProp="label"
              options={vehicles.map((v) => ({
                value: v.id,
                label: v.brandModel ? `${v.plateNo}（${v.brandModel}）` : v.plateNo,
              }))}
              onChange={(id?: number) => {
                const target = vehicles.find((v) => v.id === id);
                form.setFieldsValue({ plateNo: target?.plateNo });
              }}
            />
          </Form.Item>
          <Form.Item name="plateNo" label="车牌号" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="driverUserId" label="驾驶员">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.driverName} />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="用车开始"
            rules={[{ required: true, message: '请选择用车开始时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="用车结束"
            rules={[{ required: true, message: '请选择用车结束时间' }]}
          >
            <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="destination" label="目的地">
            <Input placeholder="请输入目的地" />
          </Form.Item>
          <Form.Item name="purpose" label="用车事由">
            <Input.TextArea rows={2} placeholder="请输入用车事由" />
          </Form.Item>
          <Form.Item name="passengerCount" label="乘车人数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入乘车人数" />
          </Form.Item>
          <Form.Item name="mileage" label="预估里程（公里）">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预估里程" />
          </Form.Item>
          <Form.Item name="costAmount" label="预估费用（元）">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预估费用" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        vehicleId: r.vehicleId,
        plateNo: r.plateNo,
        driverUserId: r.driverUserId,
        startTime: r.startTime ? dayjs(r.startTime) : undefined,
        endTime: r.endTime ? dayjs(r.endTime) : undefined,
        destination: r.destination,
        purpose: r.purpose,
        passengerCount: r.passengerCount,
        mileage: r.mileage,
        costAmount: r.costAmount,
        remark: r.remark,
      })}
      buildPayload={(v) => {
        const payload: OaHrVehicleApplySaveParams & { plateNo?: string } = {
          vehicleId: v.vehicleId,
          driverUserId: v.driverUserId,
          startTime: v.startTime ? v.startTime.format(DATE_TIME_SECOND_FORMAT) : undefined,
          endTime: v.endTime ? v.endTime.format(DATE_TIME_SECOND_FORMAT) : undefined,
          destination: v.destination,
          purpose: v.purpose,
          passengerCount: v.passengerCount,
          mileage: v.mileage,
          costAmount: v.costAmount,
          remark: v.remark,
          submit: v.submit,
          plateNo: v.plateNo,
        };
        return payload;
      }}
    />
  );
}

/* ---------------- 7. 车辆档案 ---------------- */

interface VehicleFormValues {
  vehicleCode: string;
  plateNo: string;
  vehicleType?: string;
  brandModel?: string;
  seatCount?: number;
  driverUserId?: number;
  vehicleStatus?: string;
  remark?: string;
}

function VehicleTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<VehicleFormValues>();

  const [data, setData] = useState<OaHrVehicleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ keyword?: string; vehicleStatus?: string }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaHrVehicleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaHrVehicleQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          vehicleStatus: cond.vehicleStatus || undefined,
        };
        const res = await oaHrVehicleService.page(params);
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

  const onSearch = (values: { keyword?: string; vehicleStatus?: string }) => {
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
    form.setFieldsValue({ vehicleStatus: 'IDLE' });
    setModalOpen(true);
  };

  const openEdit = (record: OaHrVehicleItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaHrVehicleSaveParams = { ...values };
    setSubmitting(true);
    try {
      if (editing) {
        await oaHrVehicleService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaHrVehicleService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaHrVehicleItem) => {
    await oaHrVehicleService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<OaHrVehicleItem> = [
    { title: '车辆编码', dataIndex: 'vehicleCode', width: 130, fixed: 'left', render: plain },
    { title: '车牌号', dataIndex: 'plateNo', width: 130, render: plain },
    {
      title: '车辆类型',
      dataIndex: 'vehicleType',
      width: 110,
      render: (v) => enumLabel(OA_HR_VEHICLE_TYPE_LABEL, v),
    },
    { title: '品牌型号', dataIndex: 'brandModel', width: 150, render: plain },
    { title: '座位数', dataIndex: 'seatCount', width: 90, render: plain },
    { title: '驾驶员', dataIndex: 'driverName', width: 120, render: plain },
    { title: '车辆状态', dataIndex: 'vehicleStatus', width: 110, render: vehicleStatusTag },
    { title: '备注', dataIndex: 'remark', width: 200, render: plain },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:hr:vehicle:manage') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('oa:hr:vehicle:manage') && (
            <Popconfirm title="确认删除该车辆档案？" onConfirm={() => void handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="车辆">
            <Input placeholder="车辆编码 / 车牌号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="vehicleStatus" label="车辆状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={[...OA_HR_VEHICLE_STATUS_OPTIONS]}
            />
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
        title={`车辆档案列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:hr:vehicle:manage') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增车辆
            </Button>
          )
        }
      >
        <Table<OaHrVehicleItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title={editing ? '编辑车辆档案' : '新增车辆档案'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="vehicleCode"
            label="车辆编码"
            rules={[{ required: true, message: '请输入车辆编码' }]}
          >
            <Input placeholder="请输入车辆编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="plateNo"
            label="车牌号"
            rules={[{ required: true, message: '请输入车牌号' }]}
          >
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="vehicleType" label="车辆类型">
            <Select placeholder="请选择" options={[...OA_HR_VEHICLE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="brandModel" label="品牌型号">
            <Input placeholder="请输入品牌型号" />
          </Form.Item>
          <Form.Item name="seatCount" label="座位数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入座位数" />
          </Form.Item>
          <Form.Item name="driverUserId" label="默认驾驶员">
            <UserSelect style={{ width: '100%' }} fallbackLabel={editing?.driverName} />
          </Form.Item>
          <Form.Item name="vehicleStatus" label="车辆状态">
            <Select placeholder="请选择" options={[...OA_HR_VEHICLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function OaHrPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        行政人事
      </Title>

      <Tabs
        items={[
          { key: 'leave', label: '请假申请', children: <LeaveTab /> },
          { key: 'overtime', label: '加班申请', children: <OvertimeTab /> },
          { key: 'resignation', label: '离职申请', children: <ResignationTab /> },
          { key: 'visitor', label: '访客申请', children: <VisitorTab /> },
          { key: 'att-exception', label: '考勤异常', children: <AttExceptionTab /> },
          { key: 'vehicle-apply', label: '用车申请', children: <VehicleApplyTab /> },
          { key: 'vehicle-archive', label: '车辆档案', children: <VehicleTab /> },
        ]}
      />
    </Space>
  );
}
