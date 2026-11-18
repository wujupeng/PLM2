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
import { mesEquipmentService as service } from '@/services/mesEquipmentService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_EQUIPMENT_STATUS_LABEL,
  MES_EQUIPMENT_STATUS_OPTIONS,
  type MesEquipment,
  type MesEquipmentQuery,
  type MesEquipmentSaveRequest,
} from '@/types/mesEquipment';

const { Title } = Typography;

const MANAGE = 'mes:equipment:ledger:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<
  MesEquipmentSaveRequest,
  'purchaseDate' | 'installDate' | 'warrantyEndDate'
> & {
  purchaseDate?: Dayjs;
  installDate?: Dayjs;
  warrantyEndDate?: Dayjs;
};

export default function MesEquipmentLedgerPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesEquipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = equipmentStatus) => {
      setLoading(true);
      try {
        const params: MesEquipmentQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          equipmentStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, equipmentStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ equipmentStatus: 'IDLE' });
    setOpen(true);
  };

  const openEdit = (record: MesEquipment) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : undefined,
      installDate: record.installDate ? dayjs(record.installDate) : undefined,
      warrantyEndDate: record.warrantyEndDate ? dayjs(record.warrantyEndDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesEquipmentSaveRequest = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.format(DATETIME_FORMAT) : undefined,
        installDate: values.installDate ? values.installDate.format(DATETIME_FORMAT) : undefined,
        warrantyEndDate: values.warrantyEndDate
          ? values.warrantyEndDate.format(DATETIME_FORMAT)
          : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('设备台账已创建');
      } else {
        await service.update(editId, payload);
        message.success('设备台账已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('设备台账已删除');
    void loadData();
  };

  const columns: ColumnsType<MesEquipment> = [
    { title: '设备编号', dataIndex: 'equipmentNo', width: 180, fixed: 'left', render: plain },
    { title: '设备名称', dataIndex: 'equipmentName', width: 170, render: plain },
    { title: '设备类型', dataIndex: 'equipmentType', width: 120, render: plain },
    { title: '型号', dataIndex: 'model', width: 130, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '制造商', dataIndex: 'manufacturer', width: 160, render: plain },
    { title: '车间编码', dataIndex: 'workshopCode', width: 120, render: plain },
    { title: '产线编码', dataIndex: 'lineCode', width: 110, render: plain },
    { title: '位置', dataIndex: 'location', width: 150, render: plain },
    { title: '购置日期', dataIndex: 'purchaseDate', width: 170, render: formatDateTime },
    { title: '安装日期', dataIndex: 'installDate', width: 170, render: formatDateTime },
    { title: '保修截止', dataIndex: 'warrantyEndDate', width: 170, render: formatDateTime },
    {
      title: '设备状态',
      dataIndex: 'equipmentStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_EQUIPMENT_STATUS_LABEL, v),
    },
    { title: '负责人', dataIndex: 'manager', width: 110, render: plain },
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
            <Popconfirm title="确认删除该设备？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        设备台账
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="设备状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={equipmentStatus}
              onChange={(v) => setEquipmentStatus(v)}
              options={[...MES_EQUIPMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="设备编号 / 设备名称 / 设备类型 / 型号 / 车间编码"
              allowClear
              style={{ width: 420 }}
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
                  void loadData(1, pageSize, keyword, equipmentStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setEquipmentStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建设备</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`设备台账（共 ${total} 条）`}>
        <Table<MesEquipment>
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
        title={editId == null ? '新建设备' : '编辑设备'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="equipmentNo" label="设备编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item
            name="equipmentName"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="equipmentType" label="设备类型">
            <Input placeholder="请输入设备类型" />
          </Form.Item>
          <Form.Item name="model" label="型号">
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="manufacturer" label="制造商">
            <Input placeholder="请输入制造商" />
          </Form.Item>
          <Form.Item name="workshopCode" label="车间编码">
            <Input placeholder="请输入车间编码" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线编码">
            <Input placeholder="请输入产线编码" />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input placeholder="请输入位置" />
          </Form.Item>
          <Form.Item name="purchaseDate" label="购置日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="installDate" label="安装日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warrantyEndDate" label="保修截止">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="equipmentStatus" label="设备状态">
            <Select placeholder="为空默认 IDLE" options={[...MES_EQUIPMENT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="manager" label="负责人">
            <Input placeholder="请输入负责人" />
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
