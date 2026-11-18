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
import { srmDeliveryAppointmentService as service } from '@/services/srmCollabService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_APPOINTMENT_STATUS_LABEL,
  SRM_APPOINTMENT_STATUS_OPTIONS,
  type SrmDeliveryAppointment,
  type SrmDeliveryAppointmentQuery,
  type SrmDeliveryAppointmentSaveRequest,
} from '@/types/srmCollab';

const { Title } = Typography;

const MANAGE = 'srm:collab:appointment:manage';

type FormValues = Omit<SrmDeliveryAppointmentSaveRequest, 'deliveryDate' | 'appointDate'> & {
  deliveryDate?: Dayjs;
  appointDate?: Dayjs;
};

export default function SrmDeliveryAppointmentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmDeliveryAppointment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = appointmentStatus) => {
      setLoading(true);
      try {
        const params: SrmDeliveryAppointmentQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          appointmentStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, appointmentStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ appointmentStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmDeliveryAppointment) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : undefined,
      appointDate: record.appointDate ? dayjs(record.appointDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmDeliveryAppointmentSaveRequest = {
        ...values,
        deliveryDate: values.deliveryDate ? values.deliveryDate.format(DATE_FORMAT) : undefined,
        appointDate: values.appointDate ? values.appointDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('送货预约已创建');
      } else {
        await service.update(editId, payload);
        message.success('送货预约已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('送货预约已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmDeliveryAppointment> = [
    { title: '预约编号', dataIndex: 'appointmentNo', width: 170, fixed: 'left', render: plain },
    { title: '采购订单号', dataIndex: 'poNo', width: 150, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '预约数量', dataIndex: 'appointQty', width: 100, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '送货日期', dataIndex: 'deliveryDate', width: 120, render: formatDate },
    { title: '送货时段', dataIndex: 'timeSlot', width: 120, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 150, render: plain },
    { title: '仓库名称', dataIndex: 'warehouseName', width: 160, render: plain },
    { title: '车牌号', dataIndex: 'vehicleNo', width: 120, render: plain },
    { title: '司机', dataIndex: 'driver', width: 100, render: plain },
    { title: '司机电话', dataIndex: 'driverPhone', width: 130, render: plain },
    { title: '预约人', dataIndex: 'appointBy', width: 100, render: plain },
    { title: '预约日期', dataIndex: 'appointDate', width: 120, render: formatDate },
    {
      title: '预约状态',
      dataIndex: 'appointmentStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_APPOINTMENT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该送货预约？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        送货预约
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="预约状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={appointmentStatus}
              onChange={(v) => setAppointmentStatus(v)}
              options={[...SRM_APPOINTMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="预约编号 / 采购订单号 / 供应商编码 / 车辆号"
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
                  void loadData(1, pageSize, keyword, appointmentStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setAppointmentStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建送货预约</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`送货预约（共 ${total} 条）`}>
        <Table<SrmDeliveryAppointment>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2900 }}
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
        title={editId == null ? '新建送货预约' : '编辑送货预约'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="appointmentNo" label="预约编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="poNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="appointQty" label="预约数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="deliveryDate" label="送货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="timeSlot" label="送货时段">
            <Input placeholder="请输入送货时段" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="收货仓库编码">
            <Input placeholder="请输入收货仓库编码" />
          </Form.Item>
          <Form.Item name="warehouseName" label="收货仓库名称">
            <Input placeholder="请输入收货仓库名称" />
          </Form.Item>
          <Form.Item name="vehicleNo" label="车牌号">
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="driver" label="司机">
            <Input placeholder="请输入司机" />
          </Form.Item>
          <Form.Item name="driverPhone" label="司机电话">
            <Input placeholder="请输入司机电话" />
          </Form.Item>
          <Form.Item name="appointBy" label="预约人">
            <Input placeholder="请输入预约人" />
          </Form.Item>
          <Form.Item name="appointDate" label="预约日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="appointmentStatus" label="预约状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_APPOINTMENT_STATUS_OPTIONS]} />
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
