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
import { mesEquipmentFaultService as service } from '@/services/mesEquipmentService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_EQUIPMENT_FAULT_LEVEL_LABEL,
  MES_EQUIPMENT_FAULT_LEVEL_OPTIONS,
  MES_EQUIPMENT_FAULT_STATUS_LABEL,
  MES_EQUIPMENT_FAULT_STATUS_OPTIONS,
  type MesEquipmentFault,
  type MesEquipmentFaultQuery,
  type MesEquipmentFaultSaveRequest,
} from '@/types/mesEquipment';

const { Title } = Typography;

const MANAGE = 'mes:equipment:fault:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesEquipmentFaultSaveRequest, 'occurTime' | 'repairTime'> & {
  occurTime?: Dayjs;
  repairTime?: Dayjs;
};

export default function MesEquipmentFaultPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesEquipmentFault[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [faultStatus, setFaultStatus] = useState<string | undefined>(undefined);
  const [faultLevel, setFaultLevel] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = faultStatus, level = faultLevel) => {
      setLoading(true);
      try {
        const params: MesEquipmentFaultQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          faultStatus: status,
          faultLevel: level,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, faultStatus, faultLevel],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ faultLevel: 'MEDIUM', faultStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesEquipmentFault) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      occurTime: record.occurTime ? dayjs(record.occurTime) : undefined,
      repairTime: record.repairTime ? dayjs(record.repairTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesEquipmentFaultSaveRequest = {
        ...values,
        occurTime: values.occurTime ? values.occurTime.format(DATETIME_FORMAT) : undefined,
        repairTime: values.repairTime ? values.repairTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('设备故障已创建');
      } else {
        await service.update(editId, payload);
        message.success('设备故障已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('设备故障已删除');
    void loadData();
  };

  const columns: ColumnsType<MesEquipmentFault> = [
    { title: '故障单号', dataIndex: 'faultNo', width: 190, fixed: 'left', render: plain },
    { title: '设备编码', dataIndex: 'equipmentCode', width: 150, render: plain },
    { title: '设备名称', dataIndex: 'equipmentName', width: 170, render: plain },
    { title: '故障类型', dataIndex: 'faultType', width: 130, render: plain },
    {
      title: '故障等级',
      dataIndex: 'faultLevel',
      width: 110,
      render: (v) => statusTag(MES_EQUIPMENT_FAULT_LEVEL_LABEL, v),
    },
    { title: '故障描述', dataIndex: 'faultDesc', width: 200, render: plain },
    { title: '发生时间', dataIndex: 'occurTime', width: 170, render: formatDateTime },
    { title: '报修人', dataIndex: 'reporter', width: 110, render: plain },
    { title: '维修人', dataIndex: 'repairer', width: 110, render: plain },
    { title: '修复时间', dataIndex: 'repairTime', width: 170, render: formatDateTime },
    { title: '停机(分)', dataIndex: 'downtimeMinutes', width: 110, render: plain },
    {
      title: '故障状态',
      dataIndex: 'faultStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_EQUIPMENT_FAULT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该故障记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        设备故障
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="故障状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={faultStatus}
              onChange={(v) => setFaultStatus(v)}
              options={[...MES_EQUIPMENT_FAULT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="故障等级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={faultLevel}
              onChange={(v) => setFaultLevel(v)}
              options={[...MES_EQUIPMENT_FAULT_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="故障单号 / 设备编码 / 设备名称 / 故障类型"
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
                  void loadData(1, pageSize, keyword, faultStatus, faultLevel);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFaultStatus(undefined);
                  setFaultLevel(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建故障</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`设备故障（共 ${total} 条）`}>
        <Table<MesEquipmentFault>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建故障' : '编辑故障'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="faultNo" label="故障单号">
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
          <Form.Item name="faultType" label="故障类型">
            <Input placeholder="请输入故障类型" />
          </Form.Item>
          <Form.Item name="faultLevel" label="故障等级">
            <Select placeholder="为空默认 MEDIUM" options={[...MES_EQUIPMENT_FAULT_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="faultDesc" label="故障描述">
            <Input.TextArea rows={2} placeholder="请输入故障描述" />
          </Form.Item>
          <Form.Item name="occurTime" label="发生时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reporter" label="报修人">
            <Input placeholder="请输入报修人" />
          </Form.Item>
          <Form.Item name="repairer" label="维修人">
            <Input placeholder="请输入维修人" />
          </Form.Item>
          <Form.Item name="repairTime" label="修复时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="downtimeMinutes" label="停机(分钟)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入停机时长（分钟）" />
          </Form.Item>
          <Form.Item name="faultStatus" label="故障状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_EQUIPMENT_FAULT_STATUS_OPTIONS]} />
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
