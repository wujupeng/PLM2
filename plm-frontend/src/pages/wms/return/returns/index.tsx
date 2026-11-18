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
import { wmsReturnOrderService as service } from '@/services/wmsReturnService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  WMS_RETURN_STATUS_LABEL,
  WMS_RETURN_STATUS_OPTIONS,
  WMS_RETURN_TYPE_LABEL,
  WMS_RETURN_TYPE_OPTIONS,
  type WmsReturnOrder,
  type WmsReturnOrderQuery,
  type WmsReturnOrderSaveRequest,
} from '@/types/wmsReturn';

const { Title } = Typography;

const MANAGE = 'wms:return:return:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<WmsReturnOrderSaveRequest, 'applyTime' | 'receiveTime'> & {
  applyTime?: Dayjs;
  receiveTime?: Dayjs;
};

export default function WmsReturnOrderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<WmsReturnOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [returnStatus, setReturnStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = returnStatus) => {
      setLoading(true);
      try {
        const params: WmsReturnOrderQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          returnStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, returnStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ returnType: 'RETURN', returnStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: WmsReturnOrder) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      applyTime: record.applyTime ? dayjs(record.applyTime) : undefined,
      receiveTime: record.receiveTime ? dayjs(record.receiveTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: WmsReturnOrderSaveRequest = {
        ...values,
        applyTime: values.applyTime ? values.applyTime.format(DATETIME_FORMAT) : undefined,
        receiveTime: values.receiveTime ? values.receiveTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('生产退料已创建');
      } else {
        await service.update(editId, payload);
        message.success('生产退料已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('生产退料已删除');
    void loadData();
  };

  const columns: ColumnsType<WmsReturnOrder> = [
    { title: '退料单号', dataIndex: 'returnNo', width: 190, fixed: 'left', render: plain },
    {
      title: '退料类型',
      dataIndex: 'returnType',
      width: 110,
      render: (v) => statusTag(WMS_RETURN_TYPE_LABEL, v),
    },
    { title: '生产工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 160, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '库位', dataIndex: 'binCode', width: 130, render: plain },
    { title: '退料数量', dataIndex: 'returnQty', width: 100, render: plain },
    { title: '已收数量', dataIndex: 'receivedQty', width: 100, render: plain },
    { title: '退料原因', dataIndex: 'returnReason', width: 160, render: plain },
    {
      title: '退料状态',
      dataIndex: 'returnStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(WMS_RETURN_STATUS_LABEL, v),
    },
    { title: '申请人', dataIndex: 'applyBy', width: 120, render: plain },
    { title: '申请时间', dataIndex: 'applyTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该生产退料？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        生产退料
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="退料状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={returnStatus}
              onChange={(v) => setReturnStatus(v)}
              options={[...WMS_RETURN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="退料单号 / 生产工单号 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, returnStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReturnStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建生产退料</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`生产退料（共 ${total} 条）`}>
        <Table<WmsReturnOrder>
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
        title={editId == null ? '新建生产退料' : '编辑生产退料'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="returnNo" label="退料单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="returnType" label="退料类型">
            <Select placeholder="为空默认 RETURN" options={[...WMS_RETURN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="workOrderNo" label="生产工单号">
            <Input placeholder="请输入生产工单号" />
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
          <Form.Item name="binCode" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item name="returnQty" label="退料数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receivedQty" label="已收数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="returnReason" label="退料原因">
            <Input placeholder="请输入退料原因" />
          </Form.Item>
          <Form.Item name="returnStatus" label="退料状态">
            <Select placeholder="为空默认 DRAFT" options={[...WMS_RETURN_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="applyBy" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="applyTime" label="申请时间">
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
