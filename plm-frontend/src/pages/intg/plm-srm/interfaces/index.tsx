import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { intgPlmSrmInterfaceService as service } from '@/services/intgPlmSrmService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  INTG_PLM_SRM_INTERFACE_STATUS_LABEL,
  INTG_PLM_SRM_INTERFACE_STATUS_OPTIONS,
  INTG_PLM_SRM_OBJECT_TYPE_LABEL,
  INTG_PLM_SRM_OBJECT_TYPE_OPTIONS,
  INTG_PLM_SRM_PROTOCOL_LABEL,
  INTG_PLM_SRM_PROTOCOL_OPTIONS,
  INTG_PLM_SRM_SYNC_MODE_LABEL,
  INTG_PLM_SRM_SYNC_MODE_OPTIONS,
  INTG_PLM_SRM_TRIGGER_TYPE_LABEL,
  INTG_PLM_SRM_TRIGGER_TYPE_OPTIONS,
  type IntgPlmSrmInterface,
  type IntgPlmSrmInterfaceQuery,
  type IntgPlmSrmInterfaceSaveRequest,
} from '@/types/intgPlmSrm';

const { Title } = Typography;

const MANAGE = 'intg:plm-srm:interface:manage';

export default function IntgPlmSrmInterfacePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<IntgPlmSrmInterfaceSaveRequest>();
  const [data, setData] = useState<IntgPlmSrmInterface[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectType, setObjectType] = useState<string | undefined>(undefined);
  const [protocol, setProtocol] = useState<string | undefined>(undefined);
  const [interfaceStatus, setInterfaceStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = objectType,
      proto = protocol,
      status = interfaceStatus,
    ) => {
      setLoading(true);
      try {
        const params: IntgPlmSrmInterfaceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectType: type,
          protocol: proto,
          interfaceStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectType, protocol, interfaceStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      direction: 'PLM_TO_SRM',
      objectType: 'PURCHASE_SPEC',
      protocol: 'API',
      triggerType: 'MANUAL',
      syncMode: 'INCREMENTAL',
      interfaceStatus: 'DRAFT',
    });
    setOpen(true);
  };

  const openEdit = (record: IntgPlmSrmInterface) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: IntgPlmSrmInterfaceSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('集成接口已创建');
      } else {
        await service.update(editId, payload);
        message.success('集成接口已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('集成接口已删除');
    void loadData();
  };

  const columns: ColumnsType<IntgPlmSrmInterface> = [
    { title: '接口编号', dataIndex: 'interfaceNo', width: 200, fixed: 'left', render: plain },
    { title: '接口名称', dataIndex: 'interfaceName', width: 180, render: plain },
    { title: '集成方向', dataIndex: 'direction', width: 130, render: plain },
    {
      title: '集成对象',
      dataIndex: 'objectType',
      width: 120,
      render: (v) => statusTag(INTG_PLM_SRM_OBJECT_TYPE_LABEL, v),
    },
    {
      title: '传输协议',
      dataIndex: 'protocol',
      width: 120,
      render: (v) => statusTag(INTG_PLM_SRM_PROTOCOL_LABEL, v),
    },
    { title: '端点', dataIndex: 'endpoint', width: 240, render: plain },
    {
      title: '触发方式',
      dataIndex: 'triggerType',
      width: 120,
      render: (v) => statusTag(INTG_PLM_SRM_TRIGGER_TYPE_LABEL, v),
    },
    {
      title: '同步方式',
      dataIndex: 'syncMode',
      width: 110,
      render: (v) => statusTag(INTG_PLM_SRM_SYNC_MODE_LABEL, v),
    },
    {
      title: '状态',
      dataIndex: 'interfaceStatus',
      width: 110,
      render: (v) => statusTag(INTG_PLM_SRM_INTERFACE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该集成接口？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        集成接口
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="集成对象">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={objectType}
              onChange={(v) => setObjectType(v)}
              options={[...INTG_PLM_SRM_OBJECT_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="传输协议">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={protocol}
              onChange={(v) => setProtocol(v)}
              options={[...INTG_PLM_SRM_PROTOCOL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="接口编号 / 接口名称 / 端点"
              allowClear
              style={{ width: 380 }}
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
                  void loadData(1, pageSize, keyword, objectType, protocol, interfaceStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectType(undefined);
                  setProtocol(undefined);
                  setInterfaceStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建集成接口</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`集成接口（共 ${total} 条）`}>
        <Table<IntgPlmSrmInterface>
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
        title={editId == null ? '新建集成接口' : '编辑集成接口'}
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
          <Form.Item
            name="interfaceName"
            label="接口名称"
            rules={[{ required: true, message: '请输入接口名称' }]}
          >
            <Input placeholder="请输入接口名称" />
          </Form.Item>
          <Form.Item name="direction" label="集成方向">
            <Input placeholder="请输入集成方向" />
          </Form.Item>
          <Form.Item name="objectType" label="集成对象">
            <Select placeholder="为空默认 PURCHASE_SPEC" options={[...INTG_PLM_SRM_OBJECT_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="protocol" label="传输协议">
            <Select placeholder="为空默认 API" options={[...INTG_PLM_SRM_PROTOCOL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="endpoint" label="端点">
            <Input placeholder="请输入端点" />
          </Form.Item>
          <Form.Item name="triggerType" label="触发方式">
            <Select placeholder="为空默认 MANUAL" options={[...INTG_PLM_SRM_TRIGGER_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="syncMode" label="同步方式">
            <Select placeholder="为空默认 INCREMENTAL" options={[...INTG_PLM_SRM_SYNC_MODE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="interfaceStatus" label="状态">
            <Select placeholder="为空默认 DRAFT" options={[...INTG_PLM_SRM_INTERFACE_STATUS_OPTIONS]} />
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
