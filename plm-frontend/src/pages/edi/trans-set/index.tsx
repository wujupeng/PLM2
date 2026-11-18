import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
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
import { ediService } from '@/services/ediService';
import {
  EDI_DIRECTION_COLOR,
  EDI_DIRECTION_LABEL,
  EDI_DIRECTION_OPTIONS,
  EDI_ENABLED_COLOR,
  EDI_ENABLED_LABEL,
  EDI_ENABLED_OPTIONS,
  EDI_STANDARD_OPTIONS,
  EDI_TRANS_CODE_LABEL,
  EDI_TRANS_CODE_OPTIONS,
  type EdiTransactionSetItem,
  type EdiTransactionSetQuery,
  type EdiTransactionSetSaveParams,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 是否回执选项 */
const ACK_REQUIRED_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

interface EdiTransSetFormValues {
  partnerCode?: string;
  transCode: string;
  transName?: string;
  direction?: string;
  standard?: string;
  stdVersion?: string;
  headerSegTag?: string;
  lineSegTag?: string;
  ackTransCode?: string;
  ackRequired?: number;
  status?: string;
  description?: string;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  partnerCode?: string;
  transCode?: string;
  direction?: string;
  standard?: string;
  status?: string;
}

export default function EdiTransSetPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<EdiTransSetFormValues>();

  const [data, setData] = useState<EdiTransactionSetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EdiTransactionSetItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: EdiTransactionSetQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          partnerCode: cond.partnerCode || undefined,
          transCode: cond.transCode || undefined,
          direction: cond.direction || undefined,
          standard: cond.standard || undefined,
          status: cond.status || undefined,
        };
        const res = await ediService.transSetPage(params);
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
      partnerCode: '*',
      direction: 'INBOUND',
      standard: 'X12',
      ackRequired: 0,
      status: 'enabled',
    });
    setModalOpen(true);
  };

  const openEdit = (record: EdiTransactionSetItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      partnerCode: record.partnerCode,
      transCode: record.transCode,
      transName: record.transName,
      direction: record.direction,
      standard: record.standard,
      stdVersion: record.stdVersion,
      headerSegTag: record.headerSegTag,
      lineSegTag: record.lineSegTag,
      ackTransCode: record.ackTransCode,
      ackRequired: record.ackRequired,
      status: record.status,
      description: record.description,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: EdiTransactionSetSaveParams = {
      partnerCode: values.partnerCode,
      transCode: values.transCode,
      transName: values.transName,
      direction: values.direction,
      standard: values.standard,
      stdVersion: values.stdVersion,
      headerSegTag: values.headerSegTag,
      lineSegTag: values.lineSegTag,
      ackTransCode: values.ackTransCode,
      ackRequired: values.ackRequired,
      status: values.status,
      description: values.description,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await ediService.transSetUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await ediService.transSetCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: EdiTransactionSetItem) => {
    await ediService.transSetRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<EdiTransactionSetItem> = [
    { title: '伙伴编码', dataIndex: 'partnerCode', width: 120, render: (v?: string) => v || '*' },
    {
      title: '交易代码',
      dataIndex: 'transCode',
      width: 150,
      render: (v?: string) => (v ? EDI_TRANS_CODE_LABEL[v] || v : '-'),
    },
    { title: '交易名称', dataIndex: 'transName', width: 160, render: (v) => v || '-' },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_DIRECTION_COLOR[v]}>{EDI_DIRECTION_LABEL[v] || v}</Tag> : '-',
    },
    { title: '标准', dataIndex: 'standard', width: 110, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'stdVersion', width: 100, render: (v) => v || '-' },
    { title: '头段标签', dataIndex: 'headerSegTag', width: 120, render: (v) => v || '-' },
    { title: '行段标签', dataIndex: 'lineSegTag', width: 120, render: (v) => v || '-' },
    { title: '回执交易码', dataIndex: 'ackTransCode', width: 120, render: (v) => v || '-' },
    {
      title: '要求回执',
      dataIndex: 'ackRequired',
      width: 100,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">是</Tag> : v === 0 ? <Tag color="error">否</Tag> : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={EDI_ENABLED_COLOR[v]}>{EDI_ENABLED_LABEL[v] || v}</Tag> : '-',
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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('edi:transset:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('edi:transset:delete') && (
            <Popconfirm title="确认删除该交易集？" onConfirm={() => handleDelete(record)}>
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
        EDI 交易集配置
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="交易名称 / 交易代码" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="partnerCode" label="伙伴编码">
            <Input placeholder="请输入伙伴编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={EDI_TRANS_CODE_OPTIONS} />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={EDI_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="standard" label="标准">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={EDI_STANDARD_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={EDI_ENABLED_OPTIONS} />
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
        title={`EDI 交易集列表（共 ${total} 条）`}
        extra={
          hasPermission('edi:transset:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增交易集
            </Button>
          )
        }
      >
        <Table<EdiTransactionSetItem>
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

      {/* 新增/编辑交易集 */}
      <Modal
        title={editing ? '编辑交易集' : '新增交易集'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="partnerCode" label="伙伴编码">
            <Input placeholder="请输入伙伴编码，* 表示通用" />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码" rules={[{ required: true, message: '请输入交易代码' }]}>
            <Input placeholder="如 850/862/856" />
          </Form.Item>
          <Form.Item name="transName" label="交易名称">
            <Input placeholder="请输入交易名称" />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" options={EDI_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="standard" label="标准">
            <Select placeholder="请选择" options={EDI_STANDARD_OPTIONS} />
          </Form.Item>
          <Form.Item name="stdVersion" label="版本">
            <Input placeholder="请输入标准版本" />
          </Form.Item>
          <Form.Item name="headerSegTag" label="头段标签">
            <Input placeholder="请输入头段标签" />
          </Form.Item>
          <Form.Item name="lineSegTag" label="行段标签">
            <Input placeholder="请输入行段标签" />
          </Form.Item>
          <Form.Item name="ackTransCode" label="回执交易码">
            <Input placeholder="请输入回执交易码" />
          </Form.Item>
          <Form.Item name="ackRequired" label="要求回执">
            <Select placeholder="请选择" options={ACK_REQUIRED_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={EDI_ENABLED_OPTIONS} />
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
