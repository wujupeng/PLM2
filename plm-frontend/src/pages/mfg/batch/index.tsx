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
import { mfgService } from '@/services/mfgService';
import {
  MFG_BATCH_STATUS_COLOR,
  MFG_BATCH_STATUS_LABEL,
  MFG_BATCH_STATUS_OPTIONS,
  MFG_RELEASE_STATUS_COLOR,
  MFG_RELEASE_STATUS_LABEL,
  MFG_RELEASE_STATUS_OPTIONS,
  type MfgBatchQuery,
  type MfgBatchSaveParams,
  type MfgProductionBatchItem,
} from '@/types/mfg';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface BatchFormValues {
  batchNo?: string;
  workOrderNo?: string;
  productCode: string;
  productName?: string;
  productVersion?: string;
  bomVersion?: string;
  processVersion?: string;
  productionDate?: dayjs.Dayjs;
  shiftCode?: string;
  lineCode?: string;
  workStation?: string;
  plannedQty?: number;
  completedQty?: number;
  scrapQty?: number;
  batchStatus?: string;
  releaseStatus?: string;
  sourceSystem?: string;
  remark?: string;
}

interface SearchState {
  batchNo?: string;
  productCode?: string;
  lineCode?: string;
  batchStatus?: string;
  releaseStatus?: string;
}

export default function MfgBatchPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BatchFormValues>();

  const [data, setData] = useState<MfgProductionBatchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MfgProductionBatchItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgBatchQuery = {
          pageNum: page,
          pageSize: size,
          batchNo: cond.batchNo || undefined,
          productCode: cond.productCode || undefined,
          lineCode: cond.lineCode || undefined,
          batchStatus: cond.batchStatus || undefined,
          releaseStatus: cond.releaseStatus || undefined,
        };
        const res = await mfgService.batchPage(params);
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
    form.setFieldsValue({ batchStatus: 'PLANNED', releaseStatus: 'UNRELEASED', sourceSystem: 'MES' });
    setModalOpen(true);
  };

  const openEdit = (record: MfgProductionBatchItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      productionDate: record.productionDate ? dayjs(record.productionDate) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgBatchSaveParams = {
      batchNo: values.batchNo,
      workOrderNo: values.workOrderNo,
      productCode: values.productCode,
      productName: values.productName,
      productVersion: values.productVersion,
      bomVersion: values.bomVersion,
      processVersion: values.processVersion,
      productionDate: values.productionDate ? values.productionDate.format('YYYY-MM-DD') : undefined,
      shiftCode: values.shiftCode,
      lineCode: values.lineCode,
      workStation: values.workStation,
      plannedQty: values.plannedQty,
      completedQty: values.completedQty,
      scrapQty: values.scrapQty,
      batchStatus: values.batchStatus,
      releaseStatus: values.releaseStatus,
      sourceSystem: values.sourceSystem,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await mfgService.batchUpdate(editing.batchNo, payload);
        message.success('更新成功');
      } else {
        await mfgService.batchCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MfgProductionBatchItem) => {
    await mfgService.batchRemove(record.batchNo);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<MfgProductionBatchItem> = [
    { title: '生产批次号', dataIndex: 'batchNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '工单号', dataIndex: 'workOrderNo', width: 140, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 130, render: (v) => v || '-' },
    { title: '产品名称', dataIndex: 'productName', width: 160, render: (v) => v || '-' },
    { title: '产品版本', dataIndex: 'productVersion', width: 100, render: (v) => v || '-' },
    { title: 'BOM 版本', dataIndex: 'bomVersion', width: 110, render: (v) => v || '-' },
    { title: '工艺版本', dataIndex: 'processVersion', width: 110, render: (v) => v || '-' },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    { title: '产线', dataIndex: 'lineCode', width: 100, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'workStation', width: 100, render: (v) => v || '-' },
    { title: '计划数量', dataIndex: 'plannedQty', width: 100, render: (v) => (v ?? '-') },
    { title: '完工数量', dataIndex: 'completedQty', width: 100, render: (v) => (v ?? '-') },
    { title: '报废数量', dataIndex: 'scrapQty', width: 100, render: (v) => (v ?? '-') },
    {
      title: '批次状态',
      dataIndex: 'batchStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={MFG_BATCH_STATUS_COLOR[v]}>{MFG_BATCH_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '放行状态',
      dataIndex: 'releaseStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={MFG_RELEASE_STATUS_COLOR[v]}>{MFG_RELEASE_STATUS_LABEL[v] || v}</Tag> : '-',
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
          {hasPermission('mfg:batch:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('mfg:batch:save') && (
            <Popconfirm title="确认删除该生产批次？" onConfirm={() => handleDelete(record)}>
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
        生产批次
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" allowClear style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="batchStatus" label="批次状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={MFG_BATCH_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="releaseStatus" label="放行状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={MFG_RELEASE_STATUS_OPTIONS} />
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
        title={`生产批次列表（共 ${total} 条）`}
        extra={
          hasPermission('mfg:batch:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增批次
            </Button>
          )
        }
      >
        <Table<MfgProductionBatchItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editing ? '编辑生产批次' : '新增生产批次'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="生产批次号" extra="留空将自动生成">
            <Input placeholder="请输入生产批次号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码" rules={[{ required: true, message: '请输入产品编码' }]}>
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="productVersion" label="产品版本">
            <Input placeholder="请输入产品版本" />
          </Form.Item>
          <Form.Item name="bomVersion" label="生效 BOM 版本">
            <Input placeholder="请输入 BOM 版本" />
          </Form.Item>
          <Form.Item name="processVersion" label="生效工艺版本">
            <Input placeholder="请输入工艺版本" />
          </Form.Item>
          <Form.Item name="productionDate" label="生产日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shiftCode" label="班次">
            <Input placeholder="如 DAY / NIGHT" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="plannedQty" label="计划数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入计划数量" />
          </Form.Item>
          <Form.Item name="completedQty" label="完工数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入完工数量" />
          </Form.Item>
          <Form.Item name="scrapQty" label="报废数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入报废数量" />
          </Form.Item>
          <Form.Item name="batchStatus" label="批次状态">
            <Select placeholder="请选择" options={MFG_BATCH_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="releaseStatus" label="放行状态">
            <Select placeholder="请选择" options={MFG_RELEASE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="如 MES / ERP" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
