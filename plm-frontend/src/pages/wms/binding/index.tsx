import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import type { Dayjs } from 'dayjs';
import { wmsService } from '@/services/wmsService';
import {
  WMS_BINDING_TYPE_LABEL,
  WMS_BINDING_TYPE_OPTIONS,
  WMS_ENABLED_COLOR,
  WMS_ENABLED_LABEL,
  WMS_ENABLED_OPTIONS,
  type WmsBindingQuery,
  type WmsBindingSaveParams,
  type WmsMaterialBindingItem,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface SearchState {
  bindType?: string;
  lineCode?: string;
  workStation?: string;
  materialCode?: string;
  bindStatus?: string;
}

interface BindingFormValues {
  bindType?: string;
  lineCode?: string;
  workStation?: string;
  materialCode: string;
  batchNo?: string;
  containerCode?: string;
  effectiveFrom?: Dayjs;
  effectiveTo?: Dayjs;
  bindStatus?: string;
  remark?: string;
}

export default function WmsBindingPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BindingFormValues>();

  const [data, setData] = useState<WmsMaterialBindingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WmsMaterialBindingItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsBindingQuery = {
          pageNum: page,
          pageSize: size,
          bindType: cond.bindType || undefined,
          lineCode: cond.lineCode || undefined,
          workStation: cond.workStation || undefined,
          materialCode: cond.materialCode || undefined,
          bindStatus: cond.bindStatus || undefined,
        };
        const res = await wmsService.bindingPage(params);
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
    form.setFieldsValue({ bindType: 'LINE_MATERIAL', bindStatus: 'enabled' });
    setModalOpen(true);
  };

  const openEdit = (record: WmsMaterialBindingItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      bindType: record.bindType,
      lineCode: record.lineCode,
      workStation: record.workStation,
      materialCode: record.materialCode,
      batchNo: record.batchNo,
      containerCode: record.containerCode,
      effectiveFrom: record.effectiveFrom ? dayjs(record.effectiveFrom) : undefined,
      effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : undefined,
      bindStatus: record.bindStatus,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: WmsBindingSaveParams = {
      bindType: values.bindType,
      lineCode: values.lineCode,
      workStation: values.workStation,
      materialCode: values.materialCode,
      batchNo: values.batchNo,
      containerCode: values.containerCode,
      effectiveFrom: values.effectiveFrom ? values.effectiveFrom.format('YYYY-MM-DD') : undefined,
      effectiveTo: values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DD') : undefined,
      bindStatus: values.bindStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await wmsService.bindingUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await wmsService.bindingCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: WmsMaterialBindingItem) => {
    await wmsService.bindingRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<WmsMaterialBindingItem> = [
    { title: '绑定单号', dataIndex: 'bindingNo', width: 150, render: (v) => v || '-' },
    {
      title: '绑定类型',
      dataIndex: 'bindType',
      width: 140,
      render: (v?: string) => (v ? WMS_BINDING_TYPE_LABEL[v] || v : '-'),
    },
    { title: '产线编码', dataIndex: 'lineCode', width: 110, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'workStation', width: 110, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: (v) => v || '-' },
    { title: '容器编码', dataIndex: 'containerCode', width: 120, render: (v) => v || '-' },
    { title: '生效开始', dataIndex: 'effectiveFrom', width: 120, render: (v) => v || '-' },
    { title: '生效结束', dataIndex: 'effectiveTo', width: 120, render: (v) => v || '-' },
    {
      title: '绑定状态',
      dataIndex: 'bindStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={WMS_ENABLED_COLOR[v]}>{WMS_ENABLED_LABEL[v] || v}</Tag> : '-',
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
          {hasPermission('wms:binding:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('wms:binding:save') && (
            <Popconfirm title="确认删除该绑定？" onConfirm={() => handleDelete(record)}>
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
        防混料绑定
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="bindType" label="绑定类型">
            <Select placeholder="请选择" allowClear style={{ width: 160 }} options={WMS_BINDING_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="bindStatus" label="绑定状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={WMS_ENABLED_OPTIONS} />
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
        title={`防混料绑定列表（共 ${total} 条）`}
        extra={
          hasPermission('wms:binding:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增绑定
            </Button>
          )
        }
      >
        <Table<WmsMaterialBindingItem>
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
        title={editing ? '编辑绑定' : '新增绑定'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="bindType" label="绑定类型">
            <Select placeholder="请选择" options={WMS_BINDING_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="containerCode" label="容器编码">
            <Input placeholder="请输入容器编码" />
          </Form.Item>
          <Form.Item name="effectiveFrom" label="生效开始">
            <DatePicker style={{ width: '100%' }} placeholder="请选择生效开始日期" />
          </Form.Item>
          <Form.Item name="effectiveTo" label="生效结束">
            <DatePicker style={{ width: '100%' }} placeholder="请选择生效结束日期" />
          </Form.Item>
          <Form.Item name="bindStatus" label="绑定状态">
            <Select placeholder="请选择" options={WMS_ENABLED_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
