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
import { wmsBinService as service } from '@/services/wmsBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_BIN_STATUS_LABEL,
  WMS_BIN_STATUS_OPTIONS,
  WMS_BIN_TYPE_LABEL,
  WMS_BIN_TYPE_OPTIONS,
  type WmsBin,
  type WmsBinQuery,
  type WmsBinSaveRequest,
} from '@/types/wmsBase';

const { Title } = Typography;

const MANAGE = 'wms:base:bin:manage';

type FormValues = WmsBinSaveRequest;

export default function WmsBinPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsBin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [binType, setBinType] = useState<string | undefined>(undefined);
  const [binStatus, setBinStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = binType,
      status = binStatus,
    ) => {
      setLoading(true);
      try {
        const params: WmsBinQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          binType: type,
          binStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, binType, binStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ binType: 'STORAGE', binStatus: 'IDLE', usedCapacity: 0 });
    setOpen(true);
  };

  const openEdit = (record: WmsBin) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsBinSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('库位已创建');
      } else {
        await service.update(editId, payload);
        message.success('库位已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('库位已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsBin> = [
    { title: '库位编码', dataIndex: 'binCode', width: 160, fixed: 'left', render: plain },
    { title: '库位名称', dataIndex: 'binName', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 150, render: plain },
    { title: '库区编码', dataIndex: 'zoneCode', width: 150, render: plain },
    {
      title: '库位类型',
      dataIndex: 'binType',
      width: 110,
      render: (v) => statusTag(WMS_BIN_TYPE_LABEL, v),
    },
    { title: '容量上限', dataIndex: 'maxCapacity', width: 110, render: plain },
    { title: '已用容量', dataIndex: 'usedCapacity', width: 110, render: plain },
    { title: '容量单位', dataIndex: 'capacityUnit', width: 100, render: plain },
    { title: '条码', dataIndex: 'barcode', width: 160, render: plain },
    {
      title: '库位状态',
      dataIndex: 'binStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_BIN_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该库位？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        库位管理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="库位类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={binType}
              onChange={(v) => setBinType(v)}
              options={[...WMS_BIN_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="库位状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={binStatus}
              onChange={(v) => setBinStatus(v)}
              options={[...WMS_BIN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="库位编码 / 名称 / 仓库 / 库区 / 条码"
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
                  void loadData(1, pageSize, keyword, binType, binStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBinType(undefined);
                  setBinStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建库位</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`库位管理（共 ${total} 条）`}>
        <Table<WmsBin>
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
        title={editId == null ? '新建库位' : '编辑库位'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="binCode" label="库位编码" rules={[{ required: true, message: '请输入库位编码' }]}>
            <Input placeholder="请输入库位编码" />
          </Form.Item>
          <Form.Item name="binName" label="库位名称">
            <Input placeholder="请输入库位名称" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="zoneCode" label="库区编码">
            <Input placeholder="请输入库区编码" />
          </Form.Item>
          <Form.Item name="binType" label="库位类型">
            <Select placeholder="为空默认 STORAGE" options={[...WMS_BIN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="maxCapacity" label="容量上限">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="usedCapacity" label="已用容量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="capacityUnit" label="容量单位">
            <Input placeholder="请输入容量单位" />
          </Form.Item>
          <Form.Item name="barcode" label="条码">
            <Input placeholder="请输入条码" />
          </Form.Item>
          <Form.Item name="binStatus" label="库位状态">
            <Select placeholder="为空默认 IDLE" options={[...WMS_BIN_STATUS_OPTIONS]} />
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
