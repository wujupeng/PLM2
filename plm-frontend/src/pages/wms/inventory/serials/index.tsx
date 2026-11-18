import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { wmsSerialNumberService as service } from '@/services/wmsInventoryService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_SERIAL_STATUS_LABEL,
  WMS_SERIAL_STATUS_OPTIONS,
  type WmsSerialNumber,
  type WmsSerialNumberQuery,
  type WmsSerialNumberSaveRequest,
} from '@/types/wmsInventory';

const { Title } = Typography;

const MANAGE = 'wms:inventory:serial:manage';

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsSerialNumberSaveRequest, 'inboundTime' | 'outboundTime'> & {
  inboundTime?: Dayjs;
  outboundTime?: Dayjs;
};

export default function WmsSerialNumberPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsSerialNumber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [serialStatus, setSerialStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = serialStatus) => {
      setLoading(true);
      try {
        const params: WmsSerialNumberQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          serialStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, serialStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ serialStatus: 'IN_STOCK' });
    setOpen(true);
  };

  const openEdit = (record: WmsSerialNumber) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      inboundTime: record.inboundTime ? dayjs(record.inboundTime) : undefined,
      outboundTime: record.outboundTime ? dayjs(record.outboundTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsSerialNumberSaveRequest = {
        ...values,
        inboundTime: values.inboundTime ? values.inboundTime.format(DATETIME_FORMAT) : undefined,
        outboundTime: values.outboundTime ? values.outboundTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('序列号已创建');
      } else {
        await service.update(editId, payload);
        message.success('序列号已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('序列号已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsSerialNumber> = [
    { title: '序列号', dataIndex: 'serialNo', width: 190, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库位', dataIndex: 'binCode', width: 130, render: plain },
    { title: '供应商', dataIndex: 'supplierCode', width: 140, render: plain },
    { title: '收货单号', dataIndex: 'receiptNo', width: 170, render: plain },
    { title: '入库时间', dataIndex: 'inboundTime', width: 170, render: formatDateTime },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: plain },
    { title: '出库时间', dataIndex: 'outboundTime', width: 170, render: formatDateTime },
    {
      title: '序列号状态',
      dataIndex: 'serialStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(WMS_SERIAL_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该序列号？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        序列号
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="序列号状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={serialStatus}
              onChange={(v) => setSerialStatus(v)}
              options={[...WMS_SERIAL_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="序列号 / 物料编码 / 物料名称 / 批次号"
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
                  void loadData(1, pageSize, keyword, serialStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSerialStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建序列号</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`序列号（共 ${total} 条）`}>
        <Table<WmsSerialNumber>
          rowKey="id"
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

      <Modal
        title={editId == null ? '新建序列号' : '编辑序列号'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="serialNo" label="序列号">
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
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
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
          <Form.Item name="inboundTime" label="入库时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="outboundTime" label="出库时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="serialStatus" label="序列号状态">
            <Select placeholder="为空默认 IN_STOCK" options={[...WMS_SERIAL_STATUS_OPTIONS]} />
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
