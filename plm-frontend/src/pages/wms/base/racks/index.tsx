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
import { wmsRackService as service } from '@/services/wmsBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_RACK_STATUS_LABEL,
  WMS_RACK_STATUS_OPTIONS,
  WMS_RACK_TYPE_LABEL,
  WMS_RACK_TYPE_OPTIONS,
  type WmsRack,
  type WmsRackQuery,
  type WmsRackSaveRequest,
} from '@/types/wmsBase';

const { Title } = Typography;

const MANAGE = 'wms:base:rack:manage';

type FormValues = WmsRackSaveRequest;

export default function WmsRackPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsRack[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [rackStatus, setRackStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = rackStatus) => {
      setLoading(true);
      try {
        const params: WmsRackQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          rackStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, rackStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ rackType: 'SHELF', rackStatus: 'DRAFT', layerCount: 0, binCount: 0 });
    setOpen(true);
  };

  const openEdit = (record: WmsRack) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsRackSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('货架已创建');
      } else {
        await service.update(editId, payload);
        message.success('货架已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('货架已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsRack> = [
    { title: '货架编码', dataIndex: 'rackCode', width: 160, fixed: 'left', render: plain },
    { title: '货架名称', dataIndex: 'rackName', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 150, render: plain },
    { title: '库区编码', dataIndex: 'zoneCode', width: 150, render: plain },
    {
      title: '货架类型',
      dataIndex: 'rackType',
      width: 120,
      render: (v) => statusTag(WMS_RACK_TYPE_LABEL, v),
    },
    { title: '层数', dataIndex: 'layerCount', width: 90, render: plain },
    { title: '货位数', dataIndex: 'binCount', width: 90, render: plain },
    { title: '最大承重', dataIndex: 'maxLoad', width: 110, render: plain },
    { title: '条码', dataIndex: 'barcode', width: 160, render: plain },
    {
      title: '货架状态',
      dataIndex: 'rackStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_RACK_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该货架？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        货架管理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="货架状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={rackStatus}
              onChange={(v) => setRackStatus(v)}
              options={[...WMS_RACK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="货架编码 / 名称 / 仓库 / 库区 / 条码"
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
                  void loadData(1, pageSize, keyword, rackStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRackStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建货架</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`货架管理（共 ${total} 条）`}>
        <Table<WmsRack>
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
        title={editId == null ? '新建货架' : '编辑货架'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="rackCode" label="货架编码" rules={[{ required: true, message: '请输入货架编码' }]}>
            <Input placeholder="请输入货架编码" />
          </Form.Item>
          <Form.Item name="rackName" label="货架名称">
            <Input placeholder="请输入货架名称" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="zoneCode" label="库区编码">
            <Input placeholder="请输入库区编码" />
          </Form.Item>
          <Form.Item name="rackType" label="货架类型">
            <Select placeholder="为空默认 SHELF" options={[...WMS_RACK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="layerCount" label="层数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="binCount" label="货位数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxLoad" label="最大承重">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="barcode" label="条码">
            <Input placeholder="请输入条码" />
          </Form.Item>
          <Form.Item name="rackStatus" label="货架状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_RACK_STATUS_OPTIONS]} />
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
