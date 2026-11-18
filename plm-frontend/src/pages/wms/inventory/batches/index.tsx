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
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { wmsInventoryBatchService as service } from '@/services/wmsInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_INV_BATCH_SOURCE_LABEL,
  WMS_INV_BATCH_SOURCE_OPTIONS,
  WMS_INV_BATCH_STATUS_LABEL,
  WMS_INV_BATCH_STATUS_OPTIONS,
  type WmsInventoryBatch,
  type WmsInventoryBatchQuery,
  type WmsInventoryBatchSaveRequest,
} from '@/types/wmsInventory';

const { Title } = Typography;

const MANAGE = 'wms:inventory:batch:manage';

type FormValues = Omit<WmsInventoryBatchSaveRequest, 'productionDate' | 'expiryDate' | 'inboundDate'> & {
  productionDate?: Dayjs;
  expiryDate?: Dayjs;
  inboundDate?: Dayjs;
};

export default function WmsInventoryBatchPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsInventoryBatch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [batchStatus, setBatchStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = batchStatus) => {
      setLoading(true);
      try {
        const params: WmsInventoryBatchQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          batchStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, batchStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ batchSource: 'PURCHASE', batchStatus: 'NORMAL' });
    setOpen(true);
  };

  const openEdit = (record: WmsInventoryBatch) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      productionDate: record.productionDate ? dayjs(record.productionDate) : undefined,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : undefined,
      inboundDate: record.inboundDate ? dayjs(record.inboundDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsInventoryBatchSaveRequest = {
        ...values,
        productionDate: values.productionDate ? values.productionDate.format(DATE_FORMAT) : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.format(DATE_FORMAT) : undefined,
        inboundDate: values.inboundDate ? values.inboundDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('库存批次已创建');
      } else {
        await service.update(editId, payload);
        message.success('库存批次已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('库存批次已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsInventoryBatch> = [
    { title: '批次号', dataIndex: 'batchNo', width: 190, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库区', dataIndex: 'zoneCode', width: 110, render: plain },
    { title: '库位', dataIndex: 'binCode', width: 130, render: plain },
    { title: '供应商', dataIndex: 'supplierCode', width: 140, render: plain },
    { title: '收货单号', dataIndex: 'receiptNo', width: 170, render: plain },
    {
      title: '批次来源',
      dataIndex: 'batchSource',
      width: 110,
      render: (v) => statusTag(WMS_INV_BATCH_SOURCE_LABEL, v),
    },
    { title: '生产日期', dataIndex: 'productionDate', width: 120, render: formatDate },
    { title: '到期日期', dataIndex: 'expiryDate', width: 120, render: formatDate },
    { title: '入库日期', dataIndex: 'inboundDate', width: 120, render: formatDate },
    { title: '库存数量', dataIndex: 'qty', width: 100, render: plain },
    { title: '可用数量', dataIndex: 'availableQty', width: 100, render: plain },
    { title: '冻结数量', dataIndex: 'frozenQty', width: 100, render: plain },
    {
      title: '库存状态',
      dataIndex: 'batchStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_INV_BATCH_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该库存批次？" onConfirm={() => record.id != null && void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        库存批次
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="库存状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={batchStatus}
              onChange={(v) => setBatchStatus(v)}
              options={[...WMS_INV_BATCH_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="批次号 / 物料编码 / 物料名称 / 库位"
              allowClear
              style={{ width: 300 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, batchStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBatchStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建库存批次</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库存批次（共 ${total} 条）`}>
        <Table<WmsInventoryBatch>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2600 }}
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
        title={editId == null ? '新建库存批次' : '编辑库存批次'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="zoneCode" label="库区编码">
            <Input placeholder="请输入库区编码" />
          </Form.Item>
          <Form.Item name="binCode" label="库位编码">
            <Input placeholder="请输入库位编码" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="receiptNo" label="收货单号">
            <Input placeholder="请输入收货单号" />
          </Form.Item>
          <Form.Item name="batchSource" label="批次来源">
            <Select placeholder="为空默认 PURCHASE" options={[...WMS_INV_BATCH_SOURCE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="productionDate" label="生产日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiryDate" label="到期日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inboundDate" label="入库日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="qty" label="库存数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="availableQty" label="可用数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="frozenQty" label="冻结数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="batchStatus" label="库存状态">
            <Select placeholder="为空默认 NORMAL" options={[...WMS_INV_BATCH_STATUS_OPTIONS]} />
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
