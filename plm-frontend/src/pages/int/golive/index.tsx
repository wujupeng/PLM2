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
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { intService } from '@/services/intService';
import {
  INT_CUTOVER_STATUS_COLOR,
  INT_CUTOVER_STATUS_LABEL,
  INT_CUTOVER_STATUS_OPTIONS,
  INT_DELIVERY_CATEGORY_LABEL,
  INT_DELIVERY_CATEGORY_OPTIONS,
  INT_DELIVERY_STATUS_COLOR,
  INT_DELIVERY_STATUS_LABEL,
  INT_DELIVERY_STATUS_OPTIONS,
  type IntDeliveryItemModel,
  type IntDeliveryItemQuery,
  type IntDeliveryItemSaveParams,
  type IntGoliveRecordItem,
  type IntGoliveRecordQuery,
  type IntGoliveRecordSaveParams,
  type IntTrainingRecordItem,
  type IntTrainingRecordQuery,
  type IntTrainingRecordSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 培训记录 ================= */

interface TrainingFormValues {
  trainingNo?: string;
  roleCode: string;
  title?: string;
  trainer?: string;
  traineeCount?: number;
  passedCount?: number;
  trainedAt?: dayjs.Dayjs;
  materialUrl?: string;
  remark?: string;
}

interface TrainingSearchState {
  trainingNo?: string;
  roleCode?: string;
  trainer?: string;
}

function TrainingTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<TrainingFormValues>();

  const [data, setData] = useState<IntTrainingRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<TrainingSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntTrainingRecordItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntTrainingRecordQuery = {
          pageNum: page,
          pageSize: size,
          trainingNo: cond.trainingNo || undefined,
          roleCode: cond.roleCode || undefined,
          trainer: cond.trainer || undefined,
        };
        const res = await intService.trainingPage(params);
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

  const onSearch = (values: TrainingSearchState) => {
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

  const openEdit = (record: IntTrainingRecordItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      trainedAt: record.trainedAt ? dayjs(record.trainedAt) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntTrainingRecordSaveParams = {
      trainingNo: values.trainingNo,
      roleCode: values.roleCode,
      title: values.title,
      trainer: values.trainer,
      traineeCount: values.traineeCount,
      passedCount: values.passedCount,
      trainedAt: values.trainedAt ? values.trainedAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      materialUrl: values.materialUrl,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.trainingUpdate(editing.trainingNo, payload);
        message.success('更新成功');
      } else {
        await intService.trainingCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntTrainingRecordItem) => {
    await intService.trainingRemove(record.trainingNo);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<IntTrainingRecordItem> = [
    { title: '培训编号', dataIndex: 'trainingNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '角色编码', dataIndex: 'roleCode', width: 130, render: (v) => v || '-' },
    { title: '培训主题', dataIndex: 'title', width: 180, render: (v) => v || '-' },
    { title: '讲师', dataIndex: 'trainer', width: 110, render: (v) => v || '-' },
    { title: '参训人数', dataIndex: 'traineeCount', width: 100, render: (v) => (v ?? '-') },
    { title: '通过人数', dataIndex: 'passedCount', width: 100, render: (v) => (v ?? '-') },
    {
      title: '培训时间',
      dataIndex: 'trainedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '通过率',
      dataIndex: 'passRate',
      width: 110,
      render: (v?: number) => (v === null || v === undefined ? '-' : `${(v * 100).toFixed(1)}%`),
    },
    { title: '材料地址', dataIndex: 'materialUrl', width: 200, ellipsis: true, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:training:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:training:save') && (
            <Popconfirm title="确认删除该培训记录？" onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="trainingNo" label="培训编号">
            <Input placeholder="请输入培训编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="roleCode" label="角色编码">
            <Input placeholder="请输入角色编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="trainer" label="讲师">
            <Input placeholder="请输入讲师" allowClear style={{ width: 120 }} />
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
        title={`培训记录（共 ${total} 条）`}
        extra={
          hasPermission('int:training:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增培训
            </Button>
          )
        }
      >
        <Table<IntTrainingRecordItem>
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
        title={editing ? '编辑培训记录' : '新增培训记录'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="trainingNo" label="培训编号" extra="留空将自动生成">
            <Input placeholder="请输入培训编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="roleCode" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input placeholder="请输入角色编码" />
          </Form.Item>
          <Form.Item name="title" label="培训主题">
            <Input placeholder="请输入培训主题" />
          </Form.Item>
          <Form.Item name="trainer" label="讲师">
            <Input placeholder="请输入讲师" />
          </Form.Item>
          <Form.Item name="traineeCount" label="参训人数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入参训人数" />
          </Form.Item>
          <Form.Item name="passedCount" label="通过人数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入通过人数" />
          </Form.Item>
          <Form.Item name="trainedAt" label="培训时间">
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item name="materialUrl" label="材料地址">
            <Input placeholder="请输入培训材料地址" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 上线切换 ================= */

interface GoliveFormValues {
  goliveNo?: string;
  planName: string;
  scope?: string;
  plannedAt?: dayjs.Dayjs;
  rollbackPlan?: string;
  owner?: string;
  remark?: string;
}

interface GoliveExecuteFormValues {
  cutoverStatus: string;
  note?: string;
}

interface GoliveSearchState {
  goliveNo?: string;
  cutoverStatus?: string;
  owner?: string;
}

function GoliveTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GoliveFormValues>();
  const [executeForm] = Form.useForm<GoliveExecuteFormValues>();

  const [data, setData] = useState<IntGoliveRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<GoliveSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntGoliveRecordItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [executeOpen, setExecuteOpen] = useState(false);
  const [executeRecord, setExecuteRecord] = useState<IntGoliveRecordItem | null>(null);
  const [executing, setExecuting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntGoliveRecordQuery = {
          pageNum: page,
          pageSize: size,
          goliveNo: cond.goliveNo || undefined,
          cutoverStatus: cond.cutoverStatus || undefined,
          owner: cond.owner || undefined,
        };
        const res = await intService.golivePage(params);
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

  const onSearch = (values: GoliveSearchState) => {
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

  const openEdit = (record: IntGoliveRecordItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      plannedAt: record.plannedAt ? dayjs(record.plannedAt) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntGoliveRecordSaveParams = {
      goliveNo: values.goliveNo,
      planName: values.planName,
      scope: values.scope,
      plannedAt: values.plannedAt ? values.plannedAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      rollbackPlan: values.rollbackPlan,
      owner: values.owner,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.goliveUpdate(editing.goliveNo, payload);
        message.success('更新成功');
      } else {
        await intService.goliveCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntGoliveRecordItem) => {
    await intService.goliveRemove(record.goliveNo);
    message.success('删除成功');
    void loadData();
  };

  const openExecute = (record: IntGoliveRecordItem) => {
    setExecuteRecord(record);
    executeForm.resetFields();
    executeForm.setFieldsValue({ cutoverStatus: 'SUCCESS' });
    setExecuteOpen(true);
  };

  const handleExecute = async () => {
    const values = await executeForm.validateFields();
    if (!executeRecord) {
      return;
    }
    setExecuting(true);
    try {
      await intService.goliveExecute(executeRecord.goliveNo, values);
      message.success('执行切换成功');
      setExecuteOpen(false);
      void loadData();
    } finally {
      setExecuting(false);
    }
  };

  const columns: ColumnsType<IntGoliveRecordItem> = [
    { title: '上线编号', dataIndex: 'goliveNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '方案名称', dataIndex: 'planName', width: 180, render: (v) => v || '-' },
    { title: '切换范围', dataIndex: 'scope', width: 130, render: (v) => v || '-' },
    {
      title: '计划切换时间',
      dataIndex: 'plannedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '实际切换时间',
      dataIndex: 'actualAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '切换状态',
      dataIndex: 'cutoverStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_CUTOVER_STATUS_COLOR[v]}>{INT_CUTOVER_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '回退预案', dataIndex: 'rollbackPlan', width: 200, ellipsis: true, render: (v) => v || '-' },
    {
      title: '回退时间',
      dataIndex: 'rollbackAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '责任人', dataIndex: 'owner', width: 110, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:golive:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:golive:execute') && (
            <Button type="link" size="small" onClick={() => openExecute(record)}>
              执行切换
            </Button>
          )}
          {hasPermission('int:golive:save') && (
            <Popconfirm title="确认删除该上线记录？" onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="goliveNo" label="上线编号">
            <Input placeholder="请输入上线编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="cutoverStatus" label="切换状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={INT_CUTOVER_STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="owner" label="责任人">
            <Input placeholder="请输入责任人" allowClear style={{ width: 120 }} />
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
        title={`上线切换记录（共 ${total} 条）`}
        extra={
          hasPermission('int:golive:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增方案
            </Button>
          )
        }
      >
        <Table<IntGoliveRecordItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editing ? '编辑上线方案' : '新增上线方案'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="goliveNo" label="上线编号" extra="留空将自动生成">
            <Input placeholder="请输入上线编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="planName" label="方案名称" rules={[{ required: true, message: '请输入方案名称' }]}>
            <Input placeholder="请输入方案名称" />
          </Form.Item>
          <Form.Item name="scope" label="切换范围">
            <Input placeholder="请输入切换范围" />
          </Form.Item>
          <Form.Item name="plannedAt" label="计划切换时间">
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item name="rollbackPlan" label="回退预案">
            <Input.TextArea rows={3} placeholder="请输入回退预案" />
          </Form.Item>
          <Form.Item name="owner" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`执行切换${executeRecord?.goliveNo ? `：${executeRecord.goliveNo}` : ''}`}
        open={executeOpen}
        onOk={handleExecute}
        confirmLoading={executing}
        onCancel={() => setExecuteOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={executeForm} layout="vertical" preserve={false}>
          <Form.Item
            name="cutoverStatus"
            label="切换状态"
            rules={[{ required: true, message: '请选择切换状态' }]}
          >
            <Select placeholder="请选择" options={INT_CUTOVER_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={4} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ================= 交付物 ================= */

interface DeliveryFormValues {
  itemNo?: string;
  category: string;
  name: string;
  version?: string;
  filePath?: string;
  checksum?: string;
  remark?: string;
}

interface DeliverySearchState {
  itemNo?: string;
  category?: string;
  status?: string;
  name?: string;
}

function DeliveryTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DeliveryFormValues>();

  const [data, setData] = useState<IntDeliveryItemModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<DeliverySearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntDeliveryItemModel | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntDeliveryItemQuery = {
          pageNum: page,
          pageSize: size,
          itemNo: cond.itemNo || undefined,
          category: cond.category || undefined,
          status: cond.status || undefined,
          name: cond.name || undefined,
        };
        const res = await intService.deliveryPage(params);
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

  const onSearch = (values: DeliverySearchState) => {
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

  const openEdit = (record: IntDeliveryItemModel) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record, version: record.itemVersion });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntDeliveryItemSaveParams = {
      itemNo: values.itemNo,
      category: values.category,
      name: values.name,
      version: values.version,
      filePath: values.filePath,
      checksum: values.checksum,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.deliveryUpdate(editing.itemNo, payload);
        message.success('更新成功');
      } else {
        await intService.deliveryCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntDeliveryItemModel) => {
    await intService.deliveryRemove(record.itemNo);
    message.success('删除成功');
    void loadData();
  };

  const handleVerify = async (record: IntDeliveryItemModel) => {
    await intService.deliveryVerify(record.itemNo);
    message.success('验收成功');
    void loadData();
  };

  const columns: ColumnsType<IntDeliveryItemModel> = [
    { title: '交付物编号', dataIndex: 'itemNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    {
      title: '类别',
      dataIndex: 'category',
      width: 120,
      render: (v?: string) => (v ? INT_DELIVERY_CATEGORY_LABEL[v] || v : '-'),
    },
    { title: '名称', dataIndex: 'name', width: 180, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'itemVersion', width: 100, render: (v) => v || '-' },
    { title: '文件路径', dataIndex: 'filePath', width: 220, ellipsis: true, render: (v) => v || '-' },
    { title: '校验和', dataIndex: 'checksum', width: 200, ellipsis: true, render: (v) => v || '-' },
    {
      title: '交付时间',
      dataIndex: 'deliveredAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_DELIVERY_STATUS_COLOR[v]}>{INT_DELIVERY_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '验收人', dataIndex: 'verifier', width: 110, render: (v) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('int:delivery:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:delivery:verify') && (
            <Button type="link" size="small" onClick={() => void handleVerify(record)}>
              验收
            </Button>
          )}
          {hasPermission('int:delivery:save') && (
            <Popconfirm title="确认删除该交付物？" onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="itemNo" label="交付物编号">
            <Input placeholder="请输入交付物编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="category" label="类别">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={INT_DELIVERY_CATEGORY_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              options={INT_DELIVERY_STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="name" label="名称">
            <Input placeholder="请输入名称" allowClear style={{ width: 150 }} />
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
        title={`交付物列表（共 ${total} 条）`}
        extra={
          hasPermission('int:delivery:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增交付物
            </Button>
          )
        }
      >
        <Table<IntDeliveryItemModel>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1680 }}
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
        title={editing ? '编辑交付物' : '新增交付物'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="itemNo" label="交付物编号" extra="留空将自动生成">
            <Input placeholder="请输入交付物编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true, message: '请选择类别' }]}
          >
            <Select placeholder="请选择" options={INT_DELIVERY_CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="version" label="版本">
            <Input placeholder="请输入版本" />
          </Form.Item>
          <Form.Item name="filePath" label="文件路径">
            <Input placeholder="请输入文件路径" />
          </Form.Item>
          <Form.Item name="checksum" label="校验和">
            <Input placeholder="请输入校验和" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function IntGolivePage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        上线与交付
      </Title>
      <Tabs
        items={[
          { key: 'training', label: '培训记录', children: <TrainingTab /> },
          { key: 'golive', label: '上线切换', children: <GoliveTab /> },
          { key: 'delivery', label: '交付物', children: <DeliveryTab /> },
        ]}
      />
    </Space>
  );
}
