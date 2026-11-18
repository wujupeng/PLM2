import { useCallback, useEffect, useState } from 'react';
import {
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
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { ediService } from '@/services/ediService';
import {
  EDI_ASN_STATUS_COLOR,
  EDI_ASN_STATUS_LABEL,
  EDI_ASN_STATUS_OPTIONS,
  EDI_ASN_TYPE_OPTIONS,
  type EdiAsnDetail,
  type EdiAsnItem,
  type EdiAsnLineItem,
  type EdiAsnSaveParams,
} from '@/types/edi';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** ASN 类型中文名映射（取自 EDI_ASN_TYPE_OPTIONS，找不到时回退类型码） */
const ASN_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  EDI_ASN_TYPE_OPTIONS.map((item) => [item.value, item.label]),
);

/** ASN 查询条件 */
interface AsnSearchState {
  keyword?: string;
  asnNo?: string;
  demandNo?: string;
  supplierCode?: string;
  customerCode?: string;
  status?: string;
}

/** ASN 表单值（DatePicker 使用 Dayjs） */
interface AsnFormValues {
  asnNo?: string;
  demandNo?: string;
  dispatchNo?: string;
  transCode?: string;
  asnType?: string;
  customerCode?: string;
  supplierCode?: string;
  shipTo?: string;
  carrier?: string;
  trackingNo?: string;
  plateNo?: string;
  shipDate?: Dayjs;
  etaDate?: Dayjs;
  packageCount?: number;
  remark?: string;
  lines?: {
    lineNo?: number;
    materialCode?: string;
    qty?: number;
    unit?: string;
    batchNo?: string;
    packageCode?: string;
    boxCode?: string;
  }[];
}

