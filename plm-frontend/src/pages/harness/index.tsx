import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
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
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { harnessService } from '@/services/harnessService';
import type {
  HarnessDetail,
  HarnessItem,
  HarnessSaveParams,
  HarnessTerminalItem,
} from '@/types/harness';
import { SPEC_STATUS_LABEL, SPEC_STATUS_OPTIONS } from '@/types/spec';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 规格状态标签颜色（线束复用 draft/released/obsolete） */
const HARNESS_STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  released: 'success',
  obsolete: 'error',
};

interface HarnessFormValues {
  harnessCode: string;
  harnessName: string;
  productCode?: string;
  materialCode?: string;
  bomHeaderId?: number;
  bomCode?: string;
  bomPosition?: string;
  docNo?: string;
  totalLength?: number;
  connectorQty?: number;
  status?: string;
  description?: string;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  harnessCode?: string;
  productCode?: string;
  materialCode?: string;
  status?: string;
}

export default function HarnessPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<HarnessFormValues>();

  const [data, setData] = useState<HarnessItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HarnessItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [terminals, setTerminals] = useState<HarnessTerminalItem[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<HarnessDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await harnessService.page({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          harnessCode: cond.harnessCode || undefined,
          productCode: cond.productCode || undefined,
          materialCode: cond.materialCode || undefined,
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

  const addTerminal = () => {
    setTerminals((prev) => [...prev, { seqNo: prev.length + 1 }]);
  };

  const updateTerminal = (index: number, patch: Partial<HarnessTerminalItem>) => {
    setTerminals((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeTerminal = (index: number) => {
    setTerminals((prev) => prev.filter((_, i) => i !== index));
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'draft' });
    setTerminals([]);
    setModalOpen(true);
  };

  const openEdit = async (record: HarnessItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      harnessCode: record.harnessCode,
      harnessName: record.harnessName,
      productCode: record.productCode,
      materialCode: record.materialCode,
      bomHeaderId: record.bomHeaderId,
      bomCode: record.bomCode,
      bomPosition: record.bomPosition,
      docNo: record.docNo,
      totalLength: record.totalLength,
      connectorQty: record.connectorQty,
      status: record.status,
      description: record.description,
      remark: record.remark,
    });
    setTerminals([]);
    setModalOpen(true);
    const res = await harnessService.detail(record.id);
    setTerminals(res.terminals || []);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: HarnessSaveParams = {
      harnessCode: values.harnessCode,
      harnessName: values.harnessName,
      productCode: values.productCode,
      materialCode: values.materialCode,
      bomHeaderId: values.bomHeaderId,
      bomCode: values.bomCode,
      bomPosition: values.bomPosition,
      docNo: values.docNo,
      totalLength: values.totalLength,
      connectorQty: values.connectorQty,
      status: values.status,
      description: values.description,
      remark: values.remark,
      terminals: terminals.map((row) => ({
        seqNo: row.seqNo,
        wireMaterialCode: row.wireMaterialCode,
        wireSpec: row.wireSpec,
        wireColor: row.wireColor,
        wireLength: row.wireLength,
        terminalMaterialCode: row.terminalMaterialCode,
        terminalName: row.terminalName,
        sheathMaterialCode: row.sheathMaterialCode,
        sheathName: row.sheathName,
        fromConnector: row.fromConnector,
        fromPin: row.fromPin,
        toConnector: row.toConnector,
        toPin: row.toPin,
        assembleRequirement: row.assembleRequirement,
        remark: row.remark,
      })),
    };
    setSubmitting(true);
    try {
      if (editing) {
        await harnessService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await harnessService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: HarnessItem) => {
    await harnessService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const handleRelease = async (record: HarnessItem) => {
    await harnessService.release(record.id);
    message.success('已发布');
    void loadData();
  };

  const openDetail = async (record: HarnessItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await harnessService.detail(record.id);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<HarnessItem> = [
    { title: '线束编码', dataIndex: 'harnessCode', width: 170 },
    { title: '线束名称', dataIndex: 'harnessName', width: 160 },
    { title: '产品编码', dataIndex: 'productCode', width: 140, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: 'BOM 编码', dataIndex: 'bomCode', width: 130, render: (v) => v || '-' },
    { title: '关联图号', dataIndex: 'docNo', width: 130, render: (v) => v || '-' },
    { title: '总长度', dataIndex: 'totalLength', width: 100, render: (v) => (v ?? '-') },
    { title: '连接器数', dataIndex: 'connectorQty', width: 100, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={HARNESS_STATUS_COLOR[v] || 'default'}>{SPEC_STATUS_LABEL[v] || v}</Tag> : '-',
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
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            详情
          </Button>
          {hasPermission('harness:update') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('harness:update') && (
            <Popconfirm title="确认发布该线束？" onConfirm={() => handleRelease(record)}>
              <Button type="link" size="small" disabled={record.status === 'released'}>
                发布
              </Button>
            </Popconfirm>
          )}
          {hasPermission('harness:delete') && (
            <Popconfirm title="确认删除该线束？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const terminalEditColumns: ColumnsType<HarnessTerminalItem> = [
    {
      title: '序号',
      dataIndex: 'seqNo',
      width: 80,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateTerminal(index, { seqNo: val ?? undefined })}
        />
      ),
    },
    {
      title: '导线物料编码',
      dataIndex: 'wireMaterialCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { wireMaterialCode: e.target.value })} />
      ),
    },
    {
      title: '导线规格',
      dataIndex: 'wireSpec',
      width: 110,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { wireSpec: e.target.value })} />
      ),
    },
    {
      title: '导线颜色',
      dataIndex: 'wireColor',
      width: 100,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { wireColor: e.target.value })} />
      ),
    },
    {
      title: '导线长度',
      dataIndex: 'wireLength',
      width: 100,
      render: (v: number, _r, index) => (
        <InputNumber
          value={v}
          style={{ width: '100%' }}
          onChange={(val) => updateTerminal(index, { wireLength: val ?? undefined })}
        />
      ),
    },
    {
      title: '端子物料编码',
      dataIndex: 'terminalMaterialCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { terminalMaterialCode: e.target.value })} />
      ),
    },
    {
      title: '端子名称',
      dataIndex: 'terminalName',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { terminalName: e.target.value })} />
      ),
    },
    {
      title: '护套物料编码',
      dataIndex: 'sheathMaterialCode',
      width: 150,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { sheathMaterialCode: e.target.value })} />
      ),
    },
    {
      title: '护套名称',
      dataIndex: 'sheathName',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { sheathName: e.target.value })} />
      ),
    },
    {
      title: '起始连接器',
      dataIndex: 'fromConnector',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { fromConnector: e.target.value })} />
      ),
    },
    {
      title: '起始针脚',
      dataIndex: 'fromPin',
      width: 100,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { fromPin: e.target.value })} />
      ),
    },
    {
      title: '目标连接器',
      dataIndex: 'toConnector',
      width: 120,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { toConnector: e.target.value })} />
      ),
    },
    {
      title: '目标针脚',
      dataIndex: 'toPin',
      width: 100,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { toPin: e.target.value })} />
      ),
    },
    {
      title: '装配要求',
      dataIndex: 'assembleRequirement',
      width: 160,
      render: (v: string, _r, index) => (
        <Input value={v} onChange={(e) => updateTerminal(index, { assembleRequirement: e.target.value })} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, __, index) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => removeTerminal(index)}>
          删除
        </Button>
      ),
    },
  ];

  const terminalReadColumns: ColumnsType<HarnessTerminalItem> = [
    { title: '序号', dataIndex: 'seqNo', width: 70, render: (v) => (v ?? '-') },
    { title: '导线物料编码', dataIndex: 'wireMaterialCode', width: 150, render: (v) => v || '-' },
    { title: '导线规格', dataIndex: 'wireSpec', width: 110, render: (v) => v || '-' },
    { title: '导线颜色', dataIndex: 'wireColor', width: 100, render: (v) => v || '-' },
    { title: '导线长度', dataIndex: 'wireLength', width: 100, render: (v) => (v ?? '-') },
    { title: '端子物料编码', dataIndex: 'terminalMaterialCode', width: 150, render: (v) => v || '-' },
    { title: '端子名称', dataIndex: 'terminalName', width: 120, render: (v) => v || '-' },
    { title: '护套物料编码', dataIndex: 'sheathMaterialCode', width: 150, render: (v) => v || '-' },
    { title: '护套名称', dataIndex: 'sheathName', width: 120, render: (v) => v || '-' },
    { title: '起始连接器', dataIndex: 'fromConnector', width: 120, render: (v) => v || '-' },
    { title: '起始针脚', dataIndex: 'fromPin', width: 100, render: (v) => v || '-' },
    { title: '目标连接器', dataIndex: 'toConnector', width: 120, render: (v) => v || '-' },
    { title: '目标针脚', dataIndex: 'toPin', width: 100, render: (v) => v || '-' },
    { title: '装配要求', dataIndex: 'assembleRequirement', width: 160, render: (v) => v || '-' },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        线束端子
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="线束编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="harnessCode" label="线束编码">
            <Input placeholder="线束编码" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="产品编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="按物料筛选" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={SPEC_STATUS_OPTIONS} />
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
        title={`线束列表（共 ${total} 条）`}
        extra={
          hasPermission('harness:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增线束
            </Button>
          )
        }
      >
        <Table<HarnessItem>
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

      {/* 新增/编辑线束 */}
      <Modal
        title={editing ? '编辑线束' : '新增线束'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={1400}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="harnessCode" label="线束编码" rules={[{ required: true, message: '请输入线束编码' }]}>
            <Input placeholder="请输入线束编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="harnessName" label="线束名称" rules={[{ required: true, message: '请输入线束名称' }]}>
            <Input placeholder="请输入线束名称" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="bomHeaderId" label="BOM 头 ID">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="bomCode" label="BOM 编码">
            <Input placeholder="请输入 BOM 编码" />
          </Form.Item>
          <Form.Item name="bomPosition" label="BOM 位置">
            <Input placeholder="请输入 BOM 位置" />
          </Form.Item>
          <Form.Item name="docNo" label="关联图号">
            <Input placeholder="请输入关联图号" />
          </Form.Item>
          <Form.Item name="totalLength" label="线束总长度">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="connectorQty" label="连接器数量">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={SPEC_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Button icon={<PlusOutlined />} onClick={addTerminal}>
                新增端子
              </Button>
            </Space>
            <Table<HarnessTerminalItem>
              rowKey={(_, index) => String(index)}
              columns={terminalEditColumns}
              dataSource={terminals}
              size="small"
              pagination={false}
              scroll={{ x: 1700 }}
            />
          </div>
        </Form>
      </Modal>

      {/* 线束详情 */}
      <Drawer
        title={`线束详情 - ${detail?.harness.harnessCode || ''}`}
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
                  { key: 'harnessCode', label: '线束编码', children: detail.harness.harnessCode },
                  { key: 'harnessName', label: '线束名称', children: detail.harness.harnessName },
                  { key: 'productCode', label: '产品编码', children: detail.harness.productCode || '-' },
                  { key: 'materialCode', label: '物料编码', children: detail.harness.materialCode || '-' },
                  { key: 'bomCode', label: 'BOM 编码', children: detail.harness.bomCode || '-' },
                  { key: 'bomPosition', label: 'BOM 位置', children: detail.harness.bomPosition || '-' },
                  { key: 'docNo', label: '关联图号', children: detail.harness.docNo || '-' },
                  { key: 'totalLength', label: '线束总长度', children: detail.harness.totalLength ?? '-' },
                  { key: 'connectorQty', label: '连接器数量', children: detail.harness.connectorQty ?? '-' },
                  {
                    key: 'status',
                    label: '状态',
                    children: (
                      <Tag color={HARNESS_STATUS_COLOR[detail.harness.status || ''] || 'default'}>
                        {SPEC_STATUS_LABEL[detail.harness.status || ''] || detail.harness.status}
                      </Tag>
                    ),
                  },
                  { key: 'description', label: '描述', children: detail.harness.description || '-' },
                  { key: 'remark', label: '备注', children: detail.harness.remark || '-' },
                ]}
              />
            )}
          </Card>
          <Card size="small" title="端子清单">
            <Table<HarnessTerminalItem>
              rowKey={(record, index) => `${record.id ?? 'new'}-${index}`}
              columns={terminalReadColumns}
              dataSource={detail?.terminals || []}
              size="small"
              pagination={false}
              scroll={{ x: 1650 }}
            />
          </Card>
        </Space>
      </Drawer>
    </Space>
  );
}
