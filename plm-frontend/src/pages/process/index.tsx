import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { processRouteService } from '@/services/processService';
import type {
  ProcessOperationItem,
  ProcessOperationSaveParams,
  ProcessRouteDetail,
  ProcessRouteItem,
} from '@/types/process';
import {
  PROCESS_STATUS_COLOR,
  PROCESS_STATUS_OPTIONS,
  PROCESS_STATUS_TEXT,
} from '@/types/process';
import type { InspectionSpecItem } from '@/types/inspection';
import { INSPECTION_TYPE_TEXT } from '@/types/inspection';

const { Title, Text } = Typography;

interface ProcessFormValues {
  routeCode: string;
  routeName: string;
  productCode?: string;
  productName?: string;
  versionNo?: string;
  processVersion?: string;
  status?: string;
  effectiveDate?: Dayjs;
  description?: string;
  remark?: string;
}

interface OperationRow {
  seqNo?: number;
  operationCode?: string;
  operationName?: string;
  workCenter?: string;
  processParams?: string;
  fixtureTooling?: string;
  workInstructionDocNo?: string;
  standardTime?: string;
  inspectionRequired?: boolean;
  inspectionSpecCode?: string;
  keyOperation?: boolean;
  remark?: string;
}

interface SearchState {
  routeCode?: string;
  productCode?: string;
  status?: string;
}

