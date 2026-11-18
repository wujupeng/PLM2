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
import { ediService } from '@/services/ediService';
import {
  EDI_DIRECTION_LABEL,
  EDI_DIRECTION_OPTIONS,
  EDI_FLAG_OPTIONS,
  EDI_MESSAGE_SCOPE_LABEL,
  EDI_MESSAGE_SCOPE_OPTIONS,
  EDI_STANDARD_OPTIONS,
  EDI_TRANS_CODE_LABEL,
  EDI_TRANS_CODE_OPTIONS,
  EDI_TRANSFORM_TYPE_LABEL,
  EDI_TRANSFORM_TYPE_OPTIONS,
  type EdiMessageMapItem,
  type EdiMessageMapSaveParams,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 是否必填选项 */
const REQUIRED_FLAG_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

interface MessageMapFormValues {
  mapCode: string;
  mapName: string;
  partnerCode?: string;
  transCode: string;
  standard?: string;
  direction?: string;
  scope?: string;
  sourcePath: string;
  targetField: string;
  transformType?: string;
  dictType?: string;
  datePattern?: string;
  defaultValue?: string;
  requiredFlag?: number;
  sortNo?: number;
  status?: number;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  partnerCode?: string;
  transCode?: string;
  scope?: string;
  transformType?: string;
  status?: number;
}

export default function EdiMessageMapPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MessageMapFormValues>();

  const [data, setData] = useState<EdiMessageMapItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EdiMessageMapItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await ediService.messageMapPage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          partnerCode: cond.partnerCode || undefined,
          transCode: cond.transCode || undefined,
          scope: cond.scope || undefined,
          transformType: cond.transformType || undefined,
          status: cond.status,
        });
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
      standard: 'X12',
      direction: 'INBOUND',
      scope: 'HEADER',
      transformType: 'DIRECT',
      requiredFlag: 0,
      status: 1,
    });
    setModalOpen(true);
  };

  const openEdit = (record: EdiMessageMapItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      mapCode: record.mapCode,
      mapName: record.mapName,
      partnerCode: record.partnerCode,
      transCode: record.transCode,
      standard: record.standard,
      direction: record.direction,
      scope: record.scope,
      sourcePath: record.sourcePath,
      targetField: record.targetField,
      transformType: record.transformType,
      dictType: record.dictType,
      datePattern: record.datePattern,
      defaultValue: record.defaultValue,
      requiredFlag: record.requiredFlag,
      sortNo: record.sortNo,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: EdiMessageMapSaveParams = {
      mapCode: values.mapCode,
      mapName: values.mapName,
      partnerCode: values.partnerCode,
      transCode: values.transCode,
      standard: values.standard,
      direction: values.direction,
      scope: values.scope,
      sourcePath: values.sourcePath,
      targetField: values.targetField,
      transformType: values.transformType,
      dictType: values.dictType,
      datePattern: values.datePattern,
      defaultValue: values.defaultValue,
      requiredFlag: values.requiredFlag,
      sortNo: values.sortNo,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await ediService.messageMapUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await ediService.messageMapCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: EdiMessageMapItem) => {
    await ediService.messageMapRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<EdiMessageMapItem> = [
    { title: '映射编码', dataIndex: 'mapCode', width: 150, render: (v) => v || '-' },
    { title: '映射名称', dataIndex: 'mapName', width: 160, render: (v) => v || '-' },
    { title: '伙伴编码', dataIndex: 'partnerCode', width: 120, render: (v?: string) => v || '*' },
    {
      title: '交易代码',
      dataIndex: 'transCode',
      width: 140,
      render: (v?: string) => (v ? EDI_TRANS_CODE_LABEL[v] || v : '-'),
    },
    { title: '标准', dataIndex: 'standard', width: 110, render: (v) => v || '-' },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 90,
      render: (v?: string) => (v ? EDI_DIRECTION_LABEL[v] || v : '-'),
    },
    {
      title: '作用域',
      dataIndex: 'scope',
      width: 100,
      render: (v?: string) => (v ? EDI_MESSAGE_SCOPE_LABEL[v] || v : '-'),
    },
    { title: '源路径', dataIndex: 'sourcePath', width: 150, render: (v) => v || '-' },
    { title: '目标字段', dataIndex: 'targetField', width: 160, render: (v) => v || '-' },
    {
      title: '转换类型',
      dataIndex: 'transformType',
      width: 110,
      render: (v?: string) => (v ? EDI_TRANSFORM_TYPE_LABEL[v] || v : '-'),
    },
    { title: '字典类型', dataIndex: 'dictType', width: 140, render: (v) => v || '-' },
    { title: '日期格式', dataIndex: 'datePattern', width: 110, render: (v) => v || '-' },
    {
      title: '必填',
      dataIndex: 'requiredFlag',
      width: 80,
      render: (v?: number) =>
        v === 1 ? <Tag color="processing">是</Tag> : v === 0 ? <Tag>否</Tag> : '-',
    },
    { title: '排序', dataIndex: 'sortNo', width: 80, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">启用</Tag> : v === 0 ? <Tag color="error">停用</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('edi:map:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('edi:map:delete') && (
            <Popconfirm title="确认删除该映射？" onConfirm={() => handleDelete(record)}>
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
        EDI 报文映射与标准化
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="映射编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="partnerCode" label="伙伴编码">
            <Input placeholder="请输入伙伴编码" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={EDI_TRANS_CODE_OPTIONS} />
          </Form.Item>
          <Form.Item name="scope" label="作用域">
            <Select placeholder="请选择" allowClear style={{ width: 150 }} options={EDI_MESSAGE_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="transformType" label="转换类型">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={EDI_TRANSFORM_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={EDI_FLAG_OPTIONS} />
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
        title={`报文映射列表（共 ${total} 条）`}
        extra={
          hasPermission('edi:map:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增映射
            </Button>
          )
        }
      >
        <Table<EdiMessageMapItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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

      {/* 新增/编辑映射 */}
      <Modal
        title={editing ? '编辑映射' : '新增映射'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="mapCode" label="映射编码" rules={[{ required: true, message: '请输入映射编码' }]}>
            <Input placeholder="请输入映射编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="mapName" label="映射名称" rules={[{ required: true, message: '请输入映射名称' }]}>
            <Input placeholder="请输入映射名称" />
          </Form.Item>
          <Form.Item name="partnerCode" label="伙伴编码">
            <Input placeholder="请输入伙伴编码，默认 *" />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码" rules={[{ required: true, message: '请输入交易代码' }]}>
            <Input placeholder="如 850" />
          </Form.Item>
          <Form.Item name="standard" label="标准">
            <Select placeholder="请选择" options={EDI_STANDARD_OPTIONS} />
          </Form.Item>
          <Form.Item name="direction" label="方向">
            <Select placeholder="请选择" options={EDI_DIRECTION_OPTIONS} />
          </Form.Item>
          <Form.Item name="scope" label="作用域">
            <Select placeholder="请选择" options={EDI_MESSAGE_SCOPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourcePath" label="源路径" rules={[{ required: true, message: '请输入源路径' }]}>
            <Input placeholder="如 BEG03" />
          </Form.Item>
          <Form.Item name="targetField" label="目标字段" rules={[{ required: true, message: '请输入目标字段' }]}>
            <Input placeholder="如 customerOrderNo" />
          </Form.Item>
          <Form.Item name="transformType" label="转换类型">
            <Select placeholder="请选择" options={EDI_TRANSFORM_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="dictType" label="字典类型">
            <Input placeholder="请输入字典类型" />
          </Form.Item>
          <Form.Item name="datePattern" label="日期格式">
            <Input placeholder="如 yyyyMMdd" />
          </Form.Item>
          <Form.Item name="defaultValue" label="默认值">
            <Input placeholder="请输入默认值" />
          </Form.Item>
          <Form.Item name="requiredFlag" label="是否必填">
            <Select placeholder="请选择" options={REQUIRED_FLAG_OPTIONS} />
          </Form.Item>
          <Form.Item name="sortNo" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={EDI_FLAG_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
