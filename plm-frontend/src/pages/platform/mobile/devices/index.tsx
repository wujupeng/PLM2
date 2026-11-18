import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { deviceService } from '@/services/mobileService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/mobile/shared';
import {
  DEVICE_STATUS_LABEL,
  DEVICE_STATUS_OPTIONS,
  DEVICE_TYPE_LABEL,
  DEVICE_TYPE_OPTIONS,
  type MobileDeviceItem,
  type MobileDeviceSaveParams,
} from '@/types/mobile';

const { Title } = Typography;

const DEVICE_MANAGE = 'platform:mobile:device:manage';

export default function MobileDevicePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MobileDeviceSaveParams>();
  const [data, setData] = useState<MobileDeviceItem[]>([]);
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
      dType = deviceType,
      dStatus = deviceStatus,
    ) => {
      setLoading(true);
      try {
        const res = await deviceService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          deviceType: dType,
          deviceStatus: dStatus,
        });
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
    form.setFieldsValue({ deviceType: 'PDA', deviceStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: MobileDeviceItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MobileDeviceSaveParams = { ...values };
      if (editId == null) {
        await deviceService.create(payload);
        message.success('PDA设备已创建');
      } else {
        await deviceService.update(editId, payload);
        message.success('PDA设备已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await deviceService.remove(id);
    message.success('PDA设备已删除');
    void loadData();
  };

  const act = async (fn: (id: number) => Promise<unknown>, id: number, tip: string) => {
    await fn(id);
    message.success(tip);
    void loadData();
  };

  const columns: ColumnsType<MobileDeviceItem> = [
    { title: '设备编号', dataIndex: 'deviceNo', width: 160, fixed: 'left', render: plain },
    { title: '设备名称', dataIndex: 'deviceName', width: 180, render: plain },
    { title: '设备类型', dataIndex: 'deviceType', width: 120, render: (v) => statusTag(DEVICE_TYPE_LABEL, v) },
    { title: '设备型号', dataIndex: 'deviceModel', width: 160, render: plain },
    { title: '绑定用户', dataIndex: 'bindUserName', width: 140, render: plain },
    { title: '最后活跃时间', dataIndex: 'lastActiveTime', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'deviceStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(DEVICE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(DEVICE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认启用该PDA设备？"
              onConfirm={() => void act(deviceService.enable, record.id, 'PDA设备已启用')}
            >
              <Button type="link" size="small">
                启用
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认停用该PDA设备？"
              onConfirm={() => void act(deviceService.disable, record.id, 'PDA设备已停用')}
            >
              <Button type="link" size="small">
                停用
              </Button>
            </Popconfirm>
            <Popconfirm title="确认删除该PDA设备？" onConfirm={() => void remove(record.id)}>
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
        PDA设备
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
              options={[...DEVICE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="设备状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={deviceStatus}
              onChange={(v) => setDeviceStatus(v)}
              options={[...DEVICE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="设备编号 / 名称"
              allowClear
              style={{ width: 200 }}
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
              {hasPermission(DEVICE_MANAGE) && <Button onClick={openCreate}>新建PDA设备</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`PDA设备（共 ${total} 条）`}>
        <Table<MobileDeviceItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建PDA设备' : '编辑PDA设备'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="deviceNo" label="设备编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="deviceName" label="设备名称" rules={[{ required: true, message: '请输入设备名称' }]}>
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="deviceType" label="设备类型">
            <Select placeholder="请选择" options={[...DEVICE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="deviceModel" label="设备型号">
            <Input placeholder="请输入设备型号" />
          </Form.Item>
          <Form.Item name="deviceStatus" label="设备状态">
            <Select placeholder="请选择" options={[...DEVICE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bindUserId" label="绑定用户ID">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入绑定用户ID" />
          </Form.Item>
          <Form.Item name="bindUserName" label="绑定用户名称">
            <Input placeholder="请输入绑定用户名称" />
          </Form.Item>
          <Form.Item name="lastActiveTime" label="最后活跃时间">
            <Input placeholder="格式 yyyy-MM-dd HH:mm:ss" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
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
