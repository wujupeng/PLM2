import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
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
import { wmsZoneService as service } from '@/services/wmsBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_TEMPERATURE_TYPE_LABEL,
  WMS_TEMPERATURE_TYPE_OPTIONS,
  WMS_ZONE_STATUS_LABEL,
  WMS_ZONE_STATUS_OPTIONS,
  WMS_ZONE_TYPE_LABEL,
  WMS_ZONE_TYPE_OPTIONS,
  type WmsZone,
  type WmsZoneQuery,
  type WmsZoneSaveRequest,
} from '@/types/wmsBase';

const { Title } = Typography;

const MANAGE = 'wms:base:zone:manage';

type FormValues = WmsZoneSaveRequest;

export default function WmsZonePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsZone[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [zoneType, setZoneType] = useState<string | undefined>(undefined);
  const [zoneStatus, setZoneStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = zoneType,
      status = zoneStatus,
    ) => {
      setLoading(true);
      try {
        const params: WmsZoneQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          zoneType: type,
          zoneStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, zoneType, zoneStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ zoneType: 'STORAGE', temperatureType: 'NORMAL', zoneStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsZone) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsZoneSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('库区已创建');
      } else {
        await service.update(editId, payload);
        message.success('库区已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('库区已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsZone> = [
    { title: '库区编码', dataIndex: 'zoneCode', width: 160, fixed: 'left', render: plain },
    { title: '库区名称', dataIndex: 'zoneName', width: 180, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 160, render: plain },
    { title: '仓库名称', dataIndex: 'warehouseName', width: 180, render: plain },
    {
      title: '库区类型',
      dataIndex: 'zoneType',
      width: 110,
      render: (v) => statusTag(WMS_ZONE_TYPE_LABEL, v),
    },
    {
      title: '温层类型',
      dataIndex: 'temperatureType',
      width: 110,
      render: (v) => statusTag(WMS_TEMPERATURE_TYPE_LABEL, v),
    },
    {
      title: '库区状态',
      dataIndex: 'zoneStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_ZONE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该库区？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        库区管理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="库区类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={zoneType}
              onChange={(v) => setZoneType(v)}
              options={[...WMS_ZONE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="库区状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={zoneStatus}
              onChange={(v) => setZoneStatus(v)}
              options={[...WMS_ZONE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="库区编码 / 名称 / 仓库编码 / 名称"
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
                  void loadData(1, pageSize, keyword, zoneType, zoneStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setZoneType(undefined);
                  setZoneStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建库区</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库区管理（共 ${total} 条）`}>
        <Table<WmsZone>
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

      <Modal
        title={editId == null ? '新建库区' : '编辑库区'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="zoneCode" label="库区编码" rules={[{ required: true, message: '请输入库区编码' }]}>
            <Input placeholder="请输入库区编码" />
          </Form.Item>
          <Form.Item name="zoneName" label="库区名称">
            <Input placeholder="请输入库区名称" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="warehouseName" label="仓库名称">
            <Input placeholder="请输入仓库名称" />
          </Form.Item>
          <Form.Item name="zoneType" label="库区类型">
            <Select placeholder="为空默认 STORAGE" options={[...WMS_ZONE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="temperatureType" label="温层类型">
            <Select placeholder="为空默认 NORMAL" options={[...WMS_TEMPERATURE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="zoneStatus" label="库区状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_ZONE_STATUS_OPTIONS]} />
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
