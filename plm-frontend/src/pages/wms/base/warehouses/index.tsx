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
import { wmsWarehouseService as service } from '@/services/wmsBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_WAREHOUSE_STATUS_LABEL,
  WMS_WAREHOUSE_STATUS_OPTIONS,
  WMS_WAREHOUSE_TYPE_LABEL,
  WMS_WAREHOUSE_TYPE_OPTIONS,
  type WmsWarehouse,
  type WmsWarehouseQuery,
  type WmsWarehouseSaveRequest,
} from '@/types/wmsBase';

const { Title } = Typography;

const MANAGE = 'wms:base:warehouse:manage';

type FormValues = WmsWarehouseSaveRequest;

export default function WmsWarehousePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsWarehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [warehouseType, setWarehouseType] = useState<string | undefined>(undefined);
  const [warehouseStatus, setWarehouseStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = warehouseType,
      status = warehouseStatus,
    ) => {
      setLoading(true);
      try {
        const params: WmsWarehouseQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          warehouseType: type,
          warehouseStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, warehouseType, warehouseStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ warehouseType: 'FINISHED', warehouseStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsWarehouse) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsWarehouseSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('仓库已创建');
      } else {
        await service.update(editId, payload);
        message.success('仓库已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('仓库已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsWarehouse> = [
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 170, fixed: 'left', render: plain },
    { title: '仓库名称', dataIndex: 'warehouseName', width: 180, render: plain },
    {
      title: '仓库类型',
      dataIndex: 'warehouseType',
      width: 110,
      render: (v) => statusTag(WMS_WAREHOUSE_TYPE_LABEL, v),
    },
    { title: '负责人', dataIndex: 'manager', width: 110, render: plain },
    { title: '联系电话', dataIndex: 'contactPhone', width: 140, render: plain },
    { title: '仓库地址', dataIndex: 'address', width: 220, render: plain },
    { title: '面积', dataIndex: 'area', width: 110, render: plain },
    {
      title: '仓库状态',
      dataIndex: 'warehouseStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_WAREHOUSE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该仓库？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        仓库管理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="仓库类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={warehouseType}
              onChange={(v) => setWarehouseType(v)}
              options={[...WMS_WAREHOUSE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="仓库状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={warehouseStatus}
              onChange={(v) => setWarehouseStatus(v)}
              options={[...WMS_WAREHOUSE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="仓库编码 / 名称 / 负责人 / 地址"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, warehouseType, warehouseStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setWarehouseType(undefined);
                  setWarehouseStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建仓库</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`仓库管理（共 ${total} 条）`}>
        <Table<WmsWarehouse>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editId == null ? '新建仓库' : '编辑仓库'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="warehouseCode"
            label="仓库编码"
            rules={[{ required: true, message: '请输入仓库编码' }]}
          >
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="warehouseName" label="仓库名称">
            <Input placeholder="请输入仓库名称" />
          </Form.Item>
          <Form.Item name="warehouseType" label="仓库类型">
            <Select placeholder="为空默认 FINISHED" options={[...WMS_WAREHOUSE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="address" label="仓库地址">
            <Input placeholder="请输入仓库地址" />
          </Form.Item>
          <Form.Item name="manager" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="area" label="面积">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warehouseStatus" label="仓库状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_WAREHOUSE_STATUS_OPTIONS]} />
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