export default function EdiAsnPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<AsnFormValues>();

  const [data, setData] = useState<EdiAsnItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<AsnSearchState>({});

  /* 详情 Drawer */
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<EdiAsnDetail | null>(null);

  /* 新增/编辑 Modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EdiAsnItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await ediService.asnPage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          asnNo: cond.asnNo || undefined,
          demandNo: cond.demandNo || undefined,
          supplierCode: cond.supplierCode || undefined,
          customerCode: cond.customerCode || undefined,
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

  const onSearch = (values: AsnSearchState) => {
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

  /** 打开详情 Drawer */
  const openDetail = async (record: EdiAsnItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await ediService.asnDetail(record.asnNo);
      setDetail(res);
    } finally {
      setDetailLoading(false);
    }
  };

  /** 新建 */
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ transCode: '856', asnType: 'OUTBOUND', lines: [] });
    setModalOpen(true);
  };

  /** 编辑（先拉取详情回填，含明细行） */
  const openEdit = async (record: EdiAsnItem) => {
    const res = await ediService.asnDetail(record.asnNo);
    const asn = res.asn;
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      asnNo: asn.asnNo,
      demandNo: asn.demandNo,
      dispatchNo: asn.dispatchNo,
      transCode: asn.transCode,
      asnType: asn.asnType,
      customerCode: asn.customerCode,
      supplierCode: asn.supplierCode,
      shipTo: asn.shipTo,
      carrier: asn.carrier,
      trackingNo: asn.trackingNo,
      plateNo: asn.plateNo,
      shipDate: asn.shipDate ? dayjs(asn.shipDate) : undefined,
      etaDate: asn.etaDate ? dayjs(asn.etaDate) : undefined,
      packageCount: asn.packageCount,
      remark: asn.remark,
      lines: (res.lines || []).map((line) => ({
        lineNo: line.lineNo,
        materialCode: line.materialCode,
        qty: line.qty,
        unit: line.unit,
        batchNo: line.batchNo,
        packageCode: line.packageCode,
        boxCode: line.boxCode,
      })),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: EdiAsnSaveParams = {
      asnNo: values.asnNo,
      demandNo: values.demandNo,
      dispatchNo: values.dispatchNo,
      transCode: values.transCode,
      asnType: values.asnType,
      customerCode: values.customerCode,
      supplierCode: values.supplierCode,
      shipTo: values.shipTo,
      carrier: values.carrier,
      trackingNo: values.trackingNo,
      plateNo: values.plateNo,
      shipDate: values.shipDate ? dayjs(values.shipDate).format('YYYY-MM-DD') : undefined,
      etaDate: values.etaDate ? dayjs(values.etaDate).format('YYYY-MM-DD') : undefined,
      packageCount: values.packageCount,
      remark: values.remark,
      lines: values.lines,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await ediService.asnUpdate(editing.asnNo, payload);
        message.success('更新成功');
      } else {
        await ediService.asnCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  /** 发送 */
  const handleSend = async (record: EdiAsnItem) => {
    await ediService.asnSend(record.asnNo);
    message.success('发送成功');
    void loadData();
  };

  /** 取消 */
  const handleCancel = async (record: EdiAsnItem) => {
    await ediService.asnCancel(record.asnNo);
    message.success('取消成功');
    void loadData();
  };

  const columns: ColumnsType<EdiAsnItem> = [
    { title: 'ASN 编号', dataIndex: 'asnNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '需求编号', dataIndex: 'demandNo', width: 170, render: (v) => v || '-' },
    { title: '分发编号', dataIndex: 'dispatchNo', width: 180, render: (v) => v || '-' },
    { title: '交易代码', dataIndex: 'transCode', width: 110, render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'asnType',
      width: 130,
      render: (v?: string) => (v ? ASN_TYPE_LABEL[v] || v : '-'),
    },
    { title: '供应商', dataIndex: 'supplierCode', width: 140, render: (v) => v || '-' },
    { title: '客户', dataIndex: 'customerCode', width: 140, render: (v) => v || '-' },
    { title: '收货地址', dataIndex: 'shipTo', width: 180, render: (v) => v || '-' },
    { title: '承运商', dataIndex: 'carrier', width: 140, render: (v) => v || '-' },
    { title: '运单号', dataIndex: 'trackingNo', width: 160, render: (v) => v || '-' },
    { title: '车牌号', dataIndex: 'plateNo', width: 120, render: (v) => v || '-' },
    { title: '发货日期', dataIndex: 'shipDate', width: 120, render: (v) => v || '-' },
    { title: '预计到达', dataIndex: 'etaDate', width: 120, render: (v) => v || '-' },
    { title: '总数量', dataIndex: 'totalQty', width: 100, render: (v) => (v ?? '-') },
    { title: '箱数', dataIndex: 'packageCount', width: 90, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={EDI_ASN_STATUS_COLOR[v] || 'default'}>{EDI_ASN_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission('edi:asn:save') && (
            <Button type="link" size="small" onClick={() => void openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('edi:asn:send') && (
            <Popconfirm title="确认发送该 ASN？" onConfirm={() => handleSend(record)}>
              <Button type="link" size="small">
                发送
              </Button>
            </Popconfirm>
          )}
          {hasPermission('edi:asn:save') && (
            <Popconfirm title="确认取消该 ASN？" onConfirm={() => handleCancel(record)}>
              <Button type="link" size="small" danger>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const lineColumns: ColumnsType<EdiAsnLineItem> = [
    { title: '行号', dataIndex: 'lineNo', width: 80, render: (v) => (v ?? '-') },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'qty', width: 100, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 90, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '包装编码', dataIndex: 'packageCode', width: 150, render: (v) => v || '-' },
    { title: '箱码', dataIndex: 'boxCode', width: 150, render: (v) => v || '-' },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        ASN 交付通知
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="编号 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="asnNo" label="ASN 编号">
            <Input placeholder="请输入 ASN 编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="demandNo" label="需求编号">
            <Input placeholder="请输入需求编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商">
            <Input placeholder="请输入供应商编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户">
            <Input placeholder="请输入客户编码" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 150 }} options={EDI_ASN_STATUS_OPTIONS} />
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
        title={`ASN 交付列表（共 ${total} 条）`}
        extra={
          hasPermission('edi:asn:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建 ASN
            </Button>
          )
        }
      >
        <Table<EdiAsnItem>
          rowKey="asnNo"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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

      {/* ASN 详情 */}
      <Drawer
        title={`ASN 详情 - ${detail?.asn?.asnNo || ''}`}
        width={820}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small" title="主表信息" loading={detailLoading}>
            {detail?.asn && (
              <Descriptions
                size="small"
                bordered
                column={2}
                items={[
                  { key: 'asnNo', label: 'ASN 编号', children: detail.asn.asnNo || '-' },
                  { key: 'demandNo', label: '需求编号', children: detail.asn.demandNo || '-' },
                  { key: 'dispatchNo', label: '分发编号', children: detail.asn.dispatchNo || '-' },
                  { key: 'transCode', label: '交易代码', children: detail.asn.transCode || '-' },
                  {
                    key: 'asnType',
                    label: '类型',
                    children: detail.asn.asnType ? ASN_TYPE_LABEL[detail.asn.asnType] || detail.asn.asnType : '-',
                  },
                  { key: 'supplierCode', label: '供应商', children: detail.asn.supplierCode || '-' },
                  { key: 'customerCode', label: '客户', children: detail.asn.customerCode || '-' },
                  { key: 'shipTo', label: '收货地址', children: detail.asn.shipTo || '-' },
                  { key: 'carrier', label: '承运商', children: detail.asn.carrier || '-' },
                  { key: 'trackingNo', label: '运单号', children: detail.asn.trackingNo || '-' },
                  { key: 'plateNo', label: '车牌号', children: detail.asn.plateNo || '-' },
                  { key: 'shipDate', label: '发货日期', children: detail.asn.shipDate || '-' },
                  { key: 'etaDate', label: '预计到达', children: detail.asn.etaDate || '-' },
                  { key: 'totalQty', label: '总数量', children: detail.asn.totalQty ?? '-' },
                  { key: 'packageCount', label: '箱数', children: detail.asn.packageCount ?? '-' },
                  {
                    key: 'status',
                    label: '状态',
                    children: detail.asn.status ? (
                      <Tag color={EDI_ASN_STATUS_COLOR[detail.asn.status] || 'default'}>
                        {EDI_ASN_STATUS_LABEL[detail.asn.status] || detail.asn.status}
                      </Tag>
                    ) : (
                      '-'
                    ),
                  },
                  {
                    key: 'sendAt',
                    label: '发送时间',
                    children: detail.asn.sendAt ? dayjs(detail.asn.sendAt).format('YYYY-MM-DD HH:mm:ss') : '-',
                  },
                  {
                    key: 'ackAt',
                    label: '回执时间',
                    children: detail.asn.ackAt ? dayjs(detail.asn.ackAt).format('YYYY-MM-DD HH:mm:ss') : '-',
                  },
                  { key: 'remark', label: '备注', children: detail.asn.remark || '-' },
                ]}
              />
            )}
          </Card>
          <Card size="small" title="明细行">
            <Table<EdiAsnLineItem>
              rowKey="id"
              size="small"
              columns={lineColumns}
              dataSource={detail?.lines || []}
              scroll={{ x: 900 }}
              pagination={false}
            />
          </Card>
        </Space>
      </Drawer>

      {/* 新增/编辑 ASN */}
      <Modal
        title={editing ? '编辑 ASN' : '新建 ASN'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={900}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="asnNo" label="ASN 编号">
            <Input placeholder="留空自动生成" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="demandNo" label="需求编号">
            <Input placeholder="请输入需求编号" />
          </Form.Item>
          <Form.Item name="dispatchNo" label="分发编号">
            <Input placeholder="请输入分发编号" />
          </Form.Item>
          <Form.Item name="transCode" label="交易代码">
            <Input placeholder="请输入交易代码" />
          </Form.Item>
          <Form.Item name="asnType" label="类型">
            <Select placeholder="请选择" options={EDI_ASN_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="shipTo" label="收货地址">
            <Input placeholder="请输入收货地址" />
          </Form.Item>
          <Form.Item name="carrier" label="承运商">
            <Input placeholder="请输入承运商" />
          </Form.Item>
          <Form.Item name="trackingNo" label="运单号">
            <Input placeholder="请输入运单号" />
          </Form.Item>
          <Form.Item name="plateNo" label="车牌号">
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="shipDate" label="发货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="etaDate" label="预计到达">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="packageCount" label="箱数">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item label="明细行">
            <Form.List name="lines">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" wrap>
                      <Form.Item {...field} name={[field.name, 'materialCode']} style={{ marginBottom: 0 }}>
                        <Input placeholder="物料编码" style={{ width: 160 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'qty']} style={{ marginBottom: 0 }}>
                        <InputNumber placeholder="数量" min={0} style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'unit']} style={{ marginBottom: 0 }}>
                        <Input placeholder="单位" style={{ width: 100 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'batchNo']} style={{ marginBottom: 0 }}>
                        <Input placeholder="批次号" style={{ width: 140 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'packageCode']} style={{ marginBottom: 0 }}>
                        <Input placeholder="包装编码" style={{ width: 140 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'boxCode']} style={{ marginBottom: 0 }}>
                        <Input placeholder="箱码" style={{ width: 140 }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(field.name)}>
                        删除
                      </Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加明细行
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
