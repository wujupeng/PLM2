import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { wmsService } from '@/services/wmsService';
import {
  WMS_FIFO_BASIS_LABEL,
  WMS_FIFO_BASIS_OPTIONS,
  WMS_FIFO_SCOPE_LABEL,
  WMS_FIFO_SCOPE_OPTIONS,
  type WmsFifoRuleItem,
  type WmsFifoRuleQuery,
  type WmsFifoRuleSaveParams,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

const STATUS_LABEL: Record<number, string> = {
  1: '启用',
  0: '停用',
};

const STATUS_COLOR: Record<number, string> = {
  1: 'success',
  0: 'default',
};

const EXPIRY_CHECK_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

const ALLOW_EXCEPTION_OPTIONS = [
  { label: '允许例外', value: 1 },
  { label: '不允许', value: 0 },
];

interface SearchState {
  scope?: string;
  customerCode?: string;
  materialCode?: string;
  status?: number;
}

interface FifoRuleFormValues {
  ruleCode: string;
  ruleName?: string;
  scope?: string;
  customerCode?: string;
  materialCode?: string;
  fifoBasis?: string;
  expiryCheck?: number;
  expiryWarnDays?: number;
  allowException?: number;
  exceptionRole?: string;
  priority?: number;
  status?: number;
  remark?: string;
}

export default function WmsFifoPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FifoRuleFormValues>();

  const [data, setData] = useState<WmsFifoRuleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WmsFifoRuleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsFifoRuleQuery = {
          pageNum: page,
          pageSize: size,
          scope: cond.scope || undefined,
          customerCode: cond.customerCode || undefined,
          materialCode: cond.materialCode || undefined,
          status: cond.status,
        };
        const res = await wmsService.fifoRulePage(params);
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

  const onSearch = (values: SearchState) => {
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
    form.setFieldsValue({
      scope: 'GLOBAL',
      fifoBasis: 'INBOUND_DATE',
      expiryCheck: 0,
      allowException: 0,
      status: 1,
    });
    setModalOpen(true);
  };

  const openEdit = (record: WmsFifoRuleItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ruleCode: record.ruleCode,
      ruleName: record.ruleName,
      scope: record.scope,
      customerCode: record.customerCode,
      materialCode: record.materialCode,
      fifoBasis: record.fifoBasis,
      expiryCheck: record.expiryCheck,
      expiryWarnDays: record.expiryWarnDays,
      allowException: record.allowException,
      exceptionRole: record.exceptionRole,
      priority: record.priority,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsFifoRuleSaveParams = {
      ruleCode: values.ruleCode,
      ruleName: values.ruleName,
      scope: values.scope,
      customerCode: values.customerCode,
      materialCode: values.materialCode,
      fifoBasis: values.fifoBasis,
      expiryCheck: values.expiryCheck,
      expiryWarnDays: values.expiryWarnDays,
      allowException: values.allowException,
      exceptionRole: values.exceptionRole,
      priority: values.priority,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await wmsService.fifoRuleUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await wmsService.fifoRuleCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: WmsFifoRuleItem) => {
    await wmsService.fifoRuleRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<WmsFifoRuleItem> = [
    { title: '规则编码', dataIndex: 'ruleCode', width: 140, render: (v) => v || '-' },
    { title: '规则名称', dataIndex: 'ruleName', width: 160, render: (v) => v || '-' },
    {
      title: '作用域',
      dataIndex: 'scope',
      width: 100,
      render: (v?: string) => (v ? WMS_FIFO_SCOPE_LABEL[v] || v : '-'),
    },
    { title: '客户编码', dataIndex: 'customerCode', width: 120, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: (v) => v || '-' },
    {
      title: '判定依据',
      dataIndex: 'fifoBasis',
      width: 130,
      render: (v?: string) => (v ? WMS_FIFO_BASIS_LABEL[v] || v : '-'),
    },
    {
      title: '到期校验',
      dataIndex: 'expiryCheck',
      width: 100,
      render: (v?: number) => (v === 1 ? '是' : v === 0 ? '否' : '-'),
    },
    { title: '到期预警天数', dataIndex: 'expiryWarnDays', width: 120, render: (v) => (v ?? '-') },
    {
      title: '允许例外',
      dataIndex: 'allowException',
      width: 110,
      render: (v?: number) => (v === 1 ? '允许例外' : v === 0 ? '不允许' : '-'),
    },
    { title: '例外角色', dataIndex: 'exceptionRole', width: 130, render: (v) => v || '-' },
    { title: '优先级', dataIndex: 'priority', width: 90, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v?: number) =>
        v === undefined || v === null ? '-' : <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v] || v}</Tag>,
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
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('wms:fifo:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('wms:fifo:save') && (
            <Popconfirm title="确认删除该 FIFO 规则？" onConfirm={() => handleDelete(record)}>
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
      <Title level={4} style={{ margin: 0 }}>
        FIFO 规则
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="scope" label="作用域">
            <Select placeholder="请选择" allowClear style={{ width: 140 }} options={WMS_FIFO_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={STATUS_OPTIONS} />
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
        title={`FIFO 规则列表（共 ${total} 条）`}
        extra={
          hasPermission('wms:fifo:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增规则
            </Button>
          )
        }
      >
        <Table<WmsFifoRuleItem>
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
        title={editing ? '编辑 FIFO 规则' : '新增 FIFO 规则'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true, message: '请输入规则编码' }]}>
            <Input placeholder="请输入规则编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称">
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="scope" label="作用域">
            <Select placeholder="请选择" options={WMS_FIFO_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="fifoBasis" label="判定依据">
            <Select placeholder="请选择" options={WMS_FIFO_BASIS_OPTIONS} />
          </Form.Item>
          <Form.Item name="expiryCheck" label="到期校验">
            <Select placeholder="请选择" options={EXPIRY_CHECK_OPTIONS} />
          </Form.Item>
          <Form.Item name="expiryWarnDays" label="到期预警天数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入到期预警天数" />
          </Form.Item>
          <Form.Item name="allowException" label="允许例外">
            <Select placeholder="请选择" options={ALLOW_EXCEPTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="exceptionRole" label="例外角色">
            <Input placeholder="请输入例外角色" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入优先级" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