export default function ProcessRoutePage() {
  const [form] = Form.useForm<ProcessFormValues>();

  // 列表
  const [data, setData] = useState<ProcessRouteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  // 新增/编辑
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessRouteItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [operations, setOperations] = useState<OperationRow[]>([]);

  // 详情
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ProcessRouteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 按产品反查
  const [byProductCode, setByProductCode] = useState('');
  const [byProductOpen, setByProductOpen] = useState(false);
  const [byProductLoading, setByProductLoading] = useState(false);
  const [byProductResult, setByProductResult] = useState<ProcessRouteItem | null>(null);

  // 关联检验规范
  const [specOpen, setSpecOpen] = useState(false);
  const [specLoading, setSpecLoading] = useState(false);
  const [specTarget, setSpecTarget] = useState<InspectionSpecItem | null>(null);
  const [specMessage, setSpecMessage] = useState<string>('');

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await processRouteService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.routeCode || undefined,
          routeCode: cond.routeCode || undefined,
          productCode: cond.productCode || undefined,
          status: cond.status || undefined,
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
    form.setFieldsValue({ status: 'draft' });
    setOperations([]);
    setModalOpen(true);
  };

  const openEdit = async (record: ProcessRouteItem) => {
    setEditing(record);
    form.resetFields();
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await processRouteService.detail(record.id);
      form.setFieldsValue({
        routeCode: res.route.routeCode,
        routeName: res.route.routeName,
        productCode: res.route.productCode,
        productName: res.route.productName,
        versionNo: res.route.versionNo,
        processVersion: res.route.processVersion,
        status: res.route.status,
        effectiveDate: res.route.effectiveDate ? dayjs(res.route.effectiveDate) : undefined,
        description: res.route.description,
        remark: res.route.remark,
      });
      setOperations(
        (res.operations || []).map((op) => ({
          seqNo: op.seqNo,
          operationCode: op.operationCode,
          operationName: op.operationName,
          workCenter: op.workCenter,
          processParams: op.processParams,
          fixtureTooling: op.fixtureTooling,
          workInstructionDocNo: op.workInstructionDocNo,
          standardTime: op.standardTime,
          inspectionRequired: op.inspectionRequired === 1,
          inspectionSpecCode: op.inspectionSpecCode,
          keyOperation: op.keyOperation === 1,
          remark: op.remark,
        })),
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const updateOperation = (index: number, field: keyof OperationRow, value: unknown) => {
    setOperations((prev) =>
      prev.map((row, i) => (i === index ? ({ ...row, [field]: value } as OperationRow) : row)),
    );
  };

  const addOperation = () => {
    setOperations((prev) => [...prev, { inspectionRequired: false, keyOperation: false }]);
  };

  const removeOperation = (index: number) => {
    setOperations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      routeCode: values.routeCode,
      routeName: values.routeName,
      productCode: values.productCode,
      productName: values.productName,
      versionNo: values.versionNo,
      processVersion: values.processVersion,
      status: values.status,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      description: values.description,
      remark: values.remark,
      operations: operations
        .filter(
          (op) =>
            (op.operationCode && op.operationCode.trim()) ||
            (op.operationName && op.operationName.trim()),
        )
        .map<ProcessOperationSaveParams>((op) => ({
          seqNo: op.seqNo,
          operationCode: op.operationCode || '',
          operationName: op.operationName || '',
          workCenter: op.workCenter,
          processParams: op.processParams,
          fixtureTooling: op.fixtureTooling,
          workInstructionDocNo: op.workInstructionDocNo,
          standardTime: op.standardTime,
          inspectionRequired: op.inspectionRequired ? 1 : 0,
          inspectionSpecCode: op.inspectionSpecCode,
          keyOperation: op.keyOperation ? 1 : 0,
          remark: op.remark,
        })),
    };
    setSubmitting(true);
    try {
      if (editing) {
        await processRouteService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await processRouteService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: ProcessRouteItem) => {
    await processRouteService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleRelease = async (record: ProcessRouteItem) => {
    await processRouteService.release(record.id);
    message.success('发布成功');
    void loadData();
  };

  const openDetail = async (record: ProcessRouteItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await processRouteService.detail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleByProduct = async () => {
    if (!byProductCode.trim()) {
      message.warning('请输入产品编码');
      return;
    }
    setByProductOpen(true);
    setByProductResult(null);
    setByProductLoading(true);
    try {
      const res = await processRouteService.byProduct(byProductCode.trim());
      setByProductResult(res || null);
    } finally {
      setByProductLoading(false);
    }
  };

  const openOperationSpec = async (operation: ProcessOperationItem) => {
    if (!detail) return;
    setSpecOpen(true);
    setSpecTarget(null);
    setSpecMessage('');
    setSpecLoading(true);
    try {
      const res = await processRouteService.operationInspectionSpec(
        detail.route.id,
        operation.id,
      );
      // 兼容后端 { spec, message } 包装结构与直接返回规范对象两种情况
      if (res && typeof res === 'object' && 'spec' in res) {
        const wrapper = res as { spec?: InspectionSpecItem | null; message?: string };
        setSpecTarget(wrapper.spec || null);
        setSpecMessage(wrapper.message || '');
      } else {
        setSpecTarget((res as InspectionSpecItem) || null);
      }
    } finally {
      setSpecLoading(false);
    }
  };

  const routeColumns: ColumnsType<ProcessRouteItem> = [
    { title: '路线编码', dataIndex: 'routeCode', width: 150 },
    { title: '路线名称', dataIndex: 'routeName', width: 180 },
    { title: '产品编码', dataIndex: 'productCode', width: 130, render: (v) => v || '-' },
    { title: '产品名称', dataIndex: 'productName', width: 160, render: (v) => v || '-' },
    { title: '版本号', dataIndex: 'versionNo', width: 90, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={PROCESS_STATUS_COLOR[v] || 'default'}>{PROCESS_STATUS_TEXT[v] || v}</Tag> : '-',
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          {record.status !== 'released' && (
            <Popconfirm title="确认发布该工艺路线？" onConfirm={() => handleRelease(record)}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
          )}
          <Popconfirm title="确认删除该工艺路线？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const operationColumns: ColumnsType<ProcessOperationItem> = [
    { title: '序号', dataIndex: 'seqNo', width: 70, render: (v) => (v ?? '-') },
    { title: '工序编码', dataIndex: 'operationCode', width: 130 },
    { title: '工序名称', dataIndex: 'operationName', width: 150 },
    { title: '工作中心', dataIndex: 'workCenter', width: 120, render: (v) => v || '-' },
    { title: '工艺参数', dataIndex: 'processParams', width: 140, render: (v) => v || '-' },
    { title: '工装夹具', dataIndex: 'fixtureTooling', width: 120, render: (v) => v || '-' },
    { title: '指导书图号', dataIndex: 'workInstructionDocNo', width: 140, render: (v) => v || '-' },
    { title: '标准工时', dataIndex: 'standardTime', width: 100, render: (v) => v || '-' },
    {
      title: '需要检验',
      dataIndex: 'inspectionRequired',
      width: 90,
      render: (v?: number) => (v === 1 ? <Tag color="processing">是</Tag> : <Tag>否</Tag>),
    },
    { title: '检验规范编码', dataIndex: 'inspectionSpecCode', width: 140, render: (v) => v || '-' },
    {
      title: '关键工序',
      dataIndex: 'keyOperation',
      width: 90,
      render: (v?: number) => (v === 1 ? <Tag color="warning">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openOperationSpec(record)}>
          查看关联检验规范
        </Button>
      ),
    },
  ];

  const operationEditColumns: ColumnsType<OperationRow> = [
    {
      title: '序号',
      dataIndex: 'seqNo',
      width: 80,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          min={1}
          style={{ width: '100%' }}
          onChange={(val) => updateOperation(index, 'seqNo', val ?? undefined)}
        />
      ),
    },
    {
      title: '工序编码',
      dataIndex: 'operationCode',
      width: 130,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          placeholder="必填"
          onChange={(e) => updateOperation(index, 'operationCode', e.target.value)}
        />
      ),
    },
    {
      title: '工序名称',
      dataIndex: 'operationName',
      width: 150,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          placeholder="必填"
          onChange={(e) => updateOperation(index, 'operationName', e.target.value)}
        />
      ),
    },
    {
      title: '工作中心',
      dataIndex: 'workCenter',
      width: 130,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateOperation(index, 'workCenter', e.target.value)} />
      ),
    },
    {
      title: '工艺参数',
      dataIndex: 'processParams',
      width: 140,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateOperation(index, 'processParams', e.target.value)} />
      ),
    },
    {
      title: '工装夹具',
      dataIndex: 'fixtureTooling',
      width: 130,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          onChange={(e) => updateOperation(index, 'fixtureTooling', e.target.value)}
        />
      ),
    },
    {
      title: '指导书图号',
      dataIndex: 'workInstructionDocNo',
      width: 140,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          onChange={(e) => updateOperation(index, 'workInstructionDocNo', e.target.value)}
        />
      ),
    },
    {
      title: '标准工时',
      dataIndex: 'standardTime',
      width: 110,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          onChange={(e) => updateOperation(index, 'standardTime', e.target.value)}
        />
      ),
    },
    {
      title: '需要检验',
      dataIndex: 'inspectionRequired',
      width: 110,
      render: (v: boolean, _r, index) => (
        <Switch checked={!!v} onChange={(val) => updateOperation(index, 'inspectionRequired', val)} />
      ),
    },
    {
      title: '检验规范编码',
      dataIndex: 'inspectionSpecCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input
          value={v}
          onChange={(e) => updateOperation(index, 'inspectionSpecCode', e.target.value)}
        />
      ),
    },
    {
      title: '关键工序',
      dataIndex: 'keyOperation',
      width: 100,
      render: (v: boolean, _r, index) => (
        <Switch checked={!!v} onChange={(val) => updateOperation(index, 'keyOperation', val)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_, __, index) => (
        <Button type="link" size="small" danger onClick={() => removeOperation(index)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        工艺路线
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="routeCode" label="路线编码">
            <Input placeholder="路线编码" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="产品编码" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={PROCESS_STATUS_OPTIONS} />
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

      <Card>
        <Space wrap>
          <Text>按产品反查有效路线：</Text>
          <Input
            placeholder="请输入产品编码"
            allowClear
            style={{ width: 200 }}
            value={byProductCode}
            onChange={(e) => setByProductCode(e.target.value)}
          />
          <Button type="default" loading={byProductLoading} onClick={handleByProduct}>
            反查
          </Button>
        </Space>
      </Card>

      <Card
        title={`工艺路线列表（共 ${total} 条）`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增工艺路线
          </Button>
        }
      >
        <Table<ProcessRouteItem>
          rowKey="id"
          loading={loading}
          columns={routeColumns}
          dataSource={data}
          scroll={{ x: 1400 }}
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

      {/* 新增/编辑工艺路线 */}
      <Modal
        title={editing ? '编辑工艺路线' : '新增工艺路线'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={1100}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Space size="middle" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Form.Item
              name="routeCode"
              label="路线编码"
              rules={[{ required: true, message: '请输入路线编码' }]}
              style={{ width: 260 }}
            >
              <Input placeholder="请输入路线编码" disabled={!!editing} />
            </Form.Item>
            <Form.Item
              name="routeName"
              label="路线名称"
              rules={[{ required: true, message: '请输入路线名称' }]}
              style={{ width: 260 }}
            >
              <Input placeholder="请输入路线名称" />
            </Form.Item>
            <Form.Item name="productCode" label="产品编码" style={{ width: 220 }}>
              <Input placeholder="请输入产品编码" />
            </Form.Item>
            <Form.Item name="productName" label="产品名称" style={{ width: 220 }}>
              <Input placeholder="请输入产品名称" />
            </Form.Item>
            <Form.Item name="versionNo" label="版本号" style={{ width: 160 }}>
              <Input placeholder="默认为 V1" />
            </Form.Item>
            <Form.Item name="processVersion" label="工艺版本" style={{ width: 160 }}>
              <Input placeholder="请输入工艺版本" />
            </Form.Item>
            <Form.Item name="status" label="状态" style={{ width: 160 }}>
              <Select options={PROCESS_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item name="effectiveDate" label="生效日期" style={{ width: 180 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>

        <Space style={{ marginBottom: 8 }}>
          <Text strong>工序明细</Text>
          <Button icon={<PlusOutlined />} onClick={addOperation}>
            添加工序
          </Button>
        </Space>
        <Table<OperationRow>
          rowKey={(_, index) => String(index)}
          columns={operationEditColumns}
          dataSource={operations}
          size="small"
          pagination={false}
          scroll={{ x: 1500 }}
        />
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title={`工艺路线详情 - ${detail?.route.routeCode || ''}`}
        width={1000}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" title="基本信息" loading={detailLoading}>
            {detail && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'routeCode', label: '路线编码', children: detail.route.routeCode },
                  { key: 'routeName', label: '路线名称', children: detail.route.routeName },
                  { key: 'productCode', label: '产品编码', children: detail.route.productCode || '-' },
                  { key: 'productName', label: '产品名称', children: detail.route.productName || '-' },
                  { key: 'versionNo', label: '版本号', children: detail.route.versionNo || '-' },
                  {
                    key: 'processVersion',
                    label: '工艺版本',
                    children: detail.route.processVersion || '-',
                  },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={PROCESS_STATUS_COLOR[detail.route.status || ''] || 'default'}>
                        {PROCESS_STATUS_TEXT[detail.route.status || ''] || detail.route.status}
                      </Tag>
                    ),
                  },
                  {
                    key: 'effectiveDate',
                    label: '生效日期',
                    children: detail.route.effectiveDate
                      ? dayjs(detail.route.effectiveDate).format('YYYY-MM-DD')
                      : '-',
                  },
                  { key: 'description', label: '描述', span: 2, children: detail.route.description || '-' },
                  { key: 'remark', label: '备注', span: 2, children: detail.route.remark || '-' },
                ]}
              />
            )}
          </Card>

          <Card size="small" title={`工序明细（${detail?.operations.length || 0}）`}>
            <Table<ProcessOperationItem>
              rowKey="id"
              size="small"
              columns={operationColumns}
              dataSource={detail?.operations || []}
              pagination={false}
              scroll={{ x: 1500 }}
            />
          </Card>
        </Space>
      </Drawer>

      {/* 按产品反查结果 */}
      <Modal
        title="按产品反查有效工艺路线"
        open={byProductOpen}
        footer={null}
        onCancel={() => setByProductOpen(false)}
        destroyOnClose
        width={640}
      >
        {byProductLoading ? (
          <Text type="secondary">查询中…</Text>
        ) : byProductResult ? (
          <Descriptions
            size="small"
            bordered
            column={1}
            items={[
              { key: 'routeCode', label: '路线编码', children: byProductResult.routeCode },
              { key: 'routeName', label: '路线名称', children: byProductResult.routeName },
              { key: 'productCode', label: '产品编码', children: byProductResult.productCode || '-' },
              { key: 'versionNo', label: '版本号', children: byProductResult.versionNo || '-' },
              {
                key: 'status',
                label: '状态',
                children: (
                  <Tag color={PROCESS_STATUS_COLOR[byProductResult.status || ''] || 'default'}>
                    {PROCESS_STATUS_TEXT[byProductResult.status || ''] || byProductResult.status}
                  </Tag>
                ),
              },
            ]}
          />
        ) : (
          <Alert type="info" showIcon message={`未找到产品「${byProductCode}」的有效（已发布）工艺路线`} />
        )}
      </Modal>

      {/* 关联检验规范 */}
      <Modal
        title="关联检验规范"
        open={specOpen}
        footer={null}
        onCancel={() => setSpecOpen(false)}
        destroyOnClose
        width={720}
      >
        {specLoading ? (
          <Text type="secondary">查询中…</Text>
        ) : specTarget ? (
          <Descriptions
            size="small"
            bordered
            column={2}
            items={[
              { key: 'specCode', label: '规范编码', children: specTarget.specCode },
              { key: 'specName', label: '规范名称', children: specTarget.specName },
              {
                key: 'inspectionType',
                label: '检验类型',
                children: specTarget.inspectionType
                  ? INSPECTION_TYPE_TEXT[specTarget.inspectionType] || specTarget.inspectionType
                  : '-',
              },
              {
                key: 'versionNo',
                label: '版本号',
                children: specTarget.versionNo || '-',
              },
              { key: 'productCode', label: '产品编码', children: specTarget.productCode || '-' },
              { key: 'materialCode', label: '物料编码', children: specTarget.materialCode || '-' },
              { key: 'samplingPlan', label: '抽样方案', children: specTarget.samplingPlan || '-' },
              { key: 'aqlLevel', label: 'AQL 水平', children: specTarget.aqlLevel || '-' },
            ]}
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message={specMessage || '该工序未关联检验规范或检验规范不存在'}
          />
        )}
      </Modal>
    </Space>
  );
}
