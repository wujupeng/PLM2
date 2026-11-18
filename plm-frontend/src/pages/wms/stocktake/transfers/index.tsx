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
import { wmsTransferOrderService as service } from '@/services/wmsStocktakeService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_TRANSFER_STATUS_LABEL,
  WMS_TRANSFER_STATUS_OPTIONS,
  WMS_TRANSFER_TYPE_LABEL,
  WMS_TRANSFER_TYPE_OPTIONS,
  type WmsTransferOrder,
  type WmsTransferOrderQuery,
  type WmsTransferOrderSaveRequest,
} from '@/types/wmsStocktake';

const { Title } = Typography;

const MANAGE = 'wms:stocktake:transfer:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsTransferOrderSaveRequest, 'applyTime' | 'transferTime' | 'receiveTime'> & {
  applyTime?: Dayjs;
  transferTime?: Dayjs;
  receiveTime?: Dayjs;
};

export default function WmsTransferOrderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsTransferOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [transferStatus, setTransferStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = transferStatus) => {
      setLoading(true);
      try {
        const params: WmsTransferOrderQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          transferStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, transferStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ transferType: 'WAREHOUSE', transferStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsTransferOrder) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      applyTime: record.applyTime ? dayjs(record.applyTime) : undefined,
      transferTime: record.transferTime ? dayjs(record.transferTime) : undefined,
      receiveTime: record.receiveTime ? dayjs(record.receiveTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsTransferOrderSaveRequest = {
        ...values,
        applyTime: values.applyTime ? values.applyTime.format(DATETIME_FORMAT) : undefined,
        transferTime: values.transferTime ? values.transferTime.format(DATETIME_FORMAT) : undefined,
        receiveTime: values.receiveTime ? values.receiveTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('调拨单已创建');
      } else {
        await service.update(editId, payload);
        message.success('调拨单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('调拨单已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsTransferOrder> = [
    { title: '调拨单号', dataIndex: 'transferNo', width: 190, fixed: 'left', render: plain },
    {
      title: '调拨类型',
      dataIndex: 'transferType',
      width: 110,
      render: (v) => statusTag(WMS_TRANSFER_TYPE_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '调出仓库', dataIndex: 'fromWarehouseCode', width: 120, render: plain },
    { title: '调出库位', dataIndex: 'fromBinCode', width: 120, render: plain },
    { title: '调入仓库', dataIndex: 'toWarehouseCode', width: 120, render: plain },
    { title: '调入库位', dataIndex: 'toBinCode', width: 120, render: plain },
    { title: '调拨数量', dataIndex: 'transferQty', width: 100, render: plain },
    { title: '已收数量', dataIndex: 'receivedQty', width: 100, render: plain },
    {
      title: '调拨状态',
      dataIndex: 'transferStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_TRANSFER_STATUS_LABEL, v),
    },
    { title: '申请人', dataIndex: 'applyBy', width: 120, render: plain },
    { title: '申请时间', dataIndex: 'applyTime', width: 170, render: formatDateTime },
    { title: '调出人', dataIndex: 'transferBy', width: 120, render: plain },
    { title: '调出时间', dataIndex: 'transferTime', width: 170, render: formatDateTime },
    { title: '收货人', dataIndex: 'receiveBy', width: 120, render: plain },
    { title: '收货时间', dataIndex: 'receiveTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该调拨单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        调拨单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="调拨状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={transferStatus}
              onChange={(v) => setTransferStatus(v)}
              options={[...WMS_TRANSFER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="调拨单号 / 调出仓库 / 调入仓库 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 360 }}
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
                  void loadData(1, pageSize, keyword, transferStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setTransferStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建调拨单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`调拨单（共 ${total} 条）`}>
        <Table<WmsTransferOrder>
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
        title={editId == null ? '新建调拨单' : '编辑调拨单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="transferNo" label="调拨单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="transferType" label="调拨类型">
            <Select placeholder="为空默认 WAREHOUSE" options={[...WMS_TRANSFER_TYPE_OPTIONS]} />
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
          <Form.Item name="fromWarehouseCode" label="调出仓库">
            <Input placeholder="请输入调出仓库编码" />
          </Form.Item>
          <Form.Item name="fromBinCode" label="调出库位">
            <Input placeholder="请输入调出库位编码" />
          </Form.Item>
          <Form.Item name="toWarehouseCode" label="调入仓库">
            <Input placeholder="请输入调入仓库编码" />
          </Form.Item>
          <Form.Item name="toBinCode" label="调入库位">
            <Input placeholder="请输入调入库位编码" />
          </Form.Item>
          <Form.Item name="transferQty" label="调拨数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receivedQty" label="已收数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="transferStatus" label="调拨状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_TRANSFER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="applyBy" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyTime" label="申请时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="transferBy" label="调出人">
            <Input placeholder="请输入调出人" />
          </Form.Item>
          <Form.Item name="transferTime" label="调出时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receiveBy" label="收货人">
            <Input placeholder="请输入收货人" />
          </Form.Item>
          <Form.Item name="receiveTime" label="收货时间">
            <DatePicker showTime style={{ width: '100%' }} />
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
