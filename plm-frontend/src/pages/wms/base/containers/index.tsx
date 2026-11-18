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
import { wmsContainerService as service } from '@/services/wmsBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_CONTAINER_STATUS_LABEL,
  WMS_CONTAINER_STATUS_OPTIONS,
  WMS_CONTAINER_TYPE_LABEL,
  WMS_CONTAINER_TYPE_OPTIONS,
  type WmsContainer,
  type WmsContainerQuery,
  type WmsContainerSaveRequest,
} from '@/types/wmsBase';

const { Title } = Typography;

const MANAGE = 'wms:base:container:manage';

type FormValues = WmsContainerSaveRequest;

export default function WmsContainerPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsContainer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [containerType, setContainerType] = useState<string | undefined>(undefined);
  const [containerStatus, setContainerStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = containerType,
      status = containerStatus,
    ) => {
      setLoading(true);
      try {
        const params: WmsContainerQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          containerType: type,
          containerStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, containerType, containerStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ containerType: 'PALLET', containerStatus: 'IDLE' });
    setOpen(true);
  };

  const openEdit = (record: WmsContainer) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsContainerSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('容器已创建');
      } else {
        await service.update(editId, payload);
        message.success('容器已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('容器已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsContainer> = [
    { title: '容器编码', dataIndex: 'containerCode', width: 160, fixed: 'left', render: plain },
    { title: '容器名称', dataIndex: 'containerName', width: 160, render: plain },
    {
      title: '容器类型',
      dataIndex: 'containerType',
      width: 110,
      render: (v) => statusTag(WMS_CONTAINER_TYPE_LABEL, v),
    },
    { title: '容量', dataIndex: 'capacity', width: 100, render: plain },
    { title: '容量单位', dataIndex: 'capacityUnit', width: 100, render: plain },
    { title: '当前库位', dataIndex: 'currentBinCode', width: 150, render: plain },
    { title: '条码', dataIndex: 'barcode', width: 160, render: plain },
    {
      title: '容器状态',
      dataIndex: 'containerStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_CONTAINER_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该容器？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        容器管理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="容器类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={containerType}
              onChange={(v) => setContainerType(v)}
              options={[...WMS_CONTAINER_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="容器状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={containerStatus}
              onChange={(v) => setContainerStatus(v)}
              options={[...WMS_CONTAINER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="容器编码 / 名称 / 条码 / 当前库位"
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
                  void loadData(1, pageSize, keyword, containerType, containerStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setContainerType(undefined);
                  setContainerStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建容器</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`容器管理（共 ${total} 条）`}>
        <Table<WmsContainer>
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
        title={editId == null ? '新建容器' : '编辑容器'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="containerCode"
            label="容器编码"
            rules={[{ required: true, message: '请输入容器编码' }]}
          >
            <Input placeholder="请输入容器编码" />
          </Form.Item>
          <Form.Item name="containerName" label="容器名称">
            <Input placeholder="请输入容器名称" />
          </Form.Item>
          <Form.Item name="containerType" label="容器类型">
            <Select placeholder="为空默认 PALLET" options={[...WMS_CONTAINER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="capacity" label="容量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="capacityUnit" label="容量单位">
            <Input placeholder="请输入容量单位" />
          </Form.Item>
          <Form.Item name="currentBinCode" label="当前库位编码">
            <Input placeholder="请输入当前库位编码" />
          </Form.Item>
          <Form.Item name="barcode" label="条码">
            <Input placeholder="请输入条码" />
          </Form.Item>
          <Form.Item name="containerStatus" label="容器状态">
            <Select placeholder="为空默认 IDLE" options={[...WMS_CONTAINER_STATUS_OPTIONS]} />
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
