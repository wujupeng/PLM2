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
import { intService } from '@/services/intService';
import {
  INT_DEFECT_LEVEL_COLOR,
  INT_DEFECT_LEVEL_LABEL,
  INT_DEFECT_LEVEL_OPTIONS,
  INT_INSPECTION_RESULT_COLOR,
  INT_INSPECTION_RESULT_LABEL,
  INT_INSPECTION_RESULT_OPTIONS,
  INT_INTERFACE_STATUS_COLOR,
  INT_INTERFACE_STATUS_LABEL,
  INT_INTERFACE_STATUS_OPTIONS,
  INT_QMS_RECORD_TYPE_LABEL,
  INT_QMS_RECORD_TYPE_OPTIONS,
  type IntQmsRecordItem,
  type IntQmsRecordQuery,
  type IntQmsRecordSaveParams,
} from '@/types/int';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface QmsFormValues {
  recordNo?: string;
  recordType: string;
  sourceNo?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  productVersion?: string;
  inspectionItem?: string;
  result?: string;
  defectCode?: string;
  defectLevel?: string;
  disposition?: string;
  occurredAt?: dayjs.Dayjs;
  sourceSystem?: string;
  relatedProductCode?: string;
  attachmentUrl?: string;
  interfaceStatus?: string;
  remark?: string;
}

interface QmsSearchState {
  recordNo?: string;
  recordType?: string;
  productCode?: string;
  materialCode?: string;
  batchNo?: string;
  result?: string;
  defectLevel?: string;
  interfaceStatus?: string;
  sourceSystem?: string;
}

