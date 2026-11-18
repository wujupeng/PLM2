import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  message,
} from 'antd';
import type { FormInstance } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/authStore';
import type { PageResult } from '@/types/common';
import {
  OA_BIZ_FLOW_STATUS_COLOR,
  OA_BIZ_FLOW_STATUS_LABEL,
  OA_BIZ_FLOW_STATUS_OPTIONS,
  type OaBizFlowItem,
  type OaBizFlowQuery,
} from '@/types/oa';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const DATE_TIME_SECOND_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 日期展示。 */
export const formatDate = (v: unknown): string => (v ? dayjs(String(v)).format(DATE_FORMAT) : '-');

/** 日期时间展示。 */
export const formatDateTime = (v: unknown): string =>
  v ? dayjs(String(v)).format(DATE_TIME_FORMAT) : '-';

/** 普通文本展示。 */
export const plain = (v: unknown): string =>
  v === null || v === undefined || v === '' ? '-' : String(v);

/** 枚举中文展示。 */
export const enumLabel = (map: Record<string, string>, v: unknown): string => {
  const key = v === null || v === undefined ? '' : String(v);
  return key ? map[key] || key : '-';
};

/** 是否标志展示（1=是，0=否）。 */
export const yesNoLabel = (v: unknown): string =>
  v === null || v === undefined ? '-' : Number(v) === 1 ? '是' : '否';

/** OA-N7 流程状态标签。 */
export const bizFlowStatusTag = (v: unknown) => {
  const key = v === null || v === undefined ? '' : String(v);
  if (!key) return '-';
  return <Tag color={OA_BIZ_FLOW_STATUS_COLOR[key]}>{OA_BIZ_FLOW_STATUS_LABEL[key] || key}</Tag>;
};

/** 通用状态标签（自定义取值与颜色映射）。 */
export const bizStatusTag =
  (labelMap: Record<string, string>, colorMap?: Record<string, string>) => (v: unknown) => {
    const key = v === null || v === undefined ? '' : String(v);
    if (!key) return '-';
    return <Tag color={colorMap?.[key]}>{labelMap[key] || key}</Tag>;
  };

/** OA-N7 业务流程单 service 结构（各单据端点契约一致）。 */
export interface BizFlowService<P> {
  page: (params: OaBizFlowQuery) => Promise<PageResult<OaBizFlowItem>>;
  detail: (id: number) => Promise<OaBizFlowItem>;
  create: (data: P) => Promise<number>;
  update: (id: number, data: P) => Promise<void>;
  remove: (id: number) => Promise<void>;
  cancel?: (id: number) => Promise<void>;
}

/** 表单值统一携带「保存并提交」开关。 */
export interface BizSubmitValue {
  submit?: boolean;
}

export interface BizFlowDetailField {
  label: string;
  key: string;
  render?: (value: unknown, record: OaBizFlowItem) => React.ReactNode;
}

export interface BizFlowTabProps<P, V extends BizSubmitValue> {
  /** 单据名称，如「客户授信」 */
  title: string;
  service: BizFlowService<P>;
  columns: ColumnsType<OaBizFlowItem>;
  detailFields: BizFlowDetailField[];
  /** 表单字段：参数依次为表单实例、当前编辑记录 */
  renderFields: (form: FormInstance<V>, editing: OaBizFlowItem | null) => React.ReactNode;
  buildEditValues: (record: OaBizFlowItem) => V;
  /** 编辑时异步补充表单值（如加载子表明细） */
  loadEditExtras?: (record: OaBizFlowItem) => Promise<Partial<V>>;
  buildPayload: (values: V) => P;
  initialValues?: Partial<V>;
  formWidth?: number;
  /** 列表/搜索/详情权限码 */
  listPerm: string;
  /** 新增/编辑/提交/撤回/删除权限码 */
  applyPerm: string;
  /** 管理类操作（发布/关闭/确认等扩展按钮）权限码，缺省回退到 applyPerm */
  managePerm?: string;
  /** 无流程单据：不显示提交/撤回，扩展按钮由 managePerm 控制 */
  noFlow?: boolean;
  /** 搜索状态字段标签（默认「流程状态」） */
  statusLabel?: string;
  /** 搜索状态可选值（默认 OA-N7 流程状态） */
  statusOptions?: readonly { label: string; value: string }[];
  /** 是否允许提交（默认草稿/已驳回/已撤回可提交） */
  canSubmit?: (record: OaBizFlowItem) => boolean;
  /** 是否允许撤回（默认审批中可撤回） */
  canCancel?: (record: OaBizFlowItem) => boolean;
  /** 追加操作按钮（如发布/关闭/确认/签收） */
  extraActions?: (record: OaBizFlowItem, reload: () => void) => React.ReactNode;
  /** 追加列（在操作列之前展示） */
  extraColumns?: ColumnsType<OaBizFlowItem>;
}

