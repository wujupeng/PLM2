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
import { mesCollectInterfaceService as service } from '@/services/mesCollectService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_COLLECT_PROTOCOL_LABEL,
  MES_COLLECT_PROTOCOL_OPTIONS,
  MES_COLLECT_STATUS_LABEL,
  MES_COLLECT_STATUS_OPTIONS,
  type MesCollectInterface,
  type MesCollectInterfaceQuery,
  type MesCollectInterfaceSaveRequest,
} from '@/types/mesCollect';

const { Title } = Typography;

const MANAGE = 'mes:collect:interface:manage';

export default function MesCollectInterfacePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MesCollectInterfaceSaveRequest>();
  const [data, setData] = useState<MesCollectInterface[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [interfaceStatus, setInterfaceStatus] = useState<string | undefined>(undefined);
  const [protocol, setProtocol] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = interfaceStatus,
      proto = protocol,
    ) => {
      setLoading(true);
      try {
        const params: MesCollectInterfaceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          interfaceStatus: status,
          protocol: proto,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, interfaceStatus, protocol],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ interfaceStatus: 'OFFLINE' });
    setOpen(true);
  };

  const openEdit = (record: MesCollectInterface) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesCollectInterfaceSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('采集接口已创建');
      } else {
        await service.update(editId, payload);
        message.success('采集接口已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('采集接口已删除');
    void loadData();
  };

  const columns: ColumnsType<MesCollectInterface> = [
    { title: '接口编号', dataIndex: 'interfaceNo', width: 190, fixed: 'left', render: plain },
    { title: '接口名称', dataIndex: 'interfaceName', width: 170, render: plain },
    { title: '设备编号', dataIndex: 'deviceNo', width: 160, render: plain },
    { title: '设备编码', dataIndex: 'deviceCode', width: 150, render: plain },
    {
      title: '通讯协议',
      dataIndex: 'protocol',
      width: 130,
      render: (v) => statusTag(MES_COLLECT_PROTOCOL_LABEL, v),
    },
    { title: '接入地址', dataIndex: 'endpoint', width: 220, render: plain },
    { title: '点位地址', dataIndex: 'address', width: 140, render: plain },
    { title: '数据格式', dataIndex: 'dataFormat', width: 120, render: plain },
    { title: '采集频率(秒)', dataIndex: 'sampleInterval', width: 120, render: plain },
    {
      title: '接口状态',
      dataIndex: 'interfaceStatus',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该采集接口？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        采集接口
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="接口状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={interfaceStatus}
              onChange={(v) => setInterfaceStatus(v)}
              options={[...MES_COLLECT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="通讯协议">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              value={protocol}
              onChange={(v) => setProtocol(v)}
              options={[...MES_COLLECT_PROTOCOL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="接口编号 / 接口名称 / 设备编码 / 接入地址"
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
                  void loadData(1, pageSize, keyword, interfaceStatus, protocol);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInterfaceStatus(undefined);
                  setProtocol(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建采集接口</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采集接口（共 ${total} 条）`}>
        <Table<MesCollectInterface>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1830 }}
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
        title={editId == null ? '新建采集接口' : '编辑采集接口'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="interfaceNo" label="接口编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="interfaceName" label="接口名称">
            <Input placeholder="请输入接口名称" />
          </Form.Item>
          <Form.Item name="deviceNo" label="设备编号">
            <Input placeholder="请输入设备编号" />
          </Form.Item>
          <Form.Item name="deviceCode" label="设备编码" rules={[{ required: true, message: '请输入设备编码' }]}>
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="protocol" label="通讯协议">
            <Select placeholder="请选择通讯协议" allowClear options={[...MES_COLLECT_PROTOCOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="endpoint" label="接入地址">
            <Input placeholder="请输入接入地址" />
          </Form.Item>
          <Form.Item name="address" label="点位地址">
            <Input placeholder="请输入寄存器/点位地址" />
          </Form.Item>
          <Form.Item name="dataFormat" label="数据格式">
            <Input placeholder="请输入数据格式" />
          </Form.Item>
          <Form.Item name="sampleInterval" label="采集频率(秒)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入采集频率" />
          </Form.Item>
          <Form.Item name="interfaceStatus" label="接口状态">
            <Select placeholder="为空默认 OFFLINE" options={[...MES_COLLECT_STATUS_OPTIONS]} />
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
