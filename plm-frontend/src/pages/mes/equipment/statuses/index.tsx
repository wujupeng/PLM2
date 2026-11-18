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
import { mesEquipmentStatusService as service } from '@/services/mesEquipmentService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_EQUIPMENT_STATUS_TYPE_LABEL,
  MES_EQUIPMENT_STATUS_TYPE_OPTIONS,
  type MesEquipmentStatus,
  type MesEquipmentStatusQuery,
  type MesEquipmentStatusSaveRequest,
} from '@/types/mesEquipment';

const { Title } = Typography;

const MANAGE = 'mes:equipment:status:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesEquipmentStatusSaveRequest, 'startTime' | 'endTime'> & {
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export default function MesEquipmentStatusPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesEquipmentStatus[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusType, setStatusType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, type = statusType) => {
      setLoading(true);
      try {
        const params: MesEquipmentStatusQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          statusType: type,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, statusType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ statusType: 'RUNNING', recordStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesEquipmentStatus) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      startTime: record.startTime ? dayjs(record.startTime) : undefined,
      endTime: record.endTime ? dayjs(record.endTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesEquipmentStatusSaveRequest = {
        ...values,
        startTime: values.startTime ? values.startTime.format(DATETIME_FORMAT) : undefined,
        endTime: values.endTime ? values.endTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('设备状态已创建');
      } else {
        await service.update(editId, payload);
        message.success('设备状态已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('设备状态已删除');
    void loadData();
  };

  const columns: ColumnsType<MesEquipmentStatus> = [
    { title: '状态单号', dataIndex: 'statusNo', width: 190, fixed: 'left', render: plain },
    { title: '设备编码', dataIndex: 'equipmentCode', width: 150, render: plain },
    { title: '设备名称', dataIndex: 'equipmentName', width: 170, render: plain },
    {
      title: '状态类型',
      dataIndex: 'statusType',
      width: 110,
      render: (v) => statusTag(MES_EQUIPMENT_STATUS_TYPE_LABEL, v),
    },
    { title: '开始时间', dataIndex: 'startTime', width: 170, render: formatDateTime },
    { title: '结束时间', dataIndex: 'endTime', width: 170, render: formatDateTime },
    { title: '时长(分)', dataIndex: 'durationMinutes', width: 110, render: plain },
    { title: '操作工', dataIndex: 'operator', width: 110, render: plain },
    { title: '班次', dataIndex: 'shiftCode', width: 90, render: plain },
    { title: '记录状态', dataIndex: 'recordStatus', width: 100, fixed: 'right', render: plain },
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
            <Popconfirm title="确认删除该设备状态？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        设备状态
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="状态类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={statusType}
              onChange={(v) => setStatusType(v)}
              options={[...MES_EQUIPMENT_STATUS_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="状态单号 / 设备编码 / 设备名称 / 操作工"
              allowClear
              style={{ width: 400 }}
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
                  void loadData(1, pageSize, keyword, statusType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setStatusType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建设备状态</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`设备状态（共 ${total} 条）`}>
        <Table<MesEquipmentStatus>
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
        title={editId == null ? '新建设备状态' : '编辑设备状态'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="statusNo" label="状态单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="equipmentCode"
            label="设备编码"
            rules={[{ required: true, message: '请输入设备编码' }]}
          >
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="equipmentName" label="设备名称">
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="statusType" label="状态类型">
            <Select placeholder="为空默认 RUNNING" options={[...MES_EQUIPMENT_STATUS_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationMinutes" label="时长(分钟)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入时长（分钟）" />
          </Form.Item>
          <Form.Item name="operator" label="操作工">
            <Input placeholder="请输入操作工" />
          </Form.Item>
          <Form.Item name="shiftCode" label="班次">
            <Input placeholder="请输入班次编码" />
          </Form.Item>
          <Form.Item name="recordStatus" label="记录状态">
            <Input placeholder="为空默认 DRAFT" />
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
