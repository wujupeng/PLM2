import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
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
import { mfgService } from '@/services/mfgService';
import {
  MFG_BATCH_STATUS_LABEL,
  MFG_OPERATION_RESULT_LABEL,
  MFG_PACKAGE_STATUS_LABEL,
  MFG_RELEASE_STATUS_LABEL,
  MFG_SHIPMENT_STATUS_LABEL,
  MFG_TEST_RESULT_LABEL,
  MFG_TRACE_TYPE_LABEL,
  MFG_TRACE_TYPE_OPTIONS,
  type MfgForwardTraceResponse,
  type MfgTraceBindingItem,
  type MfgTraceBindingQuery,
  type MfgTraceBindingSaveParams,
  type MfgTraceResponse,
} from '@/types/mfg';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ================= 追溯查询（DEV-093） ================= */

interface BackwardFormValues {
  traceCode?: string;
  serialNo?: string;
  batchNo?: string;
}

interface ForwardFormValues {
  materialCode?: string;
  materialBatchNo?: string;
}

function TraceQueryTab() {
  const [bwForm] = Form.useForm<BackwardFormValues>();
  const [fwForm] = Form.useForm<ForwardFormValues>();
  const [backward, setBackward] = useState<MfgTraceResponse | null>(null);
  const [forward, setForward] = useState<MfgForwardTraceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBackward = async () => {
    const values = await bwForm.validateFields();
    if (!values.traceCode && !values.serialNo && !values.batchNo) {
      message.warning('请至少填写追溯码、序列号或生产批次号之一');
      return;
    }
    setLoading(true);
    try {
      const res = await mfgService.traceBackward(values);
      setBackward(res);
      setForward(null);
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    const values = await fwForm.validateFields();
    if (!values.materialCode && !values.materialBatchNo) {
      message.warning('请至少填写物料编码或物料批次号之一');
      return;
    }
    setLoading(true);
    try {
      const res = await mfgService.traceForward(values);
      setForward(res);
      setBackward(null);
    } finally {
      setLoading(false);
    }
  };

  const batch = backward?.productionBatch;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="反向追溯（由产品码/序列号/批次反查）">
        <Form form={bwForm} layout="inline" onFinish={handleBackward}>
          <Form.Item name="traceCode" label="追溯码">
            <Input placeholder="单件码/批次码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="serialNo" label="序列号">
            <Input placeholder="序列号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="生产批次号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              追溯
            </Button>
          </Form.Item>
        </Form>

        {backward && (
          <div style={{ marginTop: 16 }}>
            {backward.recalled && (
              <Alert
                type="error"
                showIcon
                message="该追溯对象命中召回"
                description="相关批次已被召回或隔离，请勿发货并联系质量部门确认。"
                style={{ marginBottom: 16 }}
              />
            )}
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="追溯码">{backward.traceCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="追溯类型">
                {backward.traceType ? MFG_TRACE_TYPE_LABEL[backward.traceType] || backward.traceType : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="生产批次号">{batch?.batchNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="工单号">{batch?.workOrderNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="产品编码">{batch?.productCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="产品版本">{batch?.productVersion || '-'}</Descriptions.Item>
              <Descriptions.Item label="批次状态">
                {batch?.batchStatus ? MFG_BATCH_STATUS_LABEL[batch.batchStatus] || batch.batchStatus : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="放行状态">
                {batch?.releaseStatus
                  ? MFG_RELEASE_STATUS_LABEL[batch.releaseStatus] || batch.releaseStatus
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Text strong>物料批次绑定</Typography.Text>
            <Table
              rowKey="id"
              size="small"
              style={{ marginTop: 8, marginBottom: 16 }}
              dataSource={backward.materialBindings || []}
              pagination={false}
              locale={{ emptyText: '暂无物料绑定' }}
              columns={[
                { title: '物料编码', dataIndex: 'materialCode', render: (v) => v || '-' },
                { title: '物料名称', dataIndex: 'materialName', render: (v) => v || '-' },
                { title: '物料批次号', dataIndex: 'materialBatchNo', render: (v) => v || '-' },
                { title: '供应商', dataIndex: 'materialSupplier', render: (v) => v || '-' },
                { title: '装配工序', dataIndex: 'operationCode', render: (v) => v || '-' },
                { title: '数量', dataIndex: 'quantity', width: 80, render: (v) => (v ?? '-') },
              ]}
            />

            <Typography.Text strong>工序过站记录</Typography.Text>
            <Table
              rowKey="id"
              size="small"
              style={{ marginTop: 8, marginBottom: 16 }}
              dataSource={backward.operationRecords || []}
              pagination={false}
              locale={{ emptyText: '暂无过站记录' }}
              columns={[
                { title: '顺序', dataIndex: 'seqNo', width: 70, render: (v) => (v ?? '-') },
                { title: '工序编码', dataIndex: 'operationCode', render: (v) => v || '-' },
                { title: '工序名称', dataIndex: 'operationName', render: (v) => v || '-' },
                { title: '工位', dataIndex: 'workStation', render: (v) => v || '-' },
                { title: '操作人员', dataIndex: 'operator', render: (v) => v || '-' },
                {
                  title: '结果',
                  dataIndex: 'result',
                  width: 90,
                  render: (v?: string) => (v ? MFG_OPERATION_RESULT_LABEL[v] || v : '-'),
                },
                {
                  title: '采集时间',
                  dataIndex: 'collectTime',
                  width: 170,
                  render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
                },
              ]}
            />

            <Typography.Text strong>测试结果</Typography.Text>
            <Table
              rowKey="id"
              size="small"
              style={{ marginTop: 8, marginBottom: 16 }}
              dataSource={backward.testResults || []}
              pagination={false}
              locale={{ emptyText: '暂无测试结果' }}
              columns={[
                { title: '测试项', dataIndex: 'testItemName', render: (v) => v || '-' },
                { title: '实测值', dataIndex: 'actualValue', width: 100, render: (v) => (v ?? '-') },
                { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
                {
                  title: '结果',
                  dataIndex: 'result',
                  width: 90,
                  render: (v?: string) => (v ? MFG_TEST_RESULT_LABEL[v] || v : '-'),
                },
                {
                  title: '测试时间',
                  dataIndex: 'testedAt',
                  width: 170,
                  render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
                },
              ]}
            />

            <Typography.Text strong>包装</Typography.Text>
            <Table
              rowKey="id"
              size="small"
              style={{ marginTop: 8, marginBottom: 16 }}
              dataSource={backward.packages || []}
              pagination={false}
              locale={{ emptyText: '暂无包装记录' }}
              columns={[
                { title: '包装编号', dataIndex: 'packageNo', render: (v) => v || '-' },
                { title: '箱码', dataIndex: 'packageCode', render: (v) => v || '-' },
                { title: '包装数量', dataIndex: 'packageQty', width: 100, render: (v) => (v ?? '-') },
                {
                  title: '包装状态',
                  dataIndex: 'packageStatus',
                  width: 110,
                  render: (v?: string) => (v ? MFG_PACKAGE_STATUS_LABEL[v] || v : '-'),
                },
              ]}
            />

            <Typography.Text strong>发运/出货</Typography.Text>
            <Table
              rowKey="id"
              size="small"
              style={{ marginTop: 8 }}
              dataSource={backward.shipments || []}
              pagination={false}
              locale={{ emptyText: '暂无出货记录' }}
              columns={[
                { title: '出货单号', dataIndex: 'shipmentNo', render: (v) => v || '-' },
                { title: '客户编码', dataIndex: 'customerCode', render: (v) => v || '-' },
                {
                  title: '出货状态',
                  dataIndex: 'shipmentStatus',
                  width: 110,
                  render: (v?: string) => (v ? MFG_SHIPMENT_STATUS_LABEL[v] || v : '-'),
                },
                { title: 'ASN 单号', dataIndex: 'asnNo', render: (v) => v || '-' },
              ]}
            />
          </div>
        )}
      </Card>

      <Card title="正向追溯（由物料批次反查影响范围）">
        <Form form={fwForm} layout="inline" onFinish={handleForward}>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="物料编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="materialBatchNo" label="物料批次号">
            <Input placeholder="物料批次号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              追溯
            </Button>
          </Form.Item>
        </Form>

        {forward && (
          <div style={{ marginTop: 16 }}>
            <Alert
              type="warning"
              showIcon
              message={`受影响数量合计：${forward.affectedCount ?? 0}`}
              description="以下为使用该物料批次生产并可能已发货的产品范围。"
              style={{ marginBottom: 16 }}
            />
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="物料编码">{forward.materialCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="物料批次号">{forward.materialBatchNo || '-'}</Descriptions.Item>
            </Descriptions>

            <Typography.Text strong>受影响生产批次</Typography.Text>
            <Table
              rowKey="id"
              size="small"
              style={{ marginTop: 8, marginBottom: 16 }}
              dataSource={forward.productionBatches || []}
              pagination={false}
              locale={{ emptyText: '无' }}
              columns={[
                { title: '生产批次号', dataIndex: 'batchNo', render: (v) => v || '-' },
                { title: '产品编码', dataIndex: 'productCode', render: (v) => v || '-' },
                {
                  title: '生产日期',
                  dataIndex: 'productionDate',
                  width: 120,
                  render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
                },
              ]}
            />

            <Typography.Text strong>受影响单件追溯码</Typography.Text>
            <div style={{ margin: '8px 0 16px' }}>
              <Space wrap>
                {(forward.affectedTraceCodes || []).map((code) => (
                  <Tag key={code}>{code}</Tag>
                ))}
                {(forward.affectedTraceCodes || []).length === 0 && <span>-</span>}
              </Space>
            </div>

            <Typography.Text strong>已发运出货单</Typography.Text>
            <Table
              rowKey="id"
              size="small"
              style={{ marginTop: 8 }}
              dataSource={forward.shipments || []}
              pagination={false}
              locale={{ emptyText: '无' }}
              columns={[
                { title: '出货单号', dataIndex: 'shipmentNo', render: (v) => v || '-' },
                { title: '客户编码', dataIndex: 'customerCode', render: (v) => v || '-' },
                {
                  title: '出货状态',
                  dataIndex: 'shipmentStatus',
                  width: 110,
                  render: (v?: string) => (v ? MFG_SHIPMENT_STATUS_LABEL[v] || v : '-'),
                },
                { title: 'ASN 单号', dataIndex: 'asnNo', render: (v) => v || '-' },
              ]}
            />
          </div>
        )}
      </Card>
    </Space>
  );
}

/* ================= 追溯绑定（DEV-088） ================= */

interface BindingFormValues {
  bindingNo?: string;
  traceCode: string;
  traceType?: string;
  batchNo?: string;
  serialNo?: string;
  productCode?: string;
  materialCode?: string;
  materialName?: string;
  materialBatchNo?: string;
  materialSupplier?: string;
  operationCode?: string;
  quantity?: number;
  unit?: string;
  sourceSystem?: string;
  remark?: string;
}

function TraceBindingTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<BindingFormValues>();
  const [data, setData] = useState<MfgTraceBindingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{
    traceCode?: string;
    batchNo?: string;
    materialCode?: string;
    materialBatchNo?: string;
    traceType?: string;
  }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MfgTraceBindingItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgTraceBindingQuery = {
          pageNum: page,
          pageSize: size,
          traceCode: cond.traceCode || undefined,
          batchNo: cond.batchNo || undefined,
          materialCode: cond.materialCode || undefined,
          materialBatchNo: cond.materialBatchNo || undefined,
          traceType: cond.traceType || undefined,
        };
        const res = await mfgService.bindingPage(params);
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

  const onSearch = (values: typeof search) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ traceType: 'SINGLE', unit: 'EA', quantity: 1, sourceSystem: 'MES' });
    setModalOpen(true);
  };

  const openEdit = (record: MfgTraceBindingItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgTraceBindingSaveParams = { ...values };
    setSubmitting(true);
    try {
      if (editing) {
        await mfgService.bindingUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await mfgService.bindingCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MfgTraceBindingItem) => {
    await mfgService.bindingRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<MfgTraceBindingItem> = [
    { title: '绑定编号', dataIndex: 'bindingNo', width: 150, fixed: 'left', render: (v) => v || '-' },
    { title: '追溯码', dataIndex: 'traceCode', width: 150, render: (v) => v || '-' },
    {
      title: '追溯类型',
      dataIndex: 'traceType',
      width: 100,
      render: (v?: string) => (v ? MFG_TRACE_TYPE_LABEL[v] || v : '-'),
    },
    { title: '生产批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '序列号', dataIndex: 'serialNo', width: 140, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 130, render: (v) => v || '-' },
    { title: '物料批次号', dataIndex: 'materialBatchNo', width: 140, render: (v) => v || '-' },
    { title: '供应商', dataIndex: 'materialSupplier', width: 120, render: (v) => v || '-' },
    { title: '装配工序', dataIndex: 'operationCode', width: 110, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'quantity', width: 80, render: (v) => (v ?? '-') },
    {
      title: '绑定时间',
      dataIndex: 'bindTime',
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
          {hasPermission('mfg:trace:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('mfg:trace:save') && (
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
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="traceCode" label="追溯码">
            <Input placeholder="请输入追溯码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="materialBatchNo" label="物料批次号">
            <Input placeholder="请输入物料批次号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="traceType" label="追溯类型">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={MFG_TRACE_TYPE_OPTIONS} />
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
        title={`追溯绑定（共 ${total} 条）`}
        extra={
          hasPermission('mfg:trace:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增绑定
            </Button>
          )
        }
      >
        <Table<MfgTraceBindingItem>
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
        title={editing ? '编辑追溯绑定' : '新增追溯绑定'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="bindingNo" label="绑定编号" extra="留空将自动生成">
            <Input placeholder="请输入绑定编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="traceCode" label="追溯码" rules={[{ required: true, message: '请输入追溯码' }]}>
            <Input placeholder="请输入追溯码" />
          </Form.Item>
          <Form.Item name="traceType" label="追溯类型">
            <Select placeholder="请选择" options={MFG_TRACE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="请输入生产批次号" />
          </Form.Item>
          <Form.Item name="serialNo" label="序列号">
            <Input placeholder="请输入序列号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="materialBatchNo" label="物料批次号">
            <Input placeholder="请输入物料批次号" />
          </Form.Item>
          <Form.Item name="materialSupplier" label="物料供应商">
            <Input placeholder="请输入物料供应商" />
          </Form.Item>
          <Form.Item name="operationCode" label="装配工序">
            <Input placeholder="请输入装配工序" />
          </Form.Item>
          <Form.Item name="quantity" label="数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="如 EA" />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="如 MES" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function MfgTracePage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        追溯查询
      </Title>
      <Tabs
        items={[
          { key: 'query', label: '正反向追溯', children: <TraceQueryTab /> },
          { key: 'binding', label: '追溯绑定', children: <TraceBindingTab /> },
        ]}
      />
    </Space>
  );
}
