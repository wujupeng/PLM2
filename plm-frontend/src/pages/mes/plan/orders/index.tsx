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
import { mesProdOrderService as service } from '@/services/mesPlanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_ORDER_SOURCE_LABEL,
  MES_ORDER_SOURCE_OPTIONS,
  MES_PRIORITY_LABEL,
  MES_PRIORITY_OPTIONS,
  MES_PROD_ORDER_STATUS_LABEL,
  MES_PROD_ORDER_STATUS_OPTIONS,
  type MesProdOrder,
  type MesProdOrderQuery,
  type MesProdOrderSaveRequest,
} from '@/types/mesPlan';

const { Title } = Typography;

const MANAGE = 'mes:plan:order:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesProdOrderSaveRequest, 'planStartTime' | 'planEndTime' | 'receiveTime'> & {
  planStartTime?: Dayjs;
  planEndTime?: Dayjs;
  receiveTime?: Dayjs;
};

export default function MesProdOrderPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesProdOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = orderStatus) => {
      setLoading(true);
      try {
        const params: MesProdOrderQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          orderStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, orderStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ orderSource: 'ERP', orderStatus: 'DRAFT', priority: 'NORMAL' });
    setOpen(true);
  };

  const openEdit = (record: MesProdOrder) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      planStartTime: record.planStartTime ? dayjs(record.planStartTime) : undefined,
      planEndTime: record.planEndTime ? dayjs(record.planEndTime) : undefined,
      receiveTime: record.receiveTime ? dayjs(record.receiveTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesProdOrderSaveRequest = {
        ...values,
        planStartTime: values.planStartTime ? values.planStartTime.format(DATETIME_FORMAT) : undefined,
        planEndTime: values.planEndTime ? values.planEndTime.format(DATETIME_FORMAT) : undefined,
        receiveTime: values.receiveTime ? values.receiveTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('生产工单已创建');
      } else {
        await service.update(editId, payload);
        message.success('生产工单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('生产工单已删除');
    void loadData();
  };

  const columns: ColumnsType<MesProdOrder> = [
    { title: '工单号', dataIndex: 'orderNo', width: 190, fixed: 'left', render: plain },
    { title: 'ERP工单号', dataIndex: 'erpOrderNo', width: 170, render: plain },
    {
      title: '工单来源',
      dataIndex: 'orderSource',
      width: 110,
      render: (v) => statusTag(MES_ORDER_SOURCE_LABEL, v),
    },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 110, render: plain },
    { title: '已生产数量', dataIndex: 'productQty', width: 110, render: plain },
    {
      title: '工单状态',
      dataIndex: 'orderStatus',
      width: 110,
      render: (v) => statusTag(MES_PROD_ORDER_STATUS_LABEL, v),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (v) => statusTag(MES_PRIORITY_LABEL, v),
    },
    { title: '车间编码', dataIndex: 'workshopCode', width: 110, render: plain },
    { title: '计划开始时间', dataIndex: 'planStartTime', width: 170, render: formatDateTime },
    { title: '计划结束时间', dataIndex: 'planEndTime', width: 170, render: formatDateTime },
    { title: '接收时间', dataIndex: 'receiveTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该生产工单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        生产工单
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="工单状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={orderStatus}
              onChange={(v) => setOrderStatus(v)}
              options={[...MES_PROD_ORDER_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="工单号 / ERP工单号 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, orderStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setOrderStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建生产工单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`生产工单（共 ${total} 条）`}>
        <Table<MesProdOrder>
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
        title={editId == null ? '新建生产工单' : '编辑生产工单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="orderNo" label="工单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="erpOrderNo" label="ERP工单号">
            <Input placeholder="请输入 ERP 工单号" />
          </Form.Item>
          <Form.Item name="orderSource" label="工单来源">
            <Select placeholder="为空默认 ERP" options={[...MES_ORDER_SOURCE_OPTIONS]} />
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
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="productQty" label="已生产数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="orderStatus" label="工单状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_PROD_ORDER_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="为空默认 NORMAL" options={[...MES_PRIORITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="workshopCode" label="车间编码">
            <Input placeholder="请输入车间编码" />
          </Form.Item>
          <Form.Item name="planStartTime" label="计划开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="planEndTime" label="计划结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="receiveTime" label="接收时间">
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