export default function IntQmsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<QmsFormValues>();

  const [data, setData] = useState<IntQmsRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<QmsSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntQmsRecordItem | null>(null);
  const [receiveMode, setReceiveMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: IntQmsRecordQuery = {
          pageNum: page,
          pageSize: size,
          recordNo: cond.recordNo || undefined,
          recordType: cond.recordType || undefined,
          productCode: cond.productCode || undefined,
          materialCode: cond.materialCode || undefined,
          batchNo: cond.batchNo || undefined,
          result: cond.result || undefined,
          defectLevel: cond.defectLevel || undefined,
          interfaceStatus: cond.interfaceStatus || undefined,
          sourceSystem: cond.sourceSystem || undefined,
        };
        const res = await intService.qmsPage(params);
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

  const onSearch = (values: QmsSearchState) => {
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
    setReceiveMode(false);
    form.resetFields();
    form.setFieldsValue({ sourceSystem: 'QMS', interfaceStatus: 'RECEIVED' });
    setModalOpen(true);
  };

  const openReceive = () => {
    setEditing(null);
    setReceiveMode(true);
    form.resetFields();
    form.setFieldsValue({ sourceSystem: 'QMS', interfaceStatus: 'RECEIVED' });
    setModalOpen(true);
  };

  const openEdit = (record: IntQmsRecordItem) => {
    setEditing(record);
    setReceiveMode(false);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      occurredAt: record.occurredAt ? dayjs(record.occurredAt) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: IntQmsRecordSaveParams = {
      recordNo: values.recordNo,
      recordType: values.recordType,
      sourceNo: values.sourceNo,
      productCode: values.productCode,
      materialCode: values.materialCode,
      batchNo: values.batchNo,
      productVersion: values.productVersion,
      inspectionItem: values.inspectionItem,
      result: values.result,
      defectCode: values.defectCode,
      defectLevel: values.defectLevel,
      disposition: values.disposition,
      occurredAt: values.occurredAt ? values.occurredAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      sourceSystem: values.sourceSystem,
      relatedProductCode: values.relatedProductCode,
      attachmentUrl: values.attachmentUrl,
      interfaceStatus: values.interfaceStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await intService.qmsUpdate(editing.recordNo, payload);
        message.success('更新成功');
      } else if (receiveMode) {
        await intService.qmsReceive(payload);
        message.success('接口数据接收成功');
      } else {
        await intService.qmsCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: IntQmsRecordItem) => {
    await intService.qmsRemove(record.recordNo);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<IntQmsRecordItem> = [
    { title: '质量记录编号', dataIndex: 'recordNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    {
      title: '记录类型',
      dataIndex: 'recordType',
      width: 110,
      render: (v?: string) => (v ? INT_QMS_RECORD_TYPE_LABEL[v] || v : '-'),
    },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 130, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: (v) => v || '-' },
    { title: '产品版本', dataIndex: 'productVersion', width: 100, render: (v) => v || '-' },
    { title: '检验项目', dataIndex: 'inspectionItem', width: 140, render: (v) => v || '-' },
    {
      title: '检验结果',
      dataIndex: 'result',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={INT_INSPECTION_RESULT_COLOR[v]}>{INT_INSPECTION_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    { title: '缺陷代码', dataIndex: 'defectCode', width: 120, render: (v) => v || '-' },
    {
      title: '缺陷等级',
      dataIndex: 'defectLevel',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={INT_DEFECT_LEVEL_COLOR[v]}>{INT_DEFECT_LEVEL_LABEL[v] || v}</Tag> : '-',
    },
    { title: '处置方式', dataIndex: 'disposition', width: 130, render: (v) => v || '-' },
    {
      title: '发生时间',
      dataIndex: 'occurredAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    { title: '来源系统', dataIndex: 'sourceSystem', width: 110, render: (v) => v || '-' },
    {
      title: '接口状态',
      dataIndex: 'interfaceStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={INT_INTERFACE_STATUS_COLOR[v]}>{INT_INTERFACE_STATUS_LABEL[v] || v}</Tag> : '-',
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
          {hasPermission('int:qms:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('int:qms:save') && (
            <Popconfirm title="确认删除该质量记录？" onConfirm={() => handleDelete(record)}>
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
        QMS 质量接口
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="recordNo" label="质量记录编号">
            <Input placeholder="请输入质量记录编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="recordType" label="记录类型">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={INT_QMS_RECORD_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="result" label="检验结果">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_INSPECTION_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="defectLevel" label="缺陷等级">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_DEFECT_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="interfaceStatus" label="接口状态">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={INT_INTERFACE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="请输入来源系统" allowClear style={{ width: 130 }} />
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
        title={`QMS 质量记录（共 ${total} 条）`}
        extra={
          <Space wrap>
            {hasPermission('int:qms:save') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                录入记录
              </Button>
            )}
            {hasPermission('int:qms:receive') && (
              <Button onClick={openReceive}>接收接口数据</Button>
            )}
          </Space>
        }
      >
        <Table<IntQmsRecordItem>
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
        title={editing ? '编辑质量记录' : receiveMode ? '接收 QMS 接口数据' : '录入质量记录'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="recordNo" label="质量记录编号" extra="留空将自动生成">
            <Input placeholder="请输入质量记录编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="recordType" label="记录类型" rules={[{ required: true, message: '请选择记录类型' }]}>
            <Select placeholder="请选择" options={INT_QMS_RECORD_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="productVersion" label="产品版本">
            <Input placeholder="请输入产品版本" />
          </Form.Item>
          <Form.Item name="inspectionItem" label="检验项目">
            <Input placeholder="请输入检验项目" />
          </Form.Item>
          <Form.Item name="result" label="检验结果">
            <Select placeholder="请选择" options={INT_INSPECTION_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="defectCode" label="缺陷代码">
            <Input placeholder="请输入缺陷代码" />
          </Form.Item>
          <Form.Item name="defectLevel" label="缺陷等级">
            <Select placeholder="请选择" options={INT_DEFECT_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="disposition" label="处置方式">
            <Input placeholder="请输入处置方式" />
          </Form.Item>
          <Form.Item name="occurredAt" label="发生时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="请输入来源系统" />
          </Form.Item>
          <Form.Item name="relatedProductCode" label="关联产品编码">
            <Input placeholder="请输入关联产品编码" />
          </Form.Item>
          <Form.Item name="attachmentUrl" label="附件地址">
            <Input placeholder="请输入附件地址" />
          </Form.Item>
          <Form.Item name="interfaceStatus" label="接口状态">
            <Select placeholder="请选择" options={INT_INTERFACE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
