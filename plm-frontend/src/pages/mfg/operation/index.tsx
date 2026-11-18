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
  MFG_INTERFACE_STATUS_COLOR,
  MFG_INTERFACE_STATUS_LABEL,
  MFG_INTERFACE_STATUS_OPTIONS,
  MFG_OPERATION_RESULT_COLOR,
  MFG_OPERATION_RESULT_LABEL,
  MFG_OPERATION_RESULT_OPTIONS,
  type MfgOperationQuery,
  type MfgOperationRecordItem,
  type MfgOperationSaveParams,
} from '@/types/mfg';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface OperationFormValues {
  recordNo?: string;
  batchNo: string;
  workOrderNo?: string;
  productCode?: string;
  serialNo?: string;
  operationCode?: string;
  operationName?: string;
  seqNo?: number;
  workStation?: string;
  lineCode?: string;
  equipmentCode?: string;
  operator?: string;
  startTime?: dayjs.Dayjs;
  endTime?: dayjs.Dayjs;
  inQty?: number;
  outQty?: number;
  scrapQty?: number;
  result?: string;
  sourceSystem?: string;
  collectTime?: dayjs.Dayjs;
  interfaceStatus?: string;
  remark?: string;
}

interface SearchState {
  recordNo?: string;
  batchNo?: string;
  serialNo?: string;
  operationCode?: string;
  workStation?: string;
  result?: string;
  interfaceStatus?: string;
}

export default function MfgOperationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OperationFormValues>();

  const [data, setData] = useState<MfgOperationRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MfgOperationRecordItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgOperationQuery = {
          pageNum: page,
          pageSize: size,
          recordNo: cond.recordNo || undefined,
          batchNo: cond.batchNo || undefined,
          serialNo: cond.serialNo || undefined,
          operationCode: cond.operationCode || undefined,
          workStation: cond.workStation || undefined,
          result: cond.result || undefined,
          interfaceStatus: cond.interfaceStatus || undefined,
        };
        const res = await mfgService.operationPage(params);
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
    form.setFieldsValue({ result: 'OK', sourceSystem: 'MES', interfaceStatus: 'RECEIVED' });
    setModalOpen(true);
  };

  const openEdit = (record: MfgOperationRecordItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
      collectTime: record.collectTime ? dayjs(record.collectTime) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgOperationSaveParams = {
      recordNo: values.recordNo,
      batchNo: values.batchNo,
      workOrderNo: values.workOrderNo,
      productCode: values.productCode,
      serialNo: values.serialNo,
      operationCode: values.operationCode,
      operationName: values.operationName,
      seqNo: values.seqNo,
      workStation: values.workStation,
      lineCode: values.lineCode,
      equipmentCode: values.equipmentCode,
      operator: values.operator,
      startTime: values.startTime ? values.startTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: values.endTime ? values.endTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
      inQty: values.inQty,
      outQty: values.outQty,
      scrapQty: values.scrapQty,
      result: values.result,
      sourceSystem: values.sourceSystem,
      collectTime: values.collectTime ? values.collectTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
      interfaceStatus: values.interfaceStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await mfgService.operationUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await mfgService.operationCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MfgOperationRecordItem) => {
    await mfgService.operationRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<MfgOperationRecordItem> = [
    { title: '记录编号', dataIndex: 'recordNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '生产批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '工单号', dataIndex: 'workOrderNo', width: 130, render: (v) => v || '-' },
    { title: '序列号', dataIndex: 'serialNo', width: 140, render: (v) => v || '-' },
    { title: '工序编码', dataIndex: 'operationCode', width: 110, render: (v) => v || '-' },
    { title: '工序名称', dataIndex: 'operationName', width: 130, render: (v) => v || '-' },
    { title: '顺序', dataIndex: 'seqNo', width: 70, render: (v) => (v ?? '-') },
    { title: '工位', dataIndex: 'workStation', width: 100, render: (v) => v || '-' },
    { title: '设备', dataIndex: 'equipmentCode', width: 110, render: (v) => v || '-' },
    { title: '操作人员', dataIndex: 'operator', width: 100, render: (v) => v || '-' },
    { title: '投入数量', dataIndex: 'inQty', width: 100, render: (v) => (v ?? '-') },
    { title: '产出数量', dataIndex: 'outQty', width: 100, render: (v) => (v ?? '-') },
    {
      title: '结果',
      dataIndex: 'result',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={MFG_OPERATION_RESULT_COLOR[v]}>{MFG_OPERATION_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '接口状态',
      dataIndex: 'interfaceStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={MFG_INTERFACE_STATUS_COLOR[v]}>{MFG_INTERFACE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '采集时间',
      dataIndex: 'collectTime',
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
          {hasPermission('mfg:operation:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('mfg:operation:save') && (
            <Popconfirm title="确认删除该过站记录？" onConfirm={() => handleDelete(record)}>
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
        工序过站
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="recordNo" label="记录编号">
            <Input placeholder="请输入记录编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="serialNo" label="序列号">
            <Input placeholder="请输入序列号" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="operationCode" label="工序编码">
            <Input placeholder="请输入工序编码" allowClear style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={MFG_OPERATION_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="interfaceStatus" label="接口状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={MFG_INTERFACE_STATUS_OPTIONS} />
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
        title={`工序过站记录（共 ${total} 条）`}
        extra={
          hasPermission('mfg:operation:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              录入过站记录
            </Button>
          )
        }
      >
        <Table<MfgOperationRecordItem>
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
        title={editing ? '编辑过站记录' : '录入过站记录'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="recordNo" label="记录编号" extra="留空将自动生成">
            <Input placeholder="请输入记录编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号" rules={[{ required: true, message: '请输入生产批次号' }]}>
            <Input placeholder="请输入生产批次号" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="serialNo" label="序列号">
            <Input placeholder="请输入序列号" />
          </Form.Item>
          <Form.Item name="operationCode" label="工序编码">
            <Input placeholder="请输入工序编码" />
          </Form.Item>
          <Form.Item name="operationName" label="工序名称">
            <Input placeholder="请输入工序名称" />
          </Form.Item>
          <Form.Item name="seqNo" label="工序顺序">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入工序顺序" />
          </Form.Item>
          <Form.Item name="workStation" label="工位">
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" />
          </Form.Item>
          <Form.Item name="equipmentCode" label="设备编码">
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="operator" label="操作人员">
            <Input placeholder="请输入操作人员" />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inQty" label="投入数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入投入数量" />
          </Form.Item>
          <Form.Item name="outQty" label="产出数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入产出数量" />
          </Form.Item>
          <Form.Item name="scrapQty" label="报废数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入报废数量" />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <Select placeholder="请选择" options={MFG_OPERATION_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="如 MES" />
          </Form.Item>
          <Form.Item name="collectTime" label="采集时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="interfaceStatus" label="接口状态">
            <Select placeholder="请选择" options={MFG_INTERFACE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
