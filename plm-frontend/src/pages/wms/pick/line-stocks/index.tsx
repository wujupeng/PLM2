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
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { wmsLineSideInventoryService as service } from '@/services/wmsPickingService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_LINESTOCK_STATUS_LABEL,
  WMS_LINESTOCK_STATUS_OPTIONS,
  type WmsLineSideInventory,
  type WmsLineSideInventoryQuery,
  type WmsLineSideInventorySaveRequest,
} from '@/types/wmsPicking';

const { Title } = Typography;

const MANAGE = 'wms:pick:linestock:manage';

export default function WmsLineSideInventoryPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<WmsLineSideInventorySaveRequest>();
  const [data, setData] = useState<WmsLineSideInventory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [stockStatus, setStockStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = stockStatus) => {
      setLoading(true);
      try {
        const params: WmsLineSideInventoryQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          stockStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, stockStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ stockStatus: 'NORMAL' });
    setOpen(true);
  };

  const openEdit = (record: WmsLineSideInventory) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsLineSideInventorySaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('线边仓库存已创建');
      } else {
        await service.update(editId, payload);
        message.success('线边仓库存已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('线边仓库存已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsLineSideInventory> = [
    { title: '物料编码', dataIndex: 'materialCode', width: 160, fixed: 'left', render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 130, render: plain },
    { title: '线边库位', dataIndex: 'binCode', width: 130, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库存数量', dataIndex: 'qty', width: 100, render: plain },
    { title: '可用数量', dataIndex: 'availableQty', width: 100, render: plain },
    { title: '冻结数量', dataIndex: 'frozenQty', width: 100, render: plain },
    { title: '最低库存', dataIndex: 'minQty', width: 100, render: plain },
    { title: '最高库存', dataIndex: 'maxQty', width: 100, render: plain },
    {
      title: '库存状态',
      dataIndex: 'stockStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_LINESTOCK_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该线边仓库存？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        线边仓库存
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="库存状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={stockStatus}
              onChange={(v) => setStockStatus(v)}
              options={[...WMS_LINESTOCK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="物料编码 / 物料名称 / 批次号 / 线边库位"
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
                  void loadData(1, pageSize, keyword, stockStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setStockStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建线边仓库存</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`线边仓库存（共 ${total} 条）`}>
        <Table<WmsLineSideInventory>
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
        title={editId == null ? '新建线边仓库存' : '编辑线边仓库存'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
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
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="binCode" label="线边库位">
            <Input placeholder="请输入线边库位" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
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
          <Form.Item name="minQty" label="最低库存数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxQty" label="最高库存数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stockStatus" label="库存状态">
            <Select placeholder="为空默认 NORMAL" options={[...WMS_LINESTOCK_STATUS_OPTIONS]} />
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