const defaultCanSubmit = (record: OaBizFlowItem) =>
  ['DRAFT', 'REJECTED', 'CANCELLED'].includes(record.flowStatus || '');
const defaultCanCancel = (record: OaBizFlowItem) => record.flowStatus === 'RUNNING';

/** OA-N7 业务流程单通用列表：搜索 + 表格 + 新增/编辑表单 + 详情，并提供提交/撤回/删除。 */
export default function BizFlowTab<P, V extends BizSubmitValue>({
  title,
  service,
  columns,
  detailFields,
  renderFields,
  buildEditValues,
  loadEditExtras,
  buildPayload,
  initialValues,
  formWidth = 720,
  listPerm,
  applyPerm,
  managePerm,
  noFlow = false,
  statusLabel = '流程状态',
  statusOptions = OA_BIZ_FLOW_STATUS_OPTIONS,
  canSubmit = defaultCanSubmit,
  canCancel = defaultCanCancel,
  extraActions,
  extraColumns,
}: BizFlowTabProps<P, V>) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<V>();

  const [data, setData] = useState<OaBizFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ keyword?: string; flowStatus?: string }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaBizFlowItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OaBizFlowItem | null>(null);

  const extraPerm = managePerm || applyPerm;

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaBizFlowQuery = {
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

  useEffect(() => {
    void loadData(1, pageSize, {});
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

  const openEdit = async (record: OaBizFlowItem) => {
    setEditing(record);
    form.resetFields();
    let extra: Partial<V> | undefined;
    if (loadEditExtras) {
      try {
        extra = await loadEditExtras(record);
      } catch {
        extra = undefined;
      }
    }
    form.setFieldsValue(
      { ...buildEditValues(record), ...extra, submit: false } as unknown as Parameters<
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
  const handleSubmitRecord = async (record: OaBizFlowItem) => {
    const values = { ...buildEditValues(record), submit: true } as V;
    await service.update(record.id, buildPayload(values));
    message.success('已提交');
    void loadData();
  };

  const handleCancel = async (record: OaBizFlowItem) => {
    if (!service.cancel) return;
    await service.cancel(record.id);
    message.success('已撤回');
    void loadData();
  };

  const handleDelete = async (record: OaBizFlowItem) => {
    await service.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const openDetail = async (record: OaBizFlowItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await service.detail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const actionColumns: ColumnsType<OaBizFlowItem> = [
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission(listPerm) && (
            <Button type="link" size="small" onClick={() => void openDetail(record)}>
              详情
            </Button>
          )}
          {hasPermission(applyPerm) && (
            <Button type="link" size="small" onClick={() => void openEdit(record)}>
              编辑
            </Button>
          )}
          {!noFlow && hasPermission(applyPerm) && canSubmit(record) && (
            <Button type="link" size="small" onClick={() => void handleSubmitRecord(record)}>
              提交
            </Button>
          )}
          {!noFlow && service.cancel && hasPermission(applyPerm) && canCancel(record) && (
            <Popconfirm title="确认撤回该申请？" onConfirm={() => void handleCancel(record)}>
              <Button type="link" size="small">
                撤回
              </Button>
            </Popconfirm>
          )}
          {hasPermission(extraPerm) && extraActions?.(record, () => void loadData())}
          {hasPermission(applyPerm) && (
            <Popconfirm title="确认删除该单据？" onConfirm={() => void handleDelete(record)}>
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
          {statusOptions.length > 0 && (
            <Form.Item name="flowStatus" label={statusLabel}>
              <Select
                placeholder="请选择"
                allowClear
                style={{ width: 130 }}
                options={[...statusOptions]}
              />
            </Form.Item>
          )}
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="单号 / 名称" allowClear style={{ width: 180 }} />
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
          hasPermission(applyPerm) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增{title}
            </Button>
          )
        }
      >
        <Table<OaBizFlowItem>
          rowKey="id"
          loading={loading}
          columns={[...(extraColumns || []), ...columns, ...actionColumns]}
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
          {renderFields(form, editing)}
          {!noFlow && (
            <Form.Item name="submit" label=" " colon={false} valuePropName="checked">
              <Checkbox>保存并提交</Checkbox>
            </Form.Item>
          )}
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
