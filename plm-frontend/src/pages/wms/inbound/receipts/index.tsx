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
import { wmsReceiptService as service } from '@/services/wmsInboundService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_RECEIVE_STATUS_LABEL,
  WMS_RECEIVE_STATUS_OPTIONS,
  WMS_RECEIVE_TYPE_LABEL,
  WMS_RECEIVE_TYPE_OPTIONS,
  type WmsReceipt,
  type WmsReceiptQuery,
  type WmsReceiptSaveRequest,
} from '@/types/wmsInbound';

const { Title } = Typography;

const MANAGE = 'wms:inbound:receipt:manage';

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsReceiptSaveRequest, 'receiveTime'> & {
  receiveTime?: Dayjs;
};

export default function WmsReceiptPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [receiveType, setReceiveType] = useState<string | undefined>(undefined);
  const [receiveStatus, setReceiveStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = receiveType,
      status = receiveStatus,
    ) => {
      setLoading(true);
      try {
        const params: WmsReceiptQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          receiveType: type,
          receiveStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, receiveType, receiveStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ receiveType: 'SCAN', receiveStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: WmsReceipt) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      receiveTime: record.receiveTime ? dayjs(record.receiveTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsReceiptSaveRequest = {
        ...values,
        receiveTime: values.receiveTime ? values.receiveTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('收货单已创建');
      } else {
        await service.update(editId, payload);
        message.success('收货单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('收货单已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsReceipt> = [
    { title: '收货单号', dataIndex: 'receiptNo', width: 190, fixed: 'left', render: plain },
    { title: 'ASN 单号', dataIndex: 'asnNo', width: 190, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 170, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 130, render: plain },
    {
      title: '收货方式',
      dataIndex: 'receiveType',
      width: 110,
      render: (v) => statusTag(WMS_RECEIVE_TYPE_LABEL, v),
    },
    { title: '收货时间', dataIndex: 'receiveTime', width: 170, render: formatDateTime },
    { title: '操作人', dataIndex: 'operator', width: 110, render: plain },
    { title: '收货数量', dataIndex: 'totalQty', width: 100, render: plain },
    { title: '送检数量', dataIndex: 'inspectedQty', width: 100, render: plain },
    { title: '合格数量', dataIndex: 'qualifiedQty', width: 100, render: plain },
    { title: '拒收数量', dataIndex: 'rejectedQty', width: 100, render: plain },
    {
      title: '收货状态',
      dataIndex: 'receiveStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_RECEIVE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该收货单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        收货单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="收货方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={receiveType}
              onChange={(v) => setReceiveType(v)}
              options={[...WMS_RECEIVE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="收货状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={receiveStatus}
              onChange={(v) => setReceiveStatus(v)}
              options={[...WMS_RECEIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="收货单号 / ASN 单号 / 供应商"
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
                  void loadData(1, pageSize, keyword, receiveType, receiveStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReceiveType(undefined);
                  setReceiveStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建收货单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`收货单（共 ${total} 条）`}>
        <Table<WmsReceipt>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建收货单' : '编辑收货单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="receiptNo" label="收货单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="asnNo" label="ASN 单号">
            <Input placeholder="请输入 ASN 单号" />
          </Form.Item>
          <Form.Item
            name="supplierCode"
            label="供应商编码"
            rules={[{ required: true, message: '请输入供应商编码' }]}
          >
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="receiveType" label="收货方式">
            <Select placeholder="为空默认 SCAN" options={[...WMS_RECEIVE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="receiveTime" label="收货时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="totalQty" label="收货数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inspectedQty" label="送检数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="qualifiedQty" label="合格数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rejectedQty" label="拒收数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receiveStatus" label="收货状态">
            <Select placeholder="为空默认 PENDING" options={[...WMS_RECEIVE_STATUS_OPTIONS]} />
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
