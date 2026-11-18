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
import { devopsEnvironmentService } from '@/services/devopsService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  DEVOPS_ENV_STATUS_LABEL,
  DEVOPS_ENV_STATUS_OPTIONS,
  DEVOPS_ENV_TYPE_LABEL,
  DEVOPS_ENV_TYPE_OPTIONS,
  DEVOPS_ISOLATED_LABEL,
  DEVOPS_ISOLATED_OPTIONS,
  type DevopsEnvironmentItem,
  type DevopsEnvironmentSaveParams,
} from '@/types/devops';

const { Title } = Typography;

const MANAGE = 'platform:devops:environment:manage';

export default function DevopsEnvironmentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DevopsEnvironmentSaveParams>();
  const [data, setData] = useState<DevopsEnvironmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [envType, setEnvType] = useState<string | undefined>(undefined);
  const [envStatus, setEnvStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, eType = envType, eStatus = envStatus) => {
      setLoading(true);
      try {
        const res = await devopsEnvironmentService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          envType: eType,
          envStatus: eStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, envType, envStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ envType: 'DEV', envStatus: 'ACTIVE', isolated: 1 });
    setOpen(true);
  };

  const openEdit = (record: DevopsEnvironmentItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DevopsEnvironmentSaveParams = { ...values };
      if (editId == null) {
        await devopsEnvironmentService.create(payload);
        message.success('环境已创建');
      } else {
        await devopsEnvironmentService.update(editId, payload);
        message.success('环境已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await devopsEnvironmentService.remove(id);
    message.success('环境已删除');
    void loadData();
  };

  const columns: ColumnsType<DevopsEnvironmentItem> = [
    { title: '环境编号', dataIndex: 'envNo', width: 160, fixed: 'left', render: plain },
    { title: '环境编码', dataIndex: 'envCode', width: 150, render: plain },
    { title: '环境名称', dataIndex: 'envName', width: 180, render: plain },
    { title: '环境类型', dataIndex: 'envType', width: 100, render: (v) => statusTag(DEVOPS_ENV_TYPE_LABEL, v) },
    { title: '部署目标', dataIndex: 'deployTarget', width: 180, render: plain },
    { title: '是否隔离', dataIndex: 'isolated', width: 100, render: (v) => statusTag(DEVOPS_ISOLATED_LABEL, v) },
    { title: '负责人', dataIndex: 'ownerName', width: 120, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'envStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(DEVOPS_ENV_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该环境？" onConfirm={() => void remove(record.id)}>
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
        环境管理
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="环境类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={envType}
              onChange={(v) => setEnvType(v)}
              options={[...DEVOPS_ENV_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="环境状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={envStatus}
              onChange={(v) => setEnvStatus(v)}
              options={[...DEVOPS_ENV_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="环境编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, envType, envStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setEnvType(undefined);
                  setEnvStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建环境</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`环境管理（共 ${total} 条）`}>
        <Table<DevopsEnvironmentItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1700 }}
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
        title={editId == null ? '新建环境' : '编辑环境'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="envNo" label="环境编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="envCode" label="环境编码" rules={[{ required: true, message: '请输入环境编码' }]}>
            <Input placeholder="请输入环境编码" />
          </Form.Item>
          <Form.Item name="envName" label="环境名称" rules={[{ required: true, message: '请输入环境名称' }]}>
            <Input placeholder="请输入环境名称" />
          </Form.Item>
          <Form.Item name="envType" label="环境类型">
            <Select placeholder="请选择" options={[...DEVOPS_ENV_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="deployTarget" label="部署目标">
            <Input placeholder="请输入部署目标" />
          </Form.Item>
          <Form.Item name="isolated" label="是否隔离">
            <Select placeholder="请选择" options={[...DEVOPS_ISOLATED_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerName" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="envStatus" label="环境状态">
            <Select placeholder="请选择" options={[...DEVOPS_ENV_STATUS_OPTIONS]} />
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
