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
import { mesCollectDeviceService as service } from '@/services/mesCollectService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_COLLECT_DEVICE_TYPE_LABEL,
  MES_COLLECT_DEVICE_TYPE_OPTIONS,
  MES_COLLECT_PROTOCOL_LABEL,
  MES_COLLECT_PROTOCOL_OPTIONS,
  MES_COLLECT_STATUS_LABEL,
  MES_COLLECT_STATUS_OPTIONS,
  type MesCollectDevice,
  type MesCollectDeviceQuery,
  type MesCollectDeviceSaveRequest,
} from '@/types/mesCollect';

const { Title } = Typography;

const MANAGE = 'mes:collect:device:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesCollectDeviceSaveRequest, 'installDate'> & {
  installDate?: Dayjs;
};

export default function MesCollectDevicePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesCollectDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [deviceType, setDeviceType] = useState<string | undefined>(undefined);
  const [deviceStatus, setDeviceStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = deviceType,
      status = deviceStatus,
    ) => {
      setLoading(true);
      try {
        const params: MesCollectDeviceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          deviceType: type,
          deviceStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, deviceType, deviceStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ deviceType: 'TEST', deviceStatus: 'OFFLINE' });
    setOpen(true);
  };

  const openEdit = (record: MesCollectDevice) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      installDate: record.installDate ? dayjs(record.installDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesCollectDeviceSaveRequest = {
        ...values,
        installDate: values.installDate ? values.installDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('采集设备已创建');
      } else {
        await service.update(editId, payload);
        message.success('采集设备已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('采集设备已删除');
    void loadData();
  };

  const columns: ColumnsType<MesCollectDevice> = [
    { title: '设备编号', dataIndex: 'deviceNo', width: 190, fixed: 'left', render: plain },
    { title: '设备编码', dataIndex: 'deviceCode', width: 150, render: plain },
    { title: '设备名称', dataIndex: 'deviceName', width: 170, render: plain },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_DEVICE_TYPE_LABEL, v),
    },
    { title: '型号', dataIndex: 'model', width: 140, render: plain },
    { title: '厂商', dataIndex: 'vendor', width: 140, render: plain },
    {
      title: '通讯协议',
      dataIndex: 'protocol',
      width: 130,
      render: (v) => statusTag(MES_COLLECT_PROTOCOL_LABEL, v),
    },
    { title: 'IP 地址', dataIndex: 'ipAddress', width: 140, render: plain },
    { title: '端口', dataIndex: 'port', width: 90, render: plain },
    { title: '网关编码', dataIndex: 'gatewayCode', width: 140, render: plain },
    { title: '安装位置', dataIndex: 'location', width: 140, render: plain },
    {
      title: '设备状态',
      dataIndex: 'deviceStatus',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_STATUS_LABEL, v),
    },
    { title: '安装日期', dataIndex: 'installDate', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该采集设备？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        采集设备
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="设备类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={deviceType}
              onChange={(v) => setDeviceType(v)}
              options={[...MES_COLLECT_DEVICE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="设备状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={deviceStatus}
              onChange={(v) => setDeviceStatus(v)}
              options={[...MES_COLLECT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="设备编号 / 设备编码 / 设备名称 / 网关编码"
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
                  void loadData(1, pageSize, keyword, deviceType, deviceStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDeviceType(undefined);
                  setDeviceStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建采集设备</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采集设备（共 ${total} 条）`}>
        <Table<MesCollectDevice>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2140 }}
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
        title={editId == null ? '新建采集设备' : '编辑采集设备'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="deviceNo" label="设备编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="deviceCode" label="设备编码" rules={[{ required: true, message: '请输入设备编码' }]}>
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="deviceName" label="设备名称">
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="deviceType" label="设备类型">
            <Select placeholder="为空默认 TEST" options={[...MES_COLLECT_DEVICE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="model" label="型号">
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item name="vendor" label="厂商">
            <Input placeholder="请输入厂商" />
          </Form.Item>
          <Form.Item name="protocol" label="通讯协议">
            <Select placeholder="请选择通讯协议" allowClear options={[...MES_COLLECT_PROTOCOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ipAddress" label="IP 地址">
            <Input placeholder="请输入 IP 地址" />
          </Form.Item>
          <Form.Item name="port" label="端口">
            <InputNumber style={{ width: '100%' }} placeholder="请输入端口" />
          </Form.Item>
          <Form.Item name="gatewayCode" label="网关编码">
            <Input placeholder="请输入网关编码" />
          </Form.Item>
          <Form.Item name="location" label="安装位置">
            <Input placeholder="请输入安装位置" />
          </Form.Item>
          <Form.Item name="deviceStatus" label="设备状态">
            <Select placeholder="为空默认 OFFLINE" options={[...MES_COLLECT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="installDate" label="安装日期">
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
