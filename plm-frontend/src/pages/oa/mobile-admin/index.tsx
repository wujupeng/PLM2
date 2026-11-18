import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { oaMobileConfigService } from '@/services/oaService';
import {
  OA_ENABLED_STATUS_COLOR,
  OA_ENABLED_STATUS_LABEL,
  OA_ENABLED_STATUS_OPTIONS,
  OA_MOBILE_CONFIG_TYPE_LABEL,
  OA_MOBILE_CONFIG_TYPE_OPTIONS,
  type OaMobileConfigItem,
  type OaMobileConfigQuery,
  type OaMobileConfigSaveParams,
  type OaMobileWorkbench,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/* ---------------- 配置管理 ---------------- */

interface MobileConfigSearchState {
  keyword?: string;
  configType?: string;
  configStatus?: string;
}

interface MobileConfigFormValues {
  configType?: string;
  configKey: string;
  configName: string;
  configValue?: string;
  icon?: string;
  sortNo?: number;
  configStatus?: string;
  remark?: string;
}

function MobileConfigPanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MobileConfigFormValues>();

  const [data, setData] = useState<OaMobileConfigItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<MobileConfigSearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaMobileConfigItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaMobileConfigQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          configType: cond.configType || undefined,
          configStatus: cond.configStatus || undefined,
        };
        const res = await oaMobileConfigService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: MobileConfigSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ configType: 'MENU', configStatus: 'enabled', sortNo: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: OaMobileConfigItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      configType: record.configType,
      configKey: record.configKey,
      configName: record.configName,
      configValue: record.configValue,
      icon: record.icon,
      sortNo: record.sortNo,
      configStatus: record.configStatus,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: OaMobileConfigSaveParams = {
      configType: values.configType,
      configKey: values.configKey,
      configName: values.configName,
      configValue: values.configValue,
      icon: values.icon,
      sortNo: values.sortNo,
      configStatus: values.configStatus,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaMobileConfigService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaMobileConfigService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: OaMobileConfigItem) => {
    await oaMobileConfigService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<OaMobileConfigItem> = [
    { title: '配置键', dataIndex: 'configKey', width: 180, render: (v) => v || '-' },
    { title: '名称', dataIndex: 'configName', width: 180, render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'configType',
      width: 100,
      render: (v?: string) => (v ? OA_MOBILE_CONFIG_TYPE_LABEL[v] || v : '-'),
    },
    { title: '值', dataIndex: 'configValue', width: 200, ellipsis: true, render: (v) => v || '-' },
    { title: '图标', dataIndex: 'icon', width: 120, render: (v) => v || '-' },
    { title: '排序', dataIndex: 'sortNo', width: 80, render: (v?: number) => v ?? '-' },
    {
      title: '状态',
      dataIndex: 'configStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={OA_ENABLED_STATUS_COLOR[v]}>{OA_ENABLED_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该配置？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!hasPermission('oa:mobile:manage')) {
    return <Empty description="暂无移动端配置管理权限" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="配置键 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="configType" label="类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_MOBILE_CONFIG_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item name="configStatus" label="状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={OA_ENABLED_STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`移动端配置列表（共 ${total} 条）`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增配置
          </Button>
        }
      >
        <Table<OaMobileConfigItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1100 }}
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
        title={editing ? '编辑移动端配置' : '新增移动端配置'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="configType" label="配置类型">
            <Select
              placeholder="请选择"
              options={OA_MOBILE_CONFIG_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Form.Item>
          <Form.Item
            name="configKey"
            label="配置键"
            rules={[{ required: true, message: '请输入配置键' }]}
          >
            <Input placeholder="请输入配置键" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="configName"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="configValue" label="配置值">
            <Input.TextArea rows={2} placeholder="请输入配置值" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入图标标识" />
          </Form.Item>
          <Form.Item name="sortNo" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序号" />
          </Form.Item>
          <Form.Item name="configStatus" label="状态">
            <Select placeholder="请选择" options={OA_ENABLED_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 工作台预览 ---------------- */

function MobileWorkbenchPanel() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [data, setData] = useState<OaMobileWorkbench | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await oaMobileConfigService.workbench();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const columns: ColumnsType<OaMobileConfigItem> = [
    { title: '名称', dataIndex: 'configName', width: 160, render: (v) => v || '-' },
    { title: '配置键', dataIndex: 'configKey', width: 180, render: (v) => v || '-' },
    {
      title: '类型',
      dataIndex: 'configType',
      width: 100,
      render: (v?: string) => (v ? OA_MOBILE_CONFIG_TYPE_LABEL[v] || v : '-'),
    },
    { title: '值', dataIndex: 'configValue', ellipsis: true, render: (v) => v || '-' },
    { title: '排序', dataIndex: 'sortNo', width: 80, render: (v?: number) => v ?? '-' },
  ];

  if (!hasPermission('oa:mobile:view')) {
    return <Empty description="暂无移动端工作台查看权限" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card
        title="工作台统计"
        loading={loading}
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => void loadData()}>
            刷新
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="待办任务" value={data?.pendingTaskCount ?? 0} />
          </Col>
          <Col span={8}>
            <Statistic title="未读通知" value={data?.unreadNotificationCount ?? 0} />
          </Col>
          <Col span={8}>
            <Statistic title="未读邮件" value={data?.unreadMailCount ?? 0} />
          </Col>
        </Row>
      </Card>

      <Card title={`移动端菜单（共 ${data?.menus?.length ?? 0} 项）`} loading={loading}>
        <Table<OaMobileConfigItem>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={data?.menus || []}
          pagination={false}
        />
      </Card>

      <Card title={`移动端策略（共 ${data?.policies?.length ?? 0} 项）`} loading={loading}>
        <Table<OaMobileConfigItem>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={data?.policies || []}
          pagination={false}
        />
      </Card>
    </Space>
  );
}

export default function OaMobileAdminPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        移动端配置与工作台
      </Title>
      <Card>
        <Tabs
          items={[
            { key: 'config', label: '配置管理', children: <MobileConfigPanel /> },
            { key: 'workbench', label: '工作台预览', children: <MobileWorkbenchPanel /> },
          ]}
        />
      </Card>
    </Space>
  );
}
