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
import { govAsisSystemService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_ASIS_SYSTEM_STATUS_LABEL,
  GOV_ASIS_SYSTEM_STATUS_OPTIONS,
  GOV_ASIS_SYSTEM_TYPE_LABEL,
  GOV_ASIS_SYSTEM_TYPE_OPTIONS,
  type GovAsisSystemItem,
  type GovAsisSystemSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:asissystem:manage';

export default function GovAsisSystemPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovAsisSystemSaveParams>();
  const [data, setData] = useState<GovAsisSystemItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [systemType, setSystemType] = useState<string | undefined>(undefined);
  const [systemStatus, setSystemStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sType = systemType,
      sStatus = systemStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govAsisSystemService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          systemType: sType,
          systemStatus: sStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, systemType, systemStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ systemType: 'OTHER', systemStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: GovAsisSystemItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovAsisSystemSaveParams = { ...values };
      if (editId == null) {
        await govAsisSystemService.create(payload);
        message.success('存量系统已创建');
      } else {
        await govAsisSystemService.update(editId, payload);
        message.success('存量系统已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govAsisSystemService.remove(id);
    message.success('存量系统已删除');
    void loadData();
  };

  const columns: ColumnsType<GovAsisSystemItem> = [
    { title: '系统编号', dataIndex: 'systemNo', width: 160, fixed: 'left', render: plain },
    { title: '系统编码', dataIndex: 'systemCode', width: 140, render: plain },
    { title: '系统名称', dataIndex: 'systemName', width: 200, render: plain },
    {
      title: '系统类型',
      dataIndex: 'systemType',
      width: 110,
      render: (v) => statusTag(GOV_ASIS_SYSTEM_TYPE_LABEL, v),
    },
    { title: '厂商', dataIndex: 'vendor', width: 150, render: plain },
    { title: '部署模式', dataIndex: 'deployMode', width: 120, render: plain },
    { title: '用户数', dataIndex: 'userCount', width: 100, render: (v) => (v == null ? '-' : String(v)) },
    { title: '迁移策略', dataIndex: 'migrateStrategy', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'systemStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_ASIS_SYSTEM_STATUS_LABEL, v),
    },
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
            <Popconfirm title="确认删除该存量系统？" onConfirm={() => void remove(record.id)}>
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
        存量系统盘点
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="系统类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={systemType}
              onChange={(v) => setSystemType(v)}
              options={[...GOV_ASIS_SYSTEM_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="系统状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={systemStatus}
              onChange={(v) => setSystemStatus(v)}
              options={[...GOV_ASIS_SYSTEM_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="系统编号 / 编码 / 名称 / 厂商"
              allowClear
              style={{ width: 220 }}
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
                  void loadData(1, pageSize, keyword, systemType, systemStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSystemType(undefined);
                  setSystemStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建存量系统</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`存量系统盘点（共 ${total} 条）`}>
        <Table<GovAsisSystemItem>
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
        title={editId == null ? '新建存量系统' : '编辑存量系统'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="systemNo" label="系统编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="systemCode" label="系统编码">
            <Input placeholder="请输入系统编码" />
          </Form.Item>
          <Form.Item name="systemName" label="系统名称" rules={[{ required: true, message: '请输入系统名称' }]}>
            <Input placeholder="请输入系统名称" />
          </Form.Item>
          <Form.Item name="systemType" label="系统类型">
            <Select placeholder="请选择" options={[...GOV_ASIS_SYSTEM_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="vendor" label="厂商">
            <Input placeholder="请输入厂商" />
          </Form.Item>
          <Form.Item name="deployMode" label="部署模式">
            <Input placeholder="请输入部署模式" />
          </Form.Item>
          <Form.Item name="userCount" label="用户数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入用户数" />
          </Form.Item>
          <Form.Item name="systemStatus" label="系统状态">
            <Select placeholder="请选择" options={[...GOV_ASIS_SYSTEM_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="migrateStrategy" label="迁移策略">
            <Input placeholder="请输入迁移策略" />
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
