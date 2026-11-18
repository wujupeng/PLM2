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
import { mesEquipmentMaintenanceService as service } from '@/services/mesEquipmentService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_EQUIPMENT_MAINTENANCE_STATUS_LABEL,
  MES_EQUIPMENT_MAINTENANCE_STATUS_OPTIONS,
  MES_EQUIPMENT_MAINTENANCE_TYPE_LABEL,
  MES_EQUIPMENT_MAINTENANCE_TYPE_OPTIONS,
  type MesEquipmentMaintenance,
  type MesEquipmentMaintenanceQuery,
  type MesEquipmentMaintenanceSaveRequest,
} from '@/types/mesEquipment';

const { Title } = Typography;

const MANAGE = 'mes:equipment:maintenance:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesEquipmentMaintenanceSaveRequest, 'planTime' | 'actualTime'> & {
  planTime?: Dayjs;
  actualTime?: Dayjs;
};

export default function MesEquipmentMaintenancePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesEquipmentMaintenance[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = maintenanceStatus) => {
      setLoading(true);
      try {
        const params: MesEquipmentMaintenanceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          maintenanceStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, maintenanceStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ maintenanceType: 'DAILY', maintenanceStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesEquipmentMaintenance) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      planTime: record.planTime ? dayjs(record.planTime) : undefined,
      actualTime: record.actualTime ? dayjs(record.actualTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesEquipmentMaintenanceSaveRequest = {
        ...values,
        planTime: values.planTime ? values.planTime.format(DATETIME_FORMAT) : undefined,
        actualTime: values.actualTime ? values.actualTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('设备保养已创建');
      } else {
        await service.update(editId, payload);
        message.success('设备保养已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('设备保养已删除');
    void loadData();
  };

  const columns: ColumnsType<MesEquipmentMaintenance> = [
    { title: '保养单号', dataIndex: 'maintenanceNo', width: 190, fixed: 'left', render: plain },
    { title: '设备编码', dataIndex: 'equipmentCode', width: 150, render: plain },
    { title: '设备名称', dataIndex: 'equipmentName', width: 170, render: plain },
    {
      title: '保养类型',
      dataIndex: 'maintenanceType',
      width: 120,
      render: (v) => statusTag(MES_EQUIPMENT_MAINTENANCE_TYPE_LABEL, v),
    },
    { title: '计划时间', dataIndex: 'planTime', width: 170, render: formatDateTime },
    { title: '实际时间', dataIndex: 'actualTime', width: 170, render: formatDateTime },
    { title: '保养人', dataIndex: 'maintainer', width: 110, render: plain },
    { title: '费用', dataIndex: 'cost', width: 110, render: plain },
    {
      title: '保养状态',
      dataIndex: 'maintenanceStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_EQUIPMENT_MAINTENANCE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该保养记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        设备保养
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="保养状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={maintenanceStatus}
              onChange={(v) => setMaintenanceStatus(v)}
              options={[...MES_EQUIPMENT_MAINTENANCE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="保养单号 / 设备编码 / 设备名称 / 保养人"
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
                  void loadData(1, pageSize, keyword, maintenanceStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMaintenanceStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建保养</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`设备保养（共 ${total} 条）`}>
        <Table<MesEquipmentMaintenance>
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
        title={editId == null ? '新建保养' : '编辑保养'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="maintenanceNo" label="保养单号">
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
          <Form.Item name="maintenanceType" label="保养类型">
            <Select placeholder="为空默认 DAILY" options={[...MES_EQUIPMENT_MAINTENANCE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="planTime" label="计划时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="actualTime" label="实际时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maintainer" label="保养人">
            <Input placeholder="请输入保养人" />
          </Form.Item>
          <Form.Item name="cost" label="费用">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入费用" />
          </Form.Item>
          <Form.Item name="maintenanceStatus" label="保养状态">
            <Select
              placeholder="为空默认 DRAFT"
              options={[...MES_EQUIPMENT_MAINTENANCE_STATUS_OPTIONS]}
            />
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
